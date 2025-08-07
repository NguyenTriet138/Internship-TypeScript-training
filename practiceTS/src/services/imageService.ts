import { ApiService } from './apiService.js';
import { API_CONFIG, ENV } from '../config/env.js';

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

export class ImgService {
  private readonly apiService: ApiService;

  constructor() {
    this.apiService = new ApiService(API_CONFIG);
  }

  public async uploadImg(imageData: string, apiKey: string): Promise<string> {
    try {
      // Remove data:image/...;base64, prefix if needed
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

      const formData = new FormData();
      formData.append('image', base64Data);

      const uploadUrl = `${ENV.IMGBB_BASE_URL}?expiration=${ENV.IMGBB_EXPIRATION}&key=${apiKey}`;

      const response = await this.apiService.post<ImgBBResponse>(uploadUrl, formData, 'json');

      if (response != null && !response.success) {
        throw new Error('ImgBB upload failed');
      }

      return response.data.display_url;
    } catch {
      throw new Error('Failed to upload image');
    }
  }

  public async uploadImages(images: string[]): Promise<string[]> {
    const results: string[] = [];

    for (const img of images) {
      if (img.startsWith("https://")) {
        results.push(img);
      } else {
        const uploaded = await this.uploadImg(img, ENV.IMGBB_API_KEY);
        results.push(uploaded);
      }
    }

    return results;
  }
}
