import { BILLS, MARKETPLACE_ITEMS } from "./config.js"
import { GAME_CONSTANTS } from "./constants.js"
import { HospitalDialog } from "./hospital-dialog.js"

export class LifecycleManager {
  constructor(gameState, ui) {
    this.gameState = gameState
    this.ui = ui
    this.lastSatietyCheck = 0
    this.hospitalDialog = new HospitalDialog()
  }

  checkHospital() {
    try {
      const state = this.gameState.getState()

      if (state.health <= 0) {
        this.sendToHospital()
        return true
      }
      return false
    } catch (error) {
      console.error("Error checking hospital:", error)
      return false
    }
  }

  sendToHospital() {
    try {
      const state = this.gameState.getState()
      const penalties = this.calculateHospitalPenalties(state)

      this.applyHospitalPenalties(state, penalties)
      this.restoreHealthAfterHospital(state)
      this.cancelActiveOrder(state)
      this.resetSatietyCheck(state)

      this.gameState.updateState(state)
      this.showHospitalDialog(penalties.moneyCost, penalties.timePenalty)
    } catch (error) {
      console.error("Error sending to hospital:", error)
    }
  }

  calculateHospitalPenalties(state) {
    const moneyCost = Math.floor(
      state.money * GAME_CONSTANTS.HOSPITAL_MONEY_PENALTY
    )
    const timePenalty = GAME_CONSTANTS.HOSPITAL_TIME_PENALTY_DAYS

    return { moneyCost, timePenalty }
  }

  applyHospitalPenalties(state, penalties) {
    state.money = Math.max(0, state.money - penalties.moneyCost)
    state.day += penalties.timePenalty
    state.time = GAME_CONSTANTS.HOSPITAL_MORNING_HOUR

    Object.keys(state.skills).forEach((skillName) => {
      const skill = state.skills[skillName]
      if (skill && typeof skill === "object") {
        skill.xp = Math.max(
          0,
          Math.floor(skill.xp * GAME_CONSTANTS.HOSPITAL_SKILL_PENALTY)
        )
      }
    })
  }

  restoreHealthAfterHospital(state) {
    const maxHealth = state.maxHealth || GAME_CONSTANTS.INITIAL_HEALTH
    state.health = Math.floor(
      maxHealth * GAME_CONSTANTS.HOSPITAL_HEALTH_RESTORE
    )
    state.energy = state.maxEnergy
    state.satiety = GAME_CONSTANTS.HOSPITAL_SATIETY_RESTORE
  }

  cancelActiveOrder(state) {
    if (state.activeOrder) {
      state.activeOrder = null
      state.kworkOrders = []
    }
  }

  resetSatietyCheck(state) {
    this.lastSatietyCheck = state.time
  }

  showHospitalDialog(moneyCost, timePenalty) {
    this.hospitalDialog.show(moneyCost, timePenalty, () => {
      this.ui.showToast("🏥 Вы выписаны из больницы")

      if (window.game) {
        window.game.updateAllUI()
      }
    })
  }

  checkSatiety() {
    const state = this.gameState.getState()
    const currentTime = state.time

    const hoursPassed =
      Math.floor(currentTime) - Math.floor(this.lastSatietyCheck)

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
        this.ui.showToast("⚠️ Вы голодаете! Здоровье падает!")
      }

