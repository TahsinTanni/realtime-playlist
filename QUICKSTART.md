# 🚀 Quick Start Guide

## One-Command Setup

```bash
npm install && npx prisma db push && npx prisma db seed && npm run dev
```

Then open **http://localhost:3000** in your browser!

## Step-by-Step

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Setup Database
```bash
npx prisma db push
npx prisma db seed
```

### 3️⃣ Start Server
```bash
npm run dev
```

### 4️⃣ Open Application
Navigate to: **http://localhost:3000**

## Testing Realtime Sync

Open the same URL in **3+ browser windows** side-by-side and:
- ✅ Add tracks from one window
- ✅ Drag-and-drop reorder from another
- ✅ Vote on tracks from a third
- ✅ Watch everything sync in realtime! (<1 second)

## Run Tests

```bash
npm test
```

## Reset Database

```bash
npx prisma migrate reset --force
```

## Project Structure

```
src/
├── app/                  # Next.js pages & API routes
├── components/           # React components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & services
└── types/               # TypeScript types

prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Seed data
```

## Key Features

✅ **Add Tracks** - Search library, click "Add"  
✅ **Reorder** - Drag tracks using handle (☰)  
✅ **Vote** - Click ↑/↓ arrows  
✅ **Play** - Auto-playing track has pulsing bars  
✅ **Remove** - Hover over track, click X  
✅ **Search** - Filter by name or artist  
✅ **Genres** - Click genre pills to filter  

## Connection Status

Look for the colored dot in the header:
- 🟢 Green = Connected
- 🟡 Yellow = Connecting
- 🔴 Red = Disconnected

Auto-reconnects with exponential backoff!

## Need Help?

- 📖 Full docs: [README_NEW.md](README_NEW.md)
- 🎬 Demo guide: [DEMO.md](DEMO.md)
- ✅ Status: [STATUS.md](STATUS.md)

## Common Issues

**Port already in use?**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Database locked?**
```bash
# Stop server, then:
rm prisma/dev.db
npx prisma db push
npx prisma db seed
```

**Changes not syncing?**
- Check connection status (should be green)
- Open DevTools console for errors
- Refresh all browser windows

---

**You're all set! Happy testing! 🎉**
