import { ProductModel, ProductData, SaveProductDataRequest, ProductFilter, Product } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";
import { ENV } from "../config/env";
import { logger } from "../config/logger.js";

interface PageHandler {
  check: () => boolean;
  handle: () => Promise<void>;
}

export class ProductController {
  private readonly pageHandlers: PageHandler[];
  private currentProducts: Product[] = [];

  constructor(
    private readonly model: ProductModel,
    private readonly view: ProductView
  ) {
    /** pageHandlers is using for check url path and load page. */
    this.pageHandlers = [
      {
        check: () => this.isIndexPage(),
        handle: async () => {
          this.view.initializeAddProductButton(async () => {await this.handleCreateProduct()});
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

          this.view.onError((msg, error) => {
            this.handleError(msg, error);
          });
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
    logger.error(message, error);
    this.navigate("./home");
  }

  /**
   * Handle creating a new product
   */
  private async handleCreateProduct(): Promise<void> {
    try {
      let productData = this.view.getProductFormData();

      productData = await this.uploadProductImages(productData);

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
        await this.bindGetProduct(product.id);
      });
      this.view.initializeImageUpload();
    } catch (error) {
      this.handleError('Failed to load product details', error);
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
        await this.bindGetProduct(productId);
        this.view.hideProductModal();
      });

    } catch (error) {
      this.handleError('Failed to load product for editing', error);
    }
  }

  private async bindGetProduct(productId: string): Promise<void> {
    try {
      let updatedData = this.view.getProductFormData();

      updatedData = await this.uploadProductImages(updatedData);

      await this.model.updateProduct(productId, updatedData);

      // Refresh the product list
      await this.loadProducts();

      this.view.showSuccessMessage('Product updated successfully!');
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("VALIDATION:")) {
        return;
      }
      this.handleError('Failed to update product', error);
    }
  }

  private async uploadProductImages(productData: SaveProductDataRequest): Promise<SaveProductDataRequest> {
    let brandImageUpload = productData.brandImage;
    let productImageUpload = productData.productImage;

    if (!productData.brandImage.startsWith("https://")) {
      brandImageUpload = await this.model.uploadImageToImgBB(productData.brandImage, ENV.IMGBB_API_KEY);
    };

    if (!productData.productImage.startsWith("https://")) {
      productImageUpload = await this.model.uploadImageToImgBB(productData.productImage, ENV.IMGBB_API_KEY);
    };

    return {
      ...productData,
      productImage: productImageUpload,
      brandImage: brandImageUpload,
    };
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
