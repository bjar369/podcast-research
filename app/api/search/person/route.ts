import { NextRequest, NextResponse } from 'next/server';
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
}