import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/mongodbConnect.js";
import authRoute from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import activityRouter from "./routes/activityRoutes.js";
dotenv.config();
connectDB();
const app = express();

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

//auth route
app.use("/sams/auth", authRoute);

//activity route
app.use("/sams/activities", activityRouter);
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
