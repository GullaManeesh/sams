export const UI_ACTIVITY_RULES = [
  {
    id: 1,
    label: "MOOCs / SWAYAM / NPTEL / Course",
    max: 40,
    subs: [{ subId: 1, label: "Per Course", points: 20 }],
  },

  {
    id: 2,
    label: "Technical Fest / Conference / Hackathons",
    max: 10,
    subs: [
      { subId: 1, label: "Organizer", points: 5 },
      { subId: 2, label: "Participant", points: 3, max: 6 }, // Capped at 6 total for Participant sub-type
    ],
  },

  {
    id: 3,
    label: "Rural Reporting / Harihtharam / Plantation",
    max: 10,
    subs: [
      { subId: 1, label: "Rural Reporting", points: 5 },
      { subId: 2, label: "Hariharam / Plantation", points: 1 },
    ],
  },

  {
    id: 5,
    label: "Participation in Relief camps",
    max: 40,
    subs: [{ subId: 1, label: "Per Camp", points: 20 }],
  },

  {
    id: 13,
    label: "Participation in Sports/Games",
    max: 30,
    subs: [
      { subId: 1, label: "College level", points: 5, max: 10 },
      { subId: 2, label: "University level", points: 10, max: 20 },
      { subId: 3, label: "Region level", points: 12, max: 24 },
      { subId: 4, label: "State level", points: 15, max: 30 },
      { subId: 5, label: "National level", points: 20, max: 30 },
    ],
  },

  {
    id: 9,
    label: "Research Publication (per publication)",
    max: 20,
    subs: [{ subId: 1, label: "Publication", points: 10 }],
  },

  {
    id: 14,
    label: "Cultural Program (Dance, Drama, Music etc.)",
    max: 10,
    subs: [{ subId: 1, label: "Participation", points: 5 }],
  },

  // ... continue mapping all 24 categories ...
];
