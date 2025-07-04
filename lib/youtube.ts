import axios from 'axios';
import type { YouTubeVideo } from '../types/content';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const searchYouTubeVideos = async (
  personName: string,
  maxResults: number = 25
): Promise<YouTubeVideo[]> => {
  try {
    const searchQuery = `"${personName}" interview OR podcast OR conversation`;
    
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        q: searchQuery,
        type: 'video',
        part: 'snippet',
        maxResults,
        order: 'relevance',
        videoDuration: 'medium',
      },
    });

    const videoIds = response.data.items.map((item: any) => item.id.videoId);
    
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        id: videoIds.join(','),
        part: 'snippet,statistics,contentDetails',
      },
    });

    return detailsResponse.data.items.map((item: any) => ({
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
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
};