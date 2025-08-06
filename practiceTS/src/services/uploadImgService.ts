import { ApiService } from './apiService.js';
import { API_CONFIG } from '../config/env.js';
import { ENV } from '../config/env.js';
import { SaveProductDataRequest } from '../models/productModel.js';

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

  public async uploadProductImages(productData: SaveProductDataRequest): Promise<SaveProductDataRequest> {
    let brandImageUpload = productData.brandImage;
    let productImageUpload = productData.productImage;

    if (!productData.brandImage.startsWith("https://")) {
      brandImageUpload = await this.uploadImageToImgBB(productData.brandImage, ENV.IMGBB_API_KEY);
    };

    if (!productData.productImage.startsWith("https://")) {
      productImageUpload = await this.uploadImageToImgBB(productData.productImage, ENV.IMGBB_API_KEY);
    };

    return {
      ...productData,
      productImage: productImageUpload,
      brandImage: brandImageUpload,
    };
  }
}
