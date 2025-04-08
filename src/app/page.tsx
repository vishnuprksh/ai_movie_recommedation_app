'use client';

import React, { useState } from 'react';
import QuestionFlow from '../components/QuestionFlow';
import MovieRecommendations from '../components/MovieRecommendations';
import { Movie } from '../types';

export default function Home() {
  const [showQuestions, setShowQuestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string>();
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const handleQuestionComplete = async (answers: string[]) => {
    console.log('Submitting answers:', answers);
    setIsLoading(true);
    setShowQuestions(false);
    setError(undefined);
    setUserAnswers(answers);

    try {
      console.log('Sending answers to API:', answers);
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }
      
      console.log('Setting movies:', data.recommendations);
      setMovies(data.recommendations);
      console.log('Movies set to state:', data.recommendations);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to get recommendations');
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieWatched = async (movieTitle: string) => {
    try {
      const response = await fetch('/api/recommendations/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answers: userAnswers,
          watchedMovie: movieTitle
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get replacement movie');
      }
      
      return data.movie;
    } catch (error) {
      console.error('Error:', error);
      return undefined;
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto">
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