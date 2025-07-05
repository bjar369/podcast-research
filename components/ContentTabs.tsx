'use client';

import { useState } from 'react';
import { Youtube, BarChart } from 'lucide-react';
import type { PersonSearchResult, ContentAnalysis } from '../types/content';
import TranscriptViewer from './TranscriptViewer';

interface ContentTabsProps {
  results: PersonSearchResult | null;
  analysis: ContentAnalysis | null;
  onGetTranscript: (type: 'youtube', id: string) => Promise<void>;
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
  const [activeTab, setActiveTab] = useState<'youtube' | 'analysis'>('youtube');
  const [selectedTranscript, setSelectedTranscript] = useState<{
    transcript: any;
    videoTitle: string;
  } | null>(null);

  if (!results) return null;

  return (
    <div className="w-full">
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'youtube'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Youtube className="w-4 h-4" />
            YouTube ({results.youtubeVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'analysis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
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
}