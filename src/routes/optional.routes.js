import { Router } from "express";
import { getOptionalByProductId } from "../controllers/optional.controllers.js";

const router = Router();

router.get("/optional", getOptionalByProductId);

export default router;
