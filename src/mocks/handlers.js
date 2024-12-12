import { HttpResponse, http } from 'msw';

export const handlers = [
  http.post(
    'https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com',
    async (request) => {
      return HttpResponse.json(
        {
          active: true,
          when: '2024-12-30T12:00',
          lanes: '1',
          people: '1',
          shoes: ['39'],
          id: '1122',
          price: 120,
        },
        { status: 201 }
      );
    }
  ),
];
