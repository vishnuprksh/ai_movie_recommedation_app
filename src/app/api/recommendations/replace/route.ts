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
    const { answers, watchedMovie, model = 'groq', language = 'English' } = await request.json();
    
    if (!answers || !Array.isArray(answers) || !watchedMovie) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const prompt = `As a cinematic AI curator, analyze these viewer preferences and recommend 1 perfect movie to replace "${watchedMovie}" that they've already watched:

Preferred Movie Language: ${language}

${answers.map(a => `Question: ${a.question.question}
Category: ${a.question.category}
Answer: ${a.answer}
`).join('\n')}

IMPORTANT: Prioritize movies in ${language} language when available and suitable for the viewer's preferences. For non-${language} movies, note if they are subtitled or dubbed.

Provide exactly 1 recommendation using EXACTLY this format (including the numbering and labels):

1. Movie Title: [movie name]
Description: [one compelling reason why this movie perfectly matches their preferences, including language/subtitle information if not in ${language}]
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
    console.log('Parsed response:', parsedMovies);

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

    return NextResponse.json({ movie });
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

    // Find title line
    const titleLine = lines.find(line => 
      line.toLowerCase().includes('title:') || 
      /^\d+\./.test(line)
    );

    let title = '';
    if (titleLine) {
      title = titleLine
        .replace(/^\d+\.\s*/, '') // Remove numbering
        .replace(/^.*?title:\s*/i, '') // Remove "Movie Title:" or similar
        .trim();
    }

    // Find description
    const descriptionLine = lines.find(line => 
      line.toLowerCase().startsWith('description:')
    );
    let description = '';
    if (descriptionLine) {
      description = descriptionLine
        .replace(/^description:\s*/i, '')
        .trim();
    }

    // Find match score
    const scoreLine = lines.find(line => 
      line.toLowerCase().includes('match score:')
    );
    let matchScore = 85; // Default score
    if (scoreLine) {
      const match = scoreLine.match(/\d+/);
      if (match) {
        const score = parseInt(match[0], 10);
        if (!isNaN(score) && score >= 0 && score <= 100) {
          matchScore = score;
        }
      }
    }

    if (title && description) {
      movies.push({
        title,
        description,
        matchScore
      });
    }
  }

  return movies;
}