import { ProductModel } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";
import { ImgService } from "../services/imageService.js";
import { bindGetProduct } from "../services/bindGetProduct.js";
import { handleError } from "../services/errorHandler.js";

export class ProductDetailController {
  constructor(
    private readonly model: ProductModel,
    private readonly view: ProductView,
    private readonly imgService: ImgService,
  ) {}

  /**
   * Initialize the controller for product detail page
   */
  async init(): Promise<void> {
    try {
      await this.loadProductDetail();
    } catch (error) {
      handleError('Initialization failed', error);
    }
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
          imgService: this.imgService,
        });
      });
      this.view.initializeImageUpload();
    } catch (error) {
      handleError('Failed to load product details', error);
    }
  }
}
