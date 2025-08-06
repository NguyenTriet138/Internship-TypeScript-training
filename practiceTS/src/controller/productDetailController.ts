import { ProductModel } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";
import { UploadImgService } from "../services/uploadImgService.js";
import { logger } from "../config/logger.js";
import { bindGetProduct } from "../services/bindGetProduct.js";

export class ProductDetailController {
  constructor(
    private readonly model: ProductModel,
    private readonly view: ProductView,
    private readonly uploadService: UploadImgService,
  ) {}

  /**
   * Initialize the controller for product detail page
   */
  async init(): Promise<void> {
    try {
      await this.loadProductDetail();
    } catch (error) {
      this.handleError('Initialization failed', error);
    }
  }

  /**
   * Navigate to a page
   */
  private navigate(page: string): void {
    window.location.href = page;
  }

  /**
   * Handle errors: show alert when got error
   */
  public handleError(message: string, error: unknown): void {
    alert(message);
    logger.error(message, error);
    this.navigate("./home");
  }

  /**
   * Load and display product details
   */
  private async loadProductDetail(): Promise<void> {
    try {
      // Get product ID
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get("id");

      if (!productId) {
        throw new Error("No product selected");
      }

      const product = await this.model.getProductById(productId);

      if (!product) {
        throw new Error("Product data is empty");
      }

      // Render the product details and attach Save button
      this.view.renderProductDetail(product);
      this.view.attachSaveButtonHandler(async () => {
        await bindGetProduct({
          productId: product.id,
          model: this.model,
          view: this.view,
          uploadService: this.uploadService,
        });
      });
      this.view.initializeImageUpload();
    } catch (error) {
      this.handleError('Failed to load product details', error);
    }
  }
}
