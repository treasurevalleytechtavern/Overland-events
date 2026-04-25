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
  return value ? `<p class="event-detail"><strong>${label}:</strong> ${formatTextWithLinks(value)}</p>` : "";
}

function formatTextWithLinks(value) {
  const urlPattern = /((?:https?:\/\/|www\.)[^\s<]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<]*)?)/gi;
  return escapeHtml(value).replace(urlPattern, (match) => {
    const cleanMatch = match.replace(/[.,!?;:)]+$/, "");
    const trailing = match.slice(cleanMatch.length);
    const href = cleanMatch.startsWith("http://") || cleanMatch.startsWith("https://")
      ? cleanMatch
      : `https://${cleanMatch}`;

    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${cleanMatch}</a>${trailing}`;
  });
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function getContextualCopy(event, occurrenceDate) {
  const date = parseDate(occurrenceDate) || new Date();
  const day = date.getDay();
  const isWeekend = day === 5 || day === 6;
  return {
    hook: isWeekend ? event.weekendHook || event.highlightHook : event.weeknightHook || event.highlightHook,
    callToAction: isWeekend ? event.weekendCallToAction || event.callToAction : event.weeknightCallToAction || event.callToAction
  };
}

function startsAfterEightPm(event) {
  if (!event.startTime) {
    return false;
  }

  const [hourValue, minuteValue] = String(event.startTime).split(":").map(Number);
  const minutes = (hourValue * 60) + (minuteValue || 0);
  return minutes >= 20 * 60;
}

function getVibeVideo(event, occurrenceDate) {
  if (String(event.eventName || "").toLowerCase().includes("happy hour")) {
    return {
      src: "./assets/happy-hour-vibes.mp4?v=20260424-3",
      label: "Happy Hour vibes"
    };
  }

  if (!startsAfterEightPm(event)) {
    return null;
  }

  const date = parseDate(occurrenceDate) || new Date();
  const day = date.getDay();
  const isWeekend = day === 5 || day === 6;

  return {
    src: isWeekend ? "./assets/weekend-vibes.mp4?v=20260424-1" : "./assets/weeknight-vibes.mp4?v=20260424-1",
    label: isWeekend ? "Weekend vibes" : "Weeknight vibes"
  };
}

function getDaysUntilText(dateValue) {
  const occurrenceDate = parseDate(dateValue);

  if (!occurrenceDate) {
    return "";
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayDifference = Math.round((occurrenceDate - startOfToday) / 86400000);

  if (dayDifference === 0) {
    return "Tonight";
  }

  if (dayDifference === 1) {
    return "Tomorrow";
  }

  return `In ${dayDifference} days`;
}

export function renderEventCard(event, variant = "upcoming") {
  const nextOccurrence = variant === "upcoming" ? getNextOccurrence(event) : "";
  const displayOccurrence = nextOccurrence || new Date().toISOString().slice(0, 10);
  const contextualCopy = getContextualCopy(event, displayOccurrence);
  const vibeVideo = getVibeVideo(event, displayOccurrence);
  const countdownText = variant === "upcoming" ? getDaysUntilText(nextOccurrence) : "";
  const dateMarkup = nextOccurrence ? `<p class="event-date">${escapeHtml(formatDisplayDate(nextOccurrence))}</p>` : "";
  const imageMarkup = event.eventImage ? `
    <div class="event-card-image">
      <img src="${escapeHtml(event.eventImage)}" alt="${escapeHtml(event.eventName)}">
    </div>
  ` : "";
  const vibeVideoMarkup = vibeVideo ? `
    <div class="event-vibe-video" aria-label="${escapeHtml(vibeVideo.label)}">
      <video autoplay muted loop playsinline preload="metadata">
        <source src="${escapeHtml(vibeVideo.src)}" type="video/mp4">
      </video>
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
            ${countdownText ? `<span class="countdown-tag">${escapeHtml(countdownText)}</span>` : ""}
          </div>
        ${vibeVideoMarkup}
        <h3>${escapeHtml(event.eventName)}</h3>
        ${dateMarkup}
        <p class="event-time">${escapeHtml(formatTimeRange(event))}</p>
        <p class="event-description">${formatTextWithLinks(event.shortDescription)}</p>
        ${contextualCopy.hook ? `<p class="event-hook">${formatTextWithLinks(contextualCopy.hook)}</p>` : ""}
        ${detailLine("Specials", event.specialsDeals)}
        ${detailLine("Location", event.location)}
        ${signupMarkup}
        ${contextualCopy.callToAction ? `<p class="event-action">${formatTextWithLinks(contextualCopy.callToAction)}</p>` : ""}
      </div>
    </article>
  `;
}
