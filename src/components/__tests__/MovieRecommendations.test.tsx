import React from 'react';
import { render, screen } from '@testing-library/react';
import MovieRecommendations from '../MovieRecommendations';

describe('MovieRecommendations', () => {
  it('displays loading state correctly', () => {
    render(<MovieRecommendations movies={[]} isLoading={true} />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('displays movies when provided', () => {
    const mockMovies = [
      {
        title: 'Test Movie',
        description: 'Test Description',
        matchScore: 95
      }
    ];

    render(<MovieRecommendations movies={mockMovies} isLoading={false} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('95% Match')).toBeInTheDocument();
  });

  it('displays error message when error occurs', () => {
    render(<MovieRecommendations movies={[]} isLoading={false} error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('handles empty movies array', () => {
    render(<MovieRecommendations movies={[]} isLoading={false} />);
    expect(screen.getByText('Your Personalized Movie Recommendations')).toBeInTheDocument();
    expect(screen.queryByTestId('movie-card')).not.toBeInTheDocument();
  });

  it('displays correct match score format', () => {
    const mockMovies = [
      {
        title: 'Test Movie',
        description: 'Test Description',
        matchScore: 85
      }
    ];
    render(<MovieRecommendations movies={mockMovies} isLoading={false} />);
    expect(screen.getByText('85% Match')).toHaveClass('bg-blue-500', 'text-white');
  });

  it('displays multiple movies correctly', () => {
    const mockMovies = [
      {
        title: 'Movie 1',
        description: 'Description 1',
        matchScore: 90
      },
      {
        title: 'Movie 2',
        description: 'Description 2',
        matchScore: 85
      }
    ];
    render(<MovieRecommendations movies={mockMovies} isLoading={false} />);
    expect(screen.getAllByTestId('movie-card')).toHaveLength(2);
  });

  it('displays loading skeleton with correct number of items', () => {
    render(<MovieRecommendations movies={[]} isLoading={true} />);
    expect(screen.getAllByTestId('loading-skeleton-item')).toHaveLength(3);
  });
});