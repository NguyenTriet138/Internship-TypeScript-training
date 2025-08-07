import { ApiConfig } from "../config/env";

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

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
      return data;
    } catch {
      throw new Error('Failed to fetch...');
    }
  }

  public async get<T>(endpoint: string, id?: string): Promise<T> {
    const path = id ? `/${id}` : '';
    return this.fetch<T>(endpoint + path, { method: 'GET' });
  }

  public async put<T, U = T>(endpoint: string, data: U): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Create a new resource
   * @param endpoint - API endpoint
   * @param data - Data to create
   * @returns Promise with the created resource
   */
  public async post<T, U = T>(endpoint: string, data: U): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async postFormData(url: string, formData: FormData): Promise<ImgBBResponse> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      return data;
    } catch {
      throw new Error('Failed to upload form data');
    }
  }

  public async delete(endpoint: string): Promise<void> {
    try {
      const url = this.getUrl(endpoint);
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
    } catch {
      throw new Error('Failed to delete resource');
    }
  }
}
