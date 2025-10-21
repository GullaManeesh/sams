import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Eye, Award, FileText } from "lucide-react";

export const CertificateTable = ({
  certificates,
  onEdit,
  onDelete,
  onView,
}) => {
  const isPdf = (file) => file && file.startsWith("data:application/pdf;");

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Event Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
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
                  className="hover:bg-gray-50 transition-colors">
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
                      {cert.eventName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {cert.description}
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
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onView(cert)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(cert)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(cert._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete">
                        <Trash2 className="w-4 h-4" />
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
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No certificates found</p>
          <p className="text-gray-400 text-sm mt-2">
            Upload your first certificate to get started
          </p>
        </div>
      )}
    </div>
  );
};
