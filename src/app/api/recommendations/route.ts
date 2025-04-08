import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../../config/env';

export async function POST(request: Request) {
  try {
    const { answers, model = 'groq' } = await request.json();
    
    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      console.error('Invalid answers format received:', answers);
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

Please provide exactly 3 recommendations in this specific format:

1. Title: [Movie Name] (Year)
Description: [One paragraph description]
Match Score: [85-100]

2. Title: [Movie Name] (Year)
Description: [One paragraph description]
Match Score: [85-100]

3. Title: [Movie Name] (Year)
Description: [One paragraph description]
Match Score: [85-100]

Make each recommendation thoughtful and personally tailored to the viewer's preferences.`;

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
    
    const movies = parseAIResponse(response);
    console.log('Parsed movies:', movies);
    
    return NextResponse.json({ recommendations: movies });
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
  console.log('Raw AI response:', response);
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