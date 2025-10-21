import express from "express";
import {
  getactivityModels,
  addactivityModel,
  updateactivityModel,
  deleteactivityModel,
  getallactivityModels,
} from "../controllers/activityController.js";
import userAuth from "../middleware/userAuth.js";
const activityRouter = express.Router();

activityRouter.get("/get-activities", userAuth, getactivityModels);
activityRouter.post("/add-activity", userAuth, addactivityModel);
activityRouter.put("/update-activity/:id", userAuth, updateactivityModel);
activityRouter.delete("/delete-activity/:id", userAuth, deleteactivityModel);
activityRouter.get("/get-all-activities", userAuth, getallactivityModels);

export default activityRouter;
