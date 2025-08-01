// src/controller/product-controller.ts
import { ProductModel, ProductData } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";

interface PageHandler {
  check: () => boolean;
  handle: () => Promise<void>;
}

export class ProductController {
  private readonly pageHandlers: PageHandler[];

  constructor(
    private readonly model: ProductModel,
    private readonly view: ProductView
  ) {
    /** pageHandlers is using for check url path and load page. */
    this.pageHandlers = [
      {
        check: () => this.isIndexPage(),
        handle: async () => {
          await this.loadProducts();
          this.view.attachCreateProductHandler(async () => {await this.handleCreateProduct()});
        }
      },
      {
        check: () => this.isDetailPage(),
        handle: () => this.loadProductDetail()
      }
    ];
  }

  /**
   * Initialize the controller based on current page
   */
  async init(): Promise<void> {
    try {
      const handler = this.pageHandlers.find(h => h.check());
      if (handler) {
        await handler.handle();
      }
    } catch (error) {
      this.handleError('Initialization failed', error);
    }
  }

  private isIndexPage(): boolean {
    const path = window.location.pathname;
    return path.endsWith("home") || path.endsWith("/");
  }

  private isDetailPage(): boolean {
    return window.location.pathname.endsWith("productDetail");
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
    if (process.env.NODE_ENV === "development") {
      console.error(message, error);
    }
    this.navigate("./home");
  }

  /**
   * Handle creating a new product
   */
  private async handleCreateProduct(): Promise<void> {
    try {
      const productData = this.view.getProductFormData();

      // Upload image
      const productImageUpload = await this.model.uploadImageToImgBB(productData.productImage!, "80a30c7f1caf502fb8a3e61aeb968fb2");
      const brandImageUpload = await this.model.uploadImageToImgBB(productData.brandImage!, "80a30c7f1caf502fb8a3e61aeb968fb2");

      productData.productImage = productImageUpload;
      productData.brandImage = brandImageUpload;
      // Create the new product
      await this.model.createProduct(productData as Omit<ProductData, 'id'>);

      this.view.hideAddProductModal();

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
   * Get product ID from localStorage
   */
  private getStoredProductId(): number | null {
    const id = localStorage.getItem("selectedProductId");
    return id ? Number(id) : null;
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

  /**
   * Load and display product details
   */
  private async loadProductDetail(): Promise<void> {
    try {
      // Get product ID
      // const productId = this.getStoredProductId();
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get("id");

      if (!productId) {
        throw new Error("No product selected");
      }

      const product = await this.model.getProductById(+productId);

      if (!product) {
        throw new Error("Product data is empty");
      }

      // Render the product details and attach Save button
      this.view.renderProductDetail(product);
      this.view.attachSaveButtonHandler(async () => {
        await this.handleSaveProduct(product.id);
      });
      this.view.initializeImageUpload();
    } catch (error) {
      this.handleError('Failed to load product details', error);
    }
  }

  private async handleSaveProduct(productId: number): Promise<void> {
    try {
      const updatedData = this.view.getProductFormData();

      const productImageUpload = await this.model.uploadImageToImgBB(updatedData.productImage!, "80a30c7f1caf502fb8a3e61aeb968fb2");
      const brandImageUpload = await this.model.uploadImageToImgBB(updatedData.brandImage!, "80a30c7f1caf502fb8a3e61aeb968fb2");

      updatedData.productImage = productImageUpload;
      updatedData.brandImage = brandImageUpload;

      await this.model.updateProduct(productId, updatedData);
      alert('Product updated successfully!');
    } catch (error) {
      this.handleError('Failed to save product', error);
    }
  }
}
