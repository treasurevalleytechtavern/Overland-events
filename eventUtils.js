import { weekDays } from "./eventTypes.js";

const dayNameByIndex = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

function parseDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday(referenceDate = new Date()) {
  return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
}

function addDays(date, count) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + count);
  return nextDate;
}

function addMonths(date, count) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + count);
  return nextDate;
}

function addYears(date, count) {
  const nextDate = new Date(date);
  nextDate.setFullYear(nextDate.getFullYear() + count);
  return nextDate;
}

function isAfterEndDate(date, event) {
  const endDate = parseDate(event.endDate);
  return endDate ? date > endDate : false;
}

function getWeeklyDays(event, startDate) {
  if (Array.isArray(event.recurrenceDays) && event.recurrenceDays.length) {
    return event.recurrenceDays.filter((day) => weekDays.includes(day));
  }

  return [dayNameByIndex[startDate.getDay()]];
}

function getNextWeeklyOccurrence(event, startDate, today) {
  const weeklyDays = getWeeklyDays(event, startDate);
  const startDay = startDate > today ? startDate : today;

  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = addDays(startDay, offset);
    const candidateName = dayNameByIndex[candidate.getDay()];

    if (weeklyDays.includes(candidateName) && candidate >= startDate && !isAfterEndDate(candidate, event)) {
      return formatDateValue(candidate);
    }
  }

  return null;
}

export function getNextOccurrence(event, referenceDate = new Date()) {
  const startDate = parseDate(event.startDate);
  const today = startOfToday(referenceDate);

  if (!startDate) {
    return null;
  }

  if (event.eventType === "Daily Anchor") {
    return startDate <= today ? formatDateValue(today) : formatDateValue(startDate);
  }

  if (event.eventType === "One-Time Event" || event.recurrenceType === "None (Once)") {
    return startDate >= today && !isAfterEndDate(startDate, event) ? formatDateValue(startDate) : null;
  }

  if (event.endDate && parseDate(event.endDate) < today) {
    return null;
  }

  if (event.recurrenceType === "Daily") {
    const candidate = startDate > today ? startDate : today;
    return isAfterEndDate(candidate, event) ? null : formatDateValue(candidate);
  }

  if (event.recurrenceType === "Weekly") {
    return getNextWeeklyOccurrence(event, startDate, today);
  }

  if (event.recurrenceType === "Monthly") {
    let candidate = new Date(startDate);

    while (candidate < today) {
      candidate = addMonths(candidate, 1);
    }

    return isAfterEndDate(candidate, event) ? null : formatDateValue(candidate);
  }

  if (event.recurrenceType === "Annually") {
    let candidate = new Date(startDate);

    while (candidate < today) {
      candidate = addYears(candidate, 1);
    }

    return isAfterEndDate(candidate, event) ? null : formatDateValue(candidate);
  }

  return null;
}

export function isEventVisible(event, referenceDate = new Date()) {
  if (event.status !== "Published" || !event.showInWidget || event.isCancelled) {
    return false;
  }

  if (event.eventType === "Daily Anchor") {
    const startDate = parseDate(event.startDate);
    return Boolean(startDate && startDate <= startOfToday(referenceDate));
  }

  return Boolean(getNextOccurrence(event, referenceDate));
}

export function isEventInPast(event, referenceDate = new Date()) {
  return event.eventType !== "Daily Anchor" && !getNextOccurrence(event, referenceDate);
}

export function filterDailyEvents(events, referenceDate = new Date()) {
  return events
    .filter((event) => event.eventType === "Daily Anchor" && isEventVisible(event, referenceDate))
    .sort((a, b) => a.eventName.localeCompare(b.eventName));
}

export function filterUpcomingEvents(events, referenceDate = new Date()) {
  return sortByNextOccurrence(events
    .filter((event) => event.eventType !== "Daily Anchor" && isEventVisible(event, referenceDate)), referenceDate);
}

export function sortByNextOccurrence(events, referenceDate = new Date()) {
  return events.slice().sort((a, b) => {
    const aOccurrence = getNextOccurrence(a, referenceDate) || "";
    const bOccurrence = getNextOccurrence(b, referenceDate) || "";
    return aOccurrence.localeCompare(bOccurrence) || a.eventName.localeCompare(b.eventName);
  });
}

export function formatDisplayDate(value) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function formatShortDate(value) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatTimeRange(event) {
  const start = formatTime(event.startTime);
  const end = formatTime(event.endTime);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || "";
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const [hourValue, minuteValue] = String(value).split(":").map(Number);
  const date = new Date();
  date.setHours(hourValue || 0, minuteValue || 0, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function getStartDateSortValue(event) {
  return event.startDate || "9999-12-31";
}
