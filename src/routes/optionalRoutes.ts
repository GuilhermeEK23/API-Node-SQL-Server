import { Router } from "express";
import { optionalsFromDatabase } from "../controllers/optionalControllers.js";

export const optionalRoutes = (router: Router): void => {
  router.get("/optionals", optionalsFromDatabase);
};
