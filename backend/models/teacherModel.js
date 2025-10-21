import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  rollno: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const teacherModel = mongoose.model("teacher", teacherSchema);

export default teacherModel;
