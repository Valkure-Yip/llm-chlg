import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';

describe('App Component', () => {
  it('should render the App component', () => {
    render(<App />);
    expect(true).toBeTruthy();
  });
});

