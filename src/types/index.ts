export interface Movie {
  title: string;
  description: string;
  matchScore: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  category: 'language' | 'genre' | 'viewing_experience' | 'film_elements' | 'era' | 'impact';
}

export interface QuestionFlowProps {
  onComplete: (answers: Array<{ question: Question; answer: string }>) => void;
  minQuestions?: number;
}

export interface MovieRecommendationsProps {
  movies: Movie[];
  isLoading: boolean;
  error?: string;
  viewerProfile?: string;
  onMovieWatched?: (movieTitle: string) => Promise<Movie | undefined>;
  onReset?: () => void;
  language?: string;
}