import express from "express";
import {
  createNewBlog,
  deleteBlog,
  getAllBlogs,
  readBlog,
  updateBlog,
} from "../controllers/blogController.js";
import { authenticateToken } from "../middlewares/jwtTokenVerification.js";
import Joi from "joi";
import { validateBody } from "../middlewares/requestValidator.js";

// Schema for validation
const updateBlogScehma = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().optional(),
});

// Define router
export const blogRouter = express.Router();

// Create new blog
blogRouter.post("/create", authenticateToken, createNewBlog);

// Get all blogs
blogRouter.get("/all", getAllBlogs);

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
blogRouter.get("/", readBlog);
