import { ProductModel, ProductData } from '../models/productModel.js';
import { UploadImgService } from './uploadImgService.js';
import { logger } from '../config/logger.js';
import { SaveProductDataRequest } from '../models/productModel.js';

interface ProductUpdateDependencies {
  productId: string;
  model: ProductModel;
  view: {
    getProductFormData(): Partial<ProductData>;
    showSuccessMessage(message: string): void;
  };
  uploadService: UploadImgService;
}

export async function bindGetProduct({
  productId,
  model,
  view,
  uploadService,
}: ProductUpdateDependencies): Promise<void> {
  try {
    let updatedData = view.getProductFormData();

    updatedData = await uploadService.uploadProductImages(updatedData as SaveProductDataRequest);

    await model.updateProduct(productId, updatedData);

    view.showSuccessMessage('Product updated successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('VALIDATION:')) {
      return;
    }
    logger.error('Failed to update product', error);
  }
}
