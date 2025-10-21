import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { activeTab, rollno, password } = req.body;

    if (!rollno || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all fields" });
    }

    // Pick model based on tab
    const Model = activeTab === "Student" ? studentModel : teacherModel;

    // Find existing user (student or teacher)
    const existingUser = await Model.findOne({ rollno });

    // === TEACHER LOGIN LOGIC ===
    if (activeTab === "Teacher") {
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found. Please contact admin.",
        });
      }

      const isMatch =
        (await bcrypt.compare(password, existingUser.password)) ||
        password === existingUser.password;
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid teacher credentials",
        });
      }

      // Generate JWT token for teacher
      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("authToken", token, { httpOnly: true });

      return res.json({
        success: true,
        message: "Teacher logged in successfully",
        user: existingUser,
      });
    }

    // === STUDENT LOGIN OR REGISTER LOGIC ===
    if (existingUser) {
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid student credentials",
        });
      }

      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("authToken", token, { httpOnly: true });
      return res.json({
        success: true,
        message: "Student logged in successfully",
        user: existingUser,
      });
    }

    // If student doesn't exist — register
    if (password !== rollno) {
      return res.json({
        success: true,
        message: "incorrect password",
        user: existingUser,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Model.create({
      rollno,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("authToken", token, { httpOnly: true });

    return res.json({
      success: true,
      message: "Student registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all fields" });
    }

    let user = await studentModel.findById(userId);
    let userType = "Student";

    if (!user) {
      user = await teacherModel.findById(userId);
      userType = "Teacher";
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch =
      (await bcrypt.compare(oldPassword, user.password)) ||
      oldPassword === user.password;
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.json({
      success: true,
      message: `${userType} password reset successfully`,
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error resetting password",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("authToken");
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message || "Error logging out",
    });
  }
};

// In authcontroller.js (The getUser function)

export const getUser = async (req, res) => {
  const userId = req.userId;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in.",
      });
    }

    let user = await studentModel.findById(userId).select("-password").lean();

    // Add the role property to the user object
    if (user) {
      user.role = "Student";
    }

    if (!user) {
      user = await teacherModel.findById(userId).select("-password").lean();
      if (user) {
        user.role = "Teacher";
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      // Send the user object which now includes the 'role' field
      user: user,
      message: "User fetched successfully.",
    });
  } catch (error) {
    // ... (error handling)
  }
};
