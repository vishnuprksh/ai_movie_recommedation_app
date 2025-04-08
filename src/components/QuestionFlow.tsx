import React, { useState, useEffect } from 'react';
import { Question, QuestionFlowProps } from '../types';

const allQuestions: Question[] = [
  // Language Selection for Movies
  {
    id: 0,
    category: 'language',
    question: "What languages do you prefer for movies?",
    options: [
      "English",
      "Malayalam",
      "Hindi",
      "Tamil",
      "Korean"
    ]
  },
  // Language & Subtitles
  {
    id: 1,
    category: 'language',
    question: "When you're at a foreign restaurant, what's your approach to the menu?",
    options: [
      "I stick to dishes I can pronounce",
      "I love trying authentic names",
      "I ask for translations",
      "Pictures are my guide",
      "I'm open to pointing and surprises"
    ]
  },
  {
    id: 2,
    category: 'language',
    question: "Your friend is telling a story in another language. You...",
    options: [
      "Focus on their expressions and gestures",
      "Try to catch familiar words",
      "Wait for someone to translate",
      "Get lost in the rhythm",
      "Embrace the mystery"
    ]
  },
  // Genre
  {
    id: 3,
    category: 'genre',
    question: "Your perfect weekend activity would be...",
    options: [
      "Solving an escape room",
      "Dancing all night",
      "Reading sci-fi novels",
      "Rock climbing",
      "Whatever feels right"
    ]
  },
  {
    id: 4,
    category: 'genre',
    question: "Pick your dream superpower:",
    options: [
      "Time travel",
      "Mind reading",
      "Invisibility",
      "Super strength",
      "Surprise me!"
    ]
  },
  {
    id: 5,
    category: 'genre',
    question: "Your go-to spotify playlist is mostly...",
    options: [
      "Epic orchestral scores",
      "Indie acoustic vibes",
      "High-energy beats",
      "Emotional ballads",
      "A mix of everything"
    ]
  },
  // Viewing Experience
  {
    id: 6,
    category: 'viewing_experience',
    question: "How do you eat your popcorn?",
    options: [
      "One piece at a time",
      "Handful after handful",
      "Mix with other snacks",
      "Save it for intense scenes",
      "Whatever way feels natural"
    ]
  },
  {
    id: 7,
    category: 'viewing_experience',
    question: "Your ideal movie-watching spot is...",
    options: [
      "Premium center seats",
      "Cozy back row",
      "Home theater setup",
      "Outdoor screening",
      "Anywhere comfortable"
    ]
  },
  {
    id: 8,
    category: 'viewing_experience',
    question: "During a movie, you usually...",
    options: [
      "Analyze every detail",
      "Get lost in the story",
      "Chat with friends",
      "Check reviews midway",
      "Go with the flow"
    ]
  },
  // Film Elements
  {
    id: 9,
    category: 'film_elements',
    question: "In a dream, what catches your attention first?",
    options: [
      "The vivid colors",
      "The background music",
      "The story unfolding",
      "The emotions felt",
      "Everything blends together"
    ]
  },
  {
    id: 10,
    category: 'film_elements',
    question: "Your Instagram feed is full of...",
    options: [
      "Artistic shots",
      "Funny moments",
      "Inspiring quotes",
      "Action shots",
      "A bit of everything"
    ]
  },
  {
    id: 11,
    category: 'film_elements',
    question: "At a party, you're most likely to...",
    options: [
      "Notice the decorations",
      "Feel the atmosphere",
      "Follow conversations",
      "Start the dancing",
      "Float between activities"
    ]
  },
  // Era
  {
    id: 12,
    category: 'era',
    question: "Your style icon is from...",
    options: [
      "Classic Hollywood",
      "The rebellious 70s",
      "The bold 80s/90s",
      "Contemporary trends",
      "Mix of all eras"
    ]
  },
  {
    id: 13,
    category: 'era',
    question: "Your dream car would be...",
    options: [
      "Classic vintage",
      "Retro muscle car",
      "Modern luxury",
      "Future concept",
      "Any cool ride"
    ]
  },
  // Impact
  {
    id: 14,
    category: 'impact',
    question: "After a good experience, you prefer to...",
    options: [
      "Analyze it deeply",
      "Feel the emotions",
      "Share with friends",
      "Plan the next one",
      "Let it sink in naturally"
    ]
  },
  {
    id: 15,
    category: 'impact',
    question: "A perfect ending makes you feel...",
    options: [
      "Mind blown",
      "Emotionally moved",
      "Inspired to act",
      "Ready for more",
      "Whatever it brings"
    ]
  },
  // More varied questions
  {
    id: 16,
    category: 'viewing_experience',
    question: "Your reaction to plot twists is...",
    options: [
      "Gasp out loud",
      "Silent shock",
      "Predict them early",
      "Rewind to check clues",
      "Take them as they come"
    ]
  },
  {
    id: 17,
    category: 'film_elements',
    question: "Pick a time of day:",
    options: [
      "Golden sunset",
      "Mysterious midnight",
      "Fresh dawn",
      "Busy noon",
      "Any time works"
    ]
  },
  {
    id: 18,
    category: 'genre',
    question: "Your ideal pet would be...",
    options: [
      "Magical creature",
      "Loyal companion",
      "Exotic species",
      "Smart helper",
      "Any loving animal"
    ]
  },
  {
    id: 19,
    category: 'impact',
    question: "After watching something impactful, you...",
    options: [
      "Research the topic",
      "Reflect quietly",
      "Discuss with others",
      "Change something in life",
      "Let it influence naturally"
    ]
  },
  {
    id: 20,
    category: 'viewing_experience',
    question: "During intense scenes, you...",
    options: [
      "Hold your breath",
      "Cover your eyes",
      "Grip your seat",
      "Watch intently",
      "React spontaneously"
    ]
  },
  {
    id: 21,
    category: 'era',
    question: "Your ideal vacation setting is...",
    options: [
      "Historic landmarks",
      "Retro-themed resort",
      "Modern city",
      "Futuristic attraction",
      "Wherever adventure leads"
    ]
  },
  {
    id: 22,
    category: 'film_elements',
    question: "In a story, you're drawn to...",
    options: [
      "Visual details",
      "Character relationships",
      "Plot complexity",
      "Action sequences",
      "The overall experience"
    ]
  },
  {
    id: 23,
    category: 'language',
    question: "When hearing a new song in another language...",
    options: [
      "Focus on the melody",
      "Try to learn lyrics",
      "Look up translation",
      "Feel the emotion",
      "Enjoy the whole package"
    ]
  },
  {
    id: 24,
    category: 'genre',
    question: "Your dream house would be in...",
    options: [
      "Mysterious old mansion",
      "High-tech smart home",
      "Cozy cottage",
      "Urban penthouse",
      "Any place that feels right"
    ]
  },
  {
    id: 25,
    category: 'impact',
    question: "The best stories make you...",
    options: [
      "Question everything",
      "Feel deeply",
      "Learn something new",
      "Want to take action",
      "Experience life differently"
    ]
  }
];

export default function QuestionFlow({ onComplete, minQuestions = 5 }: QuestionFlowProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: Question; answer: string }>>([]);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Shuffle questions using Fisher-Yates algorithm
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  }, []);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, { question: questions[currentQuestion], answer }];
    setAnswers(newAnswers);
    setCurrentQuestion(currentQuestion + 1);
    
    // Enable skip button after minimum questions answered
    if (newAnswers.length >= minQuestions) {
      setCanSkip(true);
    }

    // Complete if all questions answered or user chooses to finish after minimum
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="mb-6">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-medium text-blue-400">
            Question {currentQuestion + 1}/{questions.length}
          </span>
          <span className="text-sm font-medium text-blue-400">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-in-out shadow-lg shadow-blue-500/50"
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
                     shadow-lg hover:shadow-blue-500/30
                     animate-pulse hover:animate-none"
          >
            Enough questions, Give me recommendations!!
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