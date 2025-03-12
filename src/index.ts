import express, { Request, Response } from "express";
import cors from "cors";
import { setupRoutes } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("./src/printer"));
setupRoutes(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Node.js + TypeScript API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
