import { GAME_CONSTANTS } from "./constants.js"
import { UIManager } from "./ui.js"

export class TimeManager {
  constructor(gameState) {
    this.gameState = gameState
    this.ui = new UIManager()
  }

  addTime(hours) {
    const state = this.gameState.getState()
    this.validateTime(state)

    const timeData = this.calculateNewTime(state, hours)
    this.updateSatiety(state, timeData.hoursPassed)

    this.gameState.updateState({
      time: timeData.newTime,
      day: timeData.newDay,
    })

    if (timeData.isNewDay) {
      this.onNewDay()
    }
  }

  validateTime(state) {
    if (typeof state.time !== "number" || isNaN(state.time)) {
      state.time = GAME_CONSTANTS.INITIAL_TIME
    }
  }

  calculateNewTime(state, hours) {
    const oldTime = state.time
    let newTime = state.time + hours
    let newDay = state.day
    let isNewDay = false

    if (newTime >= GAME_CONSTANTS.HOURS_IN_DAY) {
      newTime = newTime - GAME_CONSTANTS.HOURS_IN_DAY
      newDay += 1
      isNewDay = true
    }

    const oldHour = Math.floor(oldTime)
    const newHour = Math.floor(newTime)
    const hoursPassed =
      newHour - oldHour + (isNewDay ? GAME_CONSTANTS.HOURS_IN_DAY : 0)

    return { newTime, newDay, isNewDay, hoursPassed }
  }

  updateSatiety(state, hoursPassed) {
    if (hoursPassed >= GAME_CONSTANTS.SATIETY_DECREASE_INTERVAL) {
      const decreases = Math.floor(
        hoursPassed / GAME_CONSTANTS.SATIETY_DECREASE_INTERVAL
      )
      state.satiety = Math.max(
        0,
        state.satiety - decreases * GAME_CONSTANTS.SATIETY_DECREASE_AMOUNT
      )

      if (state.satiety === 0) {
        state.health = Math.max(
          0,
          state.health - GAME_CONSTANTS.HEALTH_PENALTY_ON_STARVATION
        )
      }
    }
  }

  onNewDay() {
    console.log(`Новый день начался!`)
  }

  canPerformAction(energyCost) {
    const state = this.gameState.getState()
    return state.energy >= energyCost
  }

  sleep(hours, energyRestore) {
    const state = this.gameState.getState()
    this.validateTime(state)

    const timeData = this.calculateSleepTime(state, hours)
    const restoredEnergy = Math.min(
      state.maxEnergy,
      state.energy + energyRestore
    )

    this.gameState.updateState({
      time: timeData.newTime,
      day: timeData.newDay,
      energy: restoredEnergy,
    })

    if (timeData.isNewDay) {
      this.onNewDay()
    }

    this.ui.showToast(`Вы поспали ${hours} часов. Энергия: ${restoredEnergy}%`)
  }

  calculateSleepTime(state, hours) {
    let newTime = state.time + hours
    let newDay = state.day
    let isNewDay = false

    if (newTime >= GAME_CONSTANTS.HOURS_IN_DAY) {
      newTime = newTime - GAME_CONSTANTS.HOURS_IN_DAY
      newDay += 1
      isNewDay = true
    }

    return { newTime, newDay, isNewDay }
  }

  isLateSleep(currentHour) {
    return (
      currentHour >= GAME_CONSTANTS.LATE_SLEEP_START_HOUR ||
      currentHour < GAME_CONSTANTS.LATE_SLEEP_END_HOUR
    )
  }

  calculateSleepPenalty(isLate) {
    return isLate ? GAME_CONSTANTS.LATE_SLEEP_PENALTY : 1
  }

  formatTime(time) {
    const hours = Math.floor(time)
    const minutes = Math.round((time - hours) * GAME_CONSTANTS.MINUTES_IN_HOUR)
    const minDigits = 2
    return `${hours.toString().padStart(minDigits, "0")}:${minutes
      .toString()
      .padStart(minDigits, "0")}`
  }
}
