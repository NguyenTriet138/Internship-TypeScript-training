import { ApiService } from '../services/apiService.js';
import { API_CONFIG } from '../config/env.js'

export enum ProductStatus {
  Available = "Available",
  SoldOut = "Sold out",
}

export enum ProductType {
  Bravo = "Bravo",
  Alfa = "Alfa",
  Gold = "Gold",
  Premium = "Premium"
}

export interface ProductData {
  id: number;
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

export class Product {
  constructor(
    public id: number,
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

  async getProductById(id: number): Promise<Product> {
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
  async updateProduct(id: number, updatedData: Partial<ProductData>): Promise<Product> {
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
      // Get all products to determine the next ID
      const products = await this.getAllProducts();
      // const nextId = Math.max(...products.map(p => p.id), 0) + 1;

      const existingIds = new Set(products.map(p => p.id));

      // Generate unique 4-digit ID
      let newId: number;
      const maxAttempts = 10000;
      let attempts = 0;

      do {
        newId = Math.floor(Math.random() * 9000) + 1000; // 1000 - 9999
        attempts++;
        if (attempts > maxAttempts) {
          throw new Error('Failed to generate unique product ID after many attempts');
        }
      } while (existingIds.has(newId));

      // Create new product with the next available ID
      const newProductData: ProductData = {
        id: newId,
        ...productData
      };

      const data = await this.apiService.post<ProductData>(API_CONFIG.endpoints.products, newProductData);
      return Product.fromJSON(data);
    } catch {
      throw new Error('Failed to create product');
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      await this.apiService.delete(`${API_CONFIG.endpoints.products}/${id}`);
    } catch {
      throw new Error('Failed to delete product');
    }
  }
}
