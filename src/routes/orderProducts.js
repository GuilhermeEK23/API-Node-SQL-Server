import { Router } from "express";
import {
  postOrderProducts,
  postOrderProduct,
  getOrdersProducts,
} from "../controllers/orderProducts.controllers.js";

const router = Router();

router.post("/orderproducts", postOrderProducts);
router.post("/orderProduct", postOrderProduct);
router.get("/ordersproducts", getOrdersProducts);

export default router;
