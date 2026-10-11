import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Test boundary trigger');
};

const GoodChild = () => <div>Safe Content Rendered</div>;

describe('ErrorBoundary Component', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe Content Rendered')).toBeInTheDocument();
  });

  it('catches render errors and displays recovery UI', () => {
    // Suppress expected console.error during test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Sanvektro Session Recovered')).toBeInTheDocument();
    expect(screen.getByText('Test boundary trigger')).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
