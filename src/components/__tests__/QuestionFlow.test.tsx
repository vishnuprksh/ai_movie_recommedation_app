import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionFlow from '../QuestionFlow';

describe('QuestionFlow', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    mockOnComplete.mockClear();
  });

  it('displays first question initially', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    expect(screen.getByText('Question 1/5')).toBeInTheDocument();
    expect(screen.getByText('If you could live in any movie universe, which genre would you choose?')).toBeInTheDocument();
  });

  it('shows progress correctly', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
  });

  it('advances to next question when option is clicked', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Sci-Fi Fantasy'));
    expect(screen.getByText('Question 2/5')).toBeInTheDocument();
    expect(screen.getByText('What emotion do you most want to feel while watching a movie?')).toBeInTheDocument();
  });

  it('shows all options for first question', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    expect(screen.getByText('Sci-Fi Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Romantic Comedy')).toBeInTheDocument();
    expect(screen.getByText('Action Adventure')).toBeInTheDocument();
    expect(screen.getByText('Mystery Thriller')).toBeInTheDocument();
    expect(screen.getByText('Animated Wonderland')).toBeInTheDocument();
  });

  it('completes flow after answering all questions', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    
    // Answer all questions
    const answers = [
      'Sci-Fi Fantasy',
      'Excitement & Adrenaline',
      'Classic (Pre-1980s)',
      'Standard (90-120 mins)',
      'Visual Effects'
    ];

    answers.forEach(answer => {
      fireEvent.click(screen.getByText(answer));
    });

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    expect(mockOnComplete).toHaveBeenCalledWith(answers);
  });

  it('updates progress percentage correctly', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('Sci-Fi Fantasy'));
    expect(screen.getByText('20% Complete')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Excitement & Adrenaline'));
    expect(screen.getByText('40% Complete')).toBeInTheDocument();
  });
});