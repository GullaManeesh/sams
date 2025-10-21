import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Search,
  Upload,
  Award,
  LayoutDashboard,
  Calendar,
  Filter,
} from "lucide-react"; // Added Calendar, Filter icons
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { ToastContainer } from "../components/ToastContainer";
import { Navbar } from "../components/Navbar";
import { UploadModal } from "../components/UploadModal";
import { ViewModal } from "../components/ViewModal";
import { CertificateTable } from "../components/CertificateTable";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [totalScore, setTotalScore] = useState(0); // NEW: State for Total Score

  const [certificates, setCertificates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [toasts, setToasts] = useState([]);

  axios.defaults.withCredentials = true;
  const API_URL = `${import.meta.env.VITE_BACKEND_URL}/activities`;
  const AUTH_URL = `${import.meta.env.VITE_BACKEND_URL}/auth`;

  // --- Toast Helpers ---
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // --- Data Fetching Functions ---
  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const res = await axios.get(`${AUTH_URL}/get-user`);

      if (res.data.success) {
        setUser(res.data.user);
      } else {
        toast.error(res.data.message || "Session expired. Please log in.");
        navigate("/");
      }
    } catch (err) {
      console.error("User fetch error:", err);
      navigate("/");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      // NOTE: Assuming your get-activities now returns { activityModels: [], totalScore: number }
      const res = await axios.get(`${API_URL}/get-activities`);
      const data = res.data.activityModels || [];

      setCertificates(data);
      // setTotalScore(res.data.totalScore || 0); // Placeholder: Capture score from backend
    } catch (err) {
      showToast("Failed to fetch certificates", "error");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCertificates();
  }, []);

  const handleSave = async (formData, errorMessage, errorType) => {
    if (errorMessage) {
      showToast(errorMessage, errorType);
      return;
    }

    try {
      if (editingCert) {
        const res = await axios.put(
          `${API_URL}/update-activity/${editingCert._id}`,
          formData
        );

        const updatedCert = res.data.activityModel;

        setCertificates((prev) =>
          prev.map((cert) =>
            cert._id === editingCert._id ? updatedCert : cert
          )
        );
        showToast("Certificate updated successfully!");
        setEditingCert(null);
      } else {
        const res = await axios.post(`${API_URL}/add-activity`, formData);

        const newCert = res.data.activityModel;

        setCertificates((prev) => [...prev, newCert]);
        showToast("Certificate added successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to save certificate", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/delete-activity/${id}`);
      setCertificates((prev) => prev.filter((cert) => cert._id !== id));
      showToast("Certificate deleted successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete certificate", "error");
    }
  };

  const handleEdit = (cert) => {
    setEditingCert(cert);
    setIsModalOpen(true);
  };

  const handleView = (cert) => {
    setViewingCert(cert);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
  };

  // --- Filtering Logic with Month Filter (Adjusted) ---
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

    const filtered = certificates.filter((cert) => {
      const certDate = cert.date ? new Date(cert.date) : null;

      const certYear =
        certDate && !isNaN(certDate.getFullYear())
          ? certDate.getFullYear().toString()
          : null;

      const certMonth =
        certDate && certYear
          ? (certDate.getMonth() + 1).toString().padStart(2, "0")
          : null;

      if (certYear) {
        years.add(certYear);
      }

      if (certMonth && certYear) {
        months.add(`${certYear}-${certMonth}`);
      }

      // Basic data validity check (optional)
      if (!cert.eventName || !certDate || isNaN(certDate)) {
        // Skip certificate if crucial data is missing/invalid for filtering
        // return false;
      }

      // 1. Search Filter (Event Name/Description)
      const matchesSearch =
        (cert.eventName?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (cert.description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        );

      // 2. Type Filter
      const matchesFilter = filterType === "All" || cert.type === filterType;

      // 3. Date Filtering Logic: Date Range OVERRIDES Year/Month filters
      let matchesDate = true;

      if (dateFrom || dateTo) {
        // If EITHER date range field is set, use Date Range filtering
        matchesDate = true; // Assume true unless checks fail
        if (certDate) {
          if (dateFrom) {
            matchesDate = matchesDate && certDate >= new Date(dateFrom);
          }
          if (dateTo) {
            const dateToInclusive = new Date(dateTo);
            dateToInclusive.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && certDate <= dateToInclusive;
          }
        } else {
          matchesDate = false; // Cannot match range if certDate is invalid
        }

        // NOTE: Year/Month filters are IGNORED when date range is active.
      } else {
        // If Date Range is NOT set, use Year/Month filters
        const matchesYear = filterYear === "All" || certYear === filterYear;
        let matchesMonth = filterMonth === "All";
        if (filterMonth !== "All") {
          matchesMonth = `${certYear}-${certMonth}` === filterMonth;
        }
        matchesDate = matchesYear && matchesMonth;
      }

      return matchesSearch && matchesFilter && matchesDate;
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    const sortedMonths = Array.from(months)
      .map((ym) => {
        const [year, monthIndex] = ym.split("-");
        const monthName = monthNames[parseInt(monthIndex, 10) - 1];
        return {
          value: ym,
          label: `${monthName} ${year}`, // Changed label format to "Oct 2025"
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

  // --- Render Logic ---
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* ... Loading Spinner ... */}
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
      <Navbar onUploadClick={() => setIsModalOpen(true)} user={user} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Certificates
          </h1>
          <p className="text-gray-600">
            Manage and view all your event certificates in one place
          </p>
        </motion.div>

        {/* Dashboard Cards (Include Total Score) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Certificates */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Certificates</p>
                <p className="text-3xl font-bold text-gray-900">
                  {certificates.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* NEW CARD: Total Activity Points (Placeholder) */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Total Activity Points
                </p>
                <p className="text-3xl font-bold text-green-700">
                  {totalScore}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <LayoutDashboard className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Card 2: This Year */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {/* ... Content remains the same ... */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Year</p>
                <p className="text-3xl font-bold text-gray-900">
                  {
                    certificates.filter(
                      (c) =>
                        new Date(c.date).getFullYear() ===
                        new Date().getFullYear()
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Card 3: Event Types */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {/* ... Content remains the same ... */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Event Types</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(certificates.map((c) => c.type)).size}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <LayoutDashboard className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- Filtering Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-3 flex items-center space-x-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <span>Filters</span>
          </h3>

          {/* Row 1: Search and Type Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Event Name or Description..."
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </button>
          </div>

          {/* Row 2: Year/Month and Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 border-t pt-4 border-gray-100">
            {/* Year Filter */}
            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setFilterMonth("All");
              }}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all lg:col-span-1">
              <option value="All">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Month Filter */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              disabled={filterYear === "All" || uniqueMonths.length === 0}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 cursor-pointer transition-all lg:col-span-1">
              <option value="All">All Months</option>
              {uniqueMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            {/* Date Range Separator/Label */}
            <div className="flex items-center justify-center text-sm font-medium text-gray-700 lg:col-span-1">
              <Calendar className="w-4 h-4 mr-1 text-indigo-500" />
              <span>Date Range:</span>
            </div>

            {/* Date From Filter */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all lg:col-span-1"
              title="Filter From Date"
            />

            {/* Date To Filter */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all lg:col-span-1"
              title="Filter To Date"
            />
          </div>
        </motion.div>
        {/* --- End Filtering Section --- */}

        {/* Certificate Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <CertificateTable
            certificates={filteredCertificates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </motion.div>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editData={editingCert}
      />

      <ViewModal
        certificate={viewingCert}
        isOpen={!!viewingCert}
        onClose={() => setViewingCert(null)}
      />
    </div>
  );
}
