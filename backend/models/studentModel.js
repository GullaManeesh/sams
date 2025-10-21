import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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

const studentModel = mongoose.model("Student", studentSchema);

export default studentModel;
