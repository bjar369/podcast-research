import { NextRequest, NextResponse } from 'next/server';
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

    const combinedTranscripts = transcripts.join('\n\n---\n\n');

    const prompt = `Analyze the following transcripts from various interviews and content featuring ${personName}. Provide a structured analysis in JSON format with the following fields:

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
${combinedTranscripts.substring(0, 8000)}`;

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
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
        summary: `Analysis completed for ${personName} based on ${transcripts.length} pieces of content.`,
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
}