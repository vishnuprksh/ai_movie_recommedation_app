import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { config, validateConfig } from '../../../../config/env';

try {
  validateConfig();
} catch (error) {
  console.error('Environment configuration error:', error);
}

// Check for API key before processing
if (!process.env.GROQ_API_KEY) {
  console.error('Groq API key not configured');
  throw new Error('Groq API key not configured');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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

Provide exactly 1 recommendation using EXACTLY this format (including the numbering and labels):

1. Movie Title: [movie name]
Description: [one compelling reason why this movie perfectly matches their preferences]
Match Score: [number between 85-100]

Important: 
- Do NOT recommend "${watchedMovie}" or any extremely similar movies
- Follow the format EXACTLY as shown above
- Include all three elements: numbered title, description, and match score`;

    const completion = await groq.chat.completions.create({
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
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      stream: false,
      stop: null
    });

    const response = completion.choices[0]?.message?.content;
    
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
  console.log('Raw AI response:', response);
  const movies: Array<{
    title: string;
    description: string;
    matchScore: number;
  }> = [];
  
  // Split into lines and clean them
  const lines = response.split('\n').map(line => line.trim());
  console.log('Processing lines:', lines);

  // Find the title line (should start with number or contain "Movie Title:")
  const titleLine = lines.find(line => /^(\d+\.|Movie Title:)/i.test(line));
  if (!titleLine) {
    console.error('No title line found in response');
    return [];
  }

  let title = titleLine
    .replace(/^\d+\.\s*/, '') // Remove number prefix
    .replace(/^Movie Title:\s*/i, '') // Remove "Movie Title:" prefix
    .trim();

  // Find description (line after "Description:")
  const descIndex = lines.findIndex(line => /^Description:/i.test(line));
  const description = descIndex >= 0 ? 
    lines[descIndex].replace(/^Description:\s*/i, '').trim() : '';

  // Find match score (number after "Match Score:")
  const scoreLine = lines.find(line => /^Match Score:/i.test(line));
  const scoreMatch = scoreLine ? scoreLine.match(/\d+/) : null;
  const matchScore = scoreMatch ? parseInt(scoreMatch[0]) : 85;

  if (title && description) {
    const movie = { title, description, matchScore };
    console.log('Parsed movie:', movie);
    movies.push(movie);
  } else {
    console.error('Failed to parse movie - missing title or description');
  }

  return movies;
}