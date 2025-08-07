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
  public async uploadImg(imageData: string, apiKey: string): Promise<string> {
    try {
      // Remove data:image/...;base64, prefix if needed
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

      const formData = new FormData();
      formData.append('image', base64Data);

      const uploadUrl = `${ENV.IMGBB_BASE_URL}?expiration=${ENV.IMGBB_EXPIRATION}&key=${apiKey}`;

      const response = await this.apiService.postFormData(uploadUrl, formData);

      if (!response.success) {
        throw new Error('ImgBB upload failed');
      }

      return response.data.display_url;
    } catch {
      throw new Error('Failed to upload image');
    }
  }

  public async uploadImages(images: UploadImgServiceInterface): Promise<UploadImgServiceInterface> {
    let { productImage, brandImage } = images;

    if (!brandImage.startsWith("https://")) {
      brandImage = await this.uploadImg(brandImage, ENV.IMGBB_API_KEY);
    };

    if (!productImage.startsWith("https://")) {
      productImage = await this.uploadImg(productImage, ENV.IMGBB_API_KEY);
    };

    return { productImage, brandImage };
  }
}
