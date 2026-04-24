import { createEventForm } from "../../components/EventForm.js";
import { createEventList } from "../../components/EventList.js";
import { normalizeEvent } from "../../eventTypes.js";
import { loadEvents, saveEvents } from "../../eventStorage.js";

const formRoot = document.querySelector("#event-form-panel");
const jsonRoot = document.querySelector("#event-json-panel");
const listRoot = document.querySelector("#event-list-panel");

let events = [];

const eventForm = createEventForm(formRoot, handleSave);
const eventList = createEventList(listRoot, {
  onEdit: (event) => eventForm.edit(event),
  onDelete: handleDelete
});

function setEvents(nextEvents) {
  events = nextEvents.map(normalizeEvent);
  eventList.setEvents(events);
  renderJsonTools();
}

function handleSave(event) {
  const existingIndex = events.findIndex((item) => item.id === event.id);
  const nextEvents = events.slice();

  if (existingIndex === -1) {
    nextEvents.push(event);
  } else {
    nextEvents[existingIndex] = event;
  }

  setEvents(saveEvents(nextEvents));
}

function handleDelete(id) {
  setEvents(saveEvents(events.filter((event) => event.id !== id)));
}

function getPublishJson() {
  return JSON.stringify({ events }, null, 2);
}

function downloadJson() {
  const blob = new Blob([getPublishJson()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "eventsData.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyJson() {
  const status = jsonRoot.querySelector("#json-tools-status");

  try {
    await navigator.clipboard.writeText(getPublishJson());
    status.textContent = "JSON copied.";
  } catch {
    status.textContent = "Copy was blocked by the browser. Select the JSON below and copy it manually.";
  }

  status.hidden = false;
}

function getEventsFromImport(value) {
  const payload = JSON.parse(value);
  const importedEvents = Array.isArray(payload) ? payload : payload.events;

  if (!Array.isArray(importedEvents)) {
    throw new Error("JSON must be an array or an object with an events array.");
  }

  return importedEvents.map(normalizeEvent).filter((event) => event.id && event.eventName);
}

function mergeImportedEvents(importedEvents) {
  const byId = new Map(events.map((event) => [event.id, event]));

  importedEvents.forEach((event) => {
    byId.set(event.id, event);
  });

  setEvents(saveEvents(Array.from(byId.values())));
}

function importFromTextarea() {
  const status = jsonRoot.querySelector("#json-tools-status");
  const textarea = jsonRoot.querySelector("#event-json-import");

  try {
    const importedEvents = getEventsFromImport(textarea.value);
    mergeImportedEvents(importedEvents);
    textarea.value = "";
    status.textContent = `${importedEvents.length} event${importedEvents.length === 1 ? "" : "s"} imported.`;
  } catch (error) {
    status.textContent = error.message || "That JSON could not be imported.";
  }

  status.hidden = false;
}

function importFromFile(file) {
  const status = jsonRoot.querySelector("#json-tools-status");

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const importedEvents = getEventsFromImport(reader.result);
      mergeImportedEvents(importedEvents);
      status.textContent = `${importedEvents.length} event${importedEvents.length === 1 ? "" : "s"} imported from file.`;
    } catch (error) {
      status.textContent = error.message || "That file could not be imported.";
    }

    status.hidden = false;
  });
  reader.readAsText(file);
}

function renderJsonTools() {
  jsonRoot.innerHTML = `
    <div class="events-section-heading compact-heading">
      <div>
        <p class="eyebrow">Publish</p>
        <h2>Event JSON</h2>
      </div>
      <p class="admin-count">${events.length} event${events.length === 1 ? "" : "s"} in this list</p>
    </div>

    <div class="json-tools-panel">
      <div class="form-status" id="json-tools-status" role="status" aria-live="polite" hidden></div>

      <div class="json-actions">
        <button type="button" data-action="download-json">Download eventsData.json</button>
        <button class="quiet-button" type="button" data-action="copy-json">Copy JSON</button>
      </div>

      <label class="form-field">
        <span>Current JSON</span>
        <textarea id="event-json-output" rows="8" readonly>${getPublishJson()}</textarea>
      </label>

      <div class="json-import-grid">
        <label class="form-field">
          <span>Import / merge JSON</span>
          <textarea id="event-json-import" rows="6" placeholder="Paste exported eventsData.json here to add or update events."></textarea>
        </label>
        <div class="json-import-actions">
          <label class="form-field">
            <span>Or choose a JSON file</span>
            <input id="event-json-file" type="file" accept="application/json,.json">
          </label>
          <button class="quiet-button" type="button" data-action="import-json">Add / Update Imported Events</button>
        </div>
      </div>
    </div>
  `;

  jsonRoot.querySelector("[data-action='download-json']").addEventListener("click", downloadJson);
  jsonRoot.querySelector("[data-action='copy-json']").addEventListener("click", copyJson);
  jsonRoot.querySelector("[data-action='import-json']").addEventListener("click", importFromTextarea);
  jsonRoot.querySelector("#event-json-file").addEventListener("change", (event) => {
    importFromFile(event.target.files[0]);
    event.target.value = "";
  });
}

async function init() {
  try {
    setEvents(await loadEvents());
  } catch {
    renderJsonTools();
    listRoot.innerHTML = `<p class="empty-state">Unable to load events right now.</p>`;
  }
}

init();
