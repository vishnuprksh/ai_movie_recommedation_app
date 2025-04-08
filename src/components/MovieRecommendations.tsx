import React, { useState, useCallback, useEffect } from 'react';
import { Movie, MovieRecommendationsProps } from '../types';

export default function MovieRecommendations({ 
  movies = [], 
  isLoading, 
  error,
  onMovieWatched,
  viewerProfile
}: MovieRecommendationsProps & { viewerProfile?: string }) {
  const [remainingMovies, setRemainingMovies] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);

  // Update state when movies prop changes, with proper dependency check
  useEffect(() => {
    // Only update if the movies array has actually changed
    if (movies.length > 0) {
      setRemainingMovies(movies);
      setCurrentMovie(movies[0]);
    } else {
      setRemainingMovies([]);
      setCurrentMovie(null);
    }
  }, [JSON.stringify(movies)]); // Using JSON.stringify to properly detect array changes

  const handleMovieWatched = useCallback(async (movieTitle: string) => {
    if (onMovieWatched) {
      const replacementMovie = await onMovieWatched(movieTitle);
      
      // Remove the current movie from the queue
      const nextMovies = remainingMovies.slice(1);
      
      if (nextMovies.length > 0) {
        // Show the next movie in queue
        setCurrentMovie(nextMovies[0]);
        setRemainingMovies(nextMovies);
      } else if (replacementMovie) {
        // If we got a replacement movie and queue is empty, show it
        setCurrentMovie(replacementMovie);
        setRemainingMovies([replacementMovie]);
      } else {
        // No more movies in queue and no replacement
        setCurrentMovie(null);
        setRemainingMovies([]);
      }
    }
  }, [remainingMovies, onMovieWatched]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="text-gray-400 text-center p-4">
        No more recommendations available. Try answering the questions again for new suggestions!
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {viewerProfile && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-blue-400 mb-3">Your Movie Personality</h3>
          <p className="text-white/90 leading-relaxed">{viewerProfile}</p>
        </div>
      )}
      
      <div className="grid gap-6">
        <div 
          key={currentMovie.title}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700
                   transition-all duration-300 hover:border-blue-500/50 group"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-white/90 group-hover:text-blue-400 transition-colors">
              {currentMovie.title}
            </h3>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
              {currentMovie.matchScore}% Match
            </span>
          </div>
          <p className="text-white/70 leading-relaxed mb-4">
            {currentMovie.description}
          </p>
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleMovieWatched(currentMovie.title)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              I've watched this
            </button>
            <span className="text-sm text-gray-500">
              {remainingMovies.length - 1} more recommendations in queue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}