import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { ObjectId } from "bson";
import { prisma } from "../db/dbConfig.js";
import jwt from "jsonwebtoken";

// Add new user
export const createUser = asyncHandler(async (req, res) => {
  // Accept Body Parameter
  const { username, name, email, password } = req.body;

  // Cehck if all the required body is passed or not
  if (!name || !username || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  // Create new user
  const uidGenerated = new ObjectId();
  const passwordEncrypted = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        uid: uidGenerated.toString(),
        username,
        name,
        email,
        hashedpassword: passwordEncrypted,
      },
    });
    res.json({
      status: 200,
      message: "New User Created",
      data: newUser,
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Unable to create new user.\nError: ${error}`);
  }
});

// User Login
export const userLogin = asyncHandler(async (req, res) => {
  // Get username and password from req body
  const { username, password } = req.body;

  // If both fields are not required
  if (!username || !password) {
    res
      .status(400)
      .json({ message: "Both username and password is required to login." });
  }

  try {
    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (user) {
      // Validate password
      const passwordMatched = await bcrypt.compare(
        password,
        user.hashedpassword
      );
      if (passwordMatched) {
        // Generate JWT access token
        const accessToken = jwt.sign(
          {
            user: {
              uid: user.uid,
              username: user.username,
              name: user.name,
              email: user.email,
            },
          },
          process.env.JWT_ACCESS_TOKEN,
          { expiresIn: "30m" }
        );

        // User Successfully logged in
        res.json({
          status: 200,
          message: `User: ${username} loggedin.`,
          token: accessToken,
        });
      } else {
        res.json({
          status: 400,
          message: `Password not matched for the username: ${username}`,
        });
      }
    } else {
      res.json({
        status: 404,
        message: `No user found with username: ${username}`,
      });
    }
  } catch (error) {
    throw new Error("Unable to login user");
  }
});

// Get User Details
export const getUserDetails = asyncHandler(async (req, res) => {
  // Get username from path params
  const username = req.params.username;

  // Check is user is authenticated or not
  if (username !== req.user.username) {
    res.status(401).json({
      message: `Username: ${username} is either not loggedin or incorrect`,
    });
  }

  // Check if user xists
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        uid: true,
        username: true,
        name: true,
        email: true,
        blogsWritten: true,
      },
    });

    if (user) {
      res.status(200).json({ message: "User data fetched", data: user });
    } else {
      res
        .status(404)
        .json({ message: `No user found with username: ${username}` });
    }
  } catch (error) {
    res.status(500).json({ message: `Unable to query user.\nError: ${error}` });
  }
});

// Get all blogs written by the user
export const blogsByUser = asyncHandler(async (req, res) => {
  // Get user details from the token
  const userData = req.user;

  // Get username from params
  const username = req.params.username;

  // Check is user is authenticated or not
  if (username !== userData.username) {
    res.status(401).json({
      message: `Username: ${username} is either not loggedin or incorrect`,
    });
  }

  // Query on DB
  const userBlogs = await prisma.blog.findMany({
    where: {
      authorId: userData.uid,
    },
    select: {
      title: true,
      content: true,
      views: true,
      likes: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  res.status(200).json({
    message: "All blogs written by the user has been fetched",
    data: userBlogs,
  });
});
