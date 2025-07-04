export interface Podcast {
  id: string;
  title: string;
  description: string;
  image: string;
  publisher: string;
  language: string;
  total_episodes: number;
  explicit_content: boolean;
  website: string;
  rss: string;
  listen_score: number;
  listen_score_global_rank: string;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  pub_date_ms: number;
  audio: string;
  audio_length_sec: number;
  link: string;
  image: string;
  podcast: {
    id: string;
    title: string;
    publisher: string;
    image: string;
  };
  transcript?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  channelId: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  url: string;
  transcript?: string;
}

export interface PersonSearchResult {
  name: string;
  podcasts: Episode[];
  youtubeVideos: YouTubeVideo[];
  totalResults: number;
  searchTimestamp: string;
}

export interface ContentAnalysis {
  summary: string;
  keyTopics: string[];
  expertise: string[];
  personalityTraits: string[];
  speakingStyle: string;
  commonThemes: string[];
  recommendations: string[];
  totalContentAnalyzed: number;
}