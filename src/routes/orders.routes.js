import { Router } from "express";
import { putOrder } from "../controllers/orders.controllers.js";
import { getOrders } from "../controllers/orders.controllers.js";

const router = Router();

router.put("/orders", putOrder);
router.get("/orders", getOrders);

export default router;
