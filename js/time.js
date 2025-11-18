import { GAME_CONSTANTS } from "./constants.js"
import { UIManager } from "./ui.js"
import { LifecycleManager } from "./lifecycle.js"
import { GameUtils } from "./utils.js"

export class TimeManager {
  constructor(gameState, appsManager = null) {
    this.gameState = gameState
    this.ui = new UIManager()
    this.lifecycleManager = new LifecycleManager(gameState, this.ui)
    this.appsManager = appsManager
  }

  setAppsManager(appsManager) {
    this.appsManager = appsManager
  }

  addTime(hours) {
    const state = this.gameState.getState()
    this.validateTime(state)

    const timeData = this.calculateNewTime(state, hours)

    this.gameState.updateState({
      time: timeData.newTime,
      day: timeData.newDay,
    })

    this.lifecycleManager.checkSatiety()
    this.lifecycleManager.checkDeliveries()

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

  onNewDay() {
    this.lifecycleManager.onNewDay()
    if (this.appsManager) {
      this.appsManager.updateIconStates()
    }
  }

  canPerformAction(energyCost) {
    const state = this.gameState.getState()
    return state.energy >= energyCost
  }

  sleep(hours, energyRestore) {
    const state = this.gameState.getState()
    this.validateTime(state)

    const timeData = this.calculateSleepTime(state, hours)

    const decreases = Math.floor(
      hours / GAME_CONSTANTS.SATIETY_DECREASE_INTERVAL
    )
    const oldSatiety = state.satiety
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

    const restoredEnergy = Math.min(
      state.maxEnergy,
      state.energy + energyRestore
    )

    this.gameState.updateState({
      time: timeData.newTime,
      day: timeData.newDay,
      energy: restoredEnergy,
      satiety: state.satiety,
      health: state.health,
    })

    this.lifecycleManager.lastSatietyCheck = timeData.newTime

    if (timeData.isNewDay) {
      this.onNewDay()
    }

    this.lifecycleManager.checkDeliveries()

    let message = `Вы поспали ${hours} часов. Энергия: ${restoredEnergy}%`
    if (state.satiety < oldSatiety) {
      message += ` | Сытость: ${state.satiety}%`
    }

    this.ui.showToast(message)

    if (state.satiety === 0) {
      setTimeout(() => {
        this.ui.showToast("⚠️ Вы голодаете! Здоровье падает!")
      }, 500)
    } else if (
      state.satiety < GAME_CONSTANTS.LOW_SATIETY_THRESHOLD &&
      oldSatiety >= GAME_CONSTANTS.LOW_SATIETY_THRESHOLD
    ) {
      setTimeout(() => {
        this.ui.showToast("⚠️ Низкая сытость! Закажите еду.")
      }, 500)
    }
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
    return GameUtils.formatTime(time)
  }

  isNightTime(time) {
    const hour = Math.floor(time)
    return (
      hour >= GAME_CONSTANTS.NIGHT_START_HOUR ||
      hour < GAME_CONSTANTS.NIGHT_END_HOUR
    )
  }

  calculateNightHealthPenalty(timeSpent) {
    const hours = Math.ceil(timeSpent)
    return hours * GAME_CONSTANTS.NIGHT_HEALTH_PENALTY_PER_HOUR
  }

  applyNightPenalty(timeSpent) {
    const state = this.gameState.getState()
    const penalty = this.calculateNightHealthPenalty(timeSpent)

    state.health = Math.max(0, state.health - penalty)
    this.gameState.updateState({ health: state.health })

    this.ui.showToast(`🌙 Работа ночью: -${penalty} здоровья`)

    return penalty
  }
}
