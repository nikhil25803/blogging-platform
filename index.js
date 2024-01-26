import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import { userRouter } from "./routes/userRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import { blogRouter } from "./routes/blogRoutes.js";

// Initialize application
const app = express();

// Define port
const PORT = process.env.PORT || 8000;

// Add middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(errorHandler);

// Ping Test
app.get("/", (req, res) => {
  return res.json({ message: "Server is up and running" });
});

// Add Routers
app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);

// Listen app to defined PORT
app.listen(PORT, () => {
  console.log("Listening to: localhost:8000");
});
