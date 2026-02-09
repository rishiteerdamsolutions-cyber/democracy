import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { psId: string } }
) {
  try {
    const { psId } = params;

    const ps = await prisma.pollingStation.findUnique({
      where: { id: psId },
      include: {
        houses: {
          include: {
            voters: {
              orderBy: { voterNumber: "asc" },
            },
          },
        },
      },
    });

    if (!ps) {
      return NextResponse.json(
        { error: "Polling station not found" },
        { status: 404 }
      );
    }

    // Sort houses by houseNumber naturally
    const sortedHouses = [...ps.houses].sort((a, b) => {
      return a.houseNumber.localeCompare(b.houseNumber, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    const totalHouses = sortedHouses.length;
    const totalVoters = sortedHouses.reduce((s, h) => s + h.voters.length, 0);
    const votersMet = sortedHouses.reduce(
      (s, h) => s + h.voters.filter((v) => v.met).length,
      0
    );

    let housesCompleted = 0;
    let housesVisited = 0;

    for (const house of sortedHouses) {
      const met = house.voters.filter((v) => v.met).length;
      if (met === house.voters.length && met > 0) housesCompleted++;
      if (met > 0) housesVisited++;
    }

    return NextResponse.json({
      id: ps.id,
      psNumber: ps.psNumber,
      psName: ps.psName,
      inchargeName: ps.inchargeName,
      houses: sortedHouses.map((h) => ({
        id: h.id,
        houseNumber: h.houseNumber,
        totalVoters: h.totalVoters,
        voters: h.voters.map((v) => ({
          id: v.id,
          voterNumber: v.voterNumber,
          met: v.met,
        })),
      })),
      stats: {
        totalHouses,
        housesVisited,
        housesCompleted,
        totalVoters,
        votersMet,
        completionPercentage:
          totalVoters > 0 ? Math.round((votersMet / totalVoters) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("PS detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch polling station" },
      { status: 500 }
    );
  }
}
