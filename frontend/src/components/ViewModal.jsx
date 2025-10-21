// src/components/ViewModal.jsx (MODIFIED)
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const ViewModal = ({ certificate, isOpen, onClose }) => {
  const isPdf =
    certificate && certificate.file.startsWith("data:application/pdf;");

  return (
    <AnimatePresence>
      {isOpen && certificate && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/30 backdrop-blur-md z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {certificate.eventName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {certificate.type}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* === File Display Area (Conditional Rendering) === */}
              <div className="p-6">
                {isPdf ? (
                  // Use iframe for PDF files
                  <iframe
                    src={certificate.file}
                    title={`${certificate.eventName} PDF`}
                    className="w-full h-[60vh] rounded-lg shadow-lg border-none"
                    style={{ border: "none" }}
                  />
                ) : (
                  // Use img for image files
                  <img
                    src={certificate.file}
                    alt={certificate.eventName}
                    className="w-full rounded-lg shadow-lg"
                  />
                )}

                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Description
                    </h3>
                    <p className="text-gray-600">{certificate.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Date
                    </h3>
                    <p className="text-gray-600">
                      {new Date(certificate.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              {/* === END File Display Area === */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
