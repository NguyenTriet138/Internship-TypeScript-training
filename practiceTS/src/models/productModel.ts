// src/model/product-model.ts
const API_BASE_URL = 'http://localhost:3000';

/** Define Product */
export class Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  status: "Available" | "Sold out";
  type: string;
  brand: string;
  productImage: string;
  brandImage: string;

  constructor(
    id: number,
    name: string,
    quantity: number,
    price: number,
    status: "Available" | "Sold out",
    type: string,
    brand: string,
    productImage: string,
    brandImage: string
  ) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.price = price;
    this.status = status;
    this.type = type;
    this.brand = brand;
    this.productImage = productImage;
    this.brandImage = brandImage;
  }

  /** Return price with config */
  getFormattedPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }

  /** Check product status */
  isAvailable(): boolean {
    return this.status === "Available";
  }
}

/** Model manage Product (API, CRUD) */
export class ProductModel {
  private apiUrl = API_BASE_URL + "/products";

  /** Get Product list */
  async getAllProducts(): Promise<Product[]> {
    const res = await fetch(this.apiUrl);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.map(
      (p: Product) =>
        new Product(
          p.id,
          p.name,
          p.quantity,
          p.price,
          p.status,
          p.type,
          p.brand,
          p.productImage,
          p.brandImage
        )
    );
  }
}
