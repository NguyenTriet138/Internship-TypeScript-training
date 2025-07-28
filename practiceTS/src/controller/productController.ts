// src/controller/product-controller.ts
import { ProductModel } from "../models/productModel.js";
import { ProductView } from "../view/components/productView.js";

export class ProductController {
  private model: ProductModel;
  private view: ProductView;

  constructor(model: ProductModel, view: ProductView) {
    this.model = model;
    this.view = view;
  }

  /** Initialize products */
  async init(): Promise<void> {
    await this.loadProducts();
  }

  /** Load products list from model */
  private async loadProducts(): Promise<void> {
    const products = await this.model.getAllProducts();
    this.view.renderProducts(products);
  }
}
