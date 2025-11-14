import { GAME_CONSTANTS, UI_SELECTORS } from "./constants.js"

class GameState {
  constructor() {
    this.state = this.createInitialState()
  }

  createInitialState() {
    return {
      day: GAME_CONSTANTS.INITIAL_DAY,
      time: GAME_CONSTANTS.INITIAL_TIME,
      money: GAME_CONSTANTS.INITIAL_MONEY,
      energy: GAME_CONSTANTS.INITIAL_ENERGY,
      maxEnergy: GAME_CONSTANTS.MAX_ENERGY,
      health: GAME_CONSTANTS.INITIAL_HEALTH,
      satiety: GAME_CONSTANTS.INITIAL_SATIETY,
      skills: this.createInitialSkills(),
    }
  }

  createInitialSkills() {
    return {
      layout: {
        level: GAME_CONSTANTS.INITIAL_SKILL_LEVEL,
        xp: GAME_CONSTANTS.INITIAL_SKILL_XP,
      },
      workpress: {
        level: GAME_CONSTANTS.INITIAL_SKILL_LEVEL,
        xp: GAME_CONSTANTS.INITIAL_SKILL_XP,
      },
      freelance: {
        level: GAME_CONSTANTS.INITIAL_SKILL_LEVEL,
        xp: GAME_CONSTANTS.INITIAL_SKILL_XP,
      },
    }
  }

  getState() {
    return { ...this.state }
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState }
    this.updateUI()
  }

  updateUI() {
    this.updateElement(UI_SELECTORS.STAT_DAY, this.state.day)
    this.updateElement(UI_SELECTORS.STAT_TIME, this.formatTime(this.state.time))
    this.updateElement(UI_SELECTORS.STAT_ENERGY, `${this.state.energy}%`)
    this.updateElement(
      UI_SELECTORS.STAT_MONEY,
      `${this.state.money.toLocaleString()} ₽`
    )
  }

  updateElement(elementId, value) {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = value
    }
  }

  formatTime(time) {
    const hours = Math.floor(time)
    const minutes = Math.floor((time - hours) * 60)
    return `${this.padZero(hours)}:${this.padZero(minutes)}`
  }

  padZero(num) {
    return num.toString().padStart(2, "0")
  }

  addTime(hours) {
    let newTime = this.state.time + hours
    let newDay = this.state.day

    if (newTime >= GAME_CONSTANTS.HOURS_IN_DAY) {
      newDay += Math.floor(newTime / GAME_CONSTANTS.HOURS_IN_DAY)
      newTime = newTime % GAME_CONSTANTS.HOURS_IN_DAY
    }

    this.updateState({ time: newTime, day: newDay })
  }
}

export default GameState
