import asyncHandler from "express-async-handler";

// Test Controller
export const testMiddleware = asyncHandler(async (req, res) => {
  res.json({ message: "listening to user route" });
});
