import { ProductModel } from "./models/productModel.js";
import { ProductView } from "./view/components/productView.js";
import { ProductController } from "./controller/productController.js";

document.addEventListener("DOMContentLoaded", async () => {
  const model = new ProductModel();
  const view = new ProductView();
  const controller = new ProductController(model, view);
  await controller.init();
});
