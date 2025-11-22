import {
  UI_SELECTORS,
  MESSAGES,
  GAME_CONSTANTS,
  SKILL_NAMES,
} from "./constants.js"
import { GameUtils } from "./utils.js"

export class OrderManager {
  constructor(gameState, skillsManager, timeManager, ui, windowManager) {
    this.gameState = gameState
    this.skillsManager = skillsManager
    this.timeManager = timeManager
    this.ui = ui
    this.windowManager = windowManager
    this.activeOrder = null
    this.syncActiveOrder()
  }

  syncActiveOrder() {
    const state = this.gameState.getState()

    if (!state || !state.skills) {
      this.activeOrder = null
      return
    }

    if (state.activeOrder) {
      const order = state.activeOrder
      const validSkills = [
        SKILL_NAMES.LAYOUT,
        SKILL_NAMES.WORKPRESS,
        SKILL_NAMES.FREELANCE,
      ]

      if (!this.validateOrder(order, state, validSkills)) {
        state.activeOrder = null
        this.gameState.updateState(state)
        this.activeOrder = null
        return
      }

      this.activeOrder = {
        ...order,
        progress: order.progress !== undefined ? order.progress : 0,
        acceptedDay: order.acceptedDay || state.day,
        deadline: order.deadline || GAME_CONSTANTS.DEFAULT_ORDER_DEADLINE,
      }
    } else {
      this.activeOrder = null
    }
  }

  validateOrder(order, state, validSkills) {
    if (!order || typeof order !== "object" || !order.skill) {
      return false
    }

    if (!validSkills.includes(order.skill)) {
      return false
    }

    if (!state.skills || typeof state.skills !== "object") {
      return false
    }

    const orderSkill = state.skills[order.skill]
    if (!orderSkill || typeof orderSkill !== "object") {
      return false
    }

    if (!("level" in orderSkill) || typeof orderSkill.level !== "number") {
      return false
    }

    return true
  }

  getActiveOrder() {
    return this.activeOrder
  }

  setActiveOrder(order) {
    this.activeOrder = order
  }

  takeOrder(orderId) {
    const state = this.gameState.getState()

    if (state.activeOrder) {
      this.ui.showToast(MESSAGES.ACTIVE_ORDER_EXISTS)
      return
    }

    const order = this.findOrder(orderId)
    if (!order) return

    const skill = state.skills[order.skill]
    if (!skill) return

    const playerLevel = skill.level || 0

    if (playerLevel === 0) {
      this.ui.showToast("Нужен хотя бы 1 уровень навыка!")
      return
    }

    const orderWithDeadline = {
      ...order,
      progress: 0,
      acceptedDay: state.day,
      deadline: order.deadline || GAME_CONSTANTS.DEFAULT_ORDER_DEADLINE,
    }

    this.activeOrder = orderWithDeadline
    state.activeOrder = orderWithDeadline
    this.removeOrderFromAvailable(orderId)
    this.gameState.updateState(state)
    this.showOrderTakenMessage(order)
    this.windowManager.closeWindow("browser")
  }

  findOrder(orderId) {
    const state = this.gameState.getState()
    return state.kworkOrders?.find((o) => o.id === orderId) || null
  }

  removeOrderFromAvailable(orderId) {
    const state = this.gameState.getState()
    if (state.kworkOrders) {
      state.kworkOrders = state.kworkOrders.filter((o) => o.id !== orderId)
      this.gameState.updateState(state)
    }
  }

  showOrderTakenMessage(order) {
    this.ui.showToast(`Заказ "${order.title}" ${MESSAGES.ORDER_TAKEN}`)
  }

  createOrderCard(order) {
    return `
      <div class="kwork-order">
        <div class="kwork-order-header">
          <strong>${order.title}</strong>
          <span style="color: var(--accent)">${order.reward} ₽</span>
        </div>
        <div class="kwork-order-meta">
          ${order.description}<br>
          <span style="color: var(--muted);">
            Время: ${order.timeRequired}ч | Энергия: ${order.energyCost}
          </span>
        </div>
        <button class="window-action kwork-apply-btn take-order-btn" data-order-id="${order.id}">
          Взять заказ
        </button>
      </div>
    `
  }

