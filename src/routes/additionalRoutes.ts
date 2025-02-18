import { Router } from "express";
import { additionalsFromDatabase } from "../controllers/additionalControllers.js";

export const additionalRoutes = (router: Router): void => {
  router.get("/additionals", additionalsFromDatabase);
};
