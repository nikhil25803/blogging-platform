import express from "express";
import {
  blogsByUser,
  createUser,
  getUserDetails,
  userLogin,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/jwtTokenVerification.js";
import Joi from "joi";
import { validateBody } from "../middlewares/requestValidator.js";

// Create user schema
const createUserSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
});

// User Login Schema
const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Define router
export const userRouter = express.Router();

// Register new user
userRouter.post("/register", validateBody(createUserSchema), createUser);

// User login
userRouter.post("/login", validateBody(userLoginSchema), userLogin);

// Read, and delete user
userRouter.get("/:username", authenticateToken, getUserDetails);

// BLogs written by user
userRouter.get("/:username/blog/all", authenticateToken, blogsByUser);
