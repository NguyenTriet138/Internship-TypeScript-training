// src/controller/product-controller.ts
import { ProductModel } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";

/**
 * Interface for page-specific handlers
 */
interface PageHandler {
  check: () => boolean;
  handle: () => Promise<void>;
}

/**
 * ProductController manages the interaction between ProductModel and ProductView
 */
export class ProductController {
  private readonly model: ProductModel;
  private readonly view: ProductView;
  private readonly pageHandlers: PageHandler[];

  constructor(model: ProductModel, view: ProductView) {
    this.model = model;
    this.view = view;

    // Define page handlers
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
      // Find and execute the appropriate page handler
      const handler = this.pageHandlers.find(h => h.check());
      if (handler) {
        await handler.handle();
      }
    } catch (error) {
      this.handleError('Initialization failed', error);
    }
  }

  /**
   * Check if current page is the index page
   */
  private isIndexPage(): boolean {
    const path = window.location.pathname;
    return path.endsWith("index.html") || path.endsWith("/");
  }

  /**
   * Check if current page is the detail page
   */
  private isDetailPage(): boolean {
    return window.location.pathname.endsWith("productDetail.html");
  }

  /**
   * Navigate to a specific page
   */
  private navigate(page: string): void {
    window.location.href = page;
  }

  /**
   * Handle errors consistently
   */
  private handleError(message: string, error: unknown): void {
    console.error(message, error);
    alert(message);
    this.navigate("./index.html");
  }

  /**
   * Get stored product ID from localStorage
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
      const productId = this.getStoredProductId();

      if (!productId) {
        throw new Error("No product selected");
      }

      const product = await this.model.getProductById(productId);
      this.view.renderProductDetail(product);

    } catch (error) {
      this.handleError('Failed to load product details', error);
    }
  }
}
