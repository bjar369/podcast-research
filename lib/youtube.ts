import axios from 'axios';
import type { YouTubeVideo } from '../types/content';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

const buildQueries = (personName: string) => [
  `"${personName}" interview`,
  `intitle:"${personName}" interview`,
  `"${personName}" podcast`,
  `intitle:"${personName}" podcast`,
  `"${personName}" conversation`,
  `intitle:"${personName}" conversation`,
  `"${personName}" guest`,
  `intitle:"${personName}" guest`,
  `"${personName}" discussion`,
  `intitle:"${personName}" discussion`,
  `"${personName}"`,
  `intitle:"${personName}"`,
];

const fetchVideosForQuery = async (query: string, maxResults: number = 10) => {
  const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      q: query,
      type: 'video',
      part: 'snippet',
      maxResults,
      order: 'relevance',
      videoDuration: 'medium',
    },
  });
  const items = response.data.items || [];
  const videoIds = items.map((item: { id: { videoId: string } }) => item.id.videoId).filter(Boolean);
  if (videoIds.length === 0) return [];
  const detailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
    params: {
      key: process.env.YOUTUBE_API_KEY,
      id: videoIds.join(','),
      part: 'snippet,statistics,contentDetails',
    },
  });
  return detailsResponse.data.items.map((item: {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: { medium: { url: string } };
      channelTitle: string;
      channelId: string;
      publishedAt: string;
    };
    contentDetails: { duration: string };
    statistics: { viewCount?: string };
  }) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    channel: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails.duration,
    viewCount: parseInt(item.statistics.viewCount || '0'),
    url: `https://www.youtube.com/watch?v=${item.id}`,
  }));
};

export const searchYouTubeVideos = async (
  personName: string,
  maxResults: number = 25
): Promise<YouTubeVideo[]> => {
  try {
    const queries = buildQueries(personName);
    // Run all queries in parallel, limit each to 10 results for quota efficiency
    const results = await Promise.all(queries.map(q => fetchVideosForQuery(q, 10)));
    // Flatten and deduplicate by video ID
    const allVideos = results.flat();
    const uniqueVideosMap = new Map<string, YouTubeVideo>();
    for (const video of allVideos) {
      if (!uniqueVideosMap.has(video.id)) {
        uniqueVideosMap.set(video.id, video);
      }
    }
    // Optionally, sort by viewCount descending for relevance
    const uniqueVideos = Array.from(uniqueVideosMap.values())
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, maxResults);
    return uniqueVideos;
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
};