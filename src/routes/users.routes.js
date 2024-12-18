import { Router } from "express";
import {
  insertUser,
  getUsers,
  updateUser,
  deleteUser,
  getUser,
} from "../controllers/users.controllers.js";

const router = Router();

router.get("/users", getUsers);
router.get("/user", getUser);
router.post("/users", insertUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
