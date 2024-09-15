import { Router } from "express";
import { postOrderProducts } from "../controllers/orderProducts.controllers.js";

const router = Router();

router.post('/orderproducts', postOrderProducts);

export default router;