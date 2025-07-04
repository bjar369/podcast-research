import { NextRequest, NextResponse } from 'next/server';

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
}