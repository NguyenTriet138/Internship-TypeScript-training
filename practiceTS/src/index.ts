import { ProductModel } from "./models/productModel.js";
import { UploadImgService } from "./services/imageService.js";
import { ProductView } from "./view/components/productView.js";
import { ProductController } from "./controller/productController.js";

document.addEventListener("DOMContentLoaded", async () => {
  const model = new ProductModel();
  const view = new ProductView();
  const uploadService = new UploadImgService();

  const controller = new ProductController(model, view, uploadService);

  await controller.init();
});
