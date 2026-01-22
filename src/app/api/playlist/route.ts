import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const playlist = await prisma.playlistTrack.findMany({
    orderBy: { position: "asc" },
    include: {
      track: {
        select: {
          id: true,
          title: true,
          artist: true,
          album: true,
          duration_seconds: true,
          genre: true,
          cover_url: true,
        },
      },
    },
  });

  // Only return the required fields
  const result = playlist.map(item => ({
    id: item.id,
    position: item.position,
    votes: item.votes,
    added_by: item.added_by,
    added_at: item.added_at,
    is_playing: item.is_playing,
    played_at: item.played_at,
    track: item.track,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { track_id, added_by } = body || {};

    // Validation
    if (!track_id || !added_by) {
      return NextResponse.json({
        error: {
          code: "VALIDATION_ERROR",
          message: "track_id and added_by are required"
        }
      }, { status: 400 });
    }

    // Duplicate check
    const existing = await prisma.playlistTrack.findUnique({ where: { track_id } });
    if (existing) {
      return NextResponse.json({
        error: {
          code: "DUPLICATE_TRACK",
          message: "This track is already in the playlist",
          details: { track_id }
        }
      }, { status: 400 });
    }

    // Find max position
    const maxPosition = await prisma.playlistTrack.aggregate({
      _max: { position: true }
    });
    const position = maxPosition._max.position != null ? maxPosition._max.position + 1 : 1.0;

    // Create PlaylistTrack
    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        id: `playlist-item-${Date.now()}`,
        track_id,
        position,
        votes: 0,
        added_by,
        added_at: new Date(),
        is_playing: false,
        played_at: null,
      },
      include: { track: true }
    });

    return NextResponse.json(playlistTrack, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: { code: "SERVER_ERROR", message: "An error occurred" } }, { status: 500 });
  }
}
