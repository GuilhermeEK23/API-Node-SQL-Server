import { Router } from "express";

export const optionalRoutes = (router: Router): void => {
  router.get("/optionals", () => {});
};
