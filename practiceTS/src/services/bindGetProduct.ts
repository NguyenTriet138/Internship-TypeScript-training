import { ProductModel, ProductData } from '../models/productModel.js';
import { UploadImgService } from './uploadImgService.js';
import { logger } from '../config/logger.js';

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
    const updatedData = view.getProductFormData();

    if (!updatedData.productImage || !updatedData.brandImage) {
      throw new Error("Missing image data: productImage or brandImage is undefined");
    }

    // updatedData = await uploadService.uploadProductImages(updatedData as SaveProductDataRequest);
    const uploadedImages = await uploadService.uploadProductImages({
      productImage: updatedData.productImage,
      brandImage: updatedData.brandImage
    });

    updatedData.productImage = uploadedImages.productImage;
    updatedData.brandImage = uploadedImages.brandImage;

    await model.updateProduct(productId, updatedData);

    view.showSuccessMessage('Product updated successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('VALIDATION:')) {
      return;
    }
    logger.error('Failed to update product', error);
  }
}
