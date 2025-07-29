// src/view/product-view.ts
import { Product, ProductStatus } from "../../models/productModel.js";

interface ElementSelectors {
  [key: string]: string;
}

export class ProductView {
  private tbody: HTMLElement | null;
  private readonly selectors: ElementSelectors = {
    productDisplay: ".product-display",
    productTitle: "productTitle",
    productName: "productName",
    productQuantity: "productQuantity",
    productPrice: "productPrice",
    productStatus: "productStatus",
    productType: "productType",
    brandName: "brandName",
    brandImagePreview: "brandImagePreview",
    productImageLarge: "productImageLarge",
    goBackButton: "goBack"
  };

  constructor() {
    this.tbody = document.querySelector(this.selectors.productDisplay);
  }

  /**
   * Render the products list and attach event listeners
   */
  renderProducts(products: Product[]): void {
    if (!this.tbody) return;
    this.tbody.innerHTML = products.map((p) => this.renderRow(p)).join("");
    this.attachRowClickHandlers();
  }

  /**
   * Attach click handlers to each product row
   */
  private attachRowClickHandlers(): void {
    if (!this.tbody) return;
    this.tbody.querySelectorAll("tr").forEach(row => {
      row.addEventListener("click", () => this.handleRowClick(row));
    });
  }

  /**
   * Handle click event on a product row
   */
  private handleRowClick(row: HTMLElement): void {
    const id = row.getAttribute("data-product-id");
    if (id) {
      this.navigateToProductDetail(id);
    }
  }

  /**
   * Navigate to product detail page
   */
  private navigateToProductDetail(productId: string): void {
    localStorage.setItem("selectedProductId", productId);
    window.location.href = "./productDetail.html";
  }

  /**
   * Render a single product row
   */
  private renderRow(product: Product): string {
    return `
      <tr data-product-id="${product.id}">
        ${this.renderProductInfo(product)}
        ${this.renderStatusCell(product)}
        ${this.renderTypeCell(product)}
        ${this.renderQuantityCell(product)}
        ${this.renderBrandInfo(product)}
        ${this.renderPriceCell(product)}
        ${this.renderActionMenu(product)}
      </tr>
    `;
  }

  /**
   * Render product info cell
   */
  private renderProductInfo(product: Product): string {
    return `
      <td>
        <div class="product-info">
          <img src="${product.productImage}" alt="${product.name}" class="product-image" />
          <span class="text text-info">${product.name}</span>
        </div>
      </td>
    `;
  }

  /**
   * Render status cell
   */
  private renderStatusCell(product: Product): string {
    const statusClass = product.status === ProductStatus.Available ? "status-available" : "status-sold-out";
    return `
      <td>
        <span class="status-badge ${statusClass}">
          ${product.status}
        </span>
      </td>
    `;
  }

  /**
   * Render type cell
   */
  private renderTypeCell(product: Product): string {
    return `<td><span class="text text-info">${product.type}</span></td>`;
  }

  /**
   * Render quantity cell
   */
  private renderQuantityCell(product: Product): string {
    return `<td><span class="product-quantity">${product.quantity}</span></td>`;
  }

  /**
   * Render brand info cell
   */
  private renderBrandInfo(product: Product): string {
    return `
      <td>
        <div class="brand-info">
          <img src="${product.brandImage}" alt="${product.brand}" class="brand-avatar" />
          <span class="text text-info">${product.brand}</span>
        </div>
      </td>
    `;
  }

  /**
   * Render price cell
   */
  private renderPriceCell(product: Product): string {
    return `<td><span class="text text-info">$${product.price.toFixed(2)}</span></td>`;
  }

  /**
   * Render action menu cell
   */
  private renderActionMenu(product: Product): string {
    return `
      <td>
        <div class="action-menu">
          <button class="action-btn" data-action="menu" aria-label="Product actions">⋯</button>
          <nav class="dropdown-menu">
            <button class="dropdown-item" data-action="edit" data-id="${product.id}">Edit</button>
            <button class="dropdown-item delete" data-action="delete" data-id="${product.id}">Delete</button>
          </nav>
        </div>
      </td>
    `;
  }

  /**
   * Get element by ID with type assertion
   */
  private getElement<T extends HTMLElement>(id: string, elementType: new () => T): T | null {
    const element = document.getElementById(id);
    return element instanceof elementType ? element : null;
  }

  /**
   * Render product detail page
   */
  renderProductDetail(product: Product): void {
    console.log("Rendering product details:", product);
    try {
      this.updateProductDetailFields(product);
      this.attachBackButtonHandler();
      console.log("Product details rendered successfully");
    } catch (error) {
      console.error("Error rendering product details:", error);
    }
  }

  /**
   * Update all product detail fields
   */
  private updateProductDetailFields(product: Product): void {
    const setElementValue = (id: string, value: string, setter: (el: HTMLElement, value: string) => void): void => {
      const element = document.getElementById(id);
      if (element) {
        setter(element, value);
      }
    };

    // Update text content
    setElementValue(this.selectors.productTitle, product.name,
      (el, value) => { el.textContent = value; });

    // Update input values
    const inputIds = [
      { id: this.selectors.productName, value: product.name },
      { id: this.selectors.productQuantity, value: product.quantity.toString() },
      { id: this.selectors.productPrice, value: product.price.toString() },
      { id: this.selectors.brandName, value: product.brand }
    ];
    inputIds.forEach(({ id, value }) => {
      setElementValue(id, value, (el, val) => { (el as HTMLInputElement).value = val; });
    });

    // Update select values
    const selectIds = [
      { id: this.selectors.productStatus, value: product.status },
      { id: this.selectors.productType, value: product.type }
    ];
    selectIds.forEach(({ id, value }) => {
      setElementValue(id, value, (el, val) => { (el as HTMLSelectElement).value = val; });
    });

    // Update image sources
    const imageIds = [
      { id: this.selectors.brandImagePreview, value: product.brandImage },
      { id: this.selectors.productImageLarge, value: product.productImage }
    ];
    imageIds.forEach(({ id, value }) => {
      setElementValue(id, value, (el, val) => { (el as HTMLImageElement).src = val; });
    });
  }

  /**
   * Attach back button handler
   */
  private attachBackButtonHandler(): void {
    const backButton = this.getElement(this.selectors.goBackButton, HTMLButtonElement);
    backButton?.addEventListener("click", () => {
      window.location.href = "./index.html";
    });
  }
}
