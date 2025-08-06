import { ApiService } from '../services/apiService.js';
import { API_CONFIG } from '../config/env.js'

export enum ProductStatus {
  Available = "Available",
  SoldOut = "Sold out",
}

export enum ProductType {
  Bravo = "Bravo",
  Alfa = "Alfa",
  Gold = "Gold"
}

export interface ProductData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: ProductStatus;
  type: ProductType;
  brand: string;
  productImage: string;
  brandImage: string;
}

export interface SaveProductDataRequest {
  name: string;
  quantity: number;
  price: number;
  status: ProductStatus;
  type: ProductType;
  brand: string;
  productImage: string;
  brandImage: string;
}

export interface ProductFilter {
  name?: string;
  status?: ProductStatus | 'All';
  type?: ProductType | 'All';
  brand?: string;
}

export class Product {
  constructor(
    public id: string,
    public name: string,
    public quantity: number,
    public price: number,
    public status: ProductStatus,
    public type: ProductType | string,
    public brand: string,
    public productImage: string,
    public brandImage: string
  ) {}

  isAvailable(): boolean {
    return this.status === ProductStatus.Available;
  }

  isInStock(): boolean {
    return this.quantity > 0;
  }

  /** Format price */
  formatPrice(currency: string = '$'): string {
    return `${currency}${this.price.toFixed(2)}`;
  }

  /** Convert raw data to Product instance */
  static fromJSON(data: ProductData): Product {
    return new Product(
      data.id,
      data.name,
      data.quantity,
      data.price,
      data.status === "Available" ? ProductStatus.Available : ProductStatus.SoldOut,
      data.type,
      data.brand,
      data.productImage,
      data.brandImage
    );
  }
}

export class ProductModel {
  private readonly apiService: ApiService;

  constructor() {
    this.apiService = new ApiService(API_CONFIG);
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const data = await this.apiService.get<ProductData[]>(API_CONFIG.endpoints.products);
      return data.map(Product.fromJSON);
    } catch {
      throw new Error('Failed to fetch products');
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const data = await this.apiService.get<ProductData>(API_CONFIG.endpoints.products, id);
      return Product.fromJSON(data);
    } catch {
      throw new Error('Product not found');
    }
  }

  /**
   * Update product info into db.json
   */
  async updateProduct(id: string, updatedData: Partial<ProductData>): Promise<Product> {
    try {
      // Fetch current product data
      const current = await this.apiService.get<ProductData>(API_CONFIG.endpoints.products, id);
      // Merge with updated fields
      const merged: ProductData = { ...current, ...updatedData };
      const data = await this.apiService.put<ProductData>(`${API_CONFIG.endpoints.products}/${id}`, merged);
      return Product.fromJSON(data);
    } catch {
      throw new Error('Failed to update product');
    }
  }

  /**
   * Upload image to ImgBB and get display URL
   */
  async uploadImageToImgBB(imageData: string, apiKey: string): Promise<string> {
    try {
      const response = await this.apiService.uploadToImgBB(imageData, apiKey);
      return response.data.display_url;
    } catch {
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Create a new product and get the next available ID
   */
  async createProduct(productData: Omit<ProductData, 'id'>): Promise<Product> {
    try {
      const data = await this.apiService.post<ProductData, Omit<ProductData, 'id'>>(
        API_CONFIG.endpoints.products,
        productData
      );
      return Product.fromJSON(data);
    } catch {
      throw new Error('Failed to create product');
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await this.apiService.delete(`${API_CONFIG.endpoints.products}/${id}`);
    } catch {
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Filter products based on multiple criteria
   */
  async getFilteredProducts(filters: ProductFilter): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return this.applyFilters(allProducts, filters);
    } catch {
      throw new Error('Failed to fetch filtered products');
    }
  }

  /**
   * Apply filters to a list of products
   */
  private applyFilters(products: Product[], filters: ProductFilter): Product[] {
    return products.filter(product => {
      // Filter by name (case-insensitive partial match)
      if (filters.name && filters.name.trim() !== '') {
        const productName = product.name.toLowerCase();
        const filterName = filters.name.toLowerCase();
        if (!productName.includes(filterName)) {
          return false;
        }
      }

      // Filter by status
      if (filters.status && filters.status !== 'All') {
        if (product.status !== filters.status) {
          return false;
        }
      }

      // Filter by type
      if (filters.type && filters.type !== 'All') {
        if (product.type !== filters.type) {
          return false;
        }
      }

      // Filter by brand (case-insensitive partial match)
      if (filters.brand && filters.brand.trim() !== '') {
        const productBrand = product.brand.toLowerCase();
        const filterBrand = filters.brand.toLowerCase();
        if (!productBrand.includes(filterBrand)) {
          return false;
        }
      }

      return true;
    });
  }
}
