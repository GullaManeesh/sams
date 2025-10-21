import React, { useState } from "react";
import toast from "react-hot-toast";
import { GraduationCap, LogIn, User, BookOpen } from "lucide-react"; // Added User and BookOpen for flair
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion for subtle animation

const Login = () => {
  const [activeTab, setActiveTab] = useState("Student");
  const [rollno, setRollno] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const isStudent = activeTab === "Student";

  // Refined Tailwind Classes for better styling
  const activeClasses =
    "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50";
  const inactiveClasses =
    "text-gray-600 hover:text-indigo-600 hover:bg-gray-50";

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true;

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          activeTab,
          rollno,
          password,
        }
      );

      if (data.success) {
        toast.success(data.message);
        if (activeTab === "Student") {
          navigate("/StudentDashboard");
        } else {
          navigate("/TeacherDashboard");
        }
      } else {
        toast.error(data.message); // Changed to toast.error for non-success messages
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 border border-gray-100">
        {/* Header Section */}
        <div className="text-center mb-8">
          <GraduationCap className="h-14 w-14 text-indigo-600 mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome to SAMS
          </h1>
          <p className="text-md text-gray-500 mt-1">
            Student Activities Management System
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-8 border border-gray-200">
          <button
            onClick={() => setActiveTab("Student")}
            className={`cursor-pointer w-1/2 py-2.5 text-base font-semibold transition-all duration-300 rounded-xl ${
              isStudent ? activeClasses : inactiveClasses
            }`}>
            <User className="w-5 h-5 mr-2 inline-block" />
            Student
          </button>
          <button
            onClick={() => setActiveTab("Teacher")}
            className={`cursor-pointer w-1/2 py-2.5 text-base font-semibold transition-all duration-300 rounded-xl ${
              !isStudent ? activeClasses : inactiveClasses
            }`}>
            <BookOpen className="w-5 h-5 mr-2 inline-block" />
            Teacher
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Roll Number Field */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <input
              onChange={(e) => setRollno(e.target.value)}
              type="text"
              id="identifier"
              placeholder="e.g., 160123737107"
              value={rollno}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-sm transition-all"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-sm transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 mt-8">
            <LogIn className="w-5 h-5 mr-2" />
            {isStudent ? "Student Login" : "Teacher Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
