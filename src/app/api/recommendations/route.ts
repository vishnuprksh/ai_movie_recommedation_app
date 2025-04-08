import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../../config/env';

export async function POST(request: Request) {
  try {
    const { answers, model = 'groq', language = 'English', batchSize = 10 } = await request.json();
    console.log('Received request:', { answers, model, language, batchSize });
    
    if (!answers || !Array.isArray(answers) || answers.length < 1) {
      console.error('Invalid answers format received:', answers);
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // First prompt: Analyze answers to create a viewer profile
    const analysisPrompt = `As a cinema psychologist, analyze these viewer responses to create a detailed viewer profile:

Preferred Movie Language: ${language}

${answers.map(a => `Question: ${a.question.question}
Category: ${a.question.category}
Answer: ${a.answer}
`).join('\n')}

Create a concise but insightful profile of this viewer's movie preferences, considering:
1. Their preferred language for movies (${language})
2. Their likely genre preferences
3. Their viewing style and atmosphere preferences
4. What film elements they value most
5. Their era preferences
6. What kind of impact they seek from movies`;

    let viewerProfile;
    
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
          parts: [{ text: analysisPrompt }],
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      viewerProfile = result.response.text();
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
            content: "You are an expert film curator and cinema psychologist with deep knowledge of viewer preferences and movie recommendations."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        stream: false,
        stop: null
      });

      viewerProfile = completion.choices[0]?.message?.content;
    }

    if (!viewerProfile) {
      console.error('Failed to generate viewer profile');
      return NextResponse.json(
        { error: 'Failed to generate viewer profile' },
        { status: 500 }
      );
    }

    // Second prompt: Use viewer profile to generate recommendations
    const recommendationPrompt = `As a cinematic AI curator, use this viewer profile to recommend ${batchSize} perfect movies.

${viewerProfile}

IMPORTANT: Prioritize movies in ${language} language when available and suitable for the viewer's preferences. For non-${language} movies, note if they are subtitled or dubbed.

Please provide exactly ${batchSize} recommendations in this specific format:

1. Title: [Movie Name] (Year)
Description: [One paragraph description including language/subtitle information if not in ${language}]
Match Score: [60-100]

[...continue for all ${batchSize} movies...]

Make each recommendation thoughtful and personally tailored to the viewer's profile, ensuring a good mix of their preferred language and other highly-rated international films when appropriate.`;

    let response;
    
    if (model === 'gemini') {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const result = await geminiModel.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: recommendationPrompt }],
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
            content: recommendationPrompt
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
      console.error('No response from AI');
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const movies = parseAIResponse(response);
    console.log('Generated recommendations:', movies);
    
    if (!movies || movies.length === 0) {
      console.error('No movies were parsed from the AI response');
      return NextResponse.json(
        { error: 'Failed to parse movie recommendations' },
        { status: 500 }
      );
    }

    const responseData = { 
      recommendations: movies,
      viewerProfile 
    };
    console.log('Sending response:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in recommendation route:', error);
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
  
  // Split response into movie blocks, handling both double and single newlines
  const movieBlocks = response.split(/\n{2,}/);
  console.log('Movie blocks:', movieBlocks);

  for (const block of movieBlocks) {
    if (!block.trim() || block.toLowerCase().includes("preferences")) continue;

    const lines = block.split('\n').map(line => line.trim());
    console.log('Processing block lines:', lines);

    // Find and parse title (now handling markdown formatting)
    const titleLine = lines.find(line => 
      line.includes(':**') || // Markdown format
      /^(\d+\.|Title:)/.test(line) || // Numbered or Title: prefix
      line.includes('Recommendation')
    ) || '';
    
    let title = titleLine
      .replace(/\*\*/g, '') // Remove all ** sequences
      .replace(/^\d+\.\s*/, '') // Remove number prefix
      .replace(/^Title:\s*/, '') // Remove "Title:" prefix
      .replace(/^Recommendation \d+:\s*/, '') // Remove "Recommendation N:" prefix
      .trim();

    // If we have a year in parentheses, make sure it stays with the title
    const yearMatch = title.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[0] : '';
    
    // Clean up the title but preserve the year
    title = title
      .replace(/\((\d{4})\)/, '') // temporarily remove year
      .trim();

    if (year) {
      title = `${title} ${year}`;
    }
    
    // Find description line (contains "Description:" or is the longest line)
    let description = '';
    const descLine = lines.find(line => line.toLowerCase().includes('description:'));
    if (descLine) {
      description = descLine.replace(/^Description:\s*/i, '').trim();
    } else {
      // If no Description: prefix found, use the longest line that's not the title
      const nonTitleLines = lines.filter(line => 
        line !== titleLine && 
        !line.toLowerCase().includes('match score:')
      );
      description = nonTitleLines.reduce((a, b) => a.length > b.length ? a : b, '').trim();
    }
    
    // Find match score (number between 85-100)
    const scoreLine = lines.find(line => /match.*score|score.*match/i.test(line));
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