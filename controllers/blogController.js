import asynchandler from "express-async-handler";
import { prisma } from "../db/dbConfig.js";
import { ObjectId } from "bson";
import { redisCache } from "../config/redis.config.js";

export const createNewBlog = asynchandler(async (req, res) => {
  // Get user data from token
  const userData = req.user;

  // Get required data from request body
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: "Both fields are required" });
  }

  try {
    // Create new entry in database
    const blogId = new ObjectId();
    const newBlog = await prisma.blog.create({
      data: {
        bid: blogId.toString(),
        title: title,
        content: content,
        authorId: userData.uid,
        categoryId: "65b214e8ecd8b502b111d84f",
      },
      select: {
        title: true,
        content: true,
        views: true,
        author: {
          select: {
            username: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Clear cache to fetch latest results
    redisCache.del("/api/blog/all", (err) => {
      if (err) {
        res
          .status(500)
          .json({ message: `Unable to create new blog.\nError: ${error}` });
      }
    });

    res.status(200).json({ message: "New blog created", data: newBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Unable to create new blog.\nError: ${error}` });
  }
});

// Read all blog posts
export const getAllBlogs = asynchandler(async (req, res) => {
  // Get all blogs fromo the database
  const blogs = await prisma.blog.findMany({
    select: {
      title: true,
      content: true,
      views: true,
      author: {
        select: {
          username: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  res
    .status(200)
    .json({ message: "All records has been fetched", data: blogs });
});

// Update a blog
export const updateBlog = asynchandler(async (req, res) => {
  // Get user data form token
  const userData = req.user;

  // Get blog id from query param
  const blogId = req.query.blogid;
  if (!blogId) {
    res.status(400).json({ message: "Please provide blog id" });
  }

  // Get updated data
  const requestBody = req.body;

  // Validate if user can update the blog
  const blogByUser = await prisma.blog.findUnique({
    where: {
      bid: blogId,
      authorId: userData.uid,
    },
  });

  if (blogByUser) {
  } else {
    res
      .status(400)
      .json({ message: "You are not authorized to delete this blog." });
  }

  try {
    // Update the blog
    const updatedBlog = await prisma.blog.update({
      where: {
        bid: blogId,
      },
      data: requestBody,
      select: {
        title: true,
        content: true,
        views: true,
      },
    });

    // Response
    res.status(200).json({
      message: "Blog has been updated successfully.",
      data: updatedBlog,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Unable to update blog.\nError: ${error}` });
  }
});

// Delete a blog
export const deleteBlog = asynchandler(async (req, res) => {
  // Get user data from the token
  const userData = req.user;

  // Get blog id from query param
  const blogId = req.query.blogid;

  if (!blogId) {
    res.status(400).json({ message: "Please provide blog id" });
  }

  // Check if blog exists and is created by the authenticated user
  const blog = await prisma.blog.findFirst({
    where: {
      bid: blogId,
      authorId: userData.uid,
    },
  });

  if (blog) {
    // Delet the blog
    await prisma.blog.delete({
      where: {
        bid: blogId,
      },
    });

    res.status(200).json({ message: "Blog has been deleted" });
  } else {
    res
      .status(400)
      .json({ message: "You are not authorized to delete this blog." });
  }
});

// Read a blog
export const readBlog = asynchandler(async (req, res) => {
  // Get blog id from query param
  const blogId = req.query.blogid;

  if (!blogId) {
    res.status(400).json({ message: "Please provide blog id" });
  }

  // Query the blog in the database
  const blogData = await prisma.blog.findUnique({
    where: {
      bid: blogId,
    },
    select: {
      title: true,
      content: true,
      views: true,
      author: {
        select: {
          username: true,
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  if (blogData) {
    // If the blog has been read, increase views count
    await prisma.blog.update({
      where: {
        bid: blogId,
      },
      data: {
        views: blogData.views + 1,
      },
    });
    res
      .status(200)
      .json({ message: "Blog data has been fetched.", data: blogData });
  } else {
    res
      .status(500)
      .json({ message: `Unable to fetch blog details.\nError: ${error}` });
  }
});
