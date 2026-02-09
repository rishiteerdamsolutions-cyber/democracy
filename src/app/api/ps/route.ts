import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stations = await prisma.pollingStation.findMany({
      include: {
        houses: {
          include: {
            voters: true,
          },
        },
      },
      orderBy: { psNumber: "asc" },
    });

    let overallTotalHouses = 0;
    let overallHousesCompleted = 0;
    let overallTotalVoters = 0;
    let overallVotersMet = 0;

    const result = stations.map((ps) => {
      const totalHouses = ps.houses.length;
      const totalVoters = ps.houses.reduce((s, h) => s + h.voters.length, 0);
      const votersMet = ps.houses.reduce(
        (s, h) => s + h.voters.filter((v) => v.met).length,
        0
      );

      let housesCompleted = 0;
      let housesPartial = 0;

      for (const house of ps.houses) {
        const met = house.voters.filter((v) => v.met).length;
        if (met === house.voters.length && met > 0) housesCompleted++;
        else if (met > 0) housesPartial++;
      }

      overallTotalHouses += totalHouses;
      overallHousesCompleted += housesCompleted;
      overallTotalVoters += totalVoters;
      overallVotersMet += votersMet;

      return {
        id: ps.id,
        psNumber: ps.psNumber,
        psName: ps.psName,
        inchargeName: ps.inchargeName,
        totalHouses,
        housesCompleted,
        housesPartial,
        housesPending: totalHouses - housesCompleted - housesPartial,
        totalVoters,
        votersMet,
        votersNotMet: totalVoters - votersMet,
        completionPercentage:
          totalVoters > 0 ? Math.round((votersMet / totalVoters) * 100) : 0,
      };
    });

    return NextResponse.json({
      stations: result,
      overall: {
        totalStations: stations.length,
        totalHouses: overallTotalHouses,
        housesCompleted: overallHousesCompleted,
        totalVoters: overallTotalVoters,
        votersMet: overallVotersMet,
        votersNotMet: overallTotalVoters - overallVotersMet,
        completionPercentage:
          overallTotalVoters > 0
            ? Math.round((overallVotersMet / overallTotalVoters) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("PS list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch polling stations" },
      { status: 500 }
    );
  }
}
