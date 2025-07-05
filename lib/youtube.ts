import axios, { AxiosError } from 'axios';
import type { YouTubeVideo } from '../types/content';


const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

const buildQueries = (personName: string) => [
  `"${personName}" interview`,
  `"${personName}" podcast`,
  `"${personName}"`,
];

const fetchVideosForQuery = async (query: string, maxResults: number = 10) => {
  try {
    console.log(`Making YouTube search request for: "${query}"`);
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        q: query,
        type: 'video',
        part: 'snippet',
        maxResults,
        order: 'relevance',
        videoDuration: 'medium',
        safeSearch: 'strict',
        relevanceLanguage: 'en',
        videoEmbeddable: 'true'
        // publishedAfter: '2022-07-01T00:00:00Z' // Optional - removed to find more videos
      },
    });
    
    const items = response.data.items || [];
    console.log(`Search returned ${items.length} items for query: "${query}"`);
    
    const videoIds = items.map((item: { id: { videoId: string } }) => item.id.videoId).filter(Boolean);
    console.log(`Found ${videoIds.length} valid video IDs`);
    
    if (videoIds.length === 0) return [];
    
    console.log(`Fetching details for ${videoIds.length} videos`);
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        id: videoIds.join(','),
        part: 'snippet,statistics,contentDetails',
      },
    });
    
    const videos = detailsResponse.data.items.map((item: {
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
    
    console.log(`Successfully processed ${videos.length} videos for query: "${query}"`);
    return videos;
  } catch (error: unknown) {
    console.error(`Error in fetchVideosForQuery for "${query}":`, error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as AxiosError;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
    }
    throw error;
  }
};

export const searchYouTubeVideos = async (
  personName: string,
  maxResults: number = 25
): Promise<YouTubeVideo[]> => {
  try {
    console.log('Searching YouTube for:', personName);
    console.log('YouTube API Key available:', !!process.env.YOUTUBE_API_KEY);
    
    const queries = buildQueries(personName);
    console.log('Generated queries:', queries);
    
    // Run all queries in parallel, limit each to 5 results for quota efficiency
    const results = await Promise.all(queries.map(async (q, index) => {
      console.log(`Query ${index + 1}: "${q}"`);
      const result = await fetchVideosForQuery(q, 5);
      console.log(`Query ${index + 1} returned ${result.length} videos`);
      return result;
    }));
    
    // Flatten and deduplicate by video ID
    const allVideos = results.flat();
    console.log('Total videos found:', allVideos.length);
    
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
    
    console.log('Final unique videos:', uniqueVideos.length);
    return uniqueVideos;
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
};

export const getYouTubeTranscript = async (videoId: string) => {
  try {
    console.log(`Fetching transcript for video: ${videoId}`);
    
    const response = await fetch('/api/transcript/youtube', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: videoId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch transcript');
    }

    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    throw error;
  }
};