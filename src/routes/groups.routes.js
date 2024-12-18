import { Router } from "express";
import { getGroups } from "../controllers/groups.controllers.js";

const router = Router();

router.get("/groups", getGroups);

export default router;
