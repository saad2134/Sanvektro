import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { BalanceCard } from '../budget/BalanceCard';
import { BudgetState } from '../../types';

describe('BalanceCard', () => {
  const mockState: BudgetState = {
    totalBudget: 10000,
    startDate: new Date(),
    spent: 2000,
    committed: 1000,
    savedToGoals: 500,
    daysRemaining: 20,
    daysPassed: 10,
    availableBalance: 6500,
    dailyAllowance: 325,
    healthScore: 82,
    riskLevel: 'safe',
  };

  const dangerState: BudgetState = {
    ...mockState,
    spent: 9500,
    availableBalance: 0,
    dailyAllowance: 0,
    riskLevel: 'danger',
  };

  it('renders available balance in rupees', () => {
    render(<BalanceCard state={mockState} />);
    expect(screen.getByText(/₹6,500/)).toBeInTheDocument();
  });

  it('shows danger color when risk is high', () => {
    render(<BalanceCard state={dangerState} />);
    expect(screen.getByTestId('risk-indicator')).toHaveClass('text-red-500');
  });

  it('shows daily allowance', () => {
    render(<BalanceCard state={mockState} />);
    expect(screen.getByText(/₹325.*day/i)).toBeInTheDocument();
  });
});
