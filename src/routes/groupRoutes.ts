import { Router } from "express";
import { groupsFromDatabase } from "../controllers/groupControllers.js";

export const groupRoutes = (router: Router): void => {
  router.get("/groups", groupsFromDatabase);
};
