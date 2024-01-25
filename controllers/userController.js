import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { ObjectId } from "bson";
import { prisma } from "../db/dbConfig.js";
import jwt from "jsonwebtoken";

// Test Controller
export const testMiddleware = asyncHandler(async (req, res) => {
  res.json({ message: "listening to user route" });
});

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
    res.status(400);
    throw new Error("Both fields are required");
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
