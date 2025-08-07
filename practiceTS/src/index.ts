import { ProductModel } from "./models/productModel.js";
import { ImgService } from "./services/imageService.js";
import { ProductView } from "./view/components/productView.js";
import { ProductController } from "./controller/productController.js";

document.addEventListener("DOMContentLoaded", async () => {
  const model = new ProductModel();
  const view = new ProductView();
  const uploadService = new ImgService();

  const controller = new ProductController(model, view, uploadService);

  await controller.init();
});
