import { ProductModel, ProductData } from '../models/productModel.js';
import { ImgService } from '../services/imageService.js';
import { logger } from '../config/logger.js';

interface ProductUpdateDependencies {
  productId: string;
  model: ProductModel;
  view: {
    getProductFormData(): Partial<ProductData>;
    showSuccessMessage(message: string): void;
  };
  imgService: ImgService;
}

export async function bindGetProduct({
  productId,
  model,
  view,
  imgService,
}: ProductUpdateDependencies): Promise<void> {
  try {
    const updatedData = view.getProductFormData();

    if (!updatedData.productImage || !updatedData.brandImage) {
      throw new Error('VALIDATION: Product and brand images are required');
    }

    const [productImage, brandImage] = await imgService.uploadImages([updatedData.productImage, updatedData.brandImage]);

    updatedData.productImage = productImage;
    updatedData.brandImage = brandImage;

    await model.updateProduct(productId, updatedData);

    view.showSuccessMessage('Product updated successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('VALIDATION:')) {
      return;
    }
    logger.error('Failed to update product', error);
  }
}

export function handleError(message: string, error: unknown, redirectUrl = './home'): void {
  alert(message);
  logger.error(message, error);
  navigateTo(redirectUrl);
}

export function navigateTo(page: string): void {
  window.location.href = page;
}
