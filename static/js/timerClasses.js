import { thresholdValue, updateTimerDisplay } from "./timerscripts.js";

class Timer {
  constructor(id, duration) {
    this.id = id;
    this.duration = duration;
    this.initialDuration = duration;
    this.running = false;
    this.countUp = false;
    this.interval = 0;
  }
  checkThreshold() {
    if (this.duration === thresholdValue) {
      document.getElementById(this.id).classList.add("threshold");
    }
  }
  checkCountUp() {
    if (this.duration === 0) {
      this.countUp = true;
      let timer = document.getElementById(this.id);
      timer.classList.add("counting-up");
      timer.classList.remove("blink", "colour", "both");
    }
    return this.countUp;
  }
  checkStop() {
    throw new Error("checkStop method must be implemented in subclasses");
  }
  runTimer() {
    this.running = true;
    this.interval = setInterval(() => {
      this.checkThreshold();
      if (!this.checkCountUp()) {
        this.duration = Math.max(0, this.duration - 1);
        updateTimerDisplay(this.id, this.duration);
      } else {
        this.duration++;
        updateTimerDisplay(this.id, this.duration);
      }
      this.checkStop();
    }, 1000);
  }
}

class MainTimer extends Timer {
  constructor(id, duration) {
    super(id, duration);
    this.subTimers = [];
  }
  addSubTimer(subTimer) {
    this.subTimers.push(subTimer);
  }
  checkStop() {
    switch (this.duration) {
      case 0:
        for (const subTimer of this.subtimers) {
          clearInterval(subTimer.interval);
        }
        clearInterval(this.interval);
    }
  }
}

class SubTimer extends Timer {
  constructor(id, duration) {
    super(id, duration);
  }
  checkStop() {}
}

export { MainTimer, SubTimer };
