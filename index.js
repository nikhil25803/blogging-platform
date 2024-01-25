import express from "express";
import "dotenv/config";

// Initialize application
const app = express();

// Define port
const PORT = process.env.PORT || 8000;

// Ping Test
app.get("/", (req, res) => {
  return res.json({ message: "Server is up and running" });
});

// Listen app to defined PORT
app.listen(PORT, () => {
  console.log("Listening to: localhost:8000");
});
