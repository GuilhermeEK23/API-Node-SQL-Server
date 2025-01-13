import { Router } from "express";
import { putOrder } from "../controllers/orders.controllers.js";

const router = Router();

router.put("/orders", putOrder);

export default router;
