import { Router } from "express";
import {
  ordersFromDatabase,
  orderFromDatabase,
  updateOrderDatabase,
} from "../controllers/orderControllers.js";

export const orderRoutes = (router: Router): void => {
  router.get("/orders", ordersFromDatabase);
  router.get("/order/:id", orderFromDatabase);
  router.put("/order/:id", updateOrderDatabase);
};
