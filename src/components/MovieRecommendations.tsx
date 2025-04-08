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
  const [isWatchedLoading, setIsWatchedLoading] = useState(false);

  useEffect(() => {
    if (movies.length > 0) {
      setRemainingMovies(movies);
      setCurrentMovie(movies[0]);
    } else {
      setRemainingMovies([]);
      setCurrentMovie(null);
    }
  }, [JSON.stringify(movies)]);

  const handleMovieWatched = useCallback(async (movieTitle: string) => {
    if (!onMovieWatched) return;
    
    setIsWatchedLoading(true);
    try {
      // First, update the UI to show the next movie immediately
      const nextMovies = remainingMovies.slice(1);
      if (nextMovies.length > 0) {
        setCurrentMovie(nextMovies[0]);
        setRemainingMovies(nextMovies);
      }

      // Then, get the replacement movie in the background
      const replacementMovie = await onMovieWatched(movieTitle);
      
      if (replacementMovie) {
        // Add the replacement movie to the end of the queue
        setRemainingMovies(prev => [...prev, replacementMovie]);
      }

      // If we had no next movies but got a replacement, show it
      if (nextMovies.length === 0 && replacementMovie) {
        setCurrentMovie(replacementMovie);
        setRemainingMovies([replacementMovie]);
      } else if (nextMovies.length === 0) {
        // If we had no next movies and got no replacement
        setCurrentMovie(null);
        setRemainingMovies([]);
      }
    } catch (error) {
      console.error('Error marking movie as watched:', error);
    } finally {
      setIsWatchedLoading(false);
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
      <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
        {error}
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="text-gray-400 text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-blue-400 mb-3">All Caught Up!</h3>
        <p>No more recommendations available. Try answering the questions again for new suggestions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {viewerProfile && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 mb-8 transform transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-xl font-semibold text-blue-400 mb-3">Your Movie Personality</h3>
          <p className="text-white/90 leading-relaxed whitespace-pre-line">{viewerProfile}</p>
        </div>
      )}
      
      <div className="grid gap-6">
        <div 
          key={currentMovie.title}
          className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700
                   transform transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/50 group"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <h3 className="text-2xl font-semibold text-white/90 group-hover:text-blue-400 transition-colors">
              {currentMovie.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-full font-medium">
                {currentMovie.matchScore}% Match
              </span>
            </div>
          </div>
          <p className="text-white/70 leading-relaxed mb-6 text-lg">
            {currentMovie.description}
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <button
              onClick={() => handleMovieWatched(currentMovie.title)}
              disabled={isWatchedLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300
                ${isWatchedLoading 
                  ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:scale-105'
                }`}
            >
              {isWatchedLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400"></div>
                  Updating...
                </span>
              ) : (
                "I've watched this"
              )}
            </button>
            <span className="text-sm text-gray-400">
              {remainingMovies.length - 1} more recommendations in queue
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}