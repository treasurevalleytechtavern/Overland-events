import { formatShortDate, formatTimeRange, getStartDateSortValue } from "../eventUtils.js";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function getFilteredEvents(events, filter) {
  if (filter === "Published") {
    return events.filter((event) => event.status === "Published");
  }

  if (filter === "Draft") {
    return events.filter((event) => event.status === "Draft");
  }

  if (filter === "Cancelled") {
    return events.filter((event) => event.isCancelled);
  }

  return events;
}

function sortAdminEvents(events) {
  return events.slice().sort((a, b) => {
    if (a.eventType === "Daily Anchor" && b.eventType !== "Daily Anchor") {
      return -1;
    }

    if (a.eventType !== "Daily Anchor" && b.eventType === "Daily Anchor") {
      return 1;
    }

    return getStartDateSortValue(a).localeCompare(getStartDateSortValue(b)) || a.eventName.localeCompare(b.eventName);
  });
}

export function createEventList(root, { onEdit, onDelete }) {
  let events = [];
  let activeFilter = "All";
  let visibleCount = 5;

  function render() {
    const visibleEvents = sortAdminEvents(getFilteredEvents(events, activeFilter));
    const renderedEvents = visibleEvents.slice(0, visibleCount);
    const hasMoreEvents = visibleEvents.length > visibleCount;

    root.innerHTML = `
      <div class="events-section-heading compact-heading">
        <div>
          <p class="eyebrow">Manage</p>
          <h2>Existing events</h2>
        </div>
        <p class="admin-count">${events.length} saved</p>
      </div>

      <div class="filter-bar" aria-label="Filter events">
        ${["All", "Published", "Draft", "Cancelled"].map((filter) => `
          <button class="filter-button${filter === activeFilter ? " is-active" : ""}" type="button" data-filter="${filter}" aria-pressed="${filter === activeFilter ? "true" : "false"}">${filter}</button>
        `).join("")}
      </div>

      <div class="admin-event-list">
        ${renderedEvents.length ? renderedEvents.map(renderEventItem).join("") : `<p class="empty-state">No ${activeFilter.toLowerCase()} events yet.</p>`}
      </div>

      ${hasMoreEvents ? `<button class="load-more-button" type="button" data-action="view-more-events">View more</button>` : ""}
    `;

    root.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        visibleCount = 5;
        render();
      });
    });

    const viewMoreButton = root.querySelector("[data-action='view-more-events']");

    if (viewMoreButton) {
      viewMoreButton.addEventListener("click", () => {
        visibleCount += 5;
        render();
      });
    }

    root.querySelectorAll("[data-action='edit']").forEach((button) => {
      button.addEventListener("click", () => {
        const event = events.find((item) => item.id === button.dataset.id);

        if (event) {
          onEdit(event);
        }
      });
    });

    root.querySelectorAll("[data-action='delete']").forEach((button) => {
      button.addEventListener("click", () => {
        const event = events.find((item) => item.id === button.dataset.id);

        if (event && window.confirm(`Delete "${event.eventName}"?`)) {
          onDelete(event.id);
        }
      });
    });
  }

  function renderEventItem(event) {
    const badges = [
      `<span class="status-badge ${event.status === "Published" ? "published" : "draft"}">${event.status}</span>`,
      event.featuredEvent ? `<span class="status-badge featured">Featured</span>` : "",
      event.isCancelled ? `<span class="status-badge cancelled">Cancelled</span>` : ""
    ].filter(Boolean).join("");

    return `
      <article class="admin-event-item">
        <div class="admin-event-main">
          <h3>${escapeHtml(event.eventName || "Untitled event")}</h3>
          <p>${escapeHtml(event.eventType)} &middot; ${escapeHtml(formatShortDate(event.startDate) || "No date")}${event.startTime ? ` &middot; ${escapeHtml(formatTimeRange(event))}` : ""}</p>
          <div class="badge-row">${badges}</div>
        </div>
        <div class="admin-event-actions">
          <button class="quiet-button" type="button" data-action="edit" data-id="${escapeHtml(event.id)}">Edit</button>
          <button class="danger-button" type="button" data-action="delete" data-id="${escapeHtml(event.id)}">Delete</button>
        </div>
      </article>
    `;
  }

  function setEvents(nextEvents) {
    events = nextEvents;
    visibleCount = Math.min(Math.max(visibleCount, 5), Math.max(events.length, 5));
    render();
  }

  render();

  return {
    setEvents
  };
}
