# Video Upload CSV

This folder contains CSV files for video uploads.

## CSV Format

The CSV file must have the following columns:

- **youtubeId**: The YouTube video ID
- **title**: The video title
- **channelName**: The name of the YouTube channel
- **thumbnailUrl**: URL to the video thumbnail image
- **description**: Video description
- **videoUrl**: Direct URL to the video

## Example

```csv
youtubeId,title,channelName,thumbnailUrl,description,videoUrl
dQw4w9WgXcQ,Example Video,Example Channel,https://example.com/thumb.jpg,This is an example video description,https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## Usage

1. Add your video data to `videos.csv`
2. Ensure all required columns are present
3. Follow the CSV format requirements from the parent folder's README
