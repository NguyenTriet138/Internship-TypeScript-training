// src/model/product-model.ts
import { ApiService, API_CONFIG } from '../utils/apiService.js';

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
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      const data = await this.apiService.get<ProductData>(API_CONFIG.endpoints.products, id);
      return Product.fromJSON(data);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
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
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Upload image to ImgBB and get display URL
   */
  async uploadImageToImgBB(imageData: string, apiKey: string): Promise<string> {
    try {
      console.log('Uploading image to ImgBB...');

      const response = await this.apiService.uploadToImgBB(imageData, apiKey);

      console.log('Image uploaded successfully, display URL:', response.data.display_url);
      return response.data.display_url;
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
      throw new Error('Failed to upload image');
    }
  }
}
