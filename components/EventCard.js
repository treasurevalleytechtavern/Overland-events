import { formatDisplayDate, formatTimeRange, getNextOccurrence } from "../eventUtils.js";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function detailLine(label, value) {
  return value ? `<p class="event-detail"><strong>${label}:</strong> ${escapeHtml(value)}</p>` : "";
}

export function renderEventCard(event, variant = "upcoming") {
  const nextOccurrence = variant === "upcoming" ? getNextOccurrence(event) : "";
  const dateMarkup = nextOccurrence ? `<p class="event-date">${escapeHtml(formatDisplayDate(nextOccurrence))}</p>` : "";
  const imageMarkup = event.eventImage ? `
    <div class="event-card-image">
      <img src="${escapeHtml(event.eventImage)}" alt="${escapeHtml(event.eventName)}">
    </div>
  ` : "";
  const signupMarkup = event.signupRequired ? detailLine("Signup", event.signupNote || "Signup required") : "";

  return `
    <article class="event-card ${event.featuredEvent ? "is-featured" : ""}">
      ${imageMarkup}
      <div class="event-card-copy">
        <div class="event-card-topline">
          ${event.featuredEvent ? `<span class="status-badge featured">Featured</span>` : ""}
          ${event.vibe ? `<span class="vibe-tag">${escapeHtml(event.vibe)}</span>` : ""}
        </div>
        <h3>${escapeHtml(event.eventName)}</h3>
        ${dateMarkup}
        <p class="event-time">${escapeHtml(formatTimeRange(event))}</p>
        <p class="event-description">${escapeHtml(event.shortDescription)}</p>
        ${event.highlightHook ? `<p class="event-hook">${escapeHtml(event.highlightHook)}</p>` : ""}
        ${detailLine("Specials", event.specialsDeals)}
        ${detailLine("Location", event.location)}
        ${signupMarkup}
        ${event.callToAction ? `<p class="event-action">${escapeHtml(event.callToAction)}</p>` : ""}
      </div>
    </article>
  `;
}
