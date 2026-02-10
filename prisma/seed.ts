import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";

const prisma = new PrismaClient();

// Path to the consolidated SQLite database
const SQLITE_PATH = path.resolve(
  __dirname,
  "../../output/NEW/data-2.db"
);

interface VoterRow {
  serial_number: string;
  house_number: string;
  source_ps_number: string;
  source_ps_name: string;
  source_room_number: string;
}

interface PSInfoRow {
  ward_number: string;
}

async function main() {
  console.log("Opening SQLite database:", SQLITE_PATH);
  const db = new Database(SQLITE_PATH, { readonly: true });

  // Get ward number from ps_info table
  const psInfo = db
    .prepare("SELECT ward_number FROM ps_info LIMIT 1")
    .get() as PSInfoRow | undefined;
  const wardNumber = psInfo?.ward_number || "";
  console.log("Ward:", wardNumber);

  // Read all voters ordered by PS, house, serial number
  const voters = db
    .prepare(
      `SELECT serial_number, house_number, source_ps_number, source_ps_name, source_room_number
       FROM voter_blocks
       ORDER BY source_ps_number, house_number, CAST(serial_number AS INTEGER)`
    )
    .all() as VoterRow[];

  console.log(`Total voters in SQLite: ${voters.length}`);

  db.close();

  // Group voters by PS, then by house
  const psMap = new Map<
    string,
    {
      psNumber: string;
      psName: string;
      roomNumber: string;
      houses: Map<string, number[]>; // houseNumber -> [serialNumbers]
    }
  >();

  for (const v of voters) {
    if (!psMap.has(v.source_ps_number)) {
      psMap.set(v.source_ps_number, {
        psNumber: v.source_ps_number,
        psName: v.source_ps_name || "",
        roomNumber: v.source_room_number || "",
        houses: new Map(),
      });
    }
    const ps = psMap.get(v.source_ps_number)!;
    // Skip voters with empty/invalid serial numbers
    const sn = parseInt(v.serial_number, 10);
    if (isNaN(sn)) continue;

    const houseNum = v.house_number && v.house_number.trim() !== "" ? v.house_number : "UNKNOWN";
    if (!ps.houses.has(houseNum)) {
      ps.houses.set(houseNum, []);
    }
    ps.houses.get(houseNum)!.push(sn);
  }

  // Clear existing MongoDB data
  console.log("\nClearing existing MongoDB data...");
  await prisma.voter.deleteMany();
  await prisma.house.deleteMany();
  await prisma.pollingStation.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPass = await bcrypt.hash("admin123", 10);
  const agentPass = await bcrypt.hash("agent123", 10);
  await prisma.user.create({
    data: { username: "admin", password: adminPass, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { username: "agent", password: agentPass, role: "AGENT" },
  });
  console.log("Users created: admin / admin123, agent / agent123");

  // Create polling stations, houses, and voters
  let totalHouses = 0;
  let totalVoters = 0;

  for (const [, psData] of psMap) {
    const station = await prisma.pollingStation.create({
      data: {
        psNumber: psData.psNumber,
        psName: psData.psName,
        roomNumber: psData.roomNumber,
        wardNumber: wardNumber,
        inchargeName: "",
      },
    });

    for (const [houseNum, serialNumbers] of psData.houses) {
      const house = await prisma.house.create({
        data: {
          houseNumber: houseNum,
          totalVoters: serialNumbers.length,
          pollingStationId: station.id,
        },
      });

      await prisma.voter.createMany({
        data: serialNumbers.map((sn) => ({
          serialNumber: sn,
          met: false,
          houseId: house.id,
        })),
      });

      totalHouses++;
      totalVoters += serialNumbers.length;
    }

    console.log(
      `  PS ${psData.psNumber} — ${psData.psName} (Room ${psData.roomNumber}): ${psData.houses.size} houses`
    );
  }

  console.log(
    `\nSeed complete: ${psMap.size} PS, ${totalHouses} houses, ${totalVoters} voters`
  );
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
