// Import timer classes
import { MainTimer, SubTimer } from "./timerClasses.js";

// Initialise global variables
let activeSubTimers = [{ id: "subTimer1", index: 0 }];
let apiData;
let currentPage = window.location.pathname;
let exampleTimer = new MainTimer("exampleTimer", 3600);
let mainTimer = new MainTimer("mainTimer", 3600);
let subTimers = [];
let thresholdValue = 10;

// Add event listeners for the timer buttons on the timer page
if (currentPage.includes("/timer")) {
  document
    .getElementById("mainTimerPause")
    .addEventListener("click", function () {
      pauseTimer("mainTimer");
    });

  document
    .getElementById("reloadButton")
    .addEventListener("click", function () {
      window.location.reload();
    });

  // Select the subTimersContainer div
  document
    .getElementById("subTimersContainer")
    .addEventListener("click", function (event) {
      // Find the button element that is clicked
      const button = event.target.closest("button");

      if (button) {
        // Get which timer the button applies to from the name attribute
        const timerName = button.getAttribute("name");

        // Find the type of button clicked and call the appropriate function
        if (button.id.startsWith("previous-timer-button")) {
          startPreviousTimer(timerName);
        } else if (button.id.startsWith("pause-timer-button")) {
          pauseTimer(timerName);
        } else if (button.id.startsWith("next-timer-button")) {
          startNextTimer(timerName);
        }
      }
    });
  // Add event listeners for the add and remove timer buttons on the set timer page
} else if (currentPage.includes("/set_timer")) {
  document
    .getElementById("addTimerButton")
    .addEventListener("click", function () {
      addSubTimer();
    });
  document
    .getElementById("removeTimerButton")
    .addEventListener("click", function () {
      removeSubTimer();
    });
  // Fill the subTimers list so the distributeRemainingTime function works properly
  subTimers = [new SubTimer("subTimer1", 60), new SubTimer("subTimer2", 60)];
}

// Update timer inputs when they lose focus
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("timersContainer");
  if (container) {
    container.addEventListener("focusout", function (event) {
      const target = event.target;
      // If a subtimer was edited, distribute the remaining time when it loses focus
      if (
        target.classList.contains("timer-container") &&
        target.getAttribute("name") === "subTimer"
      ) {
        // Turn input time into seconds
        updateInput(target.id);
        distributeRemainingTime();
        // If the main timer was edited, turn input time into seconds when it loses focus
      } else if (
        target.classList.contains("timer-container") &&
        target.getAttribute("name") === "mainTimer"
      ) {
        updateInput("mainTimer");
      }
    });
  }

  /**
   * Turn hh:mm:ss into seconds, set duration of the timer identified by inputId to this value
   *
   * @param {string} inputId The id of an input element
   */
  function updateInput(inputId) {
    const input = document.getElementById(inputId);
    const inputValue = input.value;
    const duration = toSeconds(inputValue);
    if (inputId === "mainTimer") {
      mainTimer.duration = duration;
    } else if (inputId === "exampleTimer") {
      exampleTimer.duration = duration;
    } else {
      let currentTimer = subTimers.find((subTimer) => subTimer.id === inputId);
      currentTimer.duration = duration;
      currentTimer.set = true;
    }
  }
});

// Fetch current_timer api data on page load and use it to set certain variables
fetch("/api/current_timer")
  .then((response) => {
    if (response.status === 404) {
      return;
    } else if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    } else {
      return response.json();
    }
  })
  .then((json) => {
    if (json) {
      apiData = json;
      setVariables(apiData);
    } else {
      return;
    }
  })
  .catch((error) => console.error(error));

// Fetch settings api data on page load and get the threshold value from it
fetch("/api/css_loader")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    thresholdValue = data.threshold_value;
  });

/**
 * Add a sub timer
 */
function addSubTimer() {
  const newSubTimerId = `subTimer${subTimers.length + 1}`;
  // Add subtimer to the subTimers list
  subTimers.push(new SubTimer(newSubTimerId, 60));

  // Create a label element
  const labelElement = document.createElement("label");
  labelElement.id = `label${subTimers.length}`;
  labelElement.setAttribute("for", `subTimerName${subTimers.length}`);
  labelElement.className = "timer-label";
  labelElement.innerText = "Name this section";
  document.getElementById("subTimersContainer").appendChild(labelElement);

  // Create input elements to input the name and the duration
  const subTimerNameElement = document.createElement("input");
  subTimerNameElement.id = `subTimerName${subTimers.length}`;
  subTimerNameElement.className = "timer-label";
  subTimerNameElement.setAttribute("name", "subTimerName");
  subTimerNameElement.setAttribute("type", "text");
  subTimerNameElement.setAttribute(
    "placeholder",
    `Section ${subTimers.length}:`
  );
  subTimerNameElement.setAttribute("autocomplete", "off");
  document
    .getElementById("subTimersContainer")
    .appendChild(subTimerNameElement);

  const subTimerElement = document.createElement("input");
  subTimerElement.id = newSubTimerId;
  subTimerElement.className = "timer-container";
  subTimerElement.setAttribute("name", "subTimer");
  subTimerElement.setAttribute("type", "time");
  subTimerElement.setAttribute("step", "1");
  subTimerElement.setAttribute("value", "00:00:00");
  subTimerElement.setAttribute("autocomplete", "off");
  document.getElementById("subTimersContainer").appendChild(subTimerElement);
}

/**
 * Distribute the remaining time of the main timer among the unset subtimers
 */
function distributeRemainingTime() {
  // Calculate the remaining time
  const remainingTime =
    mainTimer.duration -
    subTimers
      .filter((subTimer) => subTimer.set)
      .reduce((total, subTimer) => total + subTimer.duration, 0);
  // Find the number of subtimers that haven't been set yet
  const numberOfOtherSubtimers = subTimers.filter(
    (subTimer) => !subTimer.set
  ).length;
  // Calculate how much time each subtimer gets
  if (numberOfOtherSubtimers > 0 && remainingTime >= 0) {
    const equalTimeForEachSubtimer = Math.floor(
      remainingTime / numberOfOtherSubtimers
    );

    // Update durations and intialDuration of other subtimers that haven't been set
    subTimers.forEach((subTimer) => {
      if (!subTimer.set) {
        subTimer.duration = equalTimeForEachSubtimer;
        subTimer.initialDuration = equalTimeForEachSubtimer;
        subTimer.set = false;
        updateTimers(subTimer.id);
      }
    });
  }
}

/**
 * Formats a timer's duration in seconds to [hh:][mm:]ss, with hours and minutes
 * displayed depending on the timer's initial duration
 *
 * @param {string} timerId A string corresponding to the id of a timer
 * @param {number} timerDuration Duration in seconds
 * @returns {string} A string representing the duration in [hh:][mm:]ss
 */
function formatDuration(timerId, timerDuration) {
  const hours = Math.floor(timerDuration / 3600);
  const minutes = Math.floor((timerDuration % 3600) / 60);
  const seconds = timerDuration % 60;

  if (timerId === "mainTimer" || timerId === "exampleTimer") {
    if (mainTimer.initialDuration >= 3600) {
      // Display in HH:MM:SS format
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    } else if (mainTimer.initialDuration >= 60) {
      // Display in MM:SS format
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    } else {
      // Display in SS format
      return `${String(seconds).padStart(2, "0")}`;
    }
  } else {
    let subTimer = subTimers.find((timer) => timer.id === timerId);
    if (subTimer.initialDuration >= 3600) {
      // Display in HH:MM:SS format
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    }
    if (subTimer.initialDuration < 3600 && subTimer.initialDuration >= 60) {
      // Display in MM:SS format
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }
    if (subTimer.initialDuration < 60) {
      // Display in SS format
      return `${String(seconds).padStart(2, "0")}`;
    }
  }
}

/**
 * Pauses all timers if the main timer pause button is clicked while it's running,
 * starts main timer and first or active subtimer(s) if main timer pause button
 * is clicked while it's not running, or pauses or starts subtimers according to
 * which subtimer pause button was clicked
 *
 * @param {string} timerId A string corresponding to the id of the timer whose
 * pause button was clicked
 */
function pauseTimer(timerId) {
  // (Re)start or pause main timer and active subtimers when timerId = mainTimer
  if (timerId === "mainTimer") {
    if (mainTimer.running) {
      clearInterval(mainTimer.interval);
      subTimers.forEach((subTimer) => {
        subTimer.running = false;
        clearInterval(subTimer.interval);
        document.getElementById(subTimer.id).classList.remove("threshold");
      });
      mainTimer.running = false;
    } else {
      mainTimer.runTimer();
      activeSubTimers.forEach((subTimer) => {
        activeSubTimers = activeSubTimers.filter((activeSub) => {
          activeSub.id !== subTimer.id;
          subTimers[activeSub.index].runTimer();
        });
      });
    }
    // (Re)start or pause sub timer when timerId = subTimer<X>
  } else {
    let clickedTimer = subTimers.find((subTimer) => subTimer.id === timerId);
    let clickedTimerIndex = activeSubTimers.findIndex(
      (activeSubTimer) => activeSubTimer.id === clickedTimer.id
    );
    if (clickedTimer.running) {
      clickedTimer.running = false;
      clearInterval(clickedTimer.interval);
      activeSubTimers.splice(clickedTimerIndex, 1);
    } else {
      clickedTimer.runTimer();
    }
  }
}

/**
 * Removes subtimers from the set timer page
 * @returns None
 */
function removeSubTimer() {
  if (subTimers.length > 2) {
    const currentSubTimer = subTimers[subTimers.length - 1];

    // Get the ID of the last timer and the corresponding DOM element
    let lastTimerId = currentSubTimer.id;
    let lastSubTimer = document.getElementById(lastTimerId);
    let lastSubTimerName = document.getElementById(
      `subTimerName${subTimers.length}`
    );
    let lastLabel = document.getElementById(`label${subTimers.length}`);

    // Remove the timer from the DOM element and the array
    document.getElementById("subTimersContainer").removeChild(lastSubTimer);
    document.getElementById("subTimersContainer").removeChild(lastSubTimerName);
    document.getElementById("subTimersContainer").removeChild(lastLabel);
    subTimers.pop();
  } else {
    return;
  }
}

/**
 * Exportable function to be used in example.js to set the threshold and subtimers
 * to the values as calculated there
 *
 * @param {number} threshold The threshold value in seconds
 * @param {list} subTimerData A list of subTimer objects
 */
function setExampleVars(threshold, subTimerData) {
  thresholdValue = threshold;
  subTimers = subTimerData;
}

/**
 * Set variables based on API data
 *
 * @param {json} json JSON data received through API
 */
function setVariables(json) {
  // Set mainTimer(Initial)Duration and subTimerInitialDurations based on json data
  mainTimer.duration = json["duration"];
  mainTimer.initialDuration = json["duration"];
  json.subtimers.forEach((subtimer) => {
    const foundSubTimer = subTimers.find((timer) => timer.id === subtimer.name);
    if (foundSubTimer) {
      foundSubTimer.initialDuration = subtimer.duration;
    }
  });
  // Update existing subTimers
  subTimers.forEach((subTimer) => {
    const matchingJsonSubtimer = json.subtimers.find(
      (jsonSubtimer) => jsonSubtimer.name === subTimer.id
    );
    if (matchingJsonSubtimer) {
      subTimer.duration = matchingJsonSubtimer.duration;
      subTimer.set = true;
    }
  });
  // Append new subTimers
  json.subtimers.forEach((jsonSubtimer) => {
    // See if a subTimer already exists
    const existingSubTimer = subTimers.find(
      (subTimer) => subTimer.id === jsonSubtimer.namethreshold
    );
    // If a subtimer doesn't exist, append it to the list
    if (!existingSubTimer) {
      subTimers.push(new SubTimer(jsonSubtimer.name, jsonSubtimer.duration));
    }
  });
}

/**
 * Starts the next subtimer
 *
 * @param {string} timerId A string representing the id of the current subtimer
 * @returns None
 */
function startNextTimer(timerId) {
  // Stop if the main timer is not running
  if (!mainTimer.running) {
    return;
  }

  // Stop the current subtimer, flag it as not running, remove threshold
  // and remove it from the active subtimers list
  let subTimer = subTimers.find((subtimer) => subtimer.id === timerId);
  if (subTimer) {
    clearInterval(subTimer.interval);
    subTimer.running = false;
    document.getElementById(subTimer.id).classList.remove("threshold");
    const removeIndex = activeSubTimers.findIndex(
      (activeSubTimer) => activeSubTimer.id === subTimer.id
    );
    if (removeIndex !== -1) {
      activeSubTimers.splice(removeIndex, 1);
    }
    // Add the next subtimer to the activeSubTimers array
    const currentTimerIndex = subTimers.findIndex(
      (oldSubTimer) => oldSubTimer.id === timerId
    );
    let newSubTimer = subTimers[currentTimerIndex + 1];
    // If the timer is already running, exit the function
    if (newSubTimer.running) {
      return;
    }
    // Start the next subtimer
    if (newSubTimer.duration <= thresholdValue) {
      document.getElementById(newSubTimer.id).classList.add("threshold");
    }
    newSubTimer.runTimer();
  } else {
    console.log("startNextTimer function could not find subtimer", timerId);
  }
}

