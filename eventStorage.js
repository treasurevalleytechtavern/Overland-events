import { normalizeEvent } from "./eventTypes.js";

const storageKey = "overlandBar.events.v1";
const seedUrl = new URL("./eventsData.json", import.meta.url);

function readStoredEvents() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getEventsFromPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.events)) {
    return payload.events;
  }

  return [];
}

export async function loadEvents() {
  const storedEvents = readStoredEvents();

  if (Array.isArray(storedEvents)) {
    return storedEvents.map(normalizeEvent);
  }

  const response = await fetch(seedUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Events data was not available.");
  }

  return getEventsFromPayload(await response.json()).map(normalizeEvent);
}

export function saveEvents(events) {
  const normalizedEvents = events.map(normalizeEvent);
  window.localStorage.setItem(storageKey, JSON.stringify(normalizedEvents));
  window.dispatchEvent(new CustomEvent("overland-events-updated", {
    detail: { events: normalizedEvents }
  }));
  return normalizedEvents;
}

export function clearStoredEvents() {
  window.localStorage.removeItem(storageKey);
}
