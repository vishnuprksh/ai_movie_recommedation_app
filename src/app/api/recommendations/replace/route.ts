import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { config, validateConfig } from '../../../../config/env';

try {
  validateConfig();
} catch (error) {
  console.error('Environment configuration error:', error);
}

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export async function POST(request: Request) {
  try {
    const { answers, watchedMovie } = await request.json();
    
    if (!answers || !Array.isArray(answers) || answers.length !== 5 || !watchedMovie) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const prompt = `As a cinematic AI curator, analyze these viewer preferences and recommend 1 perfect movie to replace "${watchedMovie}" that they've already watched:

1. Character Preference: ${answers[0]}
2. Viewing Atmosphere: ${answers[1]}
3. Key Film Element: ${answers[2]}
4. Preferred Era: ${answers[3]}
5. Desired Impact: ${answers[4]}

Provide 1 highly personalized recommendation in this format:
1. Movie Title
Description: A compelling reason why this movie perfectly matches their preferences
Match Score: [85-100 based on fit]

Important: Do NOT recommend "${watchedMovie}" or any extremely similar movies.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
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
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const parsedMovies = parseAIResponse(response);
    
    if (parsedMovies.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const movie = parsedMovies[0];
    if (!movie.title || !movie.description || typeof movie.matchScore !== 'number') {
      return NextResponse.json(
        { error: 'Invalid movie data format' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      movie: {
        title: movie.title,
        description: movie.description,
        matchScore: movie.matchScore
      } 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
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
    const title = titleLine.replace(/^\d+\.\s*/, '').replace(/["*]/g, '').trim();
    
    const descLine = lines.find(line => line.toLowerCase().includes('description:'));
    const description = descLine ? 
      descLine.replace(/^Description:\s*/i, '').replace(/["*]/g, '').trim() : '';
    
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