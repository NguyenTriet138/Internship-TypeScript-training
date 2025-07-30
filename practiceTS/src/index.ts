import { ProductModel } from "./models/productModel.js";
import { ProductView } from "./view/components/productView.js";
import { ProductController } from "./controller/productController.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Check user are login or not
  const currentUser = localStorage.getItem("currentUser");
  const path = window.location.pathname;

  if ((path.endsWith("home.html") || path === "/") && !currentUser) {
    window.location.href = "/login.html";
    return;
  }

  const model = new ProductModel();
  const view = new ProductView();
  const controller = new ProductController(model, view);

  await controller.init();
});
