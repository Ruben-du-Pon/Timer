// Import startTimer and setExampleVars functions from timerscripts.js
import { setExampleVars } from "./timerscripts.js";
// Import detectGradientType function from settings.js
import { detectGradientType } from "./settings.js";
// Import timer classes
import { MainTimer, SubTimer } from "./timerClasses.js";

// Initialize global variables
let behaviourInterval;
const exampleMainTimer = document.getElementById("exampleTimer");
const exampleSubTimers = document.getElementsByName("subTimer");
let exampleSubTimerData = [
  new SubTimer("exampleSubTimer1", 2700),
  new SubTimer("exampleSubTimer2", 870),
  new SubTimer("exampleSubTimer3", 30),
];
let selectedBehaviour = "blink";
const settingsForm = document.getElementById("settingsForm");
let shape = "circle";
let tempThresholdValue = 10;

// Reset the form and start the timers on page load
window.onload = function () {
  settingsForm.reset();
  setExampleVars(tempThresholdValue, exampleSubTimerData);
  let exampleTimer = new MainTimer("exampleTimer", 3600);
  exampleTimer.runTimer();
  exampleSubTimerData[0].runTimer();
  exampleSubTimerData[1].runTimer();
  exampleSubTimerData[2].runTimer();
  // Use defaults for update behaviour
  updateBehaviour(exampleMainTimer, tempThresholdValue, selectedBehaviour);
  exampleSubTimers.forEach((subTimer) => {
    updateBehaviour(subTimer, tempThresholdValue, selectedBehaviour);
  });
};

// Find which options are selected as they change
// Get the threshold input value when it loses focus
const exampleThresholdValue = document.getElementById("thresholdValue");
// Set global variable to be used in timerscripts.js
exampleThresholdValue.addEventListener("blur", function () {
  clearInterval(behaviourInterval);
  tempThresholdValue = parseInt(exampleThresholdValue.value, 10);
  updateBehaviour(exampleMainTimer, tempThresholdValue, selectedBehaviour);
  exampleSubTimers.forEach((subTimer) => {
    updateBehaviour(subTimer, tempThresholdValue, selectedBehaviour);
  });
});

// Find which threshold behaviour is selected
const thresholdBehaviour = document.getElementById("thresholdBehaviour");
thresholdBehaviour.addEventListener("change", function () {
  selectedBehaviour = thresholdBehaviour.value;
  // Remove any threshold behaviour classes and clear behaviourInterval
  clearInterval(behaviourInterval);
  exampleMainTimer.classList.remove("blink", "colour", "both");
  exampleSubTimers.forEach((subTimer) => {
    subTimer.classList.remove("blink", "colour", "both");
  });
  // Add the correct class when --curenttime variable reaches tempThresholdValue
  updateBehaviour(exampleMainTimer, tempThresholdValue, selectedBehaviour);

  exampleSubTimers.forEach((subTimer) => {
    updateBehaviour(subTimer, tempThresholdValue, selectedBehaviour);
  });
});

// Find which timer shape is selected
const timerShape = document.getElementById("timerShape");
timerShape.addEventListener("change", function () {
  // If timer shape is set to circle remove rectangle and add circle
  shape = timerShape.value;
  if (shape === "circle") {
    exampleMainTimer.classList.remove("rectangle");
    exampleMainTimer.classList.add("circle");
    exampleSubTimers.forEach((subTimer) => {
      subTimer.classList.remove("rectangle");
      subTimer.classList.add("circle");
    });
    // If timer shape is set to rectangle remove circle and add rectangle
  } else if (shape === "rectangle") {
    exampleMainTimer.classList.remove("circle");
    exampleMainTimer.classList.add("rectangle");
    exampleSubTimers.forEach((subTimer) => {
      subTimer.classList.remove("circle");
      subTimer.classList.add("rectangle");
    });
  }
});

/**
 * Finds if threshold has been reached and applies appropriate CSS when it has
 *
 * @param {DOMElement} timerElement A html DOM element
 * @param {number} thresholdValue The threshold value in seconds
 * @param {string} thresholdBehaviour A string representing the desired behaviour
 */
function updateBehaviour(timerElement, thresholdValue, thresholdBehaviour) {
  // Get the value of the --currenttime variable every second
  behaviourInterval = setInterval(() => {
    let currentTime = parseInt(
      timerElement.style.getPropertyValue("--currenttime")
    );
    // If the current time is below thresholdValue, add appropriate css class and
    // update --gradient-type
    if (
      currentTime <= thresholdValue &&
      !timerElement.classList.contains("counting-up")
    ) {
      // Add the appropriate class
      timerElement.classList.add(thresholdBehaviour);
      // Add the correct --gradient-type if thresholdBehaviour is colour or both
      if (thresholdBehaviour === "colour" || thresholdBehaviour === "both") {
        // Remove any present gradient type
        timerElement.style.removeProperty("--gradient-type");
        // Add the correct gradienttype
        timerElement.style.cssText += ` --gradient-type: ${detectGradientType(
          shape
        )}rgba(215, 155, 0, 0) 0%,
        rgba(215, 155, 0, 0) var(--percent),
        rgb(215, 140, 0) var(--percent)`;
      }
      // If not, remove the class
    } else {
      timerElement.classList.remove(thresholdBehaviour);
    }
  });
}

// Clear tempThresholdValue variable when user leaves the page
window.addEventListener("unload", function () {
  tempThresholdValue = null;
});

console.log("examples.js loaded");
