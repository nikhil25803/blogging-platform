import redis from "express-redis-cache";

export const redisCache = redis({
  port: 6379,
  host: "localhost",
  prefix: "Blog API",
  expire: 60 * 60,
});
