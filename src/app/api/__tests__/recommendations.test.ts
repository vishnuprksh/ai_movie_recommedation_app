import './test-setup';
import { POST } from '../recommendations/route';

// Mock OpenAI with a class constructor
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: `1. Inception
Description: A mind-bending sci-fi masterpiece about dreams.
Match Score: 95

2. The Matrix
Description: Revolutionary sci-fi action film.
Match Score: 90

3. Interstellar
Description: Epic space adventure with emotional depth.
Match Score: 85`
              }
            }
          ]
        })
      }
    }
  }));
});

describe('Recommendations API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createRequest = (body: any) => {
    return new Request('http://localhost:3000/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
  };

  it('returns error when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    
    const request = createRequest({
      answers: ['Sci-Fi', 'Excitement', '2000s', 'Standard', 'Visual Effects']
    });
    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('OpenAI API key not configured');
  });

  it('returns error for invalid answers format', async () => {
    const request = createRequest({ answers: [] });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid answers format');
  });

  it('successfully processes valid answers and returns recommendations', async () => {
    const answers = ['Sci-Fi', 'Excitement', '2000s', 'Standard', 'Visual Effects'];
    const request = createRequest({ answers });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.recommendations).toHaveLength(3);
    expect(data.recommendations[0]).toEqual({
      title: 'Inception',
      description: 'A mind-bending sci-fi masterpiece about dreams.',
      matchScore: 95
    });
  });
});