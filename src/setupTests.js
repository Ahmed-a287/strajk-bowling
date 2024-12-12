import { server } from './mocks/server'; // Importera servern
import { rest } from 'msw';

// Starta servern innan alla tester körs
beforeAll(() => server.listen());

// Återställ eventuella handlers som ändrats under tester
afterEach(() => server.resetHandlers());

// Stäng servern efter att alla tester har körts
afterAll(() => server.close());
