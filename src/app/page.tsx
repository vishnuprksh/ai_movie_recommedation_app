'use client';

import React, { useState } from 'react';
import QuestionFlow from '../components/QuestionFlow';
import MovieRecommendations from '../components/MovieRecommendations';
import LanguageSelector from '../components/LanguageSelector';
import { Movie, Question } from '../types';
import { config } from '../config/env';

export default function Home() {
  const [showQuestions, setShowQuestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string>();
  const [userAnswers, setUserAnswers] = useState<Array<{ question: Question; answer: string }>>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [watchedMovies, setWatchedMovies] = useState<string[]>([]);

  const handleQuestionComplete = async (answers: Array<{ question: Question; answer: string }>) => {
    setIsLoading(true);
    setShowQuestions(false);
    setError(undefined);
    setUserAnswers(answers);
    setWatchedMovies([]); // Reset watched movies when starting new recommendations

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answers,
          model: config.defaultModel,
          language: selectedLanguage,
          watchedMovies: [] // Initial request has no watched movies
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid recommendations format received');
      }
      setMovies(data.recommendations);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieWatched = async (movieTitle: string): Promise<Movie | undefined> => {
    try {
      // Add the watched movie to our list
      setWatchedMovies(prev => [...prev, movieTitle]);

      // When we've watched all current movies, get a fresh batch
      const currentMovies = movies.map(m => m.title);
      if (currentMovies.every(title => watchedMovies.includes(title) || title === movieTitle)) {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: userAnswers,
            model: config.defaultModel,
            language: selectedLanguage,
            watchedMovies: [...watchedMovies, movieTitle] // Include all watched movies
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch new recommendations');
        }

        const data = await response.json();
        if (!data.recommendations || !Array.isArray(data.recommendations)) {
          throw new Error('Invalid recommendations format received');
        }

        // Update the movies list with new recommendations
        setMovies(data.recommendations);
        // Return the first movie from the new batch
        return data.recommendations[0];
      }

      // Otherwise, get a single replacement movie
      const response = await fetch('/api/recommendations/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: userAnswers,
          watchedMovie: movieTitle,
          model: config.defaultModel,
          language: selectedLanguage,
          watchedMovies: [...watchedMovies, movieTitle] // Include all watched movies
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get replacement movie');
      }

      const data = await response.json();
      return data.movie;
    } catch (error) {
      console.error('Error getting replacement movie:', error);
      setError('Failed to get a replacement movie recommendation');
      return undefined;
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {showQuestions ? (
        <div className="space-y-8">
          <h1 className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">
            Discover Your Perfect Movie
          </h1>
          <p className="text-center text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Let AI guide you to your next favorite film through a unique and personalized journey
          </p>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            disabled={!showQuestions}
          />
          <QuestionFlow onComplete={handleQuestionComplete} />
        </div>
      ) : (
        <MovieRecommendations 
          movies={movies} 
          isLoading={isLoading} 
          error={error}
          onMovieWatched={handleMovieWatched}
          onReset={() => {
            setShowQuestions(true);
            setMovies([]);
            setError(undefined);
          }}
          language={selectedLanguage}
        />
      )}
    </main>
  );
}