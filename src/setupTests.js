import { server } from './mocks/server'; // Importera servern
import { cleanup } from '@testing-library/react';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Starta servern innan alla tester körs
beforeAll(() => server.listen());

// Återställ eventuella handlers som ändrats under tester
afterEach(() => {
  cleanup();
});

// Stäng servern efter att alla tester har körts
afterAll(() => server.close());
