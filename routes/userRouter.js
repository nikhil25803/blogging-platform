import express from "express";
import { testMiddleware } from "../controllers/userController.js";

// Define router
export const userRouter = express.Router();

// Test Route
userRouter.get("/", testMiddleware);
