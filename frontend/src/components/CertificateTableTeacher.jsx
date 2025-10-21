import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Eye, FileText } from "lucide-react";

export const CertificateTableTeacher = ({ certificates, onView }) => {
  const isPdf = (file) => file && file.startsWith("data:application/pdf;");

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Roll No
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Event Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {certificates.map((cert) => (
                <motion.tr
                  key={cert._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-6 py-4">
                    {isPdf(cert.file) ? (
                      <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-lg shadow-sm">
                        <FileText className="w-8 h-8 text-red-600" />
                      </div>
                    ) : (
                      <img
                        src={cert.file}
                        alt={cert.eventName}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {cert.rollno || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      {cert.eventName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(cert.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                      {cert.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onView(cert)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="View Certificate">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {certificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No certificates match the current filters.
          </p>
        </div>
      )}
    </div>
  );
};
