#!/bin/bash
set -e

API_URL="http://localhost:3000/api"
TRACK_ID="track-1"
ADDED_BY="Alice"

# 1. Add a track to playlist

echo "\n--- Adding track to playlist ---"
ADD_RESPONSE=$(curl -s -X POST "$API_URL/playlist" \
  -H "Content-Type: application/json" \
  -d '{"track_id":"'$TRACK_ID'","added_by":"'$ADDED_BY'"}')
echo "$ADD_RESPONSE"

# 2. Try adding same track again (should get duplicate error)

echo "\n--- Adding same track again (expect duplicate error) ---"
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_URL/playlist" \
  -H "Content-Type: application/json" \
  -d '{"track_id":"'$TRACK_ID'","added_by":"'$ADDED_BY'"}')
echo "$DUPLICATE_RESPONSE"

# 3. Fetch /api/playlist and extract one playlist item id

echo "\n--- Fetching playlist and extracting one id ---"
PLAYLIST=$(curl -s "$API_URL/playlist")
echo "$PLAYLIST"
if command -v jq &> /dev/null; then
  ITEM_ID=$(echo "$PLAYLIST" | jq -r '.[0].id')
else
  ITEM_ID=$(echo "$PLAYLIST" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi
echo "Extracted playlist item id: $ITEM_ID"

# 4. Vote up on that id

echo "\n--- Voting up on playlist item ---"
VOTE_RESPONSE=$(curl -s -X POST "$API_URL/playlist/$ITEM_ID/vote" \
  -H "Content-Type: application/json" \
  -d '{"direction":"up"}')
echo "$VOTE_RESPONSE"

# 5. Patch is_playing true on that id

echo "\n--- Patching is_playing=true on playlist item ---"
PATCH_RESPONSE=$(curl -s -X PATCH "$API_URL/playlist/$ITEM_ID" \
  -H "Content-Type: application/json" \
  -d '{"is_playing":true}')
echo "$PATCH_RESPONSE"

# 6. Delete that id

echo "\n--- Deleting playlist item ---"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/playlist/$ITEM_ID")
echo "Deleted. Status: $?"
