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
  const [batchSize] = useState(10);

  const handleQuestionComplete = async (answers: Array<{ question: Question; answer: string }>) => {
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
        body: JSON.stringify({ 
          answers,
          model: config.defaultModel,
          language: selectedLanguage,
          batchSize
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
      const response = await fetch('/api/recommendations/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: userAnswers,
          watchedMovie: movieTitle,
          model: config.defaultModel,
          language: selectedLanguage
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

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answers: userAnswers,
          model: config.defaultModel,
          language: selectedLanguage,
          batchSize: 5
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch more recommendations');
      }

      const data = await response.json();
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid recommendations format received');
      }

      setMovies(prevMovies => [...prevMovies, ...data.recommendations]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load more recommendations');
    } finally {
      setIsLoading(false);
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
          onLoadMore={handleLoadMore}
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