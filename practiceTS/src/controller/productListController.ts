import { ProductModel, ProductData, ProductFilter, Product, SaveProductDataRequest } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";
import { ImgService } from "../services/imageService.js";
import { bindGetProduct, handleError } from "./baseController.js";

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
      });

      this.view.bindFormSubmit(this.handleFormSubmit);
      await this.loadProducts();

      this.view.onProductFilter((filters: ProductFilter) => {
        this.handleProductFilter(filters);
      });

      this.view.onDeleteProduct(async (id: string) => {
        await this.handleDeleteProduct(id);
      });

      this.view.onEditProduct(async (id: string) => {
        this.prepareEditMode(id)
      });

      this.view.onError((msg: string, error: unknown) => {
        handleError(msg, error);
      });
    } catch (error) {
      handleError('Initialization failed', error);
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

  public async handleEditProduct(data: SaveProductDataRequest, productId: string): Promise<void> {
    try {
      await bindGetProduct({
        productId,
        model: this.model,
        view: this.view,
        imgService: this.imgService,
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

  private prepareEditMode = async (productId: string): Promise<void> => {
    try {
      const product = await this.model.getProductById(productId);
      this.view.populateEditModal(product);
      this.view.setEditMode(productId);
    } catch (error) {
      handleError('Failed to load product for editing', error);
    }
  };

  private async handleAddProduct(data: SaveProductDataRequest): Promise<void> {
    await this.model.createProduct(data as Omit<ProductData, 'id'>);
    alert('Product created successfully!');
  }

  private handleFormSubmit = async (
    data: SaveProductDataRequest,
    mode: 'add' | 'edit',
    editingId: string | null
  ): Promise<void> => {
    try {

      if (mode === 'add') {
        const [productImage, brandImage] = await this.imgService.uploadImages([data.productImage, data.brandImage]);
        data.productImage = productImage;
        data.brandImage = brandImage;
        await this.handleAddProduct(data);
      } else if (mode === 'edit' && editingId) {
        await this.handleEditProduct(data, editingId);
      }

      await this.loadProducts();
      this.view.hideProductModal();
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("VALIDATION:")) return;
      handleError("Failed to save product", error);
    }
  };
}
