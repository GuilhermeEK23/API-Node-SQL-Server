import { Router } from "express";
import {
  getOrders,
  getOrder,
  postOrder,
  putOrder,
} from "../controllers/orders.controllers.js";

const router = Router();

router.get("/orders", getOrders);
router.get("/order/:code", getOrder);
router.post("/orders", postOrder);
router.put("/orders/:code", putOrder);

export default router;
