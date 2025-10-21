import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Award, Users, Filter, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { ToastContainer } from "../components/ToastContainer";
import { Navbar } from "../components/Navbar";
import { ViewModal } from "../components/ViewModal";
import { CertificateTableTeacher } from "../components/CertificateTableTeacher";
import { TeacherNavbar } from "../components/TeacherNavbar";

// Simple Card Component (Moved here for brevity, place it below the main export)
const DashboardCard = ({ title, value, icon: Icon, color, iconColor }) => (
  <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 transition-shadow duration-300 hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Data State
  const [certificates, setCertificates] = useState([]);
  const [viewingCert, setViewingCert] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(""); // Used for Roll No / Event Name search
  const [filterType, setFilterType] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [dateFrom, setDateFrom] = useState(""); // Date Range Filter: From
  const [dateTo, setDateTo] = useState(""); // Date Range Filter: To

  axios.defaults.withCredentials = true;
  const API_URL = `${import.meta.env.VITE_BACKEND_URL}/activities`;
  const AUTH_URL = `${import.meta.env.VITE_BACKEND_URL}/auth`;

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // --- Data Fetching Functions (Unchanged) ---
  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const res = await axios.get(`${AUTH_URL}/get-user`);

      if (res.data.success && res.data.user.role === "Teacher") {
        setUser(res.data.user);
      } else {
        toast.error("Access denied. Redirecting to login.");
        navigate("/");
      }
    } catch (err) {
      console.error("User fetch error:", err);
      navigate("/");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchAllCertificates = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-all-activities`);
      const data = res.data.activityModels || [];
      setCertificates(data);
    } catch (err) {
      showToast("Failed to fetch all student certificates", "error");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAllCertificates();
  }, []);

  const handleView = (cert) => {
    setViewingCert(cert);
  };

  // --- Filtering Logic (Updated to handle Roll No search and separate Date Range) ---
  const { filteredCertificates, uniqueYears, uniqueMonths } = useMemo(() => {
    const years = new Set();
    const months = new Set();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const searchLower = searchQuery.toLowerCase();

    const filtered = certificates.filter((cert) => {
      const certDate = cert.date ? new Date(cert.date) : null;

      // Date components
      const certYear =
        certDate && !isNaN(certDate.getFullYear())
          ? certDate.getFullYear().toString()
          : null;
      const certMonth =
        certDate && certYear
          ? (certDate.getMonth() + 1).toString().padStart(2, "0")
          : null;

      if (certYear) years.add(certYear);
      if (certMonth && certYear) months.add(`${certYear}-${certMonth}`);

      // 1. Roll No/Event Name Search
      const matchesSearch =
        (cert.rollno?.toLowerCase() || "").includes(searchLower) ||
        (cert.eventName?.toLowerCase() || "").includes(searchLower);

      // 2. Event Type Filter
      const matchesFilter = filterType === "All" || cert.type === filterType;

      let matchesDateFilter = true;
      let matchesDateRangeFilter = true;

      // 3. Year/Month Filters (Only apply if date range is empty)
      if (!dateFrom && !dateTo) {
        const matchesYear = filterYear === "All" || certYear === filterYear;
        let matchesMonth = filterMonth === "All";
        if (filterMonth !== "All") {
          matchesMonth = `${certYear}-${certMonth}` === filterMonth;
        }
        matchesDateFilter = matchesYear && matchesMonth;
      } else {
        // 4. Date Range Filters (Only apply if date range is set)
        if (certDate) {
          if (dateFrom) {
            matchesDateRangeFilter =
              matchesDateRangeFilter && certDate >= new Date(dateFrom);
          }
          if (dateTo) {
            const dateToInclusive = new Date(dateTo);
            dateToInclusive.setHours(23, 59, 59, 999);
            matchesDateRangeFilter =
              matchesDateRangeFilter && certDate <= dateToInclusive;
          }
        } else {
          matchesDateRangeFilter = false; // Cannot match range if date is invalid/missing
        }
        // If using date range, Year/Month filters are ignored, but search must still match
        matchesDateFilter = true;
      }

      // Combine all filters
      return (
        matchesSearch &&
        matchesFilter &&
        matchesDateFilter && // Year/Month filters
        matchesDateRangeFilter // From/To filters
      );
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    const sortedMonths = Array.from(months)
      .map((ym) => {
        const [year, monthIndex] = ym.split("-");
        const monthName = monthNames[parseInt(monthIndex, 10) - 1];
        return {
          value: ym,
          label: `${year} ${monthName}`,
        };
      })
      .sort((a, b) => b.value.localeCompare(a.value));

    const finalMonths = sortedMonths.filter(
      (m) => filterYear === "All" || m.value.startsWith(filterYear)
    );

    return {
      filteredCertificates: filtered,
      uniqueYears: sortedYears,
      uniqueMonths: finalMonths,
    };
  }, [
    certificates,
    searchQuery,
    filterType,
    filterYear,
    filterMonth,
    dateFrom,
    dateTo,
  ]);
  // --- End Filtering Logic ---

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-3 text-gray-700">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <TeacherNavbar
        onUploadClick={() =>
          showToast("Teachers cannot upload certificates.", "info")
        }
        user={user}
      />

      <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <DashboardCard
            title="Total Certificates"
            value={certificates.length}
            icon={Award}
            color="bg-indigo-100"
            iconColor="text-indigo-600"
          />
          <DashboardCard
            title="Total Students"
            value={new Set(certificates.map((c) => c.rollno)).size}
            icon={Users}
            color="bg-green-100"
            iconColor="text-green-600"
          />
          <DashboardCard
            title="Filtered Results"
            value={filteredCertificates.length}
            icon={Filter}
            color="bg-purple-100"
            iconColor="text-purple-600"
          />
          <DashboardCard
            title="Unique Event Types"
            value={new Set(certificates.map((c) => c.type)).size}
            icon={Award}
            color="bg-yellow-100"
            iconColor="text-yellow-600"
          />
        </motion.div>

        {/* --- Filtering Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <span>Filters & Search</span>
          </h3>

          {/* Row 1: Search and Type Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Roll No or Event Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all">
              <option value="All">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Competition">Competition</option>
              <option value="Conference">Conference</option>
              <option value="Seminar">Seminar</option>
              <option value="Course">Course</option>
            </select>
          </div>

          {/* Row 2: Year and Month Filters (Grouped) */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 border-t pt-4 border-gray-100">
            <h4 className="text-md font-semibold text-gray-700 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>By Year & Month</span>
            </h4>
            <div className="flex flex-1 gap-3">
              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setFilterMonth("All");
                }}
                className="w-1/2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all">
                <option value="All">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                disabled={filterYear === "All" && uniqueMonths.length > 0}
                className="w-1/2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 cursor-pointer transition-all">
                <option value="All">All Months</option>
                {uniqueMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Date Range Filter (Separated) */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 border-t pt-4 border-gray-100">
            <h4 className="text-md font-semibold text-gray-700 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>By Date Range</span>
            </h4>
            <div className="flex flex-1 gap-3">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-1/2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                title="Filter From Date"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-1/2 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
                title="Filter To Date"
              />
            </div>
          </div>
        </motion.div>
        {/* --- End Filtering Section --- */}

        {/* Certificate Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <CertificateTableTeacher
            certificates={filteredCertificates}
            onView={handleView}
          />
        </motion.div>
      </div>

      <ViewModal
        certificate={viewingCert}
        isOpen={!!viewingCert}
        onClose={() => setViewingCert(null)}
      />
    </div>
  );
}
