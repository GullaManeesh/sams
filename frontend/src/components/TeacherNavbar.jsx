import React, { useState } from "react";
import {
  Upload,
  LayoutDashboard,
  Award,
  User,
  LogOut,
  Lock,
  X,
} from "lucide-react"; // Added Lock icon
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion"; // Import motion for sidebar animations

export const TeacherNavbar = ({ onUploadClick, user }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logout`
      );
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/");
      } else {
        toast.error(res.data.message || "Logout failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Logout failed");
    }
  };

  const handleResetPassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`,
        {
          oldPassword,
          newPassword,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setOldPassword("");
        setNewPassword("");
        setShowReset(false);
      } else {
        toast.error(res.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md border-b border-gray-50 z-30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex ml-4 sm:ml-0 items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Award className="w-8 h-8 text-indigo-600" />
                <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                  CertiPortal
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => navigate("/StudentDashboard")}
                  className="cursor-pointer flex items-center space-x-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors py-1 px-2 rounded-md">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>

            {/* User Profile Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="cursor-pointer flex items-center space-x-2 p-2 rounded-full transition-colors bg-gray-50 hover:bg-gray-200 ring-1 ring-gray-200">
              <User className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Right Sidebar (Animated) */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: sidebarOpen ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 shadow-sm sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>User Profile</span>
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* User Info Card */}
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-lg font-bold text-gray-900">
              {user?.rollno || "User Roll No"}
            </p>
            <p className="text-sm text-indigo-700 mt-0.5 font-medium">
              Role: {user?.role || "Student"}
            </p>
          </div>

          {/* Reset Password Button */}
          <button
            onClick={() => setShowReset(!showReset)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
            <Lock className="w-5 h-5 text-gray-500" />
            <span>Reset Password</span>
          </button>

          {/* Reset Password Form */}
          <AnimatePresence initial={false}>
            {showReset && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 mt-3 overflow-hidden">
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md cursor-pointer">
                  Submit Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer">
            <LogOut className="w-5 h-5 text-red-600" />
            <span>Log Out</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};
