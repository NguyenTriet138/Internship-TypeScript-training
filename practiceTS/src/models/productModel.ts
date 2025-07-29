// src/model/product-model.ts

// Configuration
const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    products: '/products'
  }
} as const;

// Types and Interfaces
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

interface ProductData {
  id: number;
  name: string;
  quantity: number;
  price: number;
  status: string;
  type: string;
  brand: string;
  productImage: string;
  brandImage: string;
}

/**
 * Product entity representing a product in the system
 */
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

  /** Check if product is available */
  isAvailable(): boolean {
    return this.status === ProductStatus.Available;
  }

  /** Check if product is in stock */
  isInStock(): boolean {
    return this.quantity > 0;
  }

  /** Format price with currency */
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

/**
 * ProductModel handles all product-related data operations
 */
export class ProductModel {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.products;
  }

  /**
   * Fetch data from the API
   */
  private async fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.apiUrl + endpoint, options);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all products from the API
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const data = await this.fetchFromApi<ProductData[]>('');
      return data.map(Product.fromJSON);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<Product> {
    try {
      const data = await this.fetchFromApi<ProductData>(`/${id}`);
      return Product.fromJSON(data);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error('Product not found');
    }
  }
}
