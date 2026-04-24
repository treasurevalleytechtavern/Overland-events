import { createEventsWidget } from "./components/EventsWidget.js";

const root = document.querySelector("#events-widget-root");

if (root) {
  createEventsWidget(root);
}

function sendEmbedHeight() {
  const height = Math.ceil(document.documentElement.scrollHeight);

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      source: "overland-events",
      type: "resize",
      height
    }, "*");
  }
}

window.addEventListener("load", sendEmbedHeight);
window.addEventListener("resize", sendEmbedHeight);
window.setTimeout(sendEmbedHeight, 250);
window.setTimeout(sendEmbedHeight, 1000);

if ("ResizeObserver" in window) {
  const observer = new ResizeObserver(sendEmbedHeight);
  observer.observe(document.body);
}
