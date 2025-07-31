export interface ApiConfig {
  baseUrl: string;
  endpoints: Record<string, string>;
}

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

  public async put<T, U = T>(endpoint: string, data: U): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Upload image to ImgBB
   * @param imageData - Base64 encoded image data
   * @param apiKey - ImgBB API key
   * @returns Promise with ImgBB response
   */
  public async uploadToImgBB(imageData: string, apiKey: string): Promise<ImgBBResponse> {
    try {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

      const formData = new FormData();
      formData.append('image', base64Data);

      const url = `https://api.imgbb.com/1/upload?expiration=600&key=${apiKey}`;

      console.log('Uploading image to ImgBB...');

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('ImgBB upload response:', data);

      if (!data.success) {
        throw new Error('ImgBB upload failed');
      }

      return data;
    } catch (error) {
      console.error('ImgBB upload error:', error);
      throw error;
    }
  }
}
