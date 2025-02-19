import { Router } from "express";
import {
  ordersFromDatabase,
  updateOrderDatabase,
} from "../controllers/orderControllers.js";

export const orderRoutes = (router: Router): void => {
  router.get("/orders", ordersFromDatabase);
  router.put("/order/:id", updateOrderDatabase);
};
