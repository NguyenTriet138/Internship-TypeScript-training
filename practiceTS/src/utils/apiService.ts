export interface ApiConfig {
  baseUrl: string;
  endpoints: Record<string, string>;
}

/**
 * Default API configuration
 */
export const API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    products: '/products'
  }
} as const;

export class ApiService {
  private readonly baseUrl: string;

  constructor(private readonly config: ApiConfig) {
    this.baseUrl = config.baseUrl;
  }

  private getUrl(endpoint: string, path: string = ''): string {
    return `${this.baseUrl}${endpoint}${path}`;
  }

  public async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = this.getUrl(endpoint);
      console.log('Fetching from:', url);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  public async get<T>(endpoint: string, id?: number): Promise<T> {
    const path = id ? `/${id}` : '';
    return this.fetch<T>(endpoint + path, { method: 'GET' });
  }
}
