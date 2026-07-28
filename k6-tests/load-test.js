import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // ramp up to 20 users
    { duration: '30s', target: 20 }, // stay at 20 users for 30 seconds
    { duration: '10s', target: 0 },  // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

const BASE_URL = 'http://localhost:8000/api';

export default function () {
  // Test root / health endpoint if available, or just an arbitrary endpoint
  // Let's test the public /api/projects endpoint to see if it responds correctly
  const res = http.get(`${BASE_URL}/projects`);

  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);
}
