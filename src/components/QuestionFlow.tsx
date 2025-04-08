import React, { useState, useEffect } from 'react';
import { Question, QuestionFlowProps } from '../types';

const allQuestions: Question[] = [
  // Genre
  {
    id: 1,
    category: 'genre',
    question: "What should be happening in the first 5 minutes of your perfect movie?",
    options: [
      "An epic chase scene",
      "A mysterious murder",
      "A meet-cute moment",
      "Mind-bending visuals",
      "Surprise me!"
    ]
  },
  {
    id: 2,
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
    id: 3,
    category: 'genre',
    question: "What should the movie focus on most?",
    options: [
      "Heart-pounding action",
      "Mind-bending mystery",
      "Emotional journey",
      "Comedy and fun",
      "Mix of everything"
    ]
  },
  // Film Elements
  {
    id: 4,
    category: 'film_elements',
    question: "Pick your ideal movie setting:",
    options: [
      "Neon-lit cyberpunk city",
      "Magical fantasy realm",
      "Gritty urban streets",
      "Distant alien worlds",
      "Any immersive world"
    ]
  },
  {
    id: 5,
    category: 'film_elements',
    question: "What should stand out most in the movie?",
    options: [
      "Epic orchestral score",
      "Stunning visuals",
      "Sharp witty dialogue",
      "Deep emotional moments",
      "Everything balanced"
    ]
  },
  // Viewing Experience
  {
    id: 6,
    category: 'viewing_experience',
    question: "How should the story unfold?",
    options: [
      "Fast-paced thrill ride",
      "Slow-burn mystery",
      "Character-driven journey",
      "Multiple interwoven plots",
      "Natural progression"
    ]
  },
  {
    id: 7,
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
  // Film Elements
  {
    id: 8,
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
    id: 9,
    category: 'film_elements',
    question: "Pick the key relationship in the movie:",
    options: [
      "Enemies to lovers",
      "Unlikely partnerships",
      "Family bonds",
      "Complex rivalries",
      "Any authentic connection"
    ]
  },
  // Era
  {
    id: 10,
    category: 'era',
    question: "When should this movie take place?",
    options: [
      "Historical past",
      "Present day",
      "Near future",
      "Far future",
      "Timeless setting"
    ]
  },
  {
    id: 11,
    category: 'film_elements',
    question: "Pick the visual style:",
    options: [
      "Realistic and gritty",
      "Stylized and artistic",
      "Bright and colorful",
      "Dark and moody",
      "Whatever fits the story"
    ]
  },
  // Impact
  {
    id: 12,
    category: 'impact',
    question: "How should this movie affect the viewer?",
    options: [
      "Make them think deeply",
      "Touch their heart",
      "Pure entertainment",
      "Leave them speechless",
      "Any lasting impression"
    ]
  },
  {
    id: 13,
    category: 'impact',
    question: "Pick a must-have scene type:",
    options: [
      "Mind-blowing reveal",
      "Character transformation",
      "Epic confrontation",
      "Emotional breakthrough",
      "Any powerful moment"
    ]
  },
  {
    id: 14,
    category: 'impact',
    question: "After the movie ends, viewers should feel:",
    options: [
      "Amazed and inspired",
      "Emotionally moved",
      "Intellectually stimulated",
      "Thoroughly entertained",
      "Open to interpretation"
    ]
  },
  {
    id: 15,
    category: 'viewing_experience',
    question: "Choose the perfect viewing setup:",
    options: [
      "Epic IMAX experience",
      "Cozy home theater",
      "Late night silence",
      "Social watch party",
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
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
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