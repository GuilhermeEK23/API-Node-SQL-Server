import { Express, Router } from "express";
import { userRoutes } from "./routes/userRoutes";
import { orderRoutes } from "./routes/orderRoutes";
import { groupRoutes } from "./routes/groupRoutes";
import { productRoutes } from "./routes/productRoutes";
import { optionalRoutes } from "./routes/optionalRoutes";
import { additionalRoutes } from "./routes/additionalRoutes";

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
