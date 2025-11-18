import { EVENTS, EVENT_TYPES } from "./events.js"
import { GAME_CONSTANTS } from "./constants.js"

export class EventManager {
  constructor(gameState, ui) {
    this.gameState = gameState
    this.ui = ui
  }

  tryTriggerEvent() {
    const state = this.gameState.getState()

    if (state.activeEvent) {
      return
    }

    const eventType = this.rollEventType()
    if (!eventType) {
      return
    }

    const event = this.selectRandomEvent(eventType, state)
    if (!event) {
      return
    }

    this.triggerEvent(event)
  }

  rollEventType() {
    const roll = Math.random()

    if (roll < GAME_CONSTANTS.POSITIVE_EVENT_CHANCE) {
      return EVENT_TYPES.POSITIVE
    }

    if (
      roll <
      GAME_CONSTANTS.POSITIVE_EVENT_CHANCE +
        GAME_CONSTANTS.NEGATIVE_EVENT_CHANCE
    ) {
      return EVENT_TYPES.NEGATIVE
    }

    if (
      roll <
      GAME_CONSTANTS.POSITIVE_EVENT_CHANCE +
        GAME_CONSTANTS.NEGATIVE_EVENT_CHANCE +
        GAME_CONSTANTS.DUAL_EVENT_CHANCE
    ) {
      return EVENT_TYPES.DUAL
    }

    return null
  }

  selectRandomEvent(eventType, state) {
    const availableEvents = Object.values(EVENTS).filter(
      (event) => event.type === eventType && event.canTrigger(state)
    )

    if (availableEvents.length === 0) {
      return null
    }

    return availableEvents[Math.floor(Math.random() * availableEvents.length)]
  }

  triggerEvent(event) {
    const state = this.gameState.getState()

    state.activeEvent = {
      id: event.id,
      effect: event.effect,
      startDay: state.day,
    }

    this.applyImmediateEffects(event, state)
    this.gameState.updateState(state)
    this.showEventDialog(event)
  }

  applyImmediateEffects(event, state) {
    const effect = event.effect

    if (effect.type === "instantEnergy") {
      state.energy = Math.min(state.maxEnergy, state.energy + effect.value)
    }

    if (effect.type === "maxEnergyBoost") {
      state.maxEnergy += effect.value
      state.energy = Math.min(state.maxEnergy, state.energy)
    }

    if (effect.type === "energyPenalty") {
      state.energy = Math.max(0, state.energy + effect.value)
    }

    if (effect.type === "healthPenalty") {
      state.health = Math.max(0, state.health + effect.value)
    }

    if (effect.type === "skipDay") {
      state.day += effect.value
      state.time = 9
      state.kworkOrders = []
      state.rejectedOrders = {}
    }

    if (effect.type === "nightmareClient" && state.activeOrder) {
      state.health = Math.max(0, state.health + effect.healthPenalty)
    }

    if (effect.type === "burnoutRevelation" && state.activeOrder) {
      state.activeOrder.progress = 100
    }
  }

  showEventDialog(event) {
    const overlay = document.createElement("div")
    overlay.className = "event-overlay"
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    const dialog = document.createElement("div")
    dialog.className = `event-dialog event-${event.type}`
    dialog.innerHTML = `
      <div class="event-header">
        <span class="event-icon">${this.getEventIcon(event.type)}</span>
        <h2 class="event-title">${event.name}</h2>
      </div>
      
      <div class="event-body">
        <div class="event-lore" id="event-lore-text"></div>
        <div class="event-comment" id="event-comment-text"></div>
        <div class="event-effect" id="event-effect-text"></div>
      </div>

      <button id="event-ok-btn" class="event-button" disabled>
        Понятно
      </button>
    `

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    this.typeText(event.lore, "event-lore-text", () => {
      this.typeText(event.comment, "event-comment-text", () => {
        const effectText = this.getEffectDescription(event)
        this.typeText(effectText, "event-effect-text", () => {
          const button = document.getElementById("event-ok-btn")
          button.disabled = false
          button.style.opacity = "1"
          button.style.cursor = "pointer"

          button.addEventListener("click", () => {
            document.body.removeChild(overlay)
          })
        })
      })
    })
  }

  typeText(text, elementId, onComplete) {
    const element = document.getElementById(elementId)
    if (!element) return

    element.textContent = ""
    let charIndex = 0
    const typingSpeed = 20

    const typeChar = () => {
      if (charIndex < text.length) {
        element.textContent += text[charIndex]
        charIndex++
        setTimeout(typeChar, typingSpeed)
      } else {
        if (onComplete) onComplete()
      }
    }

    typeChar()
  }

  getEventIcon(type) {
    switch (type) {
      case EVENT_TYPES.POSITIVE:
        return "✨"
      case EVENT_TYPES.NEGATIVE:
        return "⚠️"
      case EVENT_TYPES.DUAL:
        return "⚡"
      default:
        return "📌"
    }
  }

