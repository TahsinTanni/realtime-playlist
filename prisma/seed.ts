import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const genres = ['Rock', 'Pop', 'Electronic', 'Jazz', 'Classical'];
const artists = ['Alice', 'Bob', 'Anonymous', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan'];
const albums = ['Album 1', 'Album 2', 'Album 3', 'Album 4', 'Album 5', 'Album 6', 'Album 7', 'Album 8', 'Album 9', 'Album 10'];

async function main() {
  // Seed 40 tracks
  const tracks = [];
  for (let i = 1; i <= 40; i++) {
    tracks.push({
      id: `track-${i}`,
      title: `Track Title ${i}`,
      artist: artists[i % artists.length],
      album: albums[i % albums.length],
      duration_seconds: 120 + ((i * 7) % 301), // 120-420
      genre: genres[i % genres.length],
      cover_url: null,
    });
  }
  await prisma.track.createMany({ data: tracks});

  // Seed 10 PlaylistTrack rows
  const playlistTracks = [];
  const addedBys = ['Alice', 'Bob', 'Anonymous'];
  const now = new Date();
  for (let i = 1; i <= 10; i++) {
    playlistTracks.push({
      id: `playlist-item-${i}`,
      track_id: `track-${i}`,
      position: i,
      votes: Math.floor(Math.random() * 13) - 2, // -2 to 10
      added_by: addedBys[i % addedBys.length],
      added_at: now,
      is_playing: i === 5, // Only one is_playing true
      played_at: null,
    });
  }
  await prisma.playlistTrack.createMany({ data: playlistTracks});

  console.log('Seed completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
