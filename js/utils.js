import { GAME_CONSTANTS } from "./constants.js"

export class GameUtils {
  static calculateXPBonus(state) {
    let xpBonus = 0

    if (state.upgrades?.monitorPro) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_MONITOR_PRO
    } else if (state.upgrades?.monitor) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_MONITOR
    }

    if (state.upgrades?.headphones) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_HEADPHONES
    }

    if (state.upgrades?.apartment) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_APARTMENT
    }

    if (state.upgrades?.coworking) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_COWORKING
    }

    return xpBonus
  }

  static formatTime(time) {
    const hours = Math.floor(time)
    const minutes = Math.round((time - hours) * GAME_CONSTANTS.MINUTES_IN_HOUR)
    const minDigits = 2
    return `${hours.toString().padStart(minDigits, "0")}:${minutes
      .toString()
      .padStart(minDigits, "0")}`
  }

  static parseOrderId(value) {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed <= 0) {
      return null
    }
    return parsed
  }

  static parseHours(value) {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed < 0) {
      return null
    }
    return parsed
  }

  static shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  static getStatColor(value, maxValue = 100) {
    const percent = maxValue > 0 ? (value / maxValue) * 100 : 0

    if (percent > GAME_CONSTANTS.STAT_COLOR_HIGH_THRESHOLD) {
      return "var(--accent)"
    } else if (percent > GAME_CONSTANTS.STAT_COLOR_MEDIUM_THRESHOLD) {
      return "orange"
    } else {
      return "var(--danger)"
    }
  }
}
