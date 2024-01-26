import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import { userRouter } from "./routes/userRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import { blogRouter } from "./routes/blogRoutes.js";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/ratelimiter.js";
import compression from "compression";

// Initialize application
const app = express();

// Define port
const PORT = process.env.PORT || 8000;

// Add middlewares
app.use(
  compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(errorHandler);
app.use(helmet()); // For additional security
app.use(cors()); // CORS can be further modified - default for development
app.use(limiter); // Applied rate limiter

// Ping Test
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is up and running" });
});

// Add Routers
app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);

// Listen app to defined PORT
app.listen(PORT, () => {
  console.log("Listening to: localhost:8000");
});
