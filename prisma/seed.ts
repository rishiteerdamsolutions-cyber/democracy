import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PS_DATA = [
  {
    psNumber: "295",
    psName: "Mettuguda Primary School",
    inchargeName: "Ramesh Kumar",
    houses: [
      { houseNumber: "1-1-101", voters: 5 },
      { houseNumber: "1-1-102", voters: 3 },
      { houseNumber: "1-1-103", voters: 7 },
      { houseNumber: "1-1-104", voters: 4 },
      { houseNumber: "1-1-105", voters: 6 },
      { houseNumber: "1-1-106", voters: 8 },
      { houseNumber: "1-1-107", voters: 3 },
      { houseNumber: "1-1-108", voters: 5 },
      { houseNumber: "1-1-109", voters: 4 },
      { houseNumber: "1-1-110", voters: 6 },
      { houseNumber: "1-1-111", voters: 9 },
      { houseNumber: "1-1-112", voters: 4 },
    ],
  },
  {
    psNumber: "296",
    psName: "Lalaguda Government School",
    inchargeName: "Suresh Reddy",
    houses: [
      { houseNumber: "2-3-201", voters: 6 },
      { houseNumber: "2-3-202", voters: 4 },
      { houseNumber: "2-3-203", voters: 8 },
      { houseNumber: "2-3-204", voters: 5 },
      { houseNumber: "2-3-205", voters: 3 },
      { houseNumber: "2-3-206", voters: 7 },
      { houseNumber: "2-3-207", voters: 4 },
      { houseNumber: "2-3-208", voters: 6 },
      { houseNumber: "2-3-209", voters: 5 },
      { houseNumber: "2-3-210", voters: 9 },
      { houseNumber: "2-3-211", voters: 3 },
      { houseNumber: "2-3-212", voters: 7 },
      { houseNumber: "2-3-213", voters: 4 },
      { houseNumber: "2-3-214", voters: 5 },
      { houseNumber: "2-3-215", voters: 8 },
    ],
  },
  {
    psNumber: "297",
    psName: "Chilkalguda Community Hall",
    inchargeName: "Venkat Rao",
    houses: [
      { houseNumber: "3-5-301", voters: 4 },
      { houseNumber: "3-5-302", voters: 7 },
      { houseNumber: "3-5-303", voters: 5 },
      { houseNumber: "3-5-304", voters: 6 },
      { houseNumber: "3-5-305", voters: 3 },
      { houseNumber: "3-5-306", voters: 8 },
      { houseNumber: "3-5-307", voters: 5 },
      { houseNumber: "3-5-308", voters: 4 },
      { houseNumber: "3-5-309", voters: 7 },
      { houseNumber: "3-5-310", voters: 6 },
    ],
  },
  {
    psNumber: "298",
    psName: "Bhoiguda Municipal School",
    inchargeName: "Lakshmi Devi",
    houses: [
      { houseNumber: "4-1-401", voters: 5 },
      { houseNumber: "4-1-402", voters: 3 },
      { houseNumber: "4-1-403", voters: 7 },
      { houseNumber: "4-1-404", voters: 4 },
      { houseNumber: "4-1-405", voters: 6 },
      { houseNumber: "4-1-406", voters: 8 },
      { houseNumber: "4-1-407", voters: 5 },
      { houseNumber: "4-1-408", voters: 3 },
      { houseNumber: "4-1-409", voters: 6 },
      { houseNumber: "4-1-410", voters: 4 },
      { houseNumber: "4-1-411", voters: 7 },
      { houseNumber: "4-1-412", voters: 5 },
      { houseNumber: "4-1-413", voters: 9 },
      { houseNumber: "4-1-414", voters: 4 },
      { houseNumber: "4-1-415", voters: 6 },
      { houseNumber: "4-1-416", voters: 3 },
      { houseNumber: "4-1-417", voters: 7 },
      { houseNumber: "4-1-418", voters: 5 },
    ],
  },
  {
    psNumber: "299",
    psName: "Tarnaka Government School",
    inchargeName: "Srinivas Murthy",
    houses: [
      { houseNumber: "5-2-501", voters: 6 },
      { houseNumber: "5-2-502", voters: 4 },
      { houseNumber: "5-2-503", voters: 8 },
      { houseNumber: "5-2-504", voters: 5 },
      { houseNumber: "5-2-505", voters: 3 },
      { houseNumber: "5-2-506", voters: 7 },
      { houseNumber: "5-2-507", voters: 4 },
      { houseNumber: "5-2-508", voters: 6 },
      { houseNumber: "5-2-509", voters: 5 },
      { houseNumber: "5-2-510", voters: 9 },
      { houseNumber: "5-2-511", voters: 3 },
      { houseNumber: "5-2-512", voters: 7 },
      { houseNumber: "5-2-513", voters: 4 },
      { houseNumber: "5-2-514", voters: 5 },
    ],
  },
  {
    psNumber: "300",
    psName: "Vidyanagar Community Hall",
    inchargeName: "Priya Sharma",
    houses: [
      { houseNumber: "6-4-601", voters: 5 },
      { houseNumber: "6-4-602", voters: 7 },
      { houseNumber: "6-4-603", voters: 4 },
      { houseNumber: "6-4-604", voters: 6 },
      { houseNumber: "6-4-605", voters: 3 },
      { houseNumber: "6-4-606", voters: 8 },
      { houseNumber: "6-4-607", voters: 5 },
      { houseNumber: "6-4-608", voters: 4 },
      { houseNumber: "6-4-609", voters: 7 },
      { houseNumber: "6-4-610", voters: 6 },
      { houseNumber: "6-4-611", voters: 9 },
    ],
  },
  {
    psNumber: "301",
    psName: "Nacharam Primary School",
    inchargeName: "Mahesh Babu",
    houses: [
      { houseNumber: "7-6-701", voters: 4 },
      { houseNumber: "7-6-702", voters: 6 },
      { houseNumber: "7-6-703", voters: 5 },
      { houseNumber: "7-6-704", voters: 7 },
      { houseNumber: "7-6-705", voters: 3 },
      { houseNumber: "7-6-706", voters: 8 },
      { houseNumber: "7-6-707", voters: 4 },
      { houseNumber: "7-6-708", voters: 6 },
      { houseNumber: "7-6-709", voters: 5 },
      { houseNumber: "7-6-710", voters: 9 },
      { houseNumber: "7-6-711", voters: 3 },
      { houseNumber: "7-6-712", voters: 7 },
      { houseNumber: "7-6-713", voters: 4 },
      { houseNumber: "7-6-714", voters: 5 },
      { houseNumber: "7-6-715", voters: 6 },
      { houseNumber: "7-6-716", voters: 8 },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.voter.deleteMany();
  await prisma.house.deleteMany();
  await prisma.pollingStation.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const agentPassword = await bcrypt.hash("agent123", 10);

  await prisma.user.create({
    data: { username: "admin", password: adminPassword, role: "ADMIN" },
  });
  await prisma.user.create({
    data: { username: "agent", password: agentPassword, role: "AGENT" },
  });
  console.log("  Users created: admin / admin123, agent / agent123");

  // Create polling stations with houses and voters
  let totalHouses = 0;
  let totalVoters = 0;

  for (const ps of PS_DATA) {
    const station = await prisma.pollingStation.create({
      data: {
        psNumber: ps.psNumber,
        psName: ps.psName,
        inchargeName: ps.inchargeName,
      },
    });

    for (const h of ps.houses) {
      const house = await prisma.house.create({
        data: {
          houseNumber: h.houseNumber,
          totalVoters: h.voters,
          pollingStationId: station.id,
        },
      });

      const voterData = Array.from({ length: h.voters }, (_, i) => ({
        voterNumber: i + 1,
        met: false,
        houseId: house.id,
      }));

      await prisma.voter.createMany({ data: voterData });

      totalHouses++;
      totalVoters += h.voters;
    }

    console.log(
      `  PS ${ps.psNumber} — ${ps.psName}: ${ps.houses.length} houses`
    );
  }

  console.log(
    `\nSeed complete: ${PS_DATA.length} PS, ${totalHouses} houses, ${totalVoters} voters`
  );
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
