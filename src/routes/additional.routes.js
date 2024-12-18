import { Router } from "express";
import { getAdditional } from "../controllers/additional.controllers.js";

const router = Router();

router.get("/additional", getAdditional);

export default router;
