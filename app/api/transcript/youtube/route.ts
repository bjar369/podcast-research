import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

interface EnhancedTranscript {
  fullText: string;
  segments: TranscriptSegment[];
  wordCount: number;
  duration: number;
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching transcript for YouTube video: ${id}`);

    // Fetch the transcript with timing information
    const transcript = await YoutubeTranscript.fetchTranscript(id);
    
    // Process the transcript data
    const segments: TranscriptSegment[] = transcript.map((item: { text: string; duration?: number; offset?: number }) => ({
      text: item.text,
      duration: item.duration || 0,
      offset: item.offset || 0,
    }));

    // Calculate total duration and word count
    const fullText = segments.map(segment => segment.text).join(' ');
    const wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;
    const duration = segments.length > 0 ? 
      Math.max(...segments.map(s => s.offset + s.duration)) : 0;

    // Try to detect language (default to English)
    const language = transcript[0]?.lang || 'en';

    const enhancedTranscript: EnhancedTranscript = {
      fullText,
      segments,
      wordCount,
      duration,
      language,
    };

    console.log(`Successfully fetched transcript for ${id}: ${wordCount} words, ${duration}ms duration`);

    return NextResponse.json({ 
      transcript: enhancedTranscript,
      success: true 
    });

  } catch (error) {
    console.error('YouTube transcript API error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch transcript';
    if (error instanceof Error) {
      if (error.message.includes('Could not get transcripts')) {
        errorMessage = 'No transcript available for this video';
      } else if (error.message.includes('Video unavailable')) {
        errorMessage = 'Video is unavailable or private';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded';
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: 500 }
    );
  }
}