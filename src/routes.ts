import { Express, Router } from "express";
import { userRoutes } from "./routes/userRoutes.js";
import { orderRoutes } from "./routes/orderRoutes.js";
import { groupRoutes } from "./routes/groupRoutes.js";
import { productRoutes } from "./routes/productRoutes.js";
import { optionalRoutes } from "./routes/optionalRoutes.js";
import { additionalRoutes } from "./routes/additionalRoutes.js";

export const setupRoutes = (app: Express): void => {
  const router = Router();
  app.use("/api", router);
  userRoutes(router);
  orderRoutes(router);
  groupRoutes(router);
  productRoutes(router);
  optionalRoutes(router);
  additionalRoutes(router);
};
