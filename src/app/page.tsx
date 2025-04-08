'use client';

import React, { useState } from 'react';
import QuestionFlow from '../components/QuestionFlow';
import MovieRecommendations from '../components/MovieRecommendations';
import ModelSelector from '../components/ModelSelector';
import { Movie } from '../types';
import { config } from '../config/env';

export default function Home() {
  const [showQuestions, setShowQuestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string>();
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<'groq' | 'gemini'>(config.defaultModel);

  const handleQuestionComplete = async (answers: string[]) => {
    setIsLoading(true);
    setShowQuestions(false);
    setError(undefined);
    setUserAnswers(answers);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers, model: selectedModel }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }
      
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid response format');
      }

      const validatedMovies = data.recommendations.map(movie => {
        if (!movie.title || !movie.description || typeof movie.matchScore !== 'number') {
          throw new Error('Invalid movie data format');
        }
        return movie;
      });

      setMovies(validatedMovies);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to get recommendations');
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieWatched = async (movieTitle: string) => {
    if (!userAnswers || userAnswers.length !== 5) {
      console.error('Missing user answers for replacement');
      return undefined;
    }

    try {
      const response = await fetch('/api/recommendations/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answers: userAnswers,
          watchedMovie: movieTitle,
          model: selectedModel
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get replacement movie');
      }

      const movie = data.movie;
      if (!movie || !movie.title || !movie.description || typeof movie.matchScore !== 'number') {
        throw new Error('Invalid replacement movie data');
      }
      
      return movie;
    } catch (error) {
      console.error('Error getting replacement:', error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto relative">
        <ModelSelector 
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={!showQuestions}
        />
        {showQuestions ? (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
              Discover Your Perfect Movie
            </h1>
            <p className="text-center text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
              Let AI guide you to your next favorite film through a unique and personalized journey
            </p>
            <QuestionFlow onComplete={handleQuestionComplete} />
          </div>
        ) : (
          <MovieRecommendations 
            movies={movies} 
            isLoading={isLoading} 
            error={error}
            onMovieWatched={handleMovieWatched}
          />
        )}
      </div>
    </main>
  );
}