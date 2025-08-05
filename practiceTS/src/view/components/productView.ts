import { Product, ProductStatus, ProductType, SaveProductDataRequest, ProductFilter } from "../../models/productModel.js";

interface ElementSelectors {
  [key: string]: string;
}

export class ProductView {
  private tbody: HTMLElement | null;
  private productIdToDelete: string | null = null;
  private filterTimeout: NodeJS.Timeout | null = null;
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
    addProductButton: "add-product-btn",
    modalOverlay: "modal-overlay",
    closeModalButton: "closeModal",
    cancelButton: "cancelBtn",
    confirmButton: "saveInfo",
    addProductForm: "addProductForm",
    editProductButton: "edit-product-btn",
    deleteProductButton: "delete-product-btn",
    confirmModal: "modal-overlay-confirm",
    // Filter selectors
    productSearch: "product-search",
    statusFilter: "status-filter",
    typeFilter: "type-filter",
    quantitySearch: "quantity-search",
    brandSearch: "brand-search",
    priceSearch: "price-search",
    clearFiltersButton: "clear-filters-btn"
  };

  constructor() {
    this.tbody = document.querySelector(this.selectors.productDisplay);
    this.initializeAddProductButton();
    this.initializeModalCloseHandlers();
    this.initializeDeleteModalHandlers();
    // this.initializeFilterHandlers();
  }

  /**
   * Initialize the Add Product button click handler
   */
  private initializeAddProductButton(): void {
    const addButton = document.getElementById(this.selectors.addProductButton);
    if (addButton) {
      addButton.addEventListener('click', () => {
        const addModelTitle = document.querySelector(".modal-title") as HTMLElement;
        addModelTitle.textContent = "Add new product";
        this.clearModalFields(); // Clear form for new product
        this.showProductModal();
      });
    }
  }

  /**
   * Initialize modal close button handlers
   */
  private initializeModalCloseHandlers(): void {
    // Close button handler
    const closeButton = document.getElementById(this.selectors.closeModalButton);
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hideProductModal());
    }

    // Cancel button handler
    const cancelButton = document.getElementById(this.selectors.cancelButton);
    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.hideProductModal());
    }
  }

  public initializeDeleteModalHandlers(): void {
    const confirmModal = document.querySelector('.modal-overlay-confirm') as HTMLElement;
    if (!confirmModal) return;

    // Close button
    const closeBtn = confirmModal.querySelector('.close-modal-confirm') as HTMLElement;
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
      });
    }

    // Cancel button
    const cancelBtn = confirmModal.querySelector('.cancel-modal-confirm') as HTMLElement;
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
      });
    }

    // Delete button
    const deleteBtn = document.querySelector('.delete-product') as HTMLElement;
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (this.productIdToDelete !== null) {
          await this.onDeleteProductHandler?.(this.productIdToDelete);
          this.productIdToDelete = null;
          const confirmModal = document.querySelector('.modal-overlay-confirm') as HTMLElement;
          if (confirmModal) {
            confirmModal.classList.remove('active');
          }
        }
      });
    }
  }

  /**
   * Attach update product for submit handler
   */
  public attachUpdateProductHandler(handler: () => Promise<void>): void {
    const confirmButton = document.getElementById(this.selectors.confirmButton);
    if (confirmButton) {
      const form = document.getElementById(this.selectors.addProductForm) as HTMLFormElement;

      form.addEventListener("submit", (e) => {
        e.preventDefault();
      });
      confirmButton.onclick = handler;
    }
  }

  /**
   * Show the Add Product modal overlay
   */
  private showProductModal(): void {
    const modalOverlay = document.querySelector(`.${this.selectors.modalOverlay}`) as HTMLElement;
    if (modalOverlay) {
      modalOverlay.classList.add('active');

      // Check if this is for adding a new product (not editing)
      const modalTitle = document.querySelector(".modal-title") as HTMLElement;
      if (modalTitle && modalTitle.textContent === "Add new product") {
        // Clear form fields for new product
        this.clearModalFields();
      }

      this.initializeImageUpload();
    }
  }

  /**
   * Hide the Product modal overlay
   */
  public hideProductModal(): void {
    const modalOverlay = document.querySelector(`.${this.selectors.modalOverlay}`) as HTMLElement;
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  }

  /**
   * Render the products list and add event listeners
   */
  renderProducts(products: Product[]): void {
    if (!this.tbody) return;
    this.tbody.innerHTML = products.map((p) => this.renderRow(p)).join("");
    this.attachRowClickHandlers();
    this.updateResultsCount(products.length);
  }

  /**
   * Handle click product row
   */
  private attachRowClickHandlers(): void {
    if (!this.tbody) return;
    this.tbody.querySelectorAll("tr").forEach(row => {
      row.addEventListener("click", () => this.handleRowClick(row));
    });

    this.tbody.querySelectorAll(".action-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleActionButtonClick(btn as HTMLButtonElement);
      });
    });

    this.tbody.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = (e.currentTarget as HTMLElement).dataset.action;
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (action && id) {
          this.handleActionMenuItem(action, id);
        }
      });
    });
  }

  private handleActionButtonClick(btn: HTMLButtonElement): void {
    const menu = btn.nextElementSibling as HTMLElement;
    menu?.classList.toggle("show");
  }

  private handleActionMenuItem(action: string, productId: string): void {
    if (action === "edit") {
      this.onEditProductHandler?.(productId);
    } else if (action === "delete") {
      this.productIdToDelete = productId; // Store for confirmation
      const confirmModal = document.querySelector('.modal-overlay-confirm') as HTMLElement;
      if (confirmModal) {
        confirmModal.classList.add('active');
      }
    }
  }

  /**
   * Populate modal with product data for editing
   */
  public populateEditModal(product: Product): void {
    const addModelTitle = document.querySelector(".modal-title") as HTMLElement;
    addModelTitle.textContent = "Products Information";

    // Update form fields with product data
    this.updateModalFields(product);

    // Show the modal
    this.showProductModal();
  }

  /**
   * Update modal form fields with product data
   */
  private updateModalFields(product: Product): void {
    const setElementValue = (id: string, value: string, setter: (el: HTMLElement, value: string) => void): void => {
      const element = document.getElementById(id);
      if (element) {
        setter(element, value);
      }
    };

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
   * Clear modal form fields
   */
  public clearModalFields(): void {
    const inputIds = [
      this.selectors.productName,
      this.selectors.productQuantity,
      this.selectors.productPrice,
      this.selectors.brandName
    ];
    inputIds.forEach(id => {
      const element = document.getElementById(id) as HTMLInputElement;
      if (element) {
        element.value = '';
      }
    });

    // Reset select elements to first option
    const selectIds = [
      this.selectors.productStatus,
      this.selectors.productType
    ];
    selectIds.forEach(id => {
      const element = document.getElementById(id) as HTMLSelectElement;
      if (element) {
        element.selectedIndex = 0;
      }
    });

    // Reset images to default
    const defaultImage = 'https://i.ibb.co/LXgvW3hj/image-display.png';
    const imageIds = [
      this.selectors.brandImagePreview,
      this.selectors.productImageLarge
    ];
    imageIds.forEach(id => {
      const element = document.getElementById(id) as HTMLImageElement;
      if (element) {
        element.src = defaultImage;
      }
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
            <button class="dropdown-item" id="edit-product-btn" data-action="edit" data-id="${product.id}">Edit</button>
            <button class="dropdown-item delete" id="delete-product-btn" data-action="delete" data-id="${product.id}">Delete</button>
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
    try {
      this.updateProductDetailFields(product);
      this.attachBackButtonHandler();
    } catch (error) {
      this.onErrorHandler?.("Error rendering product details:", error);
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
  public getProductFormData(): SaveProductDataRequest {
    this.clearValidationErrors();

    const name = this.getValueAndValidate(this.selectors.productName, "Please enter product name!");
    const brand = this.getValueAndValidate(this.selectors.brandName, "Please enter brand name!");

    const quantity = this.getNumberAndValidate(this.selectors.productQuantity,"Quantity must be a number greater than 0!");

    if (!Number.isInteger(quantity)) {
      this.showValidationError(this.selectors.productQuantity,"Quantity must be an integer");
      throw new Error("VALIDATION:Quantity must be an integer");
    }

    const price = this.getNumberAndValidate(this.selectors.productPrice,"Price must be a number greater than 0!");

    const status = this.getValue(this.selectors.productStatus) as ProductStatus;
    const type = this.getValue(this.selectors.productType) as ProductType;

    const productImage = this.getImageAndValidate(this.selectors.productImageLarge,"Please upload a product image!");

    const brandImage = this.getImageAndValidate(this.selectors.brandImagePreview,"Please upload a brand image!");

    return {
      name : name,
      brand : brand,
      quantity : quantity,
      price : price,
      status : status,
      type : type,
      productImage : productImage,
      brandImage : brandImage,
    };
  }

  private getValue(id: string): string {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    return el ? el.value.trim() : "";
  }

  private getValueAndValidate(id: string, errorMsg: string): string {
    const value = this.getValue(id);
    if (!value) {
      this.showValidationError(id, errorMsg);
      throw new Error("VALIDATION:" + errorMsg);
    }
    return value;
  }

  private getNumberAndValidate(id: string, errorMsg: string): number {
    const value = Number(this.getValue(id));
    if (isNaN(value) || value <= 0) {
      this.showValidationError(id, errorMsg);
      throw new Error("VALIDATION:" + errorMsg);
    }
    return value;
  }

  private getImageAndValidate(id: string, errorMsg: string): string {
    const el = document.getElementById(id);
    let value = "";

    if (el instanceof HTMLInputElement && el.type === "file" && el.files?.[0]) {
      value = URL.createObjectURL(el.files[0]);
    } else if (el instanceof HTMLImageElement) {
      value = el.getAttribute("src") || "";
    }

    if (!value || value.includes("image-display.png")) {
      this.onErrorHandler?.("Pls input Product or Brand Image", "");
      throw new Error("VALIDATION:" + errorMsg);
    }
    return value;
  }

  private showValidationError(id: string, message: string): void {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.add("input-error");

    if (!el.nextElementSibling || !el.nextElementSibling.classList.contains("error-message")) {
      const errorEl = document.createElement("div");
      errorEl.className = "error-message";
      errorEl.innerText = message;
      el.insertAdjacentElement("afterend", errorEl);
    }
  }

  private clearValidationErrors(): void {
    document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
    document.querySelectorAll(".error-message").forEach((el) => el.remove());
  }

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

  /**
   * Update the results count display
   */
  private updateResultsCount(count: number): void {
    let resultsCountElement = document.getElementById('results-count');
    // Define products count after filtered
    if (!resultsCountElement) {
      resultsCountElement = document.createElement('div');
      resultsCountElement.id = 'results-count';
      resultsCountElement.className = 'results-count';
      resultsCountElement.style.cssText = `
        text-align: center;
        padding: 10px;
        color: var(--clr-text-dark);
        font-size: var(--fs-md);
        margin-top: 10px;
      `;

      // Insert below the table
      const tableContainer = document.querySelector('.product-table-container');
      if (tableContainer) {
        tableContainer.appendChild(resultsCountElement);
      }
    }

    resultsCountElement.textContent = `Showing ${count} product${count !== 1 ? 's' : ''}`;
  }



  public showSuccessMessage(message: string): void {
    alert(message);
  }

  private onHandleProductFilter?:(filters: ProductFilter) => void;
  public onProductFilter(cb: (filters: ProductFilter) => void): void {
    this.onHandleProductFilter = cb;
  }

  private onDeleteProductHandler?: (id: string) => void;
  private onEditProductHandler?: (id: string) => void;
  private onErrorHandler?: (message: string, error: unknown) => void;

  public onDeleteProduct(cb: (id: string) => void): void {
    this.onDeleteProductHandler = cb;
  }

  public onEditProduct(cb: (id: string) => void): void {
    this.onEditProductHandler = cb;
  }

  public onError(cb: (message: string, error: unknown) => void): void {
    this.onErrorHandler = cb;
  }
}
