import express from "express";
import {
  blogsByUser,
  createUser,
  getUserDetails,
  userLogin,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/jwtTokenVerification.js";

// Define router
export const userRouter = express.Router();

// Register new user
userRouter.post("/register", createUser);

// User login
userRouter.get("/login", userLogin);

// Read, and delete user
userRouter.get("/:username", authenticateToken, getUserDetails);

// BLogs written by user
userRouter.get("/:username/blog/all", authenticateToken, blogsByUser);
