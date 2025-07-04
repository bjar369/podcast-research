import { NextRequest, NextResponse } from 'next/server';
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
}