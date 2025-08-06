import { ProductModel, ProductData, ProductFilter, Product } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";
import { UploadImgService } from "../services/uploadImgService.js";
import { logger } from "../config/logger.js";
import { bindGetProduct } from "../services/bindGetProduct.js";

export class ProductListController {
  private currentProducts: Product[] = [];

  constructor(
    private readonly model: ProductModel,
    private readonly view: ProductView,
    private readonly uploadService: UploadImgService
  ) {}

  /**
   * Initialize the controller for product list page
   */
  async init(): Promise<void> {
    try {
      this.view.initializeAddProductButton(async () => {await this.handleCreateProduct()});
      this.view.initializeDeleteModalHandlers();
      await this.loadProducts();

      this.view.onProductFilter((filters: ProductFilter) => {
        this.handleProductFilter(filters);
      });

      this.view.onDeleteProduct(async (id: string) => {
        await this.handleDeleteProduct(id);
      });

      this.view.onEditProduct(async (id: string) => {
        await this.handleLoadEditProduct(id);
      });

      this.view.onError((msg: string, error: unknown) => {
        this.handleError(msg, error);
      });
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
   * Handle creating a new product
   */
  private async handleCreateProduct(): Promise<void> {
    try {
      let productData = this.view.getProductFormData();

      productData = await this.uploadService.uploadProductImages(productData);

      // Create the new product
      await this.model.createProduct(productData as Omit<ProductData, 'id'>);

      this.view.hideProductModal();

      // Refresh the product list
      await this.loadProducts();

      alert('Product created successfully!');
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("VALIDATION:")) {
        return;
      }

      this.handleError("Failed to create product", error);
    }
  }

  /**
   * Load and display all products
   */
  private async loadProducts(): Promise<void> {
    try {
      const products = await this.model.getAllProducts();
      this.view.renderProducts(products);
    } catch (error) {
      this.handleError('Failed to load products', error);
    }
  }

  public async handleLoadEditProduct(productId: string): Promise<void> {
    try {
      // Get the product data
      const product = await this.model.getProductById(productId);

      // Populate the modal with product data
      this.view.populateEditModal(product);

      // Attach the update product info for editing
      this.view.attachUpdateProductHandler(async () => {
        await bindGetProduct({
          productId,
          model: this.model,
          view: this.view,
          uploadService: this.uploadService,
        });
        await this.loadProducts();
        this.view.hideProductModal();
      });

    } catch (error) {
      this.handleError('Failed to load product for editing', error);
    }
  }

  public async handleDeleteProduct(productId: string): Promise<void> {
    try {
      await this.model.deleteProduct(productId);
      await this.loadProducts();
    } catch (error) {
      this.handleError('Failed to delete product', error);
    }
  }

  public async handleProductFilter(filters: ProductFilter): Promise<void> {
    try {
      const filteredProducts = await this.model.getFilteredProducts(filters);
      this.currentProducts = filteredProducts;
      this.view.renderProducts(filteredProducts);
    } catch (error) {
      this.handleError('Failed to filter products', error);
    }
  }
}
