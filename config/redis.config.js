import redis from "express-redis-cache";
import "dotenv/config";

// Redis cache client
export const redisCache = redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  prefix: "Blog API",
  expire: 10 * 60,
});

// Function to clear redis
export const clearRedisCache = (url) => {
  try {
    redisCache.del(`${url}`, (err) => {
      if (err) {
        return res.status(500).json({
          message: `Unable to clear cache for URL: ${url}.\nError: ${err}`,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to clear cache.\nError: ${err}`,
    });
  }
};
