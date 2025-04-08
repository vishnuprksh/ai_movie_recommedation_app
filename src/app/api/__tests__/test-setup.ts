// Contents same as before, just moved to new file
import { NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(body), init);
      Object.defineProperty(response, 'status', {
        get() {
          return init?.status || 200;
        }
      });
      return response;
    }
  }
}));

const mockFetch = () => {
  global.Response = class implements Partial<Response> {
    public body: any;
    public status: number;
    private responseInit?: ResponseInit;

    constructor(body: BodyInit | null = null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.responseInit = init;
    }

    async json() {
      return JSON.parse(this.body);
    }
  } as any;

  global.Request = class implements Partial<Request> {
    public url: string;
    public method: string;
    public headers: Headers;
    public body: any;

    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }

    async json() {
      return JSON.parse(this.body);
    }
  } as any;

  global.Headers = class {
    private headers: Record<string, string> = {};
    
    constructor(init?: Record<string, string> | Headers) {
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value;
        });
      }
    }

    get(name: string): string | null {
      return this.headers[name.toLowerCase()] || null;
    }

    set(name: string, value: string): void {
      this.headers[name.toLowerCase()] = value;
    }
  } as any;
};

mockFetch();