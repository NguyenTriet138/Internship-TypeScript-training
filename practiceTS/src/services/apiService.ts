import { ApiConfig } from "../config/env";

export class ApiService {
  private readonly baseUrl: string;

  constructor(private readonly config: ApiConfig) {
    this.baseUrl = config.baseUrl;
  }

  private getUrl(endpoint: string, path: string = ''): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return `${endpoint}${path}`;
    }
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

  public async post<responseType>(
    endpoint: string,
    body: BodyInit,
    responseType: 'json' | 'text' | 'blob' | 'formData' | 'arrayBuffer' = 'json'
  ): Promise<responseType> {
    try {
      const url = this.getUrl(endpoint);

      const response = await fetch(url, {
        method: 'POST',
        headers: body instanceof FormData ? {} : {
          'Content-Type': 'application/json'
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      let data: object | string | Blob | FormData | ArrayBuffer;
      switch (responseType) {
        case 'json':
          data = await response.json();
          break;
        case 'text':
          data = await response.text();
          break;
        case 'blob':
          data = await response.blob();
          break;
        case 'formData':
          data = await response.formData();
          break;
        case 'arrayBuffer':
          data = await response.arrayBuffer();
          break;
        default:
          throw new Error('Unsupported response type');
      }

      return data as responseType;
    } catch (error) {
      throw new Error(
        `Failed to post data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
