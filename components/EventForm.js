import {
  crowdExpectations,
  createEventId,
  emptyEvent,
  eventTypes,
  locations,
  normalizeEvent,
  recurrenceTypes,
  statuses,
  vibes,
  weekDays
} from "../eventTypes.js";

function optionList(options, selectedValue) {
  return options.map((option) => `
    <option value="${option}"${option === selectedValue ? " selected" : ""}>${option || "Select one"}</option>
  `).join("");
}

function checked(value) {
  return value ? " checked" : "";
}

function escapeAttribute(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function textValue(event, key) {
  return escapeAttribute(event[key]);
}

export function createEventForm(root, onSave) {
  let editingEventId = "";
  let currentEvent = { ...emptyEvent };

  function render() {
    const event = normalizeEvent({ ...emptyEvent, ...currentEvent });
    const isEditing = Boolean(editingEventId);

    root.innerHTML = `
      <div class="events-section-heading">
        <div>
          <p class="eyebrow">Admin</p>
          <h1>${isEditing ? "Edit event" : "Add an event"}</h1>
        </div>
        <button class="quiet-button" type="button" data-action="reset-form"${isEditing ? "" : " hidden"}>Cancel edit</button>
      </div>

      <form class="event-admin-form" id="event-admin-form">
        <div class="form-status" id="event-form-status" role="status" aria-live="polite" hidden></div>

        <fieldset>
          <legend>Basic Info</legend>
          <div class="form-grid two-column">
            <label class="form-field">
              <span>Event name</span>
              <input name="eventName" type="text" required value="${textValue(event, "eventName")}" placeholder="Karaoke, trivia, band night">
            </label>
            <label class="form-field">
              <span>Event type</span>
              <select name="eventType" required>${optionList(eventTypes, event.eventType)}</select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Date &amp; Time</legend>
          <div class="form-grid four-column">
            <label class="form-field">
              <span>Start date</span>
              <input name="startDate" type="date" required value="${textValue(event, "startDate")}">
            </label>
            <label class="form-field">
              <span>End date</span>
              <input name="endDate" type="date" value="${textValue(event, "endDate")}">
            </label>
            <label class="form-field">
              <span>Start time</span>
              <input name="startTime" type="time" required value="${textValue(event, "startTime")}">
            </label>
            <label class="form-field">
              <span>End time</span>
              <input name="endTime" type="time" value="${textValue(event, "endTime")}">
            </label>
          </div>
        </fieldset>

        <fieldset class="conditional-group" data-conditional="recurrence">
          <legend>Recurrence</legend>
          <div class="form-grid two-column">
            <label class="form-field">
              <span>Recurrence type</span>
              <select name="recurrenceType">${optionList(recurrenceTypes, event.recurrenceType)}</select>
            </label>
          </div>
          <div class="checkbox-group" data-conditional="recurrence-days">
            <p class="form-label">Recurrence days</p>
            <div class="checkbox-row">
              ${weekDays.map((day) => `
                <label class="check-pill">
                  <input name="recurrenceDays" type="checkbox" value="${day}"${checked(event.recurrenceDays.includes(day))}>
                  <span>${day}</span>
                </label>
              `).join("")}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Description</legend>
          <label class="form-field">
            <span>Short description</span>
            <textarea name="shortDescription" required rows="3" placeholder="A quick 1-2 sentence summary for guests.">${textValue(event, "shortDescription")}</textarea>
          </label>
        </fieldset>

        <fieldset>
          <legend>Marketing / Experience</legend>
          <div class="form-grid two-column">
            <label class="form-field">
              <span>Vibe</span>
              <select name="vibe">${optionList(vibes, event.vibe)}</select>
            </label>
            <label class="form-field">
              <span>Highlight hook</span>
              <input name="highlightHook" type="text" value="${textValue(event, "highlightHook")}" placeholder="Why come out?">
            </label>
          </div>
          <div class="form-grid two-column">
            <label class="form-field">
              <span>Specials / deals</span>
              <input name="specialsDeals" type="text" value="${textValue(event, "specialsDeals")}" placeholder="Drink specials, food deals, prizes">
            </label>
            <label class="form-field">
              <span>Call to action</span>
              <input name="callToAction" type="text" value="${textValue(event, "callToAction")}" placeholder="Arrive early, sign up at 9">
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Operational</legend>
          <div class="form-grid two-column">
            <label class="form-field">
              <span>Location</span>
              <select name="location">${optionList(locations, event.location)}</select>
            </label>
            <label class="form-field admin-only">
              <span>Crowd expectation (admin only)</span>
              <select name="crowdExpectation">${optionList(crowdExpectations, event.crowdExpectation)}</select>
            </label>
          </div>
          <label class="switch-row">
            <input name="signupRequired" type="checkbox"${checked(event.signupRequired)}>
            <span>Signup required</span>
          </label>
          <label class="form-field" data-conditional="signup-note">
            <span>Signup note</span>
            <input name="signupNote" type="text" value="${textValue(event, "signupNote")}" placeholder="Sign up with the bartender">
          </label>
        </fieldset>

        <fieldset>
          <legend>Display / Visibility</legend>
          <div class="toggle-grid">
            <label class="switch-row">
              <input name="showInWidget" type="checkbox"${checked(event.showInWidget)}>
              <span>Show in widget</span>
            </label>
            <label class="switch-row">
              <input name="featuredEvent" type="checkbox"${checked(event.featuredEvent)}>
              <span>Featured event</span>
            </label>
            <label class="switch-row">
              <input name="isCancelled" type="checkbox"${checked(event.isCancelled)}>
              <span>Cancelled</span>
            </label>
          </div>
          <div class="form-grid two-column">
            <label class="form-field">
              <span>Status</span>
              <select name="status">${optionList(statuses, event.status)}</select>
            </label>
            <label class="form-field" data-conditional="cancellation-note">
              <span>Cancellation note</span>
              <input name="cancellationNote" type="text" value="${textValue(event, "cancellationNote")}" placeholder="Short internal note">
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Media</legend>
          <label class="form-field">
            <span>Event image URL</span>
            <input name="eventImage" type="url" value="${textValue(event, "eventImage")}" placeholder="https://...">
          </label>
        </fieldset>

        <fieldset>
          <legend>Internal Notes</legend>
          <label class="form-field admin-only">
            <span>Content hooks / notes (admin only)</span>
            <textarea name="contentHooksNotes" rows="4" placeholder="TikTok ideas, reminders, staff notes.">${textValue(event, "contentHooksNotes")}</textarea>
          </label>
        </fieldset>

        <div class="form-actions">
          <button type="submit">${isEditing ? "Update Event" : "Save Event"}</button>
          <button class="quiet-button" type="button" data-action="reset-form">Reset</button>
        </div>
      </form>
    `;

    bindEvents();
    updateConditionalFields();
  }

  function bindEvents() {
    const form = root.querySelector("#event-admin-form");

    root.querySelectorAll("[data-action='reset-form']").forEach((button) => {
      button.addEventListener("click", reset);
    });

    form.addEventListener("change", updateConditionalFields);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      save(form);
    });
  }

  function updateConditionalFields() {
    const form = root.querySelector("#event-admin-form");
    const eventType = form.elements.eventType.value;
    const recurrenceType = form.elements.recurrenceType ? form.elements.recurrenceType.value : "";
    const signupRequired = form.elements.signupRequired.checked;
    const isCancelled = form.elements.isCancelled.checked;

    setHidden("[data-conditional='recurrence']", eventType !== "Recurring Event");
    setHidden("[data-conditional='recurrence-days']", eventType !== "Recurring Event" || recurrenceType !== "Weekly");
    setHidden("[data-conditional='signup-note']", !signupRequired);
    setHidden("[data-conditional='cancellation-note']", !isCancelled);
  }

  function setHidden(selector, shouldHide) {
    const element = root.querySelector(selector);

    if (element) {
      element.hidden = shouldHide;
    }
  }

  function save(form) {
    const formData = new FormData(form);
    const eventType = formData.get("eventType");
    const recurrenceType = formData.get("recurrenceType") || "None (Once)";
    const recurrenceSelect = form.elements.recurrenceType;

    if (recurrenceSelect) {
      recurrenceSelect.setCustomValidity("");
    }

    if (eventType === "Recurring Event" && recurrenceType === "None (Once)") {
      recurrenceSelect.setCustomValidity("Choose Daily, Weekly, Monthly, or Annually.");
      recurrenceSelect.reportValidity();
      return;
    }

    const event = normalizeEvent({
      id: editingEventId || createEventId(),
      eventName: formData.get("eventName").trim(),
      eventType,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      recurrenceType,
      recurrenceDays: formData.getAll("recurrenceDays"),
      shortDescription: formData.get("shortDescription").trim(),
      vibe: formData.get("vibe"),
      highlightHook: formData.get("highlightHook").trim(),
      specialsDeals: formData.get("specialsDeals").trim(),
      callToAction: formData.get("callToAction").trim(),
      location: formData.get("location"),
      crowdExpectation: formData.get("crowdExpectation"),
      signupRequired: formData.has("signupRequired"),
      signupNote: formData.get("signupNote").trim(),
      showInWidget: formData.has("showInWidget"),
      featuredEvent: formData.has("featuredEvent"),
      status: formData.get("status"),
      isCancelled: formData.has("isCancelled"),
      cancellationNote: formData.get("cancellationNote").trim(),
      eventImage: formData.get("eventImage").trim(),
      contentHooksNotes: formData.get("contentHooksNotes").trim()
    });

    const statusMessage = editingEventId ? "Event updated." : "Event saved.";
    onSave(event);
    editingEventId = "";
    currentEvent = { ...emptyEvent };
    render();
    showStatus(statusMessage);
  }

  function showStatus(message) {
    const status = root.querySelector("#event-form-status");

    if (!status) {
      return;
    }

    status.textContent = message;
    status.hidden = false;
    window.setTimeout(() => {
      status.hidden = true;
    }, 2400);
  }

  function edit(event) {
    editingEventId = event.id;
    currentEvent = normalizeEvent(event);
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    editingEventId = "";
    currentEvent = { ...emptyEvent };
    render();
  }

  render();

  return {
    edit,
    reset
  };
}
