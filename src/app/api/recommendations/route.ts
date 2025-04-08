import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here', // Replace with your API key
});

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();
    
    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    const prompt = `As a cinematic AI curator, analyze these viewer preferences and recommend 3 perfect movies:

1. Character Preference: ${answers[0]}
2. Viewing Atmosphere: ${answers[1]}
3. Key Film Element: ${answers[2]}
4. Preferred Era: ${answers[3]}
5. Desired Impact: ${answers[4]}

For each recommendation, consider:
- How it matches their character preference
- The emotional atmosphere it creates
- Its strongest cinematic elements
- The era and its significance
- The lasting impact it leaves

Provide 3 highly personalized recommendations in this format:
1. Movie Title
Description: A compelling reason why this movie perfectly matches their preferences
Match Score: [85-100 based on fit]

Focus on creating a diverse selection that still maintains high relevance to their preferences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // You can replace this with gpt-4-mini when available
      messages: [
        {
          role: "system",
          content: "You are an expert film curator with deep knowledge of cinema across all eras, genres, and styles. Your recommendations are thoughtful, diverse, and personally tailored to each viewer's preferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }
    
    const movies = parseAIResponse(response);

    return NextResponse.json({ recommendations: movies });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

function parseAIResponse(response: string): Array<{
  title: string;
  description: string;
  matchScore: number;
}> {
  const movies: Array<{
    title: string;
    description: string;
    matchScore: number;
  }> = [];
  
  const movieBlocks = response.split('\n\n');

  for (const block of movieBlocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n');
    const titleLine = lines.find(line => /^\d+\./.test(line)) || '';
    const title = titleLine.replace(/^\d+\.\s*/, '').replace(/"/g, '').trim();
    
    const descLine = lines.find(line => line.toLowerCase().includes('description:'));
    const description = descLine ? 
      descLine.replace(/^Description:\s*/i, '').trim() : '';
    
    const scoreLine = lines.find(line => line.toLowerCase().includes('match score:'));
    const scoreMatch = scoreLine ? scoreLine.match(/\d+/) : null;
    const matchScore = scoreMatch ? parseInt(scoreMatch[0]) : 85;

    if (title && description) {
      movies.push({
        title,
        description,
        matchScore,
      });
    }
  }

  return movies;
}