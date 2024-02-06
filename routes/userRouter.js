import express from "express";
import {
  blogsByUser,
  createUser,
  deleteUser,
  getUserDetails,
  updateUser,
  userLogOut,
  userLogin,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/jwtTokenVerification.js";
import Joi from "joi";
import { validateBody } from "../middlewares/requestValidator.js";
import { redisCache } from "../config/redis.config.js";

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

// User update schema
const userUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().optional(),
});

// Define router
export const userRouter = express.Router();

// Register new user
userRouter.post("/register", validateBody(createUserSchema), createUser);

// User login
userRouter.post("/login", validateBody(userLoginSchema), userLogin);

// Get user details
userRouter.get(
  "/:username",
  authenticateToken,
  redisCache.route(),
  getUserDetails
);

// Update user details()
userRouter.put(
  "/:username",
  validateBody(userUpdateSchema),
  authenticateToken,
  updateUser
);

// Logout User
userRouter.get("/:username/logout", authenticateToken, userLogOut);

// Delete user
userRouter.delete("/:username", authenticateToken, deleteUser);

// Blogs written by user
userRouter.get("/:username/blog/all", authenticateToken, blogsByUser);