  attachOrderHandlers() {
    document.querySelectorAll(".take-order-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const orderId = GameUtils.parseOrderId(e.target.dataset.orderId)
        if (orderId !== null) {
          this.takeOrder(orderId)
        }
      })
    })
  }

  renderWZCode() {
    const body = document.getElementById(UI_SELECTORS.WZCODE_BODY)
    if (!body) return

    const state = this.gameState.getState()

    if (!state || !state.skills || typeof state.skills !== "object") {
      this.activeOrder = null
      body.innerHTML = this.createNoActiveOrderMessage()
      return
    }

    if (!state.activeOrder) {
      this.activeOrder = null
      body.innerHTML = this.createNoActiveOrderMessage()
      return
    }

    if (!this.activeOrder) {
      const orderFromState = state.activeOrder
      if (orderFromState && typeof orderFromState === "object") {
        this.activeOrder = {
          ...orderFromState,
          progress: orderFromState.progress !== undefined ? orderFromState.progress : 0,
          acceptedDay: orderFromState.acceptedDay !== undefined ? orderFromState.acceptedDay : state.day,
          deadline: orderFromState.deadline || GAME_CONSTANTS.DEFAULT_ORDER_DEADLINE,
        }
      } else {
        this.activeOrder = null
        state.activeOrder = null
        this.gameState.updateState(state)
        body.innerHTML = this.createNoActiveOrderMessage()
        return
      }
    }

    const validSkills = [
      SKILL_NAMES.LAYOUT,
      SKILL_NAMES.WORKPRESS,
      SKILL_NAMES.FREELANCE,
    ]

    if (!this.validateOrder(this.activeOrder, state, validSkills)) {
      this.activeOrder = null
      state.activeOrder = null
      this.gameState.updateState(state)
      body.innerHTML = this.createNoActiveOrderMessage()
      return
    }

    body.innerHTML = this.createWZCodeContent()
    this.attachWorkHandler()
  }

  createNoActiveOrderMessage() {
    return `
      <div class="message">
        ${MESSAGES.NO_ACTIVE_ORDER}<br><br>
        ${MESSAGES.CHECK_KRORK}
      </div>
    `
  }

  createWZCodeContent() {
    const state = this.gameState.getState()
    const order = state.activeOrder || this.activeOrder

    if (!order || !order.skill) {
      return this.createNoActiveOrderMessage()
    }

    const validSkills = [
      SKILL_NAMES.LAYOUT,
      SKILL_NAMES.WORKPRESS,
      SKILL_NAMES.FREELANCE,
    ]

    if (!validSkills.includes(order.skill)) {
      state.activeOrder = null
      this.activeOrder = null
      this.gameState.updateState(state)
      return this.createNoActiveOrderMessage()
    }

    const skill = state.skills[order.skill]
    if (!skill || typeof skill !== "object" || !("level" in skill) || typeof skill.level !== "number") {
      state.activeOrder = null
      this.activeOrder = null
      this.gameState.updateState(state)
      return this.createNoActiveOrderMessage()
    }

    const formatTime = (hours) => {
      const h = Math.floor(hours)
      const m = Math.round((hours - h) * 60)
      return m > 0 ? `${h}:${m.toString().padStart(2, "0")}` : `${h}:00`
    }

    const acceptedDay = order.acceptedDay || state.day
    const daysLeft = acceptedDay + order.deadline - state.day
    let deadlineText = GameUtils.replaceEmojiWithIcon(
      `📅 Дедлайн: ${daysLeft} дн.`
    )
    let deadlineColor = "var(--text-color)"

    if (daysLeft === 0) {
      deadlineText = GameUtils.replaceEmojiWithIcon(`📅 Дедлайн: СЕГОДНЯ!`)
      deadlineColor = "orange"
    } else if (daysLeft < 0) {
      deadlineText = GameUtils.replaceEmojiWithIcon(
        `📅 Дедлайн: ПРОСРОЧЕН на ${Math.abs(daysLeft)} дн.!`
      )
      deadlineColor = "var(--danger)"
    }

    const playerLevel = skill.level || 0
    const requiredLevel = order.requiredLevel || 1
    const levelDiff = requiredLevel - playerLevel

    const workData = this.calculateWorkCost(order, levelDiff)

    const energyText = `<img src="img/icons/energy.png" alt="⚡" class="stat-icon">&nbsp;${workData.energyCost}&nbsp;энергии`
    const timeText = `<img src="img/icons/clock.png" alt="⏱" class="stat-icon">&nbsp;${formatTime(
      workData.timeRequired
    )}`

    let warningText = ""
    if (levelDiff > 0) {
      warningText = `<div style="color: var(--danger); margin-top: 0.5rem;">
        ${GameUtils.replaceEmojiWithIcon("⚠ Ваш уровень ниже требуемого!")}<br>
        Расход энергии: +${Math.floor(
          levelDiff * GAME_CONSTANTS.ENERGY_PENALTY_PERCENT_PER_LEVEL
        )}%
      </div>`
    } else if (levelDiff < 0) {
      const levelAdvantage = Math.abs(levelDiff)
      const minutesReduction =
        levelAdvantage *
        GAME_CONSTANTS.TIME_REDUCTION_MINUTES_PER_LEVEL_ADVANTAGE
      warningText = `<div style="color: var(--accent); margin-top: 0.5rem;">
        ${GameUtils.replaceEmojiWithIcon("✨ Ваш уровень выше требуемого!")}<br>
        Время работы: -${minutesReduction} минут
      </div>`
    }

    const reward = order.baseReward || order.reward || 0
    const hasHalfWorkOption =
      requiredLevel >= GAME_CONSTANTS.MIN_ORDER_LEVEL_FOR_HALF_WORK

    const halfWorkData = hasHalfWorkOption
      ? this.calculateWorkCost(order, levelDiff, true)
      : null

    const halfEnergyText = halfWorkData
      ? `<img src="img/icons/energy.png" alt="⚡" class="stat-icon">&nbsp;${halfWorkData.energyCost}&nbsp;энергии`
      : ""
    const halfTimeText = halfWorkData
      ? `<img src="img/icons/clock.png" alt="⏱" class="stat-icon">&nbsp;${formatTime(
          halfWorkData.timeRequired
        )}`
      : ""

    const halfProgressStep = Math.round(
      GAME_CONSTANTS.WORK_PROGRESS_STEP *
        GAME_CONSTANTS.HALF_WORK_PROGRESS_MULTIPLIER
    )

    const buttonsHtml = hasHalfWorkOption
      ? `
        <button class="window-action" id="work-btn-full">
          Работать полностью (${timeText}, ${energyText}) - +${GAME_CONSTANTS.WORK_PROGRESS_STEP}%
        </button>
        <button class="window-action" id="work-btn-half">
          Работать наполовину (${halfTimeText}, ${halfEnergyText}) - +${halfProgressStep}%
        </button>
      `
      : `
        <button class="window-action" id="work-btn-full">
          Работать (${timeText}, ${energyText})
        </button>
      `

    return `
      <div class="message">
        <strong>Активная задача:</strong> ${order.title}<br>
        ${order.description}<br><br>
        <strong>Оплата:</strong> ${reward.toLocaleString()} ₽<br>
        <strong>Прогресс:</strong> ${order.progress}%<br>
        <span style="color: ${deadlineColor};">${deadlineText}</span>
        ${warningText}
      </div>
      ${this.createProgressBar(order.progress)}
      ${buttonsHtml}
    `
  }

  createProgressBar(progress) {
    return `
      <div class="task-progress">
        <span style="width: ${progress}%"></span>
      </div>
    `
  }

  attachWorkHandler() {
    const workBtnFull = document.getElementById("work-btn-full")
    if (workBtnFull) {
      workBtnFull.addEventListener("click", () => this.workOnOrder(false))
    }

    const workBtnHalf = document.getElementById("work-btn-half")
    if (workBtnHalf) {
      workBtnHalf.addEventListener("click", () => this.workOnOrder(true))
    }
  }

  workOnOrder(isHalfWork = false) {
    const state = this.gameState.getState()
    const order = this.activeOrder

    if (!order) return

    const skill = state.skills[order.skill]
    if (!skill) return

    const playerLevel = skill.level || 0

    if (playerLevel === 0) {
      this.ui.showToast("⚠️ Нужен хотя бы 1 уровень навыка! Учитесь сначала.")
      return
    }

    const requiredLevel = order.requiredLevel || 1
    if (
      isHalfWork &&
      requiredLevel < GAME_CONSTANTS.MIN_ORDER_LEVEL_FOR_HALF_WORK
    ) {
      this.ui.showToast(
        `⚠️ Работа наполовину доступна только для заказов ${GAME_CONSTANTS.MIN_ORDER_LEVEL_FOR_HALF_WORK} уровня и выше!`
      )
      return
    }

    const levelDiff = requiredLevel - playerLevel
    const workData = this.calculateWorkCost(order, levelDiff, isHalfWork)

    if (state.energy < workData.energyCost) {
      this.ui.showToast(MESSAGES.NO_ENERGY)
      return
    }

    this.processWork(state, workData.energyCost, workData.timeRequired)
    this.updateOrderProgress(isHalfWork)

    if (window.game && window.game.lifecycleManager) {
      if (window.game.lifecycleManager.checkHospital()) {
        return
      }
    }

    this.checkOrderCompletion(state)
    this.renderWZCode()
  }

  calculateWorkCost(order, levelDiff, isHalfWork = false) {
    const state = this.gameState.getState()
    const requiredLevel = order.requiredLevel || 1
    const baseEnergy = order.energyCost || GameUtils.calculateOrderEnergy(requiredLevel)
    let energyCost = baseEnergy
    let timeRequired = order.timeRequired

    if (isHalfWork) {
      energyCost = baseEnergy * GAME_CONSTANTS.HALF_WORK_ENERGY_MULTIPLIER
      timeRequired =
        timeRequired * GAME_CONSTANTS.HALF_WORK_TIME_MULTIPLIER
    }

    if (levelDiff > 0) {
      energyCost = Math.floor(
        energyCost *
          (1 + levelDiff * GAME_CONSTANTS.ENERGY_PENALTY_PER_LEVEL_DIFF)
      )
    } else if (levelDiff < 0) {
      const levelAdvantage = Math.abs(levelDiff)
      const minutesReduction =
        levelAdvantage *
        GAME_CONSTANTS.TIME_REDUCTION_MINUTES_PER_LEVEL_ADVANTAGE
      timeRequired = Math.max(
        GAME_CONSTANTS.MIN_WORK_TIME_HOURS,
        timeRequired - minutesReduction / GAME_CONSTANTS.MINUTES_IN_HOUR
      )
      timeRequired =
        Math.round(
          timeRequired * GAME_CONSTANTS.TIME_ROUNDING_PRECISION
        ) / GAME_CONSTANTS.TIME_ROUNDING_PRECISION
    }

    let energyReduction = 0
    if (state.upgrades.pcUltra) {
      energyReduction = GAME_CONSTANTS.PC_ULTRA_ENERGY_REDUCTION
    } else if (state.upgrades.pc) {
      energyReduction = GAME_CONSTANTS.PC_ENERGY_REDUCTION
    }

    energyCost = Math.floor(energyCost * (1 - energyReduction))

    let timeReduction = 0
    if (state.upgrades.keyboard) {
      timeReduction += GAME_CONSTANTS.KEYBOARD_TIME_REDUCTION_MINUTES
    }
    if (state.upgrades.mouse) {
      timeReduction += GAME_CONSTANTS.MOUSE_TIME_REDUCTION_MINUTES
    }
    if (state.upgrades.secondMonitor) {
      timeReduction += GAME_CONSTANTS.SECOND_MONITOR_TIME_REDUCTION_MINUTES
    }

    timeRequired = Math.max(
      GAME_CONSTANTS.MIN_WORK_TIME_HOURS,
      timeRequired - timeReduction / GAME_CONSTANTS.MINUTES_IN_HOUR
    )
    timeRequired =
      Math.round(
        timeRequired * GAME_CONSTANTS.TIME_ROUNDING_PRECISION
      ) / GAME_CONSTANTS.TIME_ROUNDING_PRECISION

    if (window.game && window.game.eventManager) {
      const workSpeedModifier =
        window.game.eventManager.getActiveEventModifier("workSpeed")
      timeRequired = timeRequired / workSpeedModifier

      const energyModifier =
        window.game.eventManager.getActiveEventModifier("energy")
      energyCost = Math.floor(energyCost * energyModifier)
    }

    return { energyCost, timeRequired }
  }

  processWork(state, energyCost, timeRequired) {
    const isNight = this.timeManager.isNightTime(state.time)

    this.timeManager.addTime(timeRequired)
    this.gameState.updateState({
      energy: state.energy - energyCost,
    })

    if (isNight) {
      this.timeManager.applyNightPenalty(timeRequired)
    }

    if (window.game && window.game.eventManager) {
      window.game.eventManager.applyBurningChairPenalty(timeRequired)
    }
  }

  updateOrderProgress(isHalfWork = false) {
    if (!this.activeOrder) return

    const progressStep = isHalfWork
      ? GAME_CONSTANTS.WORK_PROGRESS_STEP *
        GAME_CONSTANTS.HALF_WORK_PROGRESS_MULTIPLIER
      : GAME_CONSTANTS.WORK_PROGRESS_STEP

    this.activeOrder.progress += progressStep

    const state = this.gameState.getState()
    if (state.activeOrder) {
      state.activeOrder = {
        ...state.activeOrder,
        progress: this.activeOrder.progress,
      }
      this.gameState.updateState(state)
    }
  }

  checkOrderCompletion(state) {
    if (this.activeOrder.progress >= GAME_CONSTANTS.PROGRESS_COMPLETE) {
      const freshState = this.gameState.getState()
      this.completeOrder(freshState)
    }
  }

  completeOrder(state) {
    this.completeOrderInternal(state, true)
  }

  completeOrderFromEvent(state) {
    this.completeOrderInternal(state, false)
  }

  completeOrderInternal(state, shouldAddXP) {
    const order = this.activeOrder
    if (!order) return

    const acceptedDay = order.acceptedDay || state.day
    const daysLeft = acceptedDay + order.deadline - state.day

    const baseReward = order.baseReward || order.reward || 0
    let reward = baseReward
    let reputationGain = order.reputation || 1
    let message = `${MESSAGES.ORDER_COMPLETED} +${reward.toLocaleString()} ₽`

    if (window.audio) {
      if (daysLeft >= 0) {
        window.audio.playSound("success")
      } else {
        window.audio.playSound("error")
      }
    }

    if (daysLeft < 0) {
      const penalty =
        Math.abs(daysLeft) * GAME_CONSTANTS.PENALTY_PER_OVERDUE_DAY
      reward = Math.floor(reward * (1 - penalty))
      reputationGain = 0
      message = `⚠️ Заказ выполнен с просрочкой! +${reward.toLocaleString()} ₽ (штраф ${Math.floor(
        penalty * 100
      )}%)`
    }

    if (state.upgrades.webcam && daysLeft >= 0) {
      reputationGain = Math.floor(reputationGain * 1.05)
    }

    if (window.game && window.game.eventManager) {
      const moneyModifier =
        window.game.eventManager.getActiveEventModifier("orderMoney")
      reward = Math.floor(reward * moneyModifier)

      if (state.activeEvent && state.activeEvent.id === "unexpectedBonus") {
        state.activeEvent = null
      }
    }

    const updatedState = {
      ...state,
      money: state.money + reward,
      reputation: state.reputation + reputationGain,
      activeOrder: null,
    }

    const portfolio = [...(state.portfolio || [])]
    portfolio.push({
      title: order.title,
      description: `Выполнен заказ: ${order.description}`,
    })
    updatedState.portfolio = portfolio

    const completedOrders = [...(state.completedOrders || [])]
    completedOrders.push(order)
    updatedState.completedOrders = completedOrders

    if (shouldAddXP) {
      let xpGain = this.skillsManager.calculateXPGain(reward)
      xpGain += GameUtils.calculateXPBonus(state)

      if (window.game && window.game.eventManager) {
        const xpModifier = window.game.eventManager.getActiveEventModifier("xp")
        xpGain = Math.floor(xpGain * xpModifier)
      }

      this.skillsManager.addXP(order.skill, xpGain)
    }

    this.activeOrder = null

    this.gameState.updateState(updatedState)
    this.ui.showToast(message)

    if (window.game && window.game.updateAllUI) {
      window.game.updateAllUI()
    }

    const wzCodeBody = document.getElementById(UI_SELECTORS.WZCODE_BODY)
    if (wzCodeBody) {
      this.renderWZCode()
    }
  }
}

