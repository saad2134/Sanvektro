import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Simulator } from '../simulator/Simulator';
import { useBudgetStore } from '../../store/budgetStore';

describe('Decision Simulator', () => {
  beforeEach(() => {
    useBudgetStore.getState().resetToInitialDemo();
  });

  it('updates impact preview on amount change', async () => {
    render(<Simulator />);
    const input = screen.getByLabelText(/amount/i);
    fireEvent.change(input, { target: { value: '500' } });
    expect(screen.getByTestId('impact-balance')).toHaveTextContent('₹6,000');
  });

  it('shows warning for large amounts', async () => {
    render(<Simulator />);
    const input = screen.getByLabelText(/amount/i);
    fireEvent.change(input, { target: { value: '9000' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
