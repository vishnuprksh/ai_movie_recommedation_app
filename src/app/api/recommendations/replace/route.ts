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
    const { answers, watchedMovie, model = 'groq', language = 'English', watchedMovies = [] } = await request.json();
    
    if (!answers || !Array.isArray(answers) || !watchedMovie) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const watchedMoviesStr = watchedMovies.length > 0 
      ? `\nAdditionally, do NOT recommend any of these already watched movies:\n${watchedMovies.join('\n')}`
      : '';

    const prompt = `As a cinematic AI curator, analyze these viewer preferences and recommend 1 perfect movie to replace "${watchedMovie}" that they've already watched:

Preferred Movie Language: ${language}

${answers.map(a => `Question: ${a.question.question}
Category: ${a.question.category}
Answer: ${a.answer}
`).join('\n')}

IMPORTANT: Prioritize movies in ${language} language when available and suitable for the viewer's preferences. For non-${language} movies, note if they are subtitled or dubbed.${watchedMoviesStr}

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
        max_tokens: 1000,
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
    
    const movieMatch = response.match(/Movie Title:\s*(.+?)[\n\r]/);
    const descriptionMatch = response.match(/Description:\s*(.+?)[\n\r]/);
    const scoreMatch = response.match(/Match Score:\s*(\d+)/);

    if (!movieMatch || !descriptionMatch || !scoreMatch) {
      console.error('Failed to parse movie data from:', response);
      return NextResponse.json(
        { error: 'Invalid movie data format' },
        { status: 500 }
      );
    }

    const movie = {
      title: movieMatch[1].trim(),
      description: descriptionMatch[1].trim(),
      matchScore: parseInt(scoreMatch[1])
    };

    return NextResponse.json({ movie });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}