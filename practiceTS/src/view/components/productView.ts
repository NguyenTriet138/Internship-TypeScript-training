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
    goBackButton: "goBack",
    uploadBranchImg: "uploadBranchImg",
    uploadProductImg: "uploadProductImg",
  };

  constructor() {
    this.tbody = document.querySelector(this.selectors.productDisplay);
  }

  /**
   * Render the products list and add event listeners
   */
  renderProducts(products: Product[]): void {
    if (!this.tbody) return;
    this.tbody.innerHTML = products.map((p) => this.renderRow(p)).join("");
    this.attachRowClickHandlers();
  }

  /**
   * Handle click product row
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
    // localStorage.setItem("selectedProductId", productId);
    window.location.href = `./productDetail?id=${productId}`;
  }

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

  private renderTypeCell(product: Product): string {
    return `<td><span class="text text-info">${product.type}</span></td>`;
  }

  private renderQuantityCell(product: Product): string {
    return `<td><span class="product-quantity">${product.quantity}</span></td>`;
  }

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

  private renderPriceCell(product: Product): string {
    return `<td><span class="text text-info">$${product.price.toFixed(2)}</span></td>`;
  }

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
   * Navigate to home page when click Back button
   */
  private attachBackButtonHandler(): void {
    const backButton = this.getElement(this.selectors.goBackButton, HTMLButtonElement);
    backButton?.addEventListener("click", () => {
      window.location.href = "./home";
    });
  }

  /**
   * Attach save button click event
   */
  public attachSaveButtonHandler(cb: () => Promise<void>): void {
    const saveBtn = document.getElementById('saveInfo');
    if (saveBtn) {
      saveBtn.onclick = cb;
    }
  }

  /**
   * Get updated product data from form fields
   */
  public getProductFormData(): Partial<import("../../models/productModel").ProductData> {
    const getValue = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement)?.value;
    // For image input, get file or value
    const getImageValue = (id: string, fallback: string = ""): string => {
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (input && input.type === "file" && input.files && input.files[0]) {
        // For simplicity, use a URL.createObjectURL or you may want to upload and get a URL/base64
        return URL.createObjectURL(input.files[0]);
      }
      // In case img tag having src attribute
      if (input instanceof HTMLImageElement) {
        return input.getAttribute('src') || fallback;
      }
      return input?.value || fallback;
    };
    return {
      name: getValue(this.selectors.productName) || '',
      quantity: Number(getValue(this.selectors.productQuantity)),
      price: Number(getValue(this.selectors.productPrice)),
      status: getValue(this.selectors.productStatus) as ProductStatus,
      type: getValue(this.selectors.productType) as import("../../models/productModel").ProductType,
      brand: getValue(this.selectors.brandName) || '',
      productImage: getImageValue(this.selectors.productImageLarge),
      brandImage: getImageValue(this.selectors.brandImagePreview),
    };
  }

  //======================================================
  /**
   * Initialize image upload functionality
   */
  initializeImageUpload(): void {
    this.attachImageUploadHandlers();
  }

  /**
   * Attach event handlers for image upload
   */
  private attachImageUploadHandlers(): void {
    // Brand image upload
    const brandUploadBtn = document.getElementById(this.selectors.uploadBranchImg) as HTMLButtonElement;
    if (brandUploadBtn) {
      brandUploadBtn.addEventListener('click', () => this.handleImageUpload('brand'));
    }

    // Product image upload area
    const uploadArea = document.getElementById(this.selectors.uploadProductImg) as HTMLElement;
    if (uploadArea) {
      uploadArea.addEventListener('click', () => this.handleImageUpload('product'));
      uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
      uploadArea.addEventListener('drop', this.handleDrop.bind(this));
    }
  }

  /**
   * Handle image upload for both brand and product images
   */
  private handleImageUpload(type: 'brand' | 'product'): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.processImageFile(file, type);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  /**
   * Handle drag over event for drag and drop
   */
  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  /**
   * Handle drop event for drag and drop
   */
  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.processImageFile(file, 'product');
      }
    }
  }

  /**
   * Process the selected image file
   */
  private processImageFile(file: File, type: 'brand' | 'product'): void {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      this.updateImagePreview(imageUrl, type);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Update image preview
   */
  private updateImagePreview(imageUrl: string, type: 'brand' | 'product'): void {
    if (type === 'brand') {
      const brandImagePreview = document.getElementById(this.selectors.brandImagePreview) as HTMLImageElement;
      if (brandImagePreview) {
        brandImagePreview.src = imageUrl;
      }
    } else if (type === 'product') {
      const productImageLarge = document.getElementById(this.selectors.productImageLarge) as HTMLImageElement;
      if (productImageLarge) {
        productImageLarge.src = imageUrl;
      }
    }
  }

  /**
   * Get the current image data as base64 string
   */
  getImageData(type: 'brand' | 'product'): string | null {
    if (type === 'brand') {
      const brandImagePreview = document.getElementById(this.selectors.brandImagePreview) as HTMLImageElement;
      return brandImagePreview?.src || null;
    } else if (type === 'product') {
      const productImageLarge = document.getElementById(this.selectors.productImageLarge) as HTMLImageElement;
      return productImageLarge?.src || null;
    }
    return null;
  }
}
