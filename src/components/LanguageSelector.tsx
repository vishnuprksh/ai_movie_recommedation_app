import React from 'react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Japanese",
  "Korean",
  "Chinese",
  "Hindi",
  "Arabic",
  "Portuguese",
  "Russian"
];

export default function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange,
  disabled 
}: LanguageSelectorProps) {
  return (
    <div className="mb-6 flex items-center justify-center gap-4">
      <span className="text-white/90">Preferred Language:</span>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm text-gray-300
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700/50'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
      >
        {languages.map((language) => (
          <option key={language} value={language} className="bg-gray-800">
            {language}
          </option>
        ))}
      </select>
    </div>
  );
}