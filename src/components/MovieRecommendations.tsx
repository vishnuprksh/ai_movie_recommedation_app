import React, { useState, useEffect } from 'react';
import { Movie, MovieRecommendationsProps } from '../types';

export default function MovieRecommendations({ movies: initialMovies, isLoading, error: externalError, onMovieWatched }: MovieRecommendationsProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies || []);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (initialMovies && Array.isArray(initialMovies)) {
      setMovies(initialMovies);
    }
  }, [initialMovies]);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleMovieWatched = async (movieTitle: string, index: number) => {
    if (!onMovieWatched) return;

    try {
      setLoadingStates(prev => ({ ...prev, [movieTitle]: true }));
      setError(undefined);
      
      const newMovie = await onMovieWatched(movieTitle);
      
      if (!newMovie || !newMovie.title || !newMovie.description || typeof newMovie.matchScore !== 'number') {
        throw new Error('Invalid replacement movie data received');
      }

      setMovies(prevMovies => {
        const updated = [...prevMovies];
        updated[index] = newMovie;
        return updated;
      });
    } catch (err) {
      console.error('Error replacing movie:', err);
      setError(err instanceof Error ? err.message : 'Failed to get a replacement movie');
    } finally {
      setLoadingStates(prev => ({ ...prev, [movieTitle]: false }));
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-8 text-center backdrop-blur-sm">
          <h3 className="text-2xl font-semibold text-red-400 mb-3">Error</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6" data-testid="loading-state">
        <div className="animate-pulse space-y-8">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 backdrop-blur-sm" 
              data-testid="loading-skeleton-item"
            >
              <div className="h-8 bg-gray-700/50 rounded-lg w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-700/50 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative z-10">
      <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
        Your Movie Discoveries
      </h2>
      <div className="space-y-6 relative">
        {movies && movies.length > 0 ? (
          movies.map((movie, index) => (
            <div
              key={`${movie.title}-${index}`}
              data-testid="movie-card"
              className="bg-gray-800/80 rounded-xl p-8 transform transition-all duration-300 
                       hover:scale-[1.02] border border-gray-700/50 hover:border-blue-500/50 
                       backdrop-blur-sm group relative z-20"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30
                               group-hover:bg-blue-500 group-hover:text-white transition-all">
                    {movie.matchScore}% Match
                  </span>
                  <button
                    onClick={() => handleMovieWatched(movie.title, index)}
                    disabled={loadingStates[movie.title]}
                    className="px-4 py-2 bg-purple-500/20 text-purple-400 text-sm rounded-full border border-purple-500/30
                             hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStates[movie.title] ? 'Loading...' : 'Already Watched'}
                  </button>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400">
            No movie recommendations found. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}