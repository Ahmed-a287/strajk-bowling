import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { test, expect } from 'vitest';
import App from '../App';

test('renders the Strajk Bowling logo', () => {
  render(<App />);
  const images = screen.getAllByRole('img');
  const logo = images.find((img) => img.classList.contains('top__logo'));
  expect(logo).toBeInTheDocument();
});
