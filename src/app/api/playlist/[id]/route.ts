import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sseManager } from "@/lib/sse-manager";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const body = await request.json();
  const { position, is_playing } = body || {};

  let updated;
  if (typeof is_playing === "boolean") {
    if (is_playing) {
      // Enforce only one is_playing=true
      const result = await prisma.$transaction([
        prisma.playlistTrack.updateMany({
          where: { is_playing: true },
          data: { is_playing: false },
        }),
        prisma.playlistTrack.update({
          where: { id },
          data: {
            is_playing: true,
            played_at: new Date(),
            ...(typeof position === "number" ? { position } : {}),
          },
          include: { track: true },
        }),
      ]);
      // The second result is the updated record
      updated = result[1];
    } else {
      updated = await prisma.playlistTrack.update({
        where: { id },
        data: {
          is_playing: false,
          ...(typeof position === "number" ? { position } : {}),
        },
        include: { track: true },
      });
    }
  } else if (typeof position === "number") {
    updated = await prisma.playlistTrack.update({
      where: { id },
      data: { position },
      include: { track: true },
    });
  } else {
    // No valid fields to update
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "No valid fields to update" } }, { status: 400 });
  }

  // Broadcast appropriate event
  if (typeof is_playing === "boolean" && is_playing) {
    sseManager.broadcast({ type: 'track.playing', id });
  } else if (typeof position === "number") {
    sseManager.broadcast({ type: 'track.moved', item: { id, position } });
  }

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  await prisma.playlistTrack.delete({ where: { id } });
  
  // Broadcast event
  sseManager.broadcast({ type: 'track.removed', id });
  
  return new NextResponse(null, { status: 204 });
}
