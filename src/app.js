import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orders.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderProducts from "./routes/orderProducts.js";
import userRouts from "./routes/users.routes.js";
import groupRoutes from "./routes/groups.routes.js";
import optionalRoutes from "./routes/optional.routes.js";
import additionalRoutes from "./routes/additional.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(orderRoutes);
app.use(productRoutes);
app.use(orderProducts);
app.use(groupRoutes);
app.use(userRouts);
app.use(optionalRoutes);
app.use(additionalRoutes);

export default app;
