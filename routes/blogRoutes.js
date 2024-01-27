import express from "express";
import {
  createNewBlog,
  deleteBlog,
  getAllBlogs,
  queryTopNBlogs,
  readBlog,
  updateBlog,
} from "../controllers/blogController.js";
import { authenticateToken } from "../middlewares/jwtTokenVerification.js";
import Joi from "joi";
import { validateBody } from "../middlewares/requestValidator.js";
import { redisCache } from "../config/redis.config.js";

// Schema for validation
const updateBlogScehma = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().optional(),
});

// Schema to create blog
const createBlogSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
});

// Define router
export const blogRouter = express.Router();

// Create new blog
blogRouter.post(
  "/create",
  authenticateToken,
  validateBody(createBlogSchema),
  createNewBlog
);

// Get all blogs
blogRouter.get("/all", redisCache.route(), getAllBlogs);

// Update Blog
blogRouter.put(
  "/update",
  authenticateToken,
  validateBody(updateBlogScehma),
  updateBlog
);

// Delete BLog
blogRouter.delete("/delete", authenticateToken, deleteBlog);

// Read a blog
blogRouter.get("/", redisCache.route(), readBlog);

// Query blogs
blogRouter.get("/top/:n", queryTopNBlogs);
