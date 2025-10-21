import activityModel from "../models/activityModel.js";

// Utility function (unchanged, but relies on activityModel)
const saveFileToStorage = (base64String, userId) => {
  if (base64String && base64String.startsWith("data:")) {
    return base64String;
  }
  return base64String || "uploads/default_certificate.pdf";
};

// ----------------------------------------------------------------------
// Populate Configuration
// We want to fetch the rollno from the Student model referenced by userId.
// We assume the Student model has a field named 'rollno'.
const populateConfig = {
  path: "userId",
  select: "rollno -_id", // Select only 'rollno' and exclude the ID of the Student document
};
// ----------------------------------------------------------------------

// Retrieve activities for the authenticated Student (Teacher role check skipped here)
export const getactivityModels = async (req, res) => {
  if (!req.userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required for this operation.",
    });
  }

  try {
    const activityModels = await activityModel
      .find({ userId: req.userId })
      .populate(populateConfig) // <-- ADDED POPULATE
      .sort({
        date: -1,
      });

    // Remap data to put rollno at the top level for cleaner client-side use
    const finalActivityModels = activityModels.map((doc) => ({
      ...doc.toObject(),
      rollno: doc.userId ? doc.userId.rollno : "N/A",
      userId: doc.userId ? doc.userId._id : null,
    }));

    res
      .status(200)
      .json({ success: true, activityModels: finalActivityModels });
  } catch (error) {
    console.error(
      "Failed to fetch activityModels for user:",
      req.userId,
      "\nError:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch activityModels due to a database error.",
      error: error.message,
    });
  }
};

export const addactivityModel = async (req, res) => {
  try {
    const { eventName, description, date, type, file } = req.body;

    const fileData = saveFileToStorage(file, req.userId);

    const newCert = new activityModel({
      userId: req.userId,
      eventName,
      description,
      date,
      type,
      file: fileData,
    });

    await newCert.save();

    // Populate the newly saved document to return rollno to the frontend list update
    await newCert.populate(populateConfig);

    // Remap before sending
    const newCertObject = {
      ...newCert.toObject(),
      rollno: newCert.userId ? newCert.userId.rollno : "N/A",
      userId: newCert.userId ? newCert.userId._id : null,
    };

    res.status(201).json({ success: true, activityModel: newCertObject });
  } catch (error) {
    console.error("Failed to add activityModel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add activityModel",
      error: error.message,
    });
  }
};

export const updateactivityModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, description, date, type, file } = req.body;

    const fileData = saveFileToStorage(file, req.userId);

    let cert = await activityModel.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { eventName, description, date, type, file: fileData },
      { new: true }
    );

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: "Activity Model not found or unauthorized to update.",
      });
    }

    // Populate the updated document
    await cert.populate(populateConfig);

    // Remap before sending
    const updatedCertObject = {
      ...cert.toObject(),
      rollno: cert.userId ? cert.userId.rollno : "N/A",
      userId: cert.userId ? cert.userId._id : null,
    };

    res.status(200).json({ success: true, activityModel: updatedCertObject });
  } catch (error) {
    console.error("Failed to update activityModel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update activityModel",
      error: error.message,
    });
  }
};

export const deleteactivityModel = async (req, res) => {
  try {
    const { id } = req.params;

    const cert = await activityModel.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: "Activity Model not found or unauthorized to delete.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Activity Model deleted successfully" });
  } catch (error) {
    console.error("Failed to delete activityModel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete activityModel",
      error: error.message,
    });
  }
};

// Retrieve ALL activities for the Teacher Dashboard
export const getallactivityModels = async (req, res) => {
  // NOTE: Authorization check for Teacher role should happen in middleware (userAuth)
  // or at the start of this function if userAuth only checks for login.

  try {
    const activityModels = await activityModel
      .find({}) // Fetch ALL documents
      .populate(populateConfig) // <-- ADDED POPULATE
      .sort({ date: -1 })
      .select("-description");

    // Remap data to put rollno at the top level
    const finalActivityModels = activityModels.map((doc) => ({
      ...doc.toObject(),
      rollno: doc.userId ? doc.userId.rollno : "N/A",
      userId: doc.userId ? doc.userId._id : null,
    }));

    res
      .status(200)
      .json({ success: true, activityModels: finalActivityModels });
  } catch (error) {
    console.error("Failed to fetch all activities:", error);
    res.status(500).json({ success: false, message: "Database error." });
  }
};
