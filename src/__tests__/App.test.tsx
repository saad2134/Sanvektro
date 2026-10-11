import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';

describe('Sanvektro Main Application', () => {
  it('renders all 4 financial health metric cards', () => {
    render(<App />);

    expect(screen.getByTestId('metric-balance-card')).toBeInTheDocument();
    expect(screen.getByTestId('metric-daily-allowance-card')).toBeInTheDocument();
    expect(screen.getByTestId('metric-health-score-card')).toBeInTheDocument();
    expect(screen.getByTestId('metric-risk-card')).toBeInTheDocument();
  });

  it('renders the 30-day timeline scrubber and what-if decision simulator', () => {
    render(<App />);

    expect(screen.getByTestId('timeline-scrubber')).toBeInTheDocument();
    expect(screen.getByTestId('simulator-title')).toBeInTheDocument();
    expect(screen.getByTestId('simulator-amount')).toBeInTheDocument();
  });

  it('allows switching persona presets', () => {
    render(<App />);

    const internBtn = screen.getByRole('button', { name: /First-Month Intern/i });
    fireEvent.click(internBtn);

    // Verify day updates to Intern preset (Day 14)
    expect(screen.getByText('14')).toBeInTheDocument();
  });
});
