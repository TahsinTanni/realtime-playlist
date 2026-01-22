# Realtime Collaborative Playlist Manager

A collaborative playlist application where multiple users can add, remove, reorder, and vote on songs in a shared playlist with realtime synchronization across all connected clients.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Installation & Running

```bash
# Install dependencies
npm install

# Set up database and seed data
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

The application will be available at **http://localhost:3000**

### Testing Realtime Sync
Open the application in **3+ browser windows** simultaneously to see realtime synchronization in action!

## 📋 Features

### Core Functionality
- ✅ **Shared Collaborative Playlist** - All users see and modify the same playlist
- ✅ **Realtime Synchronization** - Updates propagate within ~1 second via Server-Sent Events (SSE)
- ✅ **Drag & Drop Reordering** - Smooth, intuitive track reordering with position algorithm
- ✅ **Voting System** - Upvote/downvote tracks with realtime vote count updates
- ✅ **Now Playing Simulation** - Visual indicator, progress bar, and auto-advance
- ✅ **Track Library** - Searchable library with genre filtering
- ✅ **Duplicate Prevention** - Tracks can only appear once in the playlist
- ✅ **Optimistic Updates** - Instant UI feedback with server reconciliation

### Technical Features
- ✅ **SSE with Exponential Backoff** - Automatic reconnection with increasing delays
- ✅ **Connection Status Indicator** - Real-time connection status display
- ✅ **Position Algorithm** - Efficient fractional indexing for infinite insertions
- ✅ **Smooth Animations** - 60 FPS drag animations and transitions

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- **Next.js 16** (App Router) - React framework with server components
- **React 19** - UI library with hooks for state management
- **TypeScript** - Type safety throughout the application
- **Tailwind CSS 4** - Utility-first CSS framework
- **@dnd-kit** - Performant drag-and-drop library

**Backend:**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 6** - Modern ORM for type-safe database access
- **SQLite** - Lightweight embedded database (via Prisma)

**Realtime:**
- **Server-Sent Events (SSE)** - One-way realtime updates from server to clients
- **Custom SSE Manager** - Singleton service for broadcasting events

**Testing:**
- **Vitest** - Fast unit test runner

## 🧮 Position Algorithm

The application implements a **fractional indexing** algorithm for efficient reordering without full reindexing:

```typescript
function calculatePosition(prevPosition: number | null, nextPosition: number | null): number {
  if (!prevPosition && !nextPosition) return 1.0;
  if (!prevPosition) return nextPosition! - 1;
  if (!nextPosition) return prevPosition + 1;
  return (prevPosition + nextPosition) / 2;
}
```

### Example Sequence:
```
Initial:  [1.0,    2.0,    3.0]
Insert:   [1.0, 1.5, 2.0,   3.0]
Insert:   [1.0, 1.25, 1.5, 2.0, 3.0]
```

This allows **infinite insertions** without needing to reindex all positions!

## 🔌 API Endpoints

### Tracks Library

#### `GET /api/tracks`
Returns all available tracks in the library.

### Playlist Operations

#### `GET /api/playlist`
Returns the current playlist ordered by position.

#### `POST /api/playlist`
Add a track to the playlist.

**Request:**
```json
{
  "track_id": "track-5",
  "added_by": "User456"
}
```

#### `PATCH /api/playlist/:id`
Update track position or playing status.

#### `DELETE /api/playlist/:id`
Remove a track from the playlist.

#### `POST /api/playlist/:id/vote`
Vote on a track (up/down).

### Realtime Updates

#### `GET /api/stream`
Server-Sent Events endpoint for realtime updates.

**Event Types:**
- `track.added`, `track.removed`, `track.moved`, `track.voted`, `track.playing`, `ping`

## 🧪 Testing

```bash
npm test
```

### Test Coverage
- ✅ Position calculation algorithm
- ✅ API endpoint functionality
- ✅ Duplicate prevention
- ✅ Vote system
- ✅ Playing state enforcement

## 🎯 Technical Decisions

### Why SSE over WebSocket?
- Simpler one-way communication
- Automatic reconnection built-in
- HTTP/2 friendly
- Firewall friendly

### Why Fractional Indexing?
- O(1) insert complexity
- Infinite insertions without reindexing
- Simple midpoint calculation
- Database efficient

### Why Optimistic Updates?
- Instant UI feedback
- Better perceived performance
- Graceful rollback on errors

## 🚧 If I Had 2 More Days...

### High Priority Features
1. **User Authentication** - Multi-user support with proper sessions
2. **Multiple Playlists** - Create and manage multiple playlists
3. **Auto-sort by Votes** - Optional automatic reordering
4. **Track History** - View previously played tracks
5. **Keyboard Shortcuts** - Space for play/pause, arrows for navigation

### Performance Optimizations
6. **Virtual Scrolling** - Handle 1000+ tracks efficiently
7. **Debounced Drag Updates** - Batch rapid movements
8. **React.memo Optimization** - Memoize expensive components
9. **IndexedDB Caching** - Offline-first track library

### UX Enhancements
10. **Track Preview** - Hover to play snippets
11. **Undo/Redo** - Operation history
12. **Collaborative Cursors** - See other users' interactions
13. **User Presence** - Show who's online
14. **Dark Mode** - Theme toggle

### Infrastructure
15. **Docker Compose** - One-command setup
16. **E2E Tests** - Playwright for critical flows
17. **PostgreSQL Migration** - Production-ready database
18. **Redis for SSE** - Horizontal scaling
19. **Rate Limiting** - API abuse prevention
20. **Deployment** - Vercel/Railway with proper configs

## 🐛 Known Limitations

1. **No Authentication** - All users are "Anonymous"
2. **Single Playlist** - Only one global playlist
3. **SQLite** - Not suitable for high-concurrency production
4. **No Rate Limiting** - API can be spammed
5. **Limited Error Handling** - Some edge cases not covered

## 📦 Database Schema

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

## 🤝 Project Info

This is a take-home assignment showcasing:
- Realtime synchronization with SSE
- Drag-and-drop with fractional indexing
- Optimistic updates and state management
- Clean API design with proper error handling
- Comprehensive testing strategy

---

**Built with ❤️ using Next.js, React, Prisma, and Tailwind CSS**
