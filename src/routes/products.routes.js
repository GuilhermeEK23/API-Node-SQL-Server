import { Router } from "express";
import {
  getProducts,
  getProductsApp,
} from "../controllers/products.controllers.js";

const router = Router();

router.get("/products", getProducts);
router.get("/productsapp", getProductsApp);

export default router;
