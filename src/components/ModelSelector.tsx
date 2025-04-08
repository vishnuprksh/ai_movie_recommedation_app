interface ModelSelectorProps {
  selectedModel: 'groq' | 'gemini';
  onModelChange: (model: 'groq' | 'gemini') => void;
  disabled?: boolean;
}

export default function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className="text-gray-400">AI Model:</span>
      <div className="flex bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm">
        <button
          onClick={() => onModelChange('groq')}
          disabled={disabled}
          className={`px-4 py-2 rounded-md transition-all ${
            selectedModel === 'groq'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Groq
        </button>
        <button
          onClick={() => onModelChange('gemini')}
          disabled={disabled}
          className={`px-4 py-2 rounded-md transition-all ${
            selectedModel === 'gemini'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Gemini
        </button>
      </div>
    </div>
  );
}