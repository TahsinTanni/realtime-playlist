# 🎬 Demo Instructions

## How to Test Realtime Sync

### 1. Start the Application
```bash
npm run dev
```
Navigate to http://localhost:3000

### 2. Open Multiple Browser Windows
- Open 3+ browser windows or tabs
- Point all of them to http://localhost:3000
- Position windows side-by-side to observe realtime sync

### 3. Test Scenarios

#### Scenario A: Adding Tracks
1. In Window 1: Search for "Track 15" and click "Add"
2. **Observe**: Track appears in all windows within ~1 second
3. **Verify**: Track appears at the bottom of the playlist
4. **Verify**: "Add" button becomes "In Playlist" in all windows

#### Scenario B: Voting
1. In Window 1: Click upvote (↑) on any track
2. **Observe**: Vote count increases in all windows
3. In Window 2: Click downvote (↓) on the same track
4. **Observe**: Vote count decreases in all windows
5. **Verify**: Vote animations smooth, no flickering

#### Scenario C: Drag & Drop Reordering
1. In Window 1: Drag a track from position 3 to position 1
2. **Observe**: Track smoothly animates to new position
3. **Observe**: All other windows update with the new order
4. **Verify**: Positions are maintained (no conflicts)
5. Try rapid drags: Order should stay consistent

#### Scenario D: Now Playing & Auto-Advance
1. Find a track with `is_playing: true` (indicated by pulsing bars)
2. **Observe**: Progress bar fills up over time
3. **Observe**: When track reaches 100%, next track auto-plays
4. Click "Skip" button
5. **Observe**: Next track immediately starts playing in all windows

#### Scenario E: Track Removal
1. In Window 1: Hover over a track and click the X button
2. **Observe**: Track disappears from all windows
3. **Verify**: No gaps in the playlist

#### Scenario F: Search & Filter
1. In Window 1: Type "Alice" in search box
2. **Observe**: Only tracks by Alice are shown
3. Click genre filter (e.g., "Rock")
4. **Observe**: Only Rock tracks shown
5. Add a filtered track
6. Clear filters - verify track was added

#### Scenario G: Connection Resilience
1. Open DevTools → Network tab
2. Set network to "Offline"
3. **Observe**: Connection indicator turns red
4. Try adding a track (should fail)
5. Set network back to "Online"
6. **Observe**: Connection indicator turns green within 30 seconds
7. **Verify**: All changes sync when reconnected

#### Scenario H: Duplicate Prevention
1. Add "Track 10" from library
2. Try to add "Track 10" again
3. **Observe**: Alert shows "This track is already in the playlist"
4. **Verify**: Track appears only once

### 4. Performance Testing

#### Test with Many Tracks
1. Add 20+ tracks to the playlist
2. Scroll rapidly through the playlist
3. Drag tracks from top to bottom
4. **Verify**: Smooth 60 FPS animations
5. **Verify**: No lag or stuttering

#### Test Concurrent Operations
1. Have 3 windows open
2. Simultaneously:
   - Window 1: Add a track
   - Window 2: Vote on a different track
   - Window 3: Reorder another track
3. **Verify**: All operations complete successfully
4. **Verify**: All windows show consistent state

### 5. Expected Behaviors

#### ✅ Success Indicators
- Changes appear in all windows within 1 second
- No duplicate tracks appear
- Only one track has "Now Playing" status
- Drag animations are smooth
- Connection status accurate (green = connected)
- Vote counts are consistent across windows
- No console errors

#### ⚠️ Known Behaviors (Not Bugs)
- Slight position jitter during concurrent drags (last update wins)
- Auto-advance timing may vary by ~1 second between windows
- Connection takes up to 30 seconds to recover after long disconnect

### 6. Demo Video Checklist
If recording a demo, show:
- [ ] Side-by-side browser windows
- [ ] Adding tracks from different windows
- [ ] Drag-and-drop reordering
- [ ] Voting with realtime updates
- [ ] Now Playing with auto-advance
- [ ] Connection status indicator
- [ ] Search and filter functionality
- [ ] Track removal

### 7. Quick Reset
To reset the demo environment:
```bash
npx prisma migrate reset --force
```
This will:
- Clear all playlist tracks
- Reseed with fresh data (40 tracks, 10 in playlist)
- One track will be marked as playing

### 8. Troubleshooting

**Problem**: Changes not syncing
- **Solution**: Check connection indicator (should be green)
- **Solution**: Open DevTools Console and check for errors
- **Solution**: Refresh all windows

**Problem**: Server crashes
- **Solution**: Restart with `npm run dev`
- **Solution**: Check database file exists: `prisma/dev.db`

**Problem**: Drag-and-drop not working
- **Solution**: Ensure clicking the drag handle (☰ icon)
- **Solution**: Try clicking and holding for 0.5 seconds before dragging

**Problem**: Track won't play
- **Solution**: Click the track, then click play in Now Playing bar
- **Solution**: Only one track can be playing at a time

## 🎥 Recording Tips

### For Screen Recording:
1. Use 1080p resolution minimum
2. Position 2-3 browser windows side-by-side
3. Show mouse cursor for drag interactions
4. Keep video under 2 minutes
5. Include connection status indicator in frame
6. Show console logs (optional, for technical audience)

### For Screenshots:
1. Capture the full application with multiple tracks
2. Show "Now Playing" bar with progress
3. Highlight connection status (green dot)
4. Show genre filters and search in action
5. Capture vote counts (mix of positive/negative)

## 📊 Metrics to Highlight

- **Sync Latency**: ~500ms-1s for updates to propagate
- **Track Count**: 40 in library, 10 in initial playlist
- **Concurrent Users**: Tested with 5+ simultaneous connections
- **Position Precision**: Fractional indexing to 10+ decimal places
- **Auto-Reconnect**: Exponential backoff up to 30 seconds

---

**Demo Sequence (30 seconds):**
1. Show multiple windows (5s)
2. Add track from Window 1, show sync (5s)
3. Drag-and-drop reorder from Window 2 (5s)
4. Vote on track from Window 3, show vote animation (5s)
5. Show Now Playing auto-advance (5s)
6. Pan across all windows showing consistency (5s)

**Total: 30 seconds of pure action!** 🚀
