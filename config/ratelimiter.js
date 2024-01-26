import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 Minutes
  limit: 100, // 100 requests
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
