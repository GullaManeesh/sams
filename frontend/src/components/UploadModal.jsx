import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText } from "lucide-react"; // Import FileText

export const UploadModal = ({ isOpen, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState(
    editData || {
      eventName: "",
      description: "",
      date: "",
      type: "Workshop",
      file: "", // file stores the base64 URL of the file
    }
  );

  // Utility to check if the file is a PDF based on the Base64 prefix
  const isPdf = (file) => file && file.startsWith("data:application/pdf;");

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else if (!isOpen) {
      setFormData({
        eventName: "",
        description: "",
        date: "",
        type: "Workshop",
        file: "",
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = () => {
    if (!formData.eventName || !formData.description || !formData.date) {
      onSave(null, "Please fill all required fields", "error");
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, file: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/30 backdrop-blur-md z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editData ? "Edit Certificate" : "Upload New Certificate"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* --- Event Name --- */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) =>
                      setFormData({ ...formData, eventName: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter event name"
                  />
                </div>

                {/* --- Description --- */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Brief description of the event"
                  />
                </div>

                {/* --- Date & Type --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Event Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all cursor-pointer">
                      <option value="Workshop">Workshop</option>
                      <option value="Competition">Competition</option>
                      <option value="Conference">Conference</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Course">Course</option>
                    </select>
                  </div>
                </div>

                {/* --- Upload Field (Modified for PDF/Image Preview) --- */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Upload Certificate
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-indigo-500 transition-colors h-40 sm:h-60 overflow-hidden">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="file-upload"
                    />

                    {formData.file ? (
                      // Conditional check for PDF vs Image
                      isPdf(formData.file) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-4">
                          <FileText className="w-16 h-16 text-red-600 mb-2" />
                          <p className="text-sm text-gray-700">
                            PDF Document Loaded
                          </p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                          <img
                            src={formData.file}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      )
                    ) : (
                      // Default upload prompt
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center justify-center h-full">
                        <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF or Image (Max 10MB)
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* --- Buttons --- */}
                <div className="flex justify-end space-x-2 sm:space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm cursor-pointer">
                    {editData ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
