import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeVideos } from '../../../../lib/youtube';
import type { AxiosError } from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { youtubeVideos: [], error: 'Name is required' },
        { status: 400 }
      );
    }
    try {
      const youtubeVideos = await searchYouTubeVideos(name);
      return NextResponse.json({
        name,
        youtubeVideos,
        totalResults: youtubeVideos.length,
        searchTimestamp: new Date().toISOString(),
        error: null,
      });
    } catch (error: unknown) {
      let errorMsg = 'Internal server error';
      if (
        typeof error === 'object' &&
        error !== null &&
        (error as AxiosError).isAxiosError &&
        (error as AxiosError).response?.status === 403
      ) {
        errorMsg = 'YouTube API key invalid or access denied.';
      }
      return NextResponse.json({
        name,
        youtubeVideos: [],
        totalResults: 0,
        searchTimestamp: new Date().toISOString(),
        error: errorMsg,
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Person search API error:', error);
    return NextResponse.json(
      { youtubeVideos: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}