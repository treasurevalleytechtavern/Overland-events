import { loadEvents } from "../eventStorage.js";
import { filterDailyEvents, filterUpcomingEvents } from "../eventUtils.js";
import { renderEventCard } from "./EventCard.js";

export function createEventsWidget(root) {
  let events = [];

  function render() {
    const dailyEvents = filterDailyEvents(events);
    const upcomingEvents = filterUpcomingEvents(events);

    root.innerHTML = `
      <section class="events-widget" aria-labelledby="events-widget-title">
        <div class="events-section-heading">
          <div>
            <p class="eyebrow">Overland Bar</p>
            <h2 id="events-widget-title">Events</h2>
          </div>
        </div>

        <section class="event-group" aria-labelledby="daily-events-title">
          <div class="events-section-heading compact-heading">
            <div>
              <p class="eyebrow">Daily Events</p>
              <h3 id="daily-events-title">Regular lineup</h3>
            </div>
          </div>
          <div class="event-card-grid">
            ${dailyEvents.length ? dailyEvents.map((event) => renderEventCard(event, "daily")).join("") : `<p class="empty-state">Check back soon for our regular lineup.</p>`}
          </div>
        </section>

        <section class="event-group" aria-labelledby="upcoming-events-title">
          <div class="events-section-heading compact-heading">
            <div>
              <p class="eyebrow">Upcoming Events</p>
              <h3 id="upcoming-events-title">Coming up</h3>
            </div>
          </div>
          <div class="event-card-grid">
            ${upcomingEvents.length ? upcomingEvents.map((event) => renderEventCard(event, "upcoming")).join("") : `<p class="empty-state">No upcoming events yet&mdash;stay tuned.</p>`}
          </div>
        </section>

        <p class="tiktok-note">
          You might see someone filming around the bar for
          <a href="https://www.tiktok.com/@overlandbar" target="_blank" rel="noopener">our TikTok</a>
          <span aria-hidden="true">&#128241;</span><br>
          If you'd rather not be included, just let us know!
        </p>
      </section>
    `;
  }

  async function load() {
    try {
      events = await loadEvents();
      render();
    } catch {
      root.innerHTML = `<p class="empty-state">Unable to load events right now.</p>`;
    }
  }

  window.addEventListener("overland-events-updated", (event) => {
    if (Array.isArray(event.detail.events)) {
      events = event.detail.events;
      render();
    }
  });

  load();

  return {
    render,
    load
  };
}
