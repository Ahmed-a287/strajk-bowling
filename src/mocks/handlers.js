import { HttpResponse, http } from 'msw';

export const handlers = [
  http.post(
    'https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com',
    async (request) => {
      return HttpResponse.json(
        {
          bookingNumber: 'STR432MEKA',
        },
        { status: 201 }
      );
    }
  ),
];
