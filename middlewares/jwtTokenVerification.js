import jwt from "jsonwebtoken";
import "dotenv/config";
import { prisma } from "../db/dbConfig.js";

// Function to verify token entered by a user
export function authenticateToken(req, res, next) {
  // Get the bearer token from the headers
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(400).json({ message: "JWT Token not provided." });
  }

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, async (err, tokenData) => {
    // Check for any error
    if (err) {
      return res
        .status(404)
        .json({ message: "JWT Token has been expired or incorrect." });
    }

    // Check if user is logged-in or not
    const userDetails = tokenData.user;

    if (userDetails) {
      const user = await prisma.user.findFirst({
        where: {
          uid: userDetails.uid,
        },
        select: {
          isLoggedIn: true,
        },
      });

      if (user) {
        if (user.isLoggedIn === false) {
          return res.status(400).json({
            message: "User not loggedin. Please login again!",
          });
        }
      } else {
        return res.status(404).json({
          message: "User does not exist",
        });
      }
    }
    // If all validation passed
    req.user = userDetails;
    next();
  });
}
