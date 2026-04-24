import { createEventsWidget } from "./components/EventsWidget.js";

const root = document.querySelector("#events-widget-root");

if (root) {
  createEventsWidget(root);
}
