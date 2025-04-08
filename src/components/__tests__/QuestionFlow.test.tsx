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
    expect(screen.getByText('If you could have dinner with any movie character, which genre would they be from?')).toBeInTheDocument();
  });

  it('shows progress correctly', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
  });

  it('advances to next question when option is clicked', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('A witty character from a Comedy'));
    expect(screen.getByText('Question 2/5')).toBeInTheDocument();
    expect(screen.getByText("What's your ideal movie watching atmosphere?")).toBeInTheDocument();
  });

  it('shows all options for first question', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    expect(screen.getByText('A witty character from a Comedy')).toBeInTheDocument();
    expect(screen.getByText('A wise mentor from Fantasy/Sci-Fi')).toBeInTheDocument();
    expect(screen.getByText('A mysterious figure from Thriller/Noir')).toBeInTheDocument();
    expect(screen.getByText('A passionate soul from Drama/Romance')).toBeInTheDocument();
    expect(screen.getByText('An inspiring hero from Action/Adventure')).toBeInTheDocument();
  });

  it('completes flow after answering all questions', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    
    // Answer all questions
    const answers = [
      'A witty character from a Comedy',
      'Edge of my seat, heart racing',
      'Epic visual spectacles and effects',
      'Golden Age Classics (Pre-1970s)',
      'A mind-bending revelation'
    ];

    answers.forEach(answer => {
      fireEvent.click(screen.getByText(answer));
    });

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    expect(mockOnComplete).toHaveBeenCalledWith(answers);
  });

  it('updates progress percentage correctly', () => {
    render(<QuestionFlow onComplete={mockOnComplete} />);
    
    fireEvent.click(screen.getByText('A witty character from a Comedy'));
    expect(screen.getByText('20% Complete')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Edge of my seat, heart racing'));
    expect(screen.getByText('40% Complete')).toBeInTheDocument();
  });
});