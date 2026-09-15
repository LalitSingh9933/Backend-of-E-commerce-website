import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import notFoundHandler from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true}));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API is running",
  });
});
 app.use("/api/v1", apiRoutes);

// No matching routes
app.use(notFoundHandler);

// Global error handler 

app.use(errorHandler);

export default app;