interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  status: "Available" | "Sold out";
  type: string;
  brand: string;
  productImage: string;
  brandImage: string;
}

// Fetch products từ json-server
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:3000/products");
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}

// Render product in HTML
function renderProductRow(product: Product): string {
  return `
    <tr data-product-id="${product.id}">
      <td>
        <div class="product-info">
          <img src="${product.productImage}" alt="${product.name} Image" class="product-image" />
          <span class="text text-info">${product.name}</span>
        </div>
      </td>
      <td>
        <span class="status-badge ${product.status === "Available" ? "status-available" : "status-sold-out"}">
          ${product.status}
        </span>
      </td>
      <td>
        <span class="text text-info">${product.type}</span>
      </td>
      <td>
        <span class="product-quantity">${product.quantity}</span>
      </td>
      <td>
        <div class="brand-info">
          <img src="${product.brandImage}" alt="${product.brand} Image" class="brand-avatar" />
          <span class="text text-info">${product.brand}</span>
        </div>
      </td>
      <td>
        <span class="text text-info">$${product.price.toFixed(2)}</span>
      </td>
      <td>
        <div class="action-menu">
          <button class="action-btn" aria-label="Product actions" onclick="event.stopPropagation()">⋯</button>
          <nav class="dropdown-menu">
            <button class="dropdown-item">Edit</button>
            <button class="dropdown-item delete">Delete</button>
          </nav>
        </div>
      </td>
    </tr>
  `;
}

// Render products into <tbody>
async function displayProducts() {
  try {
    const products = await fetchProducts();
    const tbody = document.querySelector(".product-display") as HTMLElement;
    tbody.innerHTML = products.map(renderProductRow).join("");
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

document.addEventListener("DOMContentLoaded", displayProducts);
