import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orders.routes.js';
import productRoutes from './routes/products.routes.js'
import orderProducts from './routes/orderProducts.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(orderRoutes);
app.use(productRoutes);
app.use(orderProducts);

export default app;