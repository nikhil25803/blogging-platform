import redis from "express-redis-cache";
import "dotenv/config";

export const redisCache = redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  prefix: "Blog API",
  expire: 5 * 60,
});
