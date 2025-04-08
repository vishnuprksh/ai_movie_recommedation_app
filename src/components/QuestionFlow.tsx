import React, { useState } from 'react';
import { Question, QuestionFlowProps } from '../types';

const questions: Question[] = [
  {
    id: 1,
    question: "If you could have dinner with any movie character, which genre would they be from?",
    options: [
      "A witty character from a Comedy",
      "A wise mentor from Fantasy/Sci-Fi",
      "A mysterious figure from Thriller/Noir",
      "A passionate soul from Drama/Romance",
      "An inspiring hero from Action/Adventure"
    ]
  },
  {
    id: 2,
    question: "What's your ideal movie watching atmosphere?",
    options: [
      "Edge of my seat, heart racing",
      "Cozy blanket, maybe some tears",
      "Mind engaged, solving mysteries",
      "Lost in wonder and imagination",
      "Laughing with friends and family"
    ]
  },
  {
    id: 3,
    question: "If your life was a movie, what would be its defining element?",
    options: [
      "Epic visual spectacles and effects",
      "Deep, meaningful conversations",
      "Plot twists and surprises",
      "Character growth and relationships",
      "Action-packed adventures"
    ]
  },
  {
    id: 4,
    question: "Which cinematic era speaks to your soul?",
    options: [
      "Golden Age Classics (Pre-1970s)",
      "Rebel Era (1970s-1980s)",
      "Innovation Period (1990s-2000s)",
      "Digital Revolution (2010s-Present)",
      "Timeless Stories (Any Era)"
    ]
  },
  {
    id: 5,
    question: "What should linger after the credits roll?",
    options: [
      "A mind-bending revelation",
      "An emotional resonance",
      "A sense of wonder",
      "A powerful message",
      "Pure entertainment joy"
    ]
  }
];

export default function QuestionFlow({ onComplete }: QuestionFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  if (currentQuestion >= questions.length) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="mb-12">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-medium text-blue-400">Question {currentQuestion + 1}/{questions.length}</span>
          <span className="text-sm font-medium text-blue-400">{Math.round((currentQuestion / questions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-in-out shadow-lg shadow-blue-500/50"
            style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
          ></div>
        </div>
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