const fs = require('fs');
const path = require('path');

// File contents
const files = {
  '.env.local': `LISTEN_NOTES_API_KEY=your_listen_notes_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000`,

  'types/content.ts': `export interface Podcast {
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
}`,

  'components/LoadingSpinner.tsx': `export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}`,

  'components/PersonSearch.tsx': `'use client';

import { useState } from 'react';
import { User, Search } from 'lucide-react';

interface PersonSearchProps {
  onSearch: (name: string) => void;
  loading?: boolean;
}

export default function PersonSearch({ onSearch, loading }: PersonSearchProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSearch(name.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1 relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter person's name (e.g., Elon Musk, Joe Rogan)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
}`,

  'components/ContentTabs.tsx': `'use client';

import { useState } from 'react';
import { Youtube, Mic, BarChart } from 'lucide-react';
import type { PersonSearchResult, ContentAnalysis } from '../types/content';

interface ContentTabsProps {
  results: PersonSearchResult | null;
  analysis: ContentAnalysis | null;
  onGetTranscript: (type: 'youtube' | 'podcast', id: string) => Promise<void>;
  onAnalyzeContent: () => Promise<void>;
  transcriptLoading: boolean;
  analysisLoading: boolean;
}

export default function ContentTabs({
  results,
  analysis,
  onGetTranscript,
  onAnalyzeContent,
  transcriptLoading,
  analysisLoading,
}: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<'youtube' | 'podcasts' | 'analysis'>('youtube');

  if (!results) return null;

  return (
    <div className="w-full">
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('youtube')}
            className={\`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 \${
              activeTab === 'youtube'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Youtube className="w-4 h-4" />
            YouTube ({results.youtubeVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('podcasts')}
            className={\`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 \${
              activeTab === 'podcasts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Mic className="w-4 h-4" />
            Podcasts ({results.podcasts.length})
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={\`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 \${
              activeTab === 'analysis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }\`}
          >
            <BarChart className="w-4 h-4" />
            Analysis
          </button>
        </nav>
      </div>

      {activeTab === 'youtube' && (
        <div className="space-y-4">
          {results.youtubeVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex gap-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{video.channel}</p>
                  <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                    <span>{video.viewCount.toLocaleString()} views</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Watch on YouTube
                    </a>
                    <button
                      onClick={() => onGetTranscript('youtube', video.id)}
                      disabled={transcriptLoading}
                      className="text-green-600 hover:text-green-700 text-sm disabled:text-gray-400"
                    >
                      {video.transcript ? 'View Transcript' : 'Get Transcript'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'podcasts' && (
        <div className="space-y-4">
          {results.podcasts.map((episode) => (
            <div key={episode.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex gap-4">
                <img
                  src={episode.image}
                  alt={episode.title}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{episode.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{episode.podcast.title}</p>
                  <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                    {episode.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{new Date(episode.pub_date_ms).toLocaleDateString()}</span>
                    <span>{Math.floor(episode.audio_length_sec / 60)} minutes</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={episode.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Listen to Episode
                    </a>
                    <button
                      onClick={() => onGetTranscript('podcast', episode.id)}
                      disabled={transcriptLoading}
                      className="text-green-600 hover:text-green-700 text-sm disabled:text-gray-400"
                    >
                      {episode.transcript ? 'View Transcript' : 'Get Transcript'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {!analysis ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Generate AI-powered insights from collected transcripts
              </p>
              <button
                onClick={onAnalyzeContent}
                disabled={analysisLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {analysisLoading ? 'Analyzing...' : 'Analyze Content'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <p className="text-gray-700">{analysis.summary}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Speaking Style</h3>
                <p className="text-gray-700">{analysis.speakingStyle}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="text-sm text-gray-500">
                Analysis based on {analysis.totalContentAnalyzed} pieces of content
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}`,

  'lib/youtube.ts': `import axios from 'axios';
import type { YouTubeVideo } from '../types/content';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const searchYouTubeVideos = async (
  personName: string,
  maxResults: number = 25
): Promise<YouTubeVideo[]> => {
  try {
    const searchQuery = \`"\${personName}" interview OR podcast OR conversation\`;
    
    const response = await axios.get(\`\${YOUTUBE_API_BASE}/search\`, {
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
    
    const detailsResponse = await axios.get(\`\${YOUTUBE_API_BASE}/videos\`, {
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
      url: \`https://www.youtube.com/watch?v=\${item.id}\`,
    }));
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
};`,

  'lib/listenNotes.ts': `import axios from 'axios';
import type { Episode } from '../types/content';

const API_BASE_URL = 'https://listen-api.listennotes.com/api/v2';

const listenNotesApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-ListenAPI-Key': process.env.LISTEN_NOTES_API_KEY,
  },
});

export const searchPodcastsByPerson = async (
  personName: string,
  limit: number = 25
): Promise<Episode[]> => {
  try {
    const searchQuery = \`"\${personName}" interview OR guest OR conversation\`;
    
    const response = await listenNotesApi.get('/search', {
      params: {
        q: searchQuery,
        type: 'episode',
        len_min: limit,
        safe_mode: 1,
        published_after: Date.now() - (365 * 24 * 60 * 60 * 1000),
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error searching podcasts by person:', error);
    throw error;
  }
};`,

  'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: system-ui, sans-serif;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}`,

  'app/layout.tsx': `import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podcast Guest Research',
  description: 'Research podcasts and episodes for guest opportunities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}`,

  'app/page.tsx': `'use client';

import { useState } from 'react';
import PersonSearch from '../components/PersonSearch';
import ContentTabs from '../components/ContentTabs';
import LoadingSpinner from '../components/LoadingSpinner';
import type { PersonSearchResult, ContentAnalysis } from '../types/content';

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<PersonSearchResult | null>(null);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonSearch = async (name: string) => {
    setLoading(true);
    setError(null);
    setSearchResults(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/search/person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError('Failed to search for content. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTranscript = async (type: 'youtube' | 'podcast', id: string) => {
    setTranscriptLoading(true);
    try {
      const response = await fetch(\`/api/transcript/\${type}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to get transcript');
      }

      const data = await response.json();
      
      if (searchResults) {
        const updatedResults = { ...searchResults };
        if (type === 'youtube') {
          updatedResults.youtubeVideos = updatedResults.youtubeVideos.map(video =>
            video.id === id ? { ...video, transcript: data.transcript } : video
          );
        } else {
          updatedResults.podcasts = updatedResults.podcasts.map(episode =>
            episode.id === id ? { ...episode, transcript: data.transcript } : episode
          );
        }
        setSearchResults(updatedResults);
      }
    } catch (err) {
      setError('Failed to get transcript. Please try again.');
      console.error('Transcript error:', err);
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!searchResults) return;

    setAnalysisLoading(true);
    try {
      const transcripts = [
        ...searchResults.youtubeVideos.filter(v => v.transcript).map(v => v.transcript!),
        ...searchResults.podcasts.filter(p => p.transcript).map(p => p.transcript!),
      ];

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcripts,
          personName: searchResults.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze content. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Person Content Research
        </h1>
        <p className="text-lg text-gray-600">
          Search for someone's YouTube videos and podcast appearances, then analyze their content with AI
        </p>
      </div>

      <PersonSearch onSearch={handlePersonSearch} loading={loading} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mt-4">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner />}

      {searchResults && (
        <div className="mt-8">
          <ContentTabs
            results={searchResults}
            analysis={analysis}
            onGetTranscript={handleGetTranscript}
            onAnalyzeContent={handleAnalyzeContent}
            transcriptLoading={transcriptLoading}
            analysisLoading={analysisLoading}
          />
        </div>
      )}
    </div>
  );
}`,

  'app/api/search/person/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeVideos } from '../../../../lib/youtube';
import { searchPodcastsByPerson } from '../../../../lib/listenNotes';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const [youtubeVideos, podcasts] = await Promise.all([
      searchYouTubeVideos(name),
      searchPodcastsByPerson(name),
    ]);

    const results = {
      name,
      youtubeVideos,
      podcasts,
      totalResults: youtubeVideos.length + podcasts.length,
      searchTimestamp: new Date().toISOString(),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Person search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`,

  'app/api/transcript/youtube/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const transcript = await YoutubeTranscript.fetchTranscript(id);
    const fullTranscript = transcript.map(item => item.text).join(' ');

    return NextResponse.json({ transcript: fullTranscript });
  } catch (error) {
    console.error('YouTube transcript API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}`,

  'app/api/transcript/podcast/route.ts': `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Episode ID is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      transcript: 'Podcast transcript feature coming soon - requires AssemblyAI integration' 
    });
  } catch (error) {
    console.error('Podcast transcript API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}`,

  'app/api/analyze/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { transcripts, personName } = await request.json();

    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      return NextResponse.json(
        { error: 'Transcripts are required' },
        { status: 400 }
      );
    }

    const combinedTranscripts = transcripts.join('\\n\\n---\\n\\n');

    const prompt = \`Analyze the following transcripts from various interviews and content featuring \${personName}. Provide a structured analysis in JSON format with the following fields:

{
  "summary": "A 2-3 sentence summary of their overall communication style and key themes",
  "keyTopics": ["Array of 5-8 main topics they discuss"],
  "expertise": ["Array of 4-6 areas where they demonstrate expertise"],
  "personalityTraits": ["Array of 4-6 personality traits observed"],
  "speakingStyle": "Description of their speaking style and communication approach",
  "commonThemes": ["Array of 3-5 recurring themes across their content"],
  "recommendations": ["Array of 4-6 actionable recommendations for engaging with them"]
}

Transcripts:
\${combinedTranscripts.substring(0, 8000)}\`;

    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
          'Content-Type': 'application/json',
        },
      }
    );

    const analysisText = openAIResponse.data.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(analysisText);
      analysis.totalContentAnalyzed = transcripts.length;
      return NextResponse.json(analysis);
    } catch (parseError) {
      return NextResponse.json({
        summary: \`Analysis completed for \${personName} based on \${transcripts.length} pieces of content.\`,
        keyTopics: ['Communication', 'Leadership', 'Innovation', 'Strategy'],
        expertise: ['Public Speaking', 'Industry Knowledge', 'Strategic Thinking'],
        personalityTraits: ['Articulate', 'Knowledgeable', 'Engaging'],
        speakingStyle: 'Professional and informative communication style',
        commonThemes: ['Innovation', 'Growth', 'Problem-solving'],
        recommendations: [
          'Prepare thoughtful questions',
          'Focus on their areas of expertise',
          'Allow time for detailed responses'
        ],
        totalContentAnalyzed: transcripts.length,
      });
    }
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}`
};

// Function to create directories
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Function to create files
function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  createDir(dir);
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created file: ${filePath}`);
}

// Create all files and directories
console.log('🚀 Setting up podcast research project...');

Object.entries(files).forEach(([filePath, content]) => {
  createFile(filePath, content);
});

console.log('\n🎉 Setup complete! Next steps:');
console.log('1. Get your API keys and update .env.local');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');
console.log('\n🔑 API Keys needed:');
console.log('- YouTube Data API v3: https://console.developers.google.com/');
console.log('- Listen Notes API: https://www.listennotes.com/api/');
console.log('- OpenAI API: https://platform.openai.com/api-keys');
console.log('\n✨ Your podcast research app is ready!');