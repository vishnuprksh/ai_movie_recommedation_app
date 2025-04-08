import React from 'react';
import { Movie, MovieRecommendationsProps } from '../types';

export default function MovieRecommendations({ 
  movies, 
  isLoading, 
  error,
  onMovieWatched,
  viewerProfile // New prop
}: MovieRecommendationsProps & { viewerProfile?: string }) {
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

  if (!movies || movies.length === 0) {
    return (
      <div className="text-gray-400 text-center p-4">
        No recommendations available. Try answering a few more questions!
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
        {movies.map((movie: Movie, index: number) => (
          <div 
            key={movie.title + index}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700
                     transition-all duration-300 hover:border-blue-500/50 group"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-white/90 group-hover:text-blue-400 transition-colors">
                {movie.title}
              </h3>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                {movie.matchScore}% Match
              </span>
            </div>
            <p className="text-white/70 leading-relaxed mb-4">
              {movie.description}
            </p>
            {onMovieWatched && (
              <button
                onClick={() => onMovieWatched(movie.title)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                I've watched this
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}