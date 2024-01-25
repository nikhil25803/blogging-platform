import express from "express";
import {
  createUser,
  testMiddleware,
  userLogin,
} from "../controllers/userController.js";

// Define router
export const userRouter = express.Router();

// Test Route
userRouter.get("/", testMiddleware);

// Register new user
userRouter.post("/register", createUser);

// User login
userRouter.get("/login", userLogin);