  getEffectDescription(event) {
    const effect = event.effect
    const effects = []

    switch (effect.type) {
      case "workSpeedBoost":
        effects.push(`📈 Скорость работы: +${Math.floor(effect.value * 100)}%`)
        break
      case "nextOrderBonus":
        effects.push(
          `💰 Бонус к следующему заказу: +${Math.floor(effect.value * 100)}%`
        )
        break
      case "xpBoost":
        effects.push(`📚 Получаемый опыт: +${Math.floor(effect.value * 100)}%`)
        break
      case "instantEnergy":
        effects.push(`⚡ Энергия: +${effect.value}`)
        break
      case "maxEnergyBoost":
        effects.push(`⚡ Максимальная энергия: +${effect.value}`)
        break
      case "skipDay":
        effects.push(`⏭️ Пропуск дня`)
        break
      case "workSpeedPenalty":
        effects.push(`📉 Скорость работы: ${Math.floor(effect.value * 100)}%`)
        if (effect.xpPenalty) {
          effects.push(
            `📉 Получаемый опыт: ${Math.floor(effect.xpPenalty * 100)}%`
          )
        }
        break
      case "energyPenalty":
        effects.push(`⚡ Энергия: ${effect.value}`)
        if (effect.workSpeedPenalty) {
          effects.push(
            `📉 Скорость работы: ${Math.floor(effect.workSpeedPenalty * 100)}%`
          )
        }
        break
      case "healthPenalty":
        effects.push(`❤️ Здоровье: ${effect.value}`)
        if (effect.xpPenalty) {
          effects.push(
            `📉 Получаемый опыт: ${Math.floor(effect.xpPenalty * 100)}%`
          )
        }
        break
      case "burningChair":
        effects.push(
          `📈 Скорость работы: +${Math.floor(effect.workSpeedBoost * 100)}%`
        )
        effects.push(
          `❤️ Здоровье: -${effect.healthPenaltyPerHour} за каждый час`
        )
        break
      case "freelanceAddiction":
        effects.push(
          `📈 Скорость работы: +${Math.floor(effect.workSpeedBoost * 100)}%`
        )
        effects.push(
          `📚 Получаемый опыт: +${Math.floor(effect.xpBoost * 100)}%`
        )
        effects.push(`😴 Нельзя спать до завершения заказа`)
        break
      case "burnoutRevelation":
        effects.push(`✅ Мгновенное завершение заказа`)
        effects.push(
          `🔥 Выгорание на ${effect.burnoutDays} дня: ${Math.floor(
            effect.burnoutPenalty * 100
          )}% ко всем характеристикам`
        )
        break
      case "nightmareClient":
        effects.push(`💰 Награда: x${effect.moneyMultiplier}`)
        effects.push(`⏱️ Время работы: x${effect.timeMultiplier}`)
        effects.push(`⚡ Энергия: x${effect.energyMultiplier}`)
        effects.push(`❤️ Здоровье: ${effect.healthPenalty}`)
        break
      case "creativeCrisis":
        effects.push(
          `📉 Утро (до 17:00): ${Math.floor(
            effect.morningPenalty * 100
          )}% скорости`
        )
        effects.push(
          `📈 Вечер (после 17:00): +${Math.floor(
            effect.eveningBoost * 100
          )}% скорости`
        )
        break
    }

    return `🎯 Эффект: ${effects.join(" | ")}`
  }

  checkEventExpiration() {
    const state = this.gameState.getState()

    if (!state.activeEvent) {
      return
    }

    if (state.day > state.activeEvent.startDay) {
      this.clearEvent()
    }
  }

  clearEvent() {
    const state = this.gameState.getState()

    if (state.activeEvent) {
      const effect = state.activeEvent.effect

      if (effect.type === "maxEnergyBoost") {
        state.maxEnergy = Math.max(
          GAME_CONSTANTS.MAX_ENERGY,
          state.maxEnergy - effect.value
        )
        state.energy = Math.min(state.maxEnergy, state.energy)
      }
    }

    state.activeEvent = null
    this.gameState.updateState(state)
  }

  getActiveEventModifier(type) {
    const state = this.gameState.getState()

    if (!state.activeEvent) {
      return 1
    }

    const effect = state.activeEvent.effect

    switch (type) {
      case "workSpeed":
        if (effect.type === "workSpeedBoost") return 1 + effect.value
        if (effect.type === "workSpeedPenalty") return 1 + effect.value
        if (effect.type === "burningChair") return 1 + effect.workSpeedBoost
        if (effect.type === "freelanceAddiction")
          return 1 + effect.workSpeedBoost
        if (effect.type === "nightmareClient") return effect.timeMultiplier
        if (effect.type === "creativeCrisis") {
          const hour = Math.floor(state.time)
          return hour < GAME_CONSTANTS.CREATIVE_CRISIS_EVENING_HOUR
            ? 1 + effect.morningPenalty
            : 1 + effect.eveningBoost
        }
        break

      case "xp":
        if (effect.type === "xpBoost") return 1 + effect.value
        if (effect.xpPenalty) return 1 + effect.xpPenalty
        if (effect.type === "freelanceAddiction") return 1 + effect.xpBoost
        break

      case "orderMoney":
        if (effect.type === "nextOrderBonus") return 1 + effect.value
        if (effect.type === "nightmareClient") return effect.moneyMultiplier
        break

      case "energy":
        if (effect.type === "nightmareClient") return effect.energyMultiplier
        break

      case "maxEnergy":
        if (effect.type === "maxEnergyBoost") return effect.value
        break
    }

    return 1
  }

  applyBurningChairPenalty(timeSpent) {
    const state = this.gameState.getState()

    if (
      !state.activeEvent ||
      state.activeEvent.effect.type !== "burningChair"
    ) {
      return
    }

    const hours = Math.ceil(timeSpent)
    const penalty = hours * state.activeEvent.effect.healthPenaltyPerHour

    state.health = Math.max(0, state.health - penalty)
    this.gameState.updateState({ health: state.health })

    if (penalty > 0) {
      this.ui.showToast(`🔥 Горящий стул: -${penalty} здоровья`)
    }
  }

  canSleep() {
    const state = this.gameState.getState()

    if (
      state.activeEvent &&
      state.activeEvent.effect.type === "freelanceAddiction" &&
      state.activeOrder
    ) {
      return false
    }

    return true
  }
}
