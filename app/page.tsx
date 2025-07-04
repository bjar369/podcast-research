'use client';

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
      const response = await fetch(`/api/transcript/${type}`, {
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
}