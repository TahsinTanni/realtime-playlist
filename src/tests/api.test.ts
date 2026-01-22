import { describe, it, expect } from 'vitest';

describe('API: GET /api/tracks', () => {
  it('should return all tracks', async () => {
    const response = await fetch('http://localhost:3000/api/tracks');
    expect(response.status).toBe(200);
    
    const tracks = await response.json();
    expect(Array.isArray(tracks)).toBe(true);
    expect(tracks.length).toBeGreaterThan(0);
    
    const firstTrack = tracks[0];
    expect(firstTrack).toHaveProperty('id');
    expect(firstTrack).toHaveProperty('title');
    expect(firstTrack).toHaveProperty('artist');
    expect(firstTrack).toHaveProperty('duration_seconds');
  });
});

describe('API: GET /api/playlist', () => {
  it('should return playlist ordered by position', async () => {
    const response = await fetch('http://localhost:3000/api/playlist');
    expect(response.status).toBe(200);
    
    const playlist = await response.json();
    expect(Array.isArray(playlist)).toBe(true);
    
    // Check ordering
    for (let i = 1; i < playlist.length; i++) {
      expect(playlist[i].position).toBeGreaterThanOrEqual(playlist[i - 1].position);
    }
  });
});

describe('API: POST /api/playlist', () => {
  it('should add a track to the playlist', async () => {
    const response = await fetch('http://localhost:3000/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: 'track-15', added_by: 'TestUser' })
    });
    
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result).toHaveProperty('id');
    expect(result.track_id).toBe('track-15');
  });

  it('should reject duplicate tracks', async () => {
    // Add once
    await fetch('http://localhost:3000/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: 'track-20', added_by: 'TestUser' })
    });

    // Try to add again
    const response = await fetch('http://localhost:3000/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: 'track-20', added_by: 'TestUser' })
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error.code).toBe('DUPLICATE_TRACK');
  });

  it('should reject missing required fields', async () => {
    const response = await fetch('http://localhost:3000/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: 'track-1' })
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('API: PATCH /api/playlist/:id', () => {
  it('should update position', async () => {
    const playlist = await fetch('http://localhost:3000/api/playlist').then(r => r.json());
    const trackId = playlist[0].id;

    const response = await fetch(`http://localhost:3000/api/playlist/${trackId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: 99.5 })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.position).toBe(99.5);
  });

  it('should enforce only one is_playing=true', async () => {
    const playlist = await fetch('http://localhost:3000/api/playlist').then(r => r.json());
    
    // Set first track as playing
    await fetch(`http://localhost:3000/api/playlist/${playlist[0].id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_playing: true })
    });

    // Set second track as playing
    await fetch(`http://localhost:3000/api/playlist/${playlist[1].id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_playing: true })
    });

    // Verify only one is playing
    const updatedPlaylist = await fetch('http://localhost:3000/api/playlist').then(r => r.json());
    const playingTracks = updatedPlaylist.filter((t: { is_playing: boolean }) => t.is_playing);
    expect(playingTracks.length).toBe(1);
    expect(playingTracks[0].id).toBe(playlist[1].id);
  });
});

describe('API: POST /api/playlist/:id/vote', () => {
  it('should increment votes when direction is up', async () => {
    const playlist = await fetch('http://localhost:3000/api/playlist').then(r => r.json());
    const trackId = playlist[0].id;
    const initialVotes = playlist[0].votes;

    const response = await fetch(`http://localhost:3000/api/playlist/${trackId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction: 'up' })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.votes).toBe(initialVotes + 1);
  });

  it('should decrement votes when direction is down', async () => {
    const playlist = await fetch('http://localhost:3000/api/playlist').then(r => r.json());
    const trackId = playlist[0].id;
    const initialVotes = playlist[0].votes;

    const response = await fetch(`http://localhost:3000/api/playlist/${trackId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction: 'down' })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.votes).toBe(initialVotes - 1);
  });

  it('should reject invalid direction', async () => {
    const playlist = await fetch('http://localhost:3000/api/playlist').then(r => r.json());
    const trackId = playlist[0].id;

    const response = await fetch(`http://localhost:3000/api/playlist/${trackId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction: 'invalid' })
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('API: DELETE /api/playlist/:id', () => {
  it('should remove a track from the playlist', async () => {
    // Add a track first
    const addResponse = await fetch('http://localhost:3000/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track_id: 'track-25', added_by: 'TestUser' })
    });
    const added = await addResponse.json();

    // Delete it
    const deleteResponse = await fetch(`http://localhost:3000/api/playlist/${added.id}`, {
      method: 'DELETE'
    });

    expect(deleteResponse.status).toBe(204);

    // Verify it's gone
    const playlist = await fetch('http://localhost:3000/api/playlist').then(r => r.json());
    expect(playlist.find((t: { id: string }) => t.id === added.id)).toBeUndefined();
  });
});
