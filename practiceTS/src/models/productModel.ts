// src/model/product-model.ts
const API_BASE_URL = 'http://localhost:3000';

export enum ProductStatus {
  Available = "Available",
  SoldOut = "Sold out",
}

/** Define Product */
export class Product {
  constructor(
    public id: number,
    public name: string,
    public quantity: number,
    public price: number,
    public status: ProductStatus,
    public type: string,
    public brand: string,
    public productImage: string,
    public brandImage: string
  ) {}

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
          p.status === "Available" ? ProductStatus.Available : ProductStatus.SoldOut,
          p.type,
          p.brand,
          p.productImage,
          p.brandImage
        )
    );
  }
}
