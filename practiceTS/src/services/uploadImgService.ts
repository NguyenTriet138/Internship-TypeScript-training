import { ApiService } from './apiService.js';
import { API_CONFIG } from '../config/env.js';
import { ENV } from '../config/env.js';

export interface UploadImgServiceInterface {
  productImage: string;
  brandImage: string;
}

export class UploadImgService {
  private readonly apiService: ApiService;

  constructor() {
    this.apiService = new ApiService(API_CONFIG);
  }

  /**
   * Upload image to ImgBB and get display URL
   */
  async uploadImageToImgBB(imageData: string, apiKey: string): Promise<string> {
    try {
      const response = await this.apiService.uploadToImgBB(imageData, apiKey);
      return response.data.display_url;
    } catch {
      throw new Error('Failed to upload image');
    }
  }

  public async uploadProductImages(images: UploadImgServiceInterface): Promise<UploadImgServiceInterface> {
    let { productImage, brandImage } = images;

    if (!brandImage.startsWith("https://")) {
      brandImage = await this.uploadImageToImgBB(brandImage, ENV.IMGBB_API_KEY);
    };

    if (!productImage.startsWith("https://")) {
      productImage = await this.uploadImageToImgBB(productImage, ENV.IMGBB_API_KEY);
    };

    return { productImage, brandImage };
  }
}
