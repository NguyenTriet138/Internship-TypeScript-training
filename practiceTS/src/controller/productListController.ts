import { ProductModel, ProductData, ProductFilter, Product, SaveProductDataRequest } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";
import { ImgService } from "../services/imageService.js";
import { bindGetProduct } from "../services/bindGetProduct.js";
import { handleError } from "../services/errorHandler.js";

export class ProductListController {
  private currentProducts: Product[] = [];

  constructor(
    private readonly model: ProductModel,
    private readonly view: ProductView,
    private readonly imgService: ImgService
  ) {}

  /**
   * Initialize the controller for product list page
   */
  async init(): Promise<void> {
    try {
      this.view.initializeAddProductButton(async () => {
        this.view.setAddMode();
        this.view.bindFormSubmit(async (data, mode) => {
          if (mode === 'add') {
            await this.handleCreateProduct(data);
          }
        });
      });
      await this.loadProducts();

      this.view.onProductFilter((filters: ProductFilter) => {
        this.handleProductFilter(filters);
      });

      this.view.onDeleteProduct(async (id: string) => {
        await this.handleDeleteProduct(id);
      });

      this.view.onEditProduct(async (id: string) => {
        await this.handleEditProduct(id);
      });

      this.view.onError((msg: string, error: unknown) => {
        handleError(msg, error);
      });
    } catch (error) {
      handleError('Initialization failed', error);
    }
  }

  /**
   * Handle creating a new product
   */
  private async handleCreateProduct(productData: SaveProductDataRequest): Promise<void> {
    try {
      const [productImage, brandImage] = await this.imgService.uploadImages([productData.productImage, productData.brandImage]);

      productData.productImage = productImage;
      productData.brandImage = brandImage;

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

      handleError("Failed to create product", error);
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
      handleError('Failed to load products', error);
    }
  }

  public async handleEditProduct(productId: string): Promise<void> {
    try {
      const product = await this.model.getProductById(productId);
    this.view.populateEditModal(product);
    this.view.setEditMode(productId);

    this.view.bindFormSubmit(async (data, mode, editingId) => {
      if (mode === 'edit' && editingId === productId) {
        await bindGetProduct({
          productId,
          model: this.model,
          view: this.view,
          imgService: this.imgService,
        });
        await this.loadProducts();
        this.view.hideProductModal();
      }
    });

    } catch (error) {
      handleError('Failed to load product for editing', error);
    }
  }

  public async handleDeleteProduct(productId: string): Promise<void> {
    try {
      await this.model.deleteProduct(productId);
      await this.loadProducts();
    } catch (error) {
      handleError('Failed to delete product', error);
    }
  }

  public async handleProductFilter(filters: ProductFilter): Promise<void> {
    try {
      const filteredProducts = await this.model.getFilteredProducts(filters);
      this.currentProducts = filteredProducts;
      this.view.renderProducts(filteredProducts);
    } catch (error) {
      handleError('Failed to filter products', error);
    }
  }
}
