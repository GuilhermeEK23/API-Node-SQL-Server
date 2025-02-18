import { Router } from "express";
import { ordersFromDatabase } from "../controllers/orderControllers.js";

export const orderRoutes = (router: Router): void => {
  router.get("/orders", ordersFromDatabase);
};
