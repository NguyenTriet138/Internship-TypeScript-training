import { ProductModel } from "./models/productModel.js";
import { UploadImgService } from "./services/uploadImgService.js";
import { ProductView } from "./view/components/productView.js";
import { ProductListController } from "./controller/productListController.js";

interface PageHandler {
  check: () => boolean;
  handle: () => Promise<void>;
}

document.addEventListener("DOMContentLoaded", async () => {
  const model = new ProductModel();
  const view = new ProductView();
  const uploadService = new UploadImgService();

  const pageHandlers: PageHandler[] = [
    {
      check: () => isIndexPage(),
      handle: async () => {

        const controller = new ProductListController(model, view, uploadService);
        await controller.init();
      }
    }
    // },
    // {
    //   check: () => isDetailPage(),
    //   handle: async () => {
    //     const controller = new ProductController(model, view, uploadService);
    //     await controller.init();
    //   }
    // }
  ];

  // Initialize based on current page
  try {
    const handler = pageHandlers.find(h => h.check());
    if (handler) {
      await handler.handle();
    }
  } catch (error) {
    console.error('Initialization failed:', error);
  }
});

function isIndexPage(): boolean {
  const path = window.location.pathname;
  return path.endsWith("home") || path.endsWith("/");
}

// function isDetailPage(): boolean {
//   return window.location.pathname.endsWith("productDetail");
// }
