import express from "express";
import {
  createUser,
  getUserDetails,
  testMiddleware,
  userLogin,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/jwtTokenVerification.js";

// Define router
export const userRouter = express.Router();

// Test Route
userRouter.get("/", testMiddleware);

// Register new user
userRouter.post("/register", createUser);

// User login
userRouter.get("/login", userLogin);

// Get user details
userRouter.get("/:username", authenticateToken, getUserDetails);
