// NOTE: For a real application, you would need a much more complex function
// to map eventName/type/description to the exact points in the table.
// This is a simplified version mirroring the structure provided.

export const MAX_POINTS_BY_CATEGORY = {
  MOOCs: 40,
  "Technical/Research Participation": 10,
  "Rural Reporting": 10,
  "Sports/Games": 30,
  Other: 20, // Default category max
};

// Simplified point calculation logic for the purpose of client-side understanding
// NOTE: The server's calculateAndCapPoints function is the authority.
export const getPointsInfo = (activity) => {
  const defaultCategory = "Other";
  const defaultPoints = 10;
  const defaultMax = 20;

  // Example: Check for MOOCs
  if (
    activity.type === "Course" ||
    (activity.eventName && activity.eventName.toLowerCase().includes("mooc"))
  ) {
    return { category: "MOOCs", points: 20, maxPoints: 40 };
  }

  // Example: Check for Technical Participant (Assuming this is complex matching)
  if (
    activity.type === "Workshop" &&
    (activity.eventName + activity.description)
      .toLowerCase()
      .includes("organizer")
  ) {
    return {
      category: "Technical/Research Participation",
      points: 5,
      maxPoints: 10,
    };
  }

  // Example: Check for Technical Participant
  if (
    activity.type === "Workshop" &&
    (activity.eventName + activity.description)
      .toLowerCase()
      .includes("participant")
  ) {
    return {
      category: "Technical/Research Participation",
      points: 3,
      maxPoints: 6,
    };
  }

  // In a final design, all 24 categories would be explicitly matched here.

  return {
    category: defaultCategory,
    points: defaultPoints,
    maxPoints: defaultMax,
  };
};
