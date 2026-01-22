// SSE Event Manager - Singleton for broadcasting events to all connected clients
import type { PlaylistTrack } from '@/types';

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

type PlaylistEvent = 
  | { type: 'track.added'; item: PlaylistTrack }
  | { type: 'track.removed'; id: string }
  | { type: 'track.moved'; item: { id: string; position: number } }
  | { type: 'track.voted'; item: { id: string; votes: number } }
  | { type: 'track.playing'; id: string }
  | { type: 'playlist.reordered'; items: PlaylistTrack[] }
  | { type: 'ping'; ts: string };

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  addClient(id: string, controller: ReadableStreamDefaultController) {
    this.clients.set(id, { id, controller });
    console.log(`SSE client connected: ${id}. Total clients: ${this.clients.size}`);
  }

  removeClient(id: string) {
    this.clients.delete(id);
    console.log(`SSE client disconnected: ${id}. Total clients: ${this.clients.size}`);
  }

  broadcast(event: PlaylistEvent) {
    const data = JSON.stringify(event);
    const message = `data: ${data}\n\n`;
    
    // Send to all connected clients
    for (const [id, client] of this.clients.entries()) {
      try {
        client.controller.enqueue(new TextEncoder().encode(message));
      } catch (error) {
        console.error(`Error sending to client ${id}:`, error);
        this.removeClient(id);
      }
    }
  }

  private startHeartbeat() {
    // Send ping every 30 seconds to keep connections alive
    this.heartbeatInterval = setInterval(() => {
      this.broadcast({ type: 'ping', ts: new Date().toISOString() });
    }, 30000);
  }

  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.clear();
  }
}

// Singleton instance
export const sseManager = new SSEManager();
