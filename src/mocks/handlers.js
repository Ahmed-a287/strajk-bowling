import { rest } from 'msw';

export const handlers = [
  // Mockar ett POST-anrop
  rest.post(
    'https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ message: 'Mocked POST request received' })
      );
    }
  ),
];
