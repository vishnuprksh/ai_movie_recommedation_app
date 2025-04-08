import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config, validateConfig } from '../../../../config/env';

try {
  validateConfig();
} catch (error) {
  console.error('Environment configuration error:', error);
}

export async function POST(request: Request) {
  try {
    const { answers, watchedMovie, model = 'groq' } = await request.json();
    
    if (!answers || !Array.isArray(answers) || answers.length !== 5 || !watchedMovie) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Find language preference from the answers
    const languagePreference = answers.find(a => a.question.id === 0)?.answer || 'English';

    const prompt = `As a cinematic AI curator, analyze these viewer preferences and recommend 1 perfect movie to replace "${watchedMovie}" that they've already watched:

Preferred Movie Language: ${languagePreference}

1. Character Preference: ${answers[0]}
2. Viewing Atmosphere: ${answers[1]}
3. Key Film Element: ${answers[2]}
4. Preferred Era: ${answers[3]}
5. Desired Impact: ${answers[4]}

IMPORTANT: Prioritize movies in ${languagePreference} language when available and suitable for the viewer's preferences. For non-${languagePreference} movies, note if they are subtitled or dubbed.

Provide exactly 1 recommendation using EXACTLY this format (including the numbering and labels):

1. Movie Title: [movie name]
Description: [one compelling reason why this movie perfectly matches their preferences, including language/subtitle information if not in ${languagePreference}]
Match Score: [number between 85-100]

Important: 
- Do NOT recommend "${watchedMovie}" or any extremely similar movies
- Follow the format EXACTLY as shown above
- Include all three elements: numbered title, description, and match score`;

    let response;
    
    if (model === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Gemini API key not configured' },
          { status: 500 }
        );
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const result = await geminiModel.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      response = result.response.text();
    } else {
      // Default to Groq
      if (!process.env.GROQ_API_KEY) {
        return NextResponse.json(
          { error: 'Groq API key not configured' },
          { status: 500 }
        );
      }

      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });

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

      response = completion.choices[0]?.message?.content;
    }
    
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
  
  // Split into blocks by double newlines to handle potential multiple recommendations
  const blocks = response.split(/\n{2,}/);
  console.log('Processing blocks:', blocks);

  for (const block of blocks) {
    // Split block into lines and clean them
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    
    console.log('Processing lines:', lines);

    // Find the title line - try multiple formats
    const titleLine = lines.find(line => 
      /^(\d+\.|Movie Title:|Title:)/i.test(line) || 
      line.includes(':**')
    );

    if (!titleLine) {
      console.error('No title line found in block');
      continue;
    }

    // Extract and clean title
    let title = titleLine
      .replace(/^\d+\.\s*/, '') // Remove number prefix
      .replace(/^(Movie )?Title:\s*/i, '') // Remove "Title:" or "Movie Title:" prefix
      .replace(/\*\*/g, '') // Remove markdown
      .trim();

    // Handle year in parentheses
    const yearMatch = title.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[0] : '';
    title = title.replace(/\((\d{4})\)/, '').trim();
    if (year) {
      title = `${title} ${year}`;
    }

    // Find description - try multiple formats
    let description = '';
    const descLine = lines.find(line => /^Description:/i.test(line));
    if (descLine) {
      description = descLine.replace(/^Description:\s*/i, '').trim();
    } else {
      // If no Description: prefix, use the longest line that's not title or score
      const contentLines = lines.filter(line => 
        line !== titleLine && 
        !line.toLowerCase().includes('score:')
      );
      description = contentLines.reduce((a, b) => a.length > b.length ? a : b, '').trim();
    }

    // Find match score - try multiple formats
    let matchScore = 85; // Default score
    const scoreLine = lines.find(line => /match.*score|score.*match/i.test(line));
    if (scoreLine) {
      const scoreMatch = scoreLine.match(/\d+/);
      if (scoreMatch) {
        const parsed = parseInt(scoreMatch[0]);
        if (!isNaN(parsed) && parsed >= 60 && parsed <= 100) {
          matchScore = parsed;
        }
      }
    }

    // Only add if we have both title and description
    if (title && description) {
      const movie = { title, description, matchScore };
      console.log('Parsed movie:', movie);
      movies.push(movie);
    } else {
      console.error('Failed to parse movie - missing title or description');
    }
  }

  return movies;
}