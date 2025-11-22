import { SLEEP_OPTIONS } from "./config.js"
import { UI_SELECTORS, GAME_CONSTANTS } from "./constants.js"
import { GameUtils } from "./utils.js"

export class SleepManager {
  constructor(gameState, timeManager, ui, windowManager) {
    this.gameState = gameState
    this.timeManager = timeManager
    this.ui = ui
    this.windowManager = windowManager
  }

  render() {
    const state = this.gameState.getState()
    const body = document.getElementById(UI_SELECTORS.SLEEP_BODY)
    if (!body) return

    this.timeManager.validateTime(state)
    this.gameState.updateState(state)

    const canSleep = this.canSleep()

    if (!canSleep) {
      body.innerHTML = `
        <div class="message" style="color: var(--danger);">
          <strong>${GameUtils.replaceEmojiWithIcon(
            "⚡ Фриланс-наркомания"
          )}</strong><br>
          Ты не можешь спать, пока не закончишь текущий заказ! Работа зовет!
        </div>
      `
      return
    }

    const currentHour = Math.floor(state.time)
    const isLate = this.timeManager.isLateSleep(currentHour)
    const penalty = this.timeManager.calculateSleepPenalty(isLate)

    const optionsHtml = this.createSleepOptions(state, penalty)

    body.innerHTML = `
      <div class="message">
        <strong>Текущее время:</strong> ${this.timeManager.formatTime(
          state.time
        )}<br>
        ${this.createLateSleepWarning(isLate)}
      </div>
      <div class="sleep-options">
        ${optionsHtml}
      </div>
    `

    this.attachSleepHandlers(body)
  }

  canSleep() {
    if (!window.game || !window.game.eventManager) {
      return true
    }
    return window.game.eventManager.canSleep()
  }

  createSleepOptions(state, penalty) {
    return SLEEP_OPTIONS.map((option) => {
      const actualRestore = Math.floor(option.energyRestore * penalty)
      const wakeUpTime =
        (state.time + option.hours) % GAME_CONSTANTS.HOURS_IN_DAY

      return `
        <div class="sleep-option">
          <div class="sleep-option-header">
            <strong>${option.label}</strong>
            <span>+${actualRestore}% энергии</span>
          </div>
          <div class="sleep-option-meta">
            Проснетесь в ${this.timeManager.formatTime(wakeUpTime)}
          </div>
          <button class="window-action sleep-btn" data-hours="${
            option.hours
          }" data-restore="${actualRestore}">
            Спать
          </button>
        </div>
      `
    }).join("")
  }

  createLateSleepWarning(isLate) {
    return isLate
      ? '<span style="color: var(--danger)">⚠ Поздно! Восстановление энергии будет снижено.</span>'
      : ""
  }

  attachSleepHandlers(body) {
    body.querySelectorAll(".sleep-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const hours = GameUtils.parseHours(e.target.dataset.hours)
        const restore = parseInt(e.target.dataset.restore, 10)
        if (hours !== null && !isNaN(restore)) {
          this.handleSleep(hours, restore)
        }
      })
    })
  }

  handleSleep(hours, restore) {
    this.timeManager.sleep(hours, restore)
    this.windowManager.closeAllWindows()
  }
}

