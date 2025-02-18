import { Router, Request, Response } from "express";
import { usersFromDatabase } from "../controllers/userControllers.js";

export const userRoutes = (router: Router) => {
  router.get("/users", usersFromDatabase);
};
