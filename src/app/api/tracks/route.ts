import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tracks = await prisma.track.findMany();
  return NextResponse.json(tracks);
}