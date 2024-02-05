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
    return res
      .status(400)
      .json({ message: "Fields required: username, name, email and password" });
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
    return res.json({
      status: 200,
      message: "New User Created",
      data: newUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to create new user.\nError: ${error}` });
  }
});

// User Login
export const userLogin = asyncHandler(async (req, res) => {
  // Get username and password from req body
  const { username, password } = req.body;

  // If both fields are not required
  if (!username || !password) {
    return res
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
        return res.json({
          status: 200,
          message: `User: ${username} loggedin.`,
          token: accessToken,
        });
      } else {
        return res.json({
          status: 400,
          message: `Password not matched for the username: ${username}`,
        });
      }
    } else {
      return res.json({
        status: 404,
        message: `No user found with username: ${username}`,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to login user" });
  }
});

// Get User Details
export const getUserDetails = asyncHandler(async (req, res) => {
  // Get username from path params
  const username = req.params.username;

  // Check is user is authenticated or not
  if (username !== req.user.username) {
    return res.status(401).json({
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
      return res.status(200).json({ message: "User data fetched", data: user });
    } else {
      return res
        .status(404)
        .json({ message: `No user found with username: ${username}` });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to query user.\nError: ${error}` });
  }
});

// Update user details
export const updateUser = asyncHandler(async (req, res) => {
  // Get user details
  const userData = req.user;

  // Collect username from query parameter
  const username = req.params.username;

  // Check is user is authenticated or not
  if (username !== userData.username) {
    return res.status(401).json({
      message: `Username: ${username} is either not loggedin or incorrect`,
    });
  }

  // Collect data to update from request body
  const requestBody = req.body;

  // Validate email -  should not already exists
  if (requestBody.email) {
    const emailCheck = await prisma.user.findFirst({
      where: {
        email: requestBody.email,
      },
    });
    if (emailCheck) {
      return res.status(401).json({
        message: `An user with email: ${userData.email} already exists!`,
      });
    }
  }

  // Update the user data
  try {
    const updatedUserData = await prisma.user.update({
      where: {
        username: username,
      },
      data: requestBody,
      select: {
        username: true,
        name: true,
        email: true,
      },
    });

    return res.status(200).json({
      message: `User data has been updated!`,
      data: updatedUserData,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to update user data: ${error}`,
    });
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
    return res.status(401).json({
      message: `Username: ${username} is either not loggedin or incorrect`,
    });
  }

  // Query on DB
  const userBlogs = await prisma.blog.findMany({
    where: {
      authorId: userData.uid,
    },
    select: {
      bid: true,
      title: true,
      content: true,
      views: true,
    },
  });

  return res.status(200).json({
    message: "All blogs written by the user has been fetched",
    data: userBlogs,
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  // Get user details
  const userData = req.user;

  // Collect username from query parameter
  const username = req.params.username;

  // Check is user is authenticated or not
  if (username !== userData.username) {
    return res.status(401).json({
      message: `Username: ${username} is either not loggedin or incorrect`,
    });
  }

  // Delete the user
  try {
    await prisma.user.delete({
      where: {
        username: username,
      },
    });

    return res.status(200).json({
      message: "User and data has been deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to update user data: ${error}`,
    });
  }
});
