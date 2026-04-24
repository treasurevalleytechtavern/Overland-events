export const eventTypes = [
  "Daily Anchor",
  "One-Time Event",
  "Recurring Event"
];

export const recurrenceTypes = [
  "None (Once)",
  "Daily",
  "Weekly",
  "Monthly",
  "Annually"
];

export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const vibes = [
  "",
  "Chill",
  "Social",
  "High Energy",
  "Party / Packed",
  "Competitive"
];

export const locations = [
  "",
  "Main Bar",
  "Patio"
];

export const crowdExpectations = [
  "",
  "Light",
  "Moderate",
  "Busy",
  "Packed"
];

export const statuses = [
  "Draft",
  "Published"
];

export const emptyEvent = {
  id: "",
  eventName: "",
  eventType: "One-Time Event",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  recurrenceType: "None (Once)",
  recurrenceDays: [],
  shortDescription: "",
  vibe: "",
  highlightHook: "",
  weeknightHook: "",
  weeknightCallToAction: "",
  weekendHook: "",
  weekendCallToAction: "",
  specialsDeals: "",
  callToAction: "",
  location: "",
  crowdExpectation: "",
  signupRequired: false,
  signupNote: "",
  showInWidget: true,
  featuredEvent: false,
  status: "Draft",
  isCancelled: false,
  cancellationNote: "",
  eventImage: "",
  contentHooksNotes: ""
};

export function createEventId() {
  return `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeEvent(event = {}) {
  const nextEvent = {
    ...emptyEvent,
    ...event,
    recurrenceDays: Array.isArray(event.recurrenceDays) ? event.recurrenceDays : []
  };

  if (nextEvent.eventType !== "Recurring Event") {
    nextEvent.recurrenceType = "None (Once)";
    nextEvent.recurrenceDays = [];
  }

  if (nextEvent.recurrenceType !== "Weekly") {
    nextEvent.recurrenceDays = [];
  }

  if (!nextEvent.signupRequired) {
    nextEvent.signupNote = "";
  }

  if (!nextEvent.isCancelled) {
    nextEvent.cancellationNote = "";
  }

  return nextEvent;
}
