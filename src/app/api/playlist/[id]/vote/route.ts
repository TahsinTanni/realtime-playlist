import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const { direction } = body || {};

  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({
      error: {
        code: "VALIDATION_ERROR",
        message: 'direction must be "up" or "down"'
      }
    }, { status: 400 });
  }

  const updated = await prisma.playlistTrack.update({
    where: { id },
    data: {
      votes: direction === "up" ? { increment: 1 } : { decrement: 1 }
    },
    include: { track: true }
  });

  return NextResponse.json(updated, { status: 200 });
}
