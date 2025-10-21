import express from "express";
import {
  getUser,
  logout,
  register,
  resetPassword,
} from "../controllers/authcontroller.js";
import userAuth from "../middleware/userAuth.js";

const authRoute = express.Router();

authRoute.post("/login", register);
authRoute.put("/reset-password", userAuth, resetPassword);
authRoute.post("/logout", logout);
authRoute.get("/get-user", userAuth, getUser);

export default authRoute;
