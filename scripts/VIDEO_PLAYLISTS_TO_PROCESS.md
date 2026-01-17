# Video Playlists That Need Processing

The following YouTube playlists were referenced but need to be processed separately using the YouTube API to extract individual video IDs:

## ComfyUI Playlists

1. **Playlist 1**: https://www.youtube.com/playlist?list=PLytT-JPS5UETbSOUKRlxE6ADyLY8TMP5e
   - Tool: ComfyUI
   - Purpose: ComfyUI tutorial series

2. **Playlist 2**: https://www.youtube.com/playlist?list=PLeSRFsDW9Go8gcQpp9kBBOCnsE-EdhMGF
   - Tool: ComfyUI
   - Purpose: ComfyUI tutorial series

## Fal.ai Playlist

3. **Fal.ai Playlist**: https://www.youtube.com/playlist?list=PLg9z7TXgYiH1doa0wMTCzG5X2Z5JAuxYk
   - Tool: Fal.ai
   - Purpose: Fal.ai tutorial series

## Processing Instructions

To add these playlists to the database:

1. Use the YouTube Data API v3 to fetch all video IDs from each playlist
2. For each video in the playlist, extract:
   - Video ID
   - Title
   - Channel name
   - Thumbnail URL
   - Description
3. Add each video to the `videos` table with the appropriate `tools_used` array

### Example API Call

```bash
# Get playlist items
GET https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLytT-JPS5UETbSOUKRlxE6ADyLY8TMP5e&key=YOUR_API_KEY
```

### Script Enhancement

Consider creating a `scripts/add-playlist-videos.ts` script that:
- Takes a playlist URL as input
- Uses YouTube API to fetch all videos
- Adds them to the database with appropriate metadata
