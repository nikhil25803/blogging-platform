import asynchandler from "express-async-handler";
import { prisma } from "../db/dbConfig.js";
import { ObjectId } from "bson";
import { clearRedisCache } from "../config/redis.config.js";
import { blogsRecommendation } from "../config/blogsRecommendation.js";

export const createNewBlog = asynchandler(async (req, res) => {
  // Get user data from token
  const userData = req.user;

  // Get required data from request body
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Both fields are required" });
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
      },
      select: {
        bid: true,
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
      },
    });

    // Clear required cache
    clearRedisCache(`/api/user/${userData.username}/blog/all`);
    clearRedisCache(`/api/user/${userData.username}`);
    clearRedisCache("/api/blog/all");

    res.status(200).json({ message: "New blog created", data: newBlog });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Unable to create new blog.\nError: ${error}` });
  }
});

// Read all blog posts
export const getAllBlogs = asynchandler(async (req, res) => {
  // Get page and number from query parameters
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.number) || 10;

  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0 || limit > 100) {
    limit = 10;
  }

  // Records to skip
  const skip = (page - 1) * limit;

  // Get all blogs fromo the database
  const blogs = await prisma.blog.findMany({
    take: limit,
    skip: skip,
    select: {
      bid: true,
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
    },
  });

  // Calculating total pages from lmits and  count in DB records
  const totalBlogs = await prisma.blog.count();
  const totalPages = Math.ceil(totalBlogs / limit);

  res.status(200).json({
    message: "All records has been fetched",
    data: blogs,
    metadata: {
      totalPages,
      currentPage: page,
      currentLimit: limit,
    },
  });
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
        bid: true,
        title: true,
        content: true,
        views: true,
      },
    });

    // Clear required cache
    clearRedisCache(`/api/blog?blogid=${blogId}`);
    clearRedisCache(`/api/user/${userData.username}/blog/all`);
    clearRedisCache(`/api/user/${userData.username}`);

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

    clearRedisCache(`/api/blog?blogid=${blogId}`);
    clearRedisCache(`/api/user/${userData.username}/blog/all`);
    clearRedisCache(`/api/user/${userData.username}`);

    res.status(200).json({ message: "Blog has been deleted" });
  } else {
    res
      .status(400)
      .json({ message: "You are not authorized to delete this blog." });
  }
});

// Read a blog
export const readBlog = asynchandler(async (req, res) => {
  // Get query parameters
  const queryParams = req.query;

  if (queryParams.mostviewed && queryParams.mostviewed === "true") {
    // Query the most viewed blog from the DB
    try {
      const popularBlog = await prisma.blog.findFirst({
        orderBy: [
          {
            views: "desc",
          },
        ],
        select: {
          bid: true,
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
        },
      });

      // Get vector data
      const recommendedBlogs = await blogsRecommendation(popularBlog.bid);

      // Return the response
      return res.status(200).json({
        message: "Most popular blogs has been fetched",
        data: popularBlog,
        recommendations: recommendedBlogs.slice(0, 5),
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: `Unable to fetch mostviewed blog.\nError: ${error}` });
    }
  } else if (queryParams.blogid) {
    const blogId = queryParams.blogid;

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
      },
    });

    const recommendedBlogs = await blogsRecommendation(blogData.bid);

    if (blogData) {
      return res.status(200).json({
        message: "Blog data has been fetched.",
        data: blogData,
        recommendations: recommendedBlogs,
      });
    } else {
      return res
        .status(500)
        .json({ message: `Unable to fetch blog details.\nError: ${error}` });
    }
  } else {
    return res.status(400).json({
      message:
        "Please provide one of the query parameters. (mostviewed / blogid)",
    });
  }
});

// Query Top N Blogs
export const queryTopNBlogs = asynchandler(async (req, res) => {
  // Get value from path parameter and convert the into number (By Default Top 10 Blogs)
  const topn = Number(req.params.n) || 10;

  // Try to fetch the results
  try {
    const topNBlogs = await prisma.blog.findMany({
      take: topn,
      orderBy: [
        {
          views: "desc",
        },
      ],
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
      },
    });

    // Return the response
    return res.status(200).json({
      message: "Top blogs has been fetched",
      data: topNBlogs,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to fetch blog details.\nError: ${error}` });
  }
});

// Keyword based query
export const keywordSearchBlog = asynchandler(async (req, res) => {
  // Get data from query params
  const queryData = req.query;

  try {
    if (queryData.title) {
      // Fetch data
      const blogData = await prisma.blog.findMany({
        where: {
          title: {
            search: queryData.title,
          },
        },
      });
      return res.status(200).json({
        message: `Fetched blogs with title keyword: ${queryData.title} in title.`,
        data: blogData,
      });
    } else if (queryData.content) {
      // Fetch data
      const blogData = await prisma.blog.findMany({
        where: {
          content: {
            search: queryData.content,
          },
        },
      });
      return res.status(200).json({
        message: `Fetched blogs with keyword: ${queryData.content} in content.`,
        data: blogData,
      });
    } else {
      return res.status(400).json({
        message: "Please provide either of title or content query value.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to fetch blog details.\nError: ${error}` });
  }
});
