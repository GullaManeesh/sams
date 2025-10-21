import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    eventName: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    file: { type: String, required: true },
  },
  { timestamps: true }
);

const activityModel = mongoose.model("Activities", activitySchema);
export default activityModel;
