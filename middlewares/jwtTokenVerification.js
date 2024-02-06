import jwt from "jsonwebtoken";
import "dotenv/config";

// Function to verify token entered by a user
export function authenticateToken(req, res, next) {
  // Get the bearer token from the headers
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(400).json({ message: "JWT Token not provided." });
  }

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, tokenData) => {
    // Check for any error
    if (err) {
      return res
        .status(404)
        .json({ message: "JWT Token has been expired or incorrect." });
    }

    // Check if user is logged-in or not
    const userDetails = tokenData.user;
    if (userDetails && userDetails.isLoggedIn === false) {
      return res.status(400).json({
        message: "User not loggedin. Please login again!",
      });
    }

    // If all validation passed
    req.user = userDetails;
  });
  next();
}
