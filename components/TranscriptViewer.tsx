'use client';

import { useState } from 'react';
import { FileText, X } from 'lucide-react';
import type { EnhancedTranscript } from '../types/content';

interface TranscriptViewerProps {
  transcript: EnhancedTranscript;
  videoTitle: string;
  onClose: () => void;
}

export default function TranscriptViewer({ transcript, videoTitle, onClose }: TranscriptViewerProps) {
  const [showTimestamps, setShowTimestamps] = useState(true);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Transcript</h2>
              <p className="text-sm text-gray-600">{videoTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{transcript.wordCount.toLocaleString()} words</span>
              <span>{formatDuration(transcript.duration)}</span>
              <span>Language: {transcript.language}</span>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={(e) => setShowTimestamps(e.target.checked)}
                className="rounded"
              />
              Show timestamps
            </label>
          </div>

          <div className="space-y-3">
            {transcript.segments.map((segment, index) => (
              <div key={index} className="flex gap-3">
                {showTimestamps && (
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500 font-mono">
                      {formatTime(segment.offset)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">{segment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 