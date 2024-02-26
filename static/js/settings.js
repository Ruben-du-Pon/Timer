/**
 * Detects which gradient type is needed
 *
 * @param {string} timerShape A string representing the shape of the timer
 * @returns A string containing the correct gradient type
 */
export function detectGradientType(timerShape) {
  return timerShape === "circle"
    ? "conic-gradient("
    : timerShape === "rectangle"
    ? "linear-gradient(to left, "
    : "conic-gradient";
}

/**
 * Loads the colour scheme based on API data
 */
function loadColourScheme() {
  fetch("/api/css_loader")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error. Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Remove the existing CSS files before loading the new ones
      removeCSS();
      // Use the retrieved settings to load the appropriate CSS file
      loadCSS(baseUrl + "css/style" + data.colour_scheme + ".css");
    })
    .catch((error) => console.error("Error loading settings:", error));
}

/**
 * Loads the correct CSS file
 *
 * @param {string} href A string representing the link to the stylesheet
 */
function loadCSS(href) {
  // Create a new <link> element
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.href = href;
  linkElement.name = "dynamic";

  // Add the newly created linkElement to the head section
  document.head.appendChild(linkElement);
}

/**
 * Loads settings based on API data
 */
function loadSettings() {
  fetch("/api/css_loader")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error. Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Set the gradient type of the timers based on timerShape
      document.getElementsByName("subTimer").forEach(
        (subTimer) =>
          (subTimer.style.cssText += ` --gradient-type: ${detectGradientType(
            data.timer_shape
          )}rgba(215, 155, 0, 0) 0%,
            rgba(215, 155, 0, 0) var(--percent),
            rgb(215, 140, 0) var(--percent)`)
      );
      document.getElementById(
        "mainTimer"
      ).style.cssText += ` --gradient-type: ${detectGradientType(
        data.timer_shape
      )}rgba(215, 155, 0, 0) 0%,
      rgba(215, 155, 0, 0) var(--percent),
      rgb(215, 140, 0) var(--percent)`;
      // Remove the existing CSS files before loading the new ones
      removeCSS();
      // Use the retrieved settings to load the appropriate CSS files
      loadCSS(baseUrl + "css/" + data.threshold_behaviour + ".css");
      loadCSS(baseUrl + "css/" + data.timer_shape + ".css");
      loadCSS(baseUrl + "css/style" + data.colour_scheme + ".css");
    })
    .catch((error) => console.error("Error loading settings:", error));
}

/**
 * Removes any existing link elements with the "dynamic" name attribute
 */
function removeCSS() {
  const existingLinks = document.querySelectorAll('link[name="dynamic"]');
  existingLinks.forEach((existingLink) => existingLink.remove());
}

// Load settings when the <head> section is loaded on the settings page
if (window.location.pathname.includes("timer")) {
  loadSettings();
} else {
  loadColourScheme();
}

console.log("settings.js loaded");
