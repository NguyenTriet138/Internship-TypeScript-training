// src/controller/product-controller.ts
import { ProductModel } from "../models/productModel.js";
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
        handle: () => this.loadProducts()
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
  private handleError(message: string, error: unknown): void {
    console.error(message, error);
    alert(message);
    this.navigate("./home");
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
      console.log('Loading product details for ID:', productId);

      if (!productId) {
        throw new Error("No product selected");
      }

      console.log('Fetching product data...');
      const product = await this.model.getProductById(+productId);

      if (!product) {
        throw new Error("Product data is empty");
      }

      // Render the product details
      console.log('Rendering product:', product);
      this.view.renderProductDetail(product);
      console.log('Product details rendered successfully');

    } catch (error) {
      console.error('Detailed error in loadProductDetail:', error);
      this.handleError('Failed to load product details', error);
    }
  }
}
