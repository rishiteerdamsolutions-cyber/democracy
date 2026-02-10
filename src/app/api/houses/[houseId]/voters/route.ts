import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { houseId: string } }
) {
  try {
    const { houseId } = params;
    const { voters } = await req.json();

    if (!Array.isArray(voters)) {
      return NextResponse.json(
        { error: "voters must be an array of { id, met }" },
        { status: 400 }
      );
    }

    // Verify house exists
    const house = await prisma.house.findUnique({
      where: { id: houseId },
      include: { voters: true },
    });

    if (!house) {
      return NextResponse.json(
        { error: "House not found" },
        { status: 404 }
      );
    }

    // Update each voter
    for (const v of voters) {
      if (typeof v.id !== "string" || typeof v.met !== "boolean") continue;
      await prisma.voter.update({
        where: { id: v.id },
        data: { met: v.met },
      });
    }

    // Return updated house data
    const updated = await prisma.house.findUnique({
      where: { id: houseId },
      include: {
        voters: { orderBy: { serialNumber: "asc" } },
      },
    });

    const metCount = updated!.voters.filter((v) => v.met).length;
    const total = updated!.voters.length;

    let status: string;
    if (metCount === 0) status = "not_met";
    else if (metCount === total) status = "complete";
    else status = "partial";

    return NextResponse.json({
      id: updated!.id,
      houseNumber: updated!.houseNumber,
      totalVoters: updated!.totalVoters,
      status,
      voters: updated!.voters.map((v) => ({
        id: v.id,
        serialNumber: v.serialNumber,
        met: v.met,
      })),
    });
  } catch (error) {
    console.error("Update voters error:", error);
    return NextResponse.json(
      { error: "Failed to update voters" },
      { status: 500 }
    );
  }
}