      this.lastSatietyCheck = currentTime
      this.gameState.updateState(state)
    }
  }

  checkBills() {
    const state = this.gameState.getState()
    let updated = false

    if (state.day >= state.bills.rent.due) {
      const isOverdue = state.day > state.bills.rent.due
      let rentAmount = BILLS.rent.amount
      if (state.upgrades.apartment) {
        rentAmount = 20000
      }

      if (state.money >= rentAmount) {
        state.money -= rentAmount
        state.bills.rent.lastPaid = state.day
        state.bills.rent.due = state.day + BILLS.rent.period
        state.hasRent = true
        this.ui.showToast(
          `💸 Автоматически оплачена квартира: ${rentAmount.toLocaleString()}₽`
        )
        updated = true
      } else {
        state.hasRent = false
        if (!isOverdue) {
          this.ui.showToast(
            "⚠️ Нет денег на квартиру! Только подработки доступны."
          )
        }
        updated = true
      }
    }

    if (state.day >= state.bills.internet.due) {
      const isOverdue = state.day > state.bills.internet.due
      if (state.money >= BILLS.internet.amount) {
        state.money -= BILLS.internet.amount
        state.bills.internet.lastPaid = state.day
        state.bills.internet.due = state.day + BILLS.internet.period
        state.hasInternet = true
        this.ui.showToast(
          `💸 Автоматически оплачен интернет: ${BILLS.internet.amount.toLocaleString()}₽`
        )
        updated = true
      } else {
        state.hasInternet = false
        if (!isOverdue) {
          this.ui.showToast("⚠️ Нет денег на интернет! Обучение недоступно.")
        }
        updated = true
      }
    }

    if (state.upgrades.coworking) {
      if (!state.bills.coworking) {
        state.bills.coworking = {
          lastPaid: state.day,
          due: state.day + BILLS.coworking.period,
        }
      }

      if (state.day >= state.bills.coworking.due) {
        const isOverdue = state.day > state.bills.coworking.due
        if (state.money >= BILLS.coworking.amount) {
          state.money -= BILLS.coworking.amount
          state.bills.coworking.lastPaid = state.day
          state.bills.coworking.due = state.day + BILLS.coworking.period
          this.ui.showToast(
            `💸 Автоматически оплачен коворкинг: ${BILLS.coworking.amount.toLocaleString()}₽`
          )
          updated = true
        } else {
          if (!isOverdue) {
            this.ui.showToast("⚠️ Нет денег на коворкинг!")
          }
          updated = true
        }
      }
    }

    if (updated) {
      this.gameState.updateState(state)
    }
  }

  onNewDay() {
    const state = this.gameState.getState()

    state.kworkOrders = []
    state.rejectedOrders = {}

    this.lastSatietyCheck = 0

    if (state.upgrades.coffeeSubscription) {
      const oldEnergy = state.energy
      state.energy = Math.min(state.maxEnergy, state.energy + 5)
      const energyGained = state.energy - oldEnergy
      if (energyGained > 0) {
        this.ui.showToast(`☕ Утренний кофе: +${energyGained} энергии`)
      }
    }

    this.gameState.updateState(state)

    this.checkBills()

    if (window.game && window.game.eventManager) {
      window.game.eventManager.checkEventExpiration()
      window.game.eventManager.tryTriggerEvent()
    }
  }

  checkDeliveries() {
    const state = this.gameState.getState()
    const currentHour = Math.floor(state.time)

    if (
      currentHour >= GAME_CONSTANTS.DELIVERY_TIME &&
      state.pendingUpgrades &&
      state.pendingUpgrades.length > 0
    ) {
      const readyToDeliver = state.pendingUpgrades.filter(
        (upgrade) => upgrade.orderedDay < state.day
      )

      if (readyToDeliver.length > 0) {
        this.deliverUpgrades(readyToDeliver)
      }
    }
  }

  deliverUpgrades(upgradesToDeliver) {
    const state = this.gameState.getState()

    upgradesToDeliver.forEach((upgrade) => {
      const upgradeKey = upgrade.key
      state.upgrades[upgradeKey] = true
      const item = MARKETPLACE_ITEMS[upgradeKey]

      if (item && item.effect) {
        if (item.effect.type === "maxEnergy") {
          state.maxEnergy += item.effect.value
        } else if (item.effect.type === "maxHealth") {
          if (!state.maxHealth) {
            state.maxHealth = GAME_CONSTANTS.INITIAL_HEALTH
          }
          state.maxHealth += item.effect.value
        }
      }

      this.ui.showToast(`📦 Доставлено: ${item ? item.name : upgradeKey}`)

      state.pendingUpgrades = state.pendingUpgrades.filter(
        (p) => p.key !== upgradeKey
      )
    })

    this.gameState.updateState(state)
  }
}
