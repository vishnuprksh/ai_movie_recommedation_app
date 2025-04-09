import React, { useState, useEffect } from 'react';
import { Question, QuestionFlowProps } from '../types';

const allQuestions: Question[] = [
  // Basic Questions - Simple preferences to start with
  {
    id: 1,
    category: 'viewing_experience',
    question: "What's your ideal movie intensity level?",
    options: [
      "Keep it light and fun",
      "Some tension is good",
      "Edge of your seat",
      "Mind-blowing intensity",
      "Whatever serves the story"
    ]
  },
  {
    id: 2,
    category: 'viewing_experience',
    question: "How do you prefer your movies to be paced?",
    options: [
      "Fast and action-packed",
      "Steady and engaging",
      "Thoughtful and measured",
      "Mix of fast and slow",
      "Any well-executed pace"
    ]
  },
  {
    id: 3,
    category: 'film_elements',
    question: "What catches your attention most in movies?",
    options: [
      "Visual effects and cinematography",
      "Music and sound",
      "Story and plot",
      "Acting performances",
      "All aspects equally"
    ]
  },
  {
    id: 4,
    category: 'genre',
    question: "What kind of opening scenes grab you?",
    options: [
      "Action and excitement",
      "Mystery and intrigue",
      "Character moments",
      "Dramatic events",
      "Any engaging opening"
    ]
  },
  // Intermediate Questions - More specific preferences
  {
    id: 5,
    category: 'film_elements',
    question: "Pick your ideal movie setting:",
    options: [
      "Modern city life",
      "Fantasy worlds",
      "Historical periods",
      "Futuristic settings",
      "Any compelling world"
    ]
  },
  {
    id: 6,
    category: 'genre',
    question: "Pick the movie villain you'd most want to watch:",
    options: [
      "Brilliant mastermind",
      "Sympathetic anti-hero",
      "Supernatural entity",
      "Complex moral opponent",
      "Any compelling antagonist"
    ]
  },
  {
    id: 7,
    category: 'film_elements',
    question: "Who should lead this movie?",
    options: [
      "Unlikely hero",
      "Skilled professional",
      "Complex anti-hero",
      "Ensemble cast",
      "Any compelling lead"
    ]
  },
  {
    id: 8,
    category: 'film_elements',
    question: "What kind of relationships interest you most?",
    options: [
      "Romance and love",
      "Family bonds",
      "Complex friendships",
      "Rivalry and conflict",
      "Any authentic connection"
    ]
  },
  // Complex Questions - Deeper preferences and impact
  {
    id: 9,
    category: 'era',
    question: "What time period interests you most in films?",
    options: [
      "Classic era (Pre-1970s)",
      "Modern day",
      "Recent past",
      "Future scenarios",
      "Any period done well"
    ]
  },
  {
    id: 10,
    category: 'impact',
    question: "How should the movie make you feel?",
    options: [
      "Emotionally moved",
      "Intellectually stimulated",
      "Pure entertainment",
      "Deep reflection",
      "Any powerful impact"
    ]
  },
  {
    id: 11,
    category: 'impact',
    question: "What's your preferred movie ending type?",
    options: [
      "Happy and satisfying",
      "Thought-provoking",
      "Plot twist",
      "Open-ended",
      "Any well-crafted ending"
    ]
  },
  {
    id: 12,
    category: 'viewing_experience',
    question: "What's your ideal way to experience a movie?",
    options: [
      "Theater experience",
      "Cozy home viewing",
      "Social watching",
      "Solo immersion",
      "Any comfortable setting"
    ]
  }
];

export default function QuestionFlow({ onComplete, minQuestions = 5 }: QuestionFlowProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: Question; answer: string }>>([]);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Set questions in order instead of shuffling them
    setQuestions(allQuestions);
  }, []);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, { question: questions[currentQuestion], answer }];
    setAnswers(newAnswers);
    setCurrentQuestion(currentQuestion + 1);
    
    // Show skip button after first question
    if (newAnswers.length >= 1) {
      setCanSkip(true);
    }

    if (currentQuestion >= questions.length - 1 || (canSkip && answer === 'SKIP')) {
      onComplete(newAnswers);
    }
  };

  const handleSkip = () => {
    if (canSkip) {
      onComplete(answers);
    }
  };

  if (!questions.length || currentQuestion >= questions.length) return null;

  const progress = (currentQuestion / questions.length) * 100;
  
  const getProgressBarStyles = () => {
    if (progress < 25) {
      return 'bg-red-500 shadow-red-500/50';
    } else if (progress < 50) {
      return 'bg-yellow-500 shadow-yellow-500/50';
    } else if (progress < 75) {
      return 'bg-blue-500 shadow-blue-500/50';
    } else {
      return 'bg-green-500 shadow-green-500/50';
    }
  };

  const getRecommendationStrength = () => {
    if (progress < 25) {
      return 'Basic';
    } else if (progress < 50) {
      return 'Good';
    } else if (progress < 75) {
      return 'Strong';
    } else {
      return 'Excellent';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="mb-6">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-medium text-blue-400">
            {getRecommendationStrength()} Recommendations
          </span>
        </div>

        <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ease-in-out shadow-lg ${getProgressBarStyles()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {canSkip && (
          <button
            onClick={handleSkip}
            className="w-full mt-4 py-3 px-6 text-lg font-semibold text-white 
                     bg-gradient-to-r from-blue-600 to-blue-400 
                     hover:from-blue-500 hover:to-blue-300
                     rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                     shadow-lg hover:shadow-blue-500/30"
          >
            Get recommendations
          </button>
        )}
      </div>

      <div className="transform transition-all duration-500 ease-in-out">
        <h2 className="text-3xl font-bold text-center mb-8 text-white/90 leading-tight">
          {questions[currentQuestion].question}
        </h2>

        <div className="grid gap-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="p-5 text-left rounded-xl bg-gray-800/80 hover:bg-gray-700/90 
                       transition-all duration-300 ease-in-out border border-gray-700 
                       hover:border-blue-500 backdrop-blur-sm transform hover:scale-[1.02]
                       hover:shadow-lg hover:shadow-blue-500/20"
            >
              <span className="text-lg text-white/90">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}