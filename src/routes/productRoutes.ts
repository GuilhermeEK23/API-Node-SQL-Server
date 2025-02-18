import { Router } from "express";
import { productsFromDatabase } from "../controllers/productControllers.js";

export const productRoutes = (router: Router): void => {
  router.get("/products", productsFromDatabase);
};
