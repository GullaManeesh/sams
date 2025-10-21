import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login.jsx";
import { Home } from "lucide-react";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            // Duration
            duration: 1500,

            // Default style for all toasts
            style: {
              background: "rgba(17, 24, 39, 0.95)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f9fafb",
              borderRadius: "12px",
              boxShadow:
                "0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              padding: "16px 20px",
              fontSize: "14px",
              fontWeight: "500",
              maxWidth: "400px",
            },

            // Success toast style
            success: {
              style: {
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10b981",
              },
              iconTheme: {
                primary: "#10b981",
                secondary: "rgba(16, 185, 129, 0.2)",
              },
            },

            // Error toast style
            error: {
              style: {
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              },
              iconTheme: {
                primary: "#ef4444",
                secondary: "rgba(239, 68, 68, 0.2)",
              },
            },

            // Loading toast style
            loading: {
              style: {
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "#3b82f6",
              },
              iconTheme: {
                primary: "#3b82f6",
                secondary: "rgba(59, 130, 246, 0.2)",
              },
            },
          }}
          containerStyle={{
            top: 20,
            right: 20,
          }}
        />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/studentDashboard" element={<StudentDashboard />} />
          <Route path="/teacherDashboard" element={<TeacherDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
