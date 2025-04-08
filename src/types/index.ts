export interface Movie {
  title: string;
  description: string;
  matchScore: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
}

export interface QuestionFlowProps {
  onComplete: (answers: string[]) => void;
}

export interface MovieRecommendationsProps {
  movies: Movie[];
  isLoading: boolean;
  error?: string;
  onMovieWatched?: (movieTitle: string) => Promise<Movie | undefined>;
}