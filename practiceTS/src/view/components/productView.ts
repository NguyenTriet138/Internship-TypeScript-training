// src/view/product-view.ts
import { Product, ProductStatus } from "../../models/productModel.js";

export class ProductView {
  private tbody: HTMLElement;

  constructor() {
    const tbodyElement = document.querySelector(".product-display");
    if (!tbodyElement) throw new Error("Product table body not found");
    this.tbody = tbodyElement as HTMLElement;
  }

  /** Render Products list */
  renderProducts(products: Product[]): void {
    this.tbody.innerHTML = products.map((p) => this.renderRow(p)).join("");
  }

  /** Render 1 Product */
  private renderRow(product: Product): string {
    return `
      <tr data-product-id="${product.id}">
        <td>
          <div class="product-info">
            <img src="${product.productImage}" alt="${product.name}" class="product-image" />
            <span class="text text-info">${product.name}</span>
          </div>
        </td>
        <td>
          <span class="status-badge ${product.status === ProductStatus.Available ? "status-available" : "status-sold-out"}">
            ${product.status}
          </span>
        </td>
        <td><span class="text text-info">${product.type}</span></td>
        <td><span class="product-quantity">${product.quantity}</span></td>
        <td>
          <div class="brand-info">
            <img src="${product.brandImage}" alt="${product.brand}" class="brand-avatar" />
            <span class="text text-info">${product.brand}</span>
          </div>
        </td>
        <td><span class="text text-info">$${product.price.toFixed(2)}</span></td>
        <td>
          <div class="action-menu">
            <button class="action-btn" data-action="menu" aria-label="Product actions">⋯</button>
            <nav class="dropdown-menu">
              <button class="dropdown-item" data-action="edit" data-id="${product.id}">Edit</button>
              <button class="dropdown-item delete" data-action="delete" data-id="${product.id}">Delete</button>
            </nav>
          </div>
        </td>
      </tr>
    `;
  }
}