/**
 * Starts the previous subtimer
 * @param {string} timerId A string representing the id of the current subtimer
 * @returns
 */
function startPreviousTimer(timerId) {
  // Stop if the main timer is not running
  if (!mainTimer.running) {
    return;
  }

  // Stop the current subtimer, flag it as not running, remove threshold
  // and remove it from the active subtimers list
  let subTimer = subTimers.find((subtimer) => subtimer.id === timerId);
  if (subTimer) {
    clearInterval(subTimer.interval);
    subTimer.running = false;
    document.getElementById(subTimer.id).classList.remove("threshold");
    const removeIndex = activeSubTimers.findIndex(
      (activeSubTimer) => activeSubTimer.id === subTimer.id
    );
    if (removeIndex !== -1) {
      activeSubTimers.splice(removeIndex, 1);
    }
    // Add the previous subtimer to the activeSubTimers array
    const currentTimerIndex = subTimers.findIndex(
      (oldSubTimer) => oldSubTimer.id === timerId
    );
    let newSubTimer = subTimers[currentTimerIndex - 1];
    // If the timer is already running, exit the function
    if (newSubTimer.running) {
      return;
    }
    // Start the next subtimer
    if (newSubTimer.duration <= thresholdValue) {
      document.getElementById(newSubTimer.id).classList.add("threshold");
    }
    newSubTimer.runTimer();
  } else {
    console.log("startPreviousTimer function could not find subtimer", timerId);
  }
}

/**
 * Takes a time in [hh:][mm:]ss and turns it into seconds
 *
 * @param {string} input An input html element
 * @returns A number representing the duration in seconds
 */
function toSeconds(input) {
  // Parse the input to extract hours, minutes, and seconds
  let [hours, minutes, seconds] = input.split(":").map(Number);

  // If only one component is provided, treat it as seconds
  if (!isNaN(hours) && isNaN(minutes) && isNaN(seconds)) {
    seconds = hours;
    minutes = 0;
    hours = 0;
  } else if (!isNaN(hours) && !isNaN(minutes) && isNaN(seconds)) {
    // If only two components are provided, treat as mm:ss
    seconds = minutes;
    minutes = hours;
    hours = 0;
  }

  // Calculate the total duration in seconds
  let totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}

/**
 * Update the --currenttime css variable
 *
 * @param {string} timerId A string representing the id of the timer to update
 * @param {number} duration The current duration in seconds
 */
function updateCurrentTime(timerId, duration) {
  const timerElement = document.getElementById(timerId);
  timerElement.style.setProperty("--currenttime", duration);
}

/**
 * Update the timers based on duration
 *
 * @param {string} timerId A string representing the id of the timer to update
 */
function updateTimers(timerId) {
  if (timerId === "mainTimer") {
    updateTimerDisplay("mainTimer", mainTimer.duration);
  } else if (timerId === "exampleTimer") {
    updateTimerDisplay("exampleTimer", exampleTimer.duration);
  } else {
    const subTimer = subTimers.find((subTimer) => subTimer.id === timerId);
    updateTimerDisplay(timerId, subTimer.duration);
  }
}

/**
 * Update the way timers are displayed based on if it's shown in an input (on the set_timer page)
 * or in a div (on the timer page)
 *
 * @param {string} timerId A string representing the id of the timer to update
 * @param {number} timerDuration The duration in seconds
 */
function updateTimerDisplay(timerId, timerDuration) {
  const formattedTime = formatDuration(timerId, timerDuration);
  const htmlElement = document.getElementById(timerId);
  if (htmlElement.tagName.toLowerCase() === "input") {
    let inputString = `${String(Math.floor(timerDuration / 3600)).padStart(
      2,
      "0"
    )}:${String(Math.floor((timerDuration % 3600) / 60)).padStart(
      2,
      "0"
    )}:${String(timerDuration % 60).padStart(2, "0")}`;
    htmlElement.value = inputString;
  } else if (htmlElement.tagName.toLowerCase() === "div") {
    htmlElement.childNodes[0].textContent = formattedTime;
    updateCurrentTime(timerId, timerDuration);
  }
}

export { thresholdValue, setExampleVars, updateTimerDisplay };
console.log("timerscripts.js loaded");
