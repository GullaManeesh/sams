// src/components/ResetPasswordModal.jsx
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const ResetPasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async () => {
    try {
      if (!oldPassword || !newPassword) {
        toast.error("Please fill all fields");
        return;
      }

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
        onClose();
      } else {
        toast.error(res.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 p-6">
        <h2 className="text-lg font-bold mb-4">Reset Password</h2>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
