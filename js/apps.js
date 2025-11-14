import { ORDERS, SLEEP_OPTIONS } from "./config.js"
import { UI_SELECTORS, MESSAGES, GAME_CONSTANTS } from "./constants.js"
import { SkillsManager } from "./skills.js"
import { LearningManager } from "./learning.js"
import { BrowserManager } from "./browser.js"
import { TimeManager } from "./time.js"
import { UIManager } from "./ui.js"

export class AppsManager {
  constructor(gameState) {
    this.gameState = gameState
    this.ui = new UIManager()
    this.skillsManager = new SkillsManager(gameState)
    this.learningManager = new LearningManager(gameState, this.skillsManager)
    this.browserManager = new BrowserManager(gameState, this)
    this.timeManager = new TimeManager(gameState)
    this.activeOrder = null
    this.availableOrders = [...ORDERS]
  }

  openApp(appName) {
    this.closeAllWindows()
    const window = this.getWindow(appName)

    if (window) {
      window.classList.remove("hidden")
      this.renderApp(appName)
    }
  }

  closeAllWindows() {
    const windowIds = [
      UI_SELECTORS.PORTFOLIO_WINDOW,
      UI_SELECTORS.WZCODE_WINDOW,
      UI_SELECTORS.BROWSER_WINDOW,
      UI_SELECTORS.SKILLS_WINDOW,
      UI_SELECTORS.LEARNING_WINDOW,
      UI_SELECTORS.TELEHLAM_WINDOW,
      UI_SELECTORS.SLEEP_WINDOW,
    ]

    windowIds.forEach((id) => {
      const window = document.getElementById(id)
      window?.classList.add("hidden")
    })
  }

  getWindow(appName) {
    const windowMap = {
      portfolio: UI_SELECTORS.PORTFOLIO_WINDOW,
      wzcode: UI_SELECTORS.WZCODE_WINDOW,
      browser: UI_SELECTORS.BROWSER_WINDOW,
      skills: UI_SELECTORS.SKILLS_WINDOW,
      learning: UI_SELECTORS.LEARNING_WINDOW,
      telehlam: UI_SELECTORS.TELEHLAM_WINDOW,
      sleep: UI_SELECTORS.SLEEP_WINDOW,
    }

    const windowId = windowMap[appName]
    return windowId ? document.getElementById(windowId) : null
  }

  renderApp(appName) {
    const renderMap = {
      wzcode: () => this.renderWZCode(),
      browser: () => this.browserManager.render(),
      skills: () => this.renderSkills(),
      learning: () => this.renderLearning(),
      telehlam: () => this.renderTelehlam(),
      sleep: () => this.renderSleep(),
      portfolio: () => this.renderPortfolio(),
    }

    const renderFunction = renderMap[appName]
    if (renderFunction) {
      renderFunction()
    }
  }

  renderPortfolio() {
    const state = this.gameState.getState()
    const body = document.getElementById("portfolio-body")

    if (state.portfolio.length === 0) {
      body.innerHTML = `
        <div class="message">
          <strong>Мои работы:</strong><br><br>
          Пока пусто. Выполняй заказы, чтобы заполнить портфолио!
        </div>
      `
      return
    }

    const portfolioHtml = state.portfolio
      .map(
        (item) => `
      <div class="portfolio-item">
        <strong>${item.title}</strong><br>
        ${item.description}
      </div>
    `
      )
      .join("")

    body.innerHTML = `
      <div class="message">
        <strong>Мои работы:</strong>
      </div>
      <div class="portfolio-list">${portfolioHtml}</div>
    `
  }

  renderSleep() {
    const state = this.gameState.getState()
    const body = document.getElementById(UI_SELECTORS.SLEEP_BODY)

    this.timeManager.validateTime(state)
    this.gameState.updateState(state)

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
        const hours = parseFloat(e.target.dataset.hours)
        const restore = parseInt(e.target.dataset.restore)
        this.handleSleep(hours, restore)
      })
    })
  }

  handleSleep(hours, restore) {
    this.timeManager.sleep(hours, restore)
    this.closeAllWindows()
  }

  renderTelehlam() {
    const body = document.getElementById(UI_SELECTORS.TELEHLAM_BODY)
    body.innerHTML = `
      <div class="message">
        <strong>Telehlam</strong><br><br>
        ${MESSAGES.APP_IN_DEVELOPMENT}
      </div>
    `
  }

  renderSkills() {
    const body = document.getElementById(UI_SELECTORS.SKILLS_BODY)
    body.innerHTML = this.skillsManager.renderSkillsWindow()
  }

  renderLearning() {
    this.learningManager.render()
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
        const orderId = parseInt(e.target.dataset.orderId)
        this.takeOrder(orderId)
      })
    })
  }

  takeOrder(orderId) {
    const state = this.gameState.getState()

    if (state.activeOrder) {
      this.ui.showToast(MESSAGES.ACTIVE_ORDER_EXISTS)
      return
    }

    const order = this.findOrder(orderId)
    if (!order) return

    const playerLevel = state.skills[order.skill].level

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
    this.closeBrowserWindow()
  }

  findOrder(orderId) {
    return this.availableOrders.find((o) => o.id === orderId)
  }

  removeOrderFromAvailable(orderId) {
    this.availableOrders = this.availableOrders.filter((o) => o.id !== orderId)
  }

  showOrderTakenMessage(order) {
    this.ui.showToast(`Заказ "${order.title}" ${MESSAGES.ORDER_TAKEN}`)
  }

  closeBrowserWindow() {
    document.getElementById(UI_SELECTORS.BROWSER_WINDOW).classList.add("hidden")
  }

  renderWZCode() {
    const body = document.getElementById(UI_SELECTORS.WZCODE_BODY)
    const state = this.gameState.getState()

    if (state.activeOrder && !this.activeOrder) {
      this.activeOrder = state.activeOrder
    }

    if (!this.activeOrder) {
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
    const order = this.activeOrder
    const state = this.gameState.getState()

    const formatTime = (hours) => {
      const h = Math.floor(hours)
      const m = Math.round((hours - h) * 60)
      return m > 0 ? `${h}:${m.toString().padStart(2, "0")}` : `${h}:00`
    }

    const acceptedDay = order.acceptedDay || state.day
    const daysLeft = acceptedDay + order.deadline - state.day
    let deadlineText = `📅 Дедлайн: ${daysLeft} дн.`
    let deadlineColor = "var(--text-color)"

    if (daysLeft === 0) {
      deadlineText = `📅 Дедлайн: СЕГОДНЯ!`
      deadlineColor = "orange"
    } else if (daysLeft < 0) {
      deadlineText = `📅 Дедлайн: ПРОСРОЧЕН на ${Math.abs(daysLeft)} дн.!`
      deadlineColor = "var(--danger)"
    }

    const playerLevel = state.skills[order.skill].level
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
        ⚠ Ваш уровень ниже требуемого!<br>
        Расход энергии: +${Math.floor(levelDiff * 50)}%
      </div>`
    } else if (levelDiff < 0) {
      const levelAdvantage = Math.abs(levelDiff)
      const minutesReduction = levelAdvantage * 10
      warningText = `<div style="color: var(--accent); margin-top: 0.5rem;">
        ✨ Ваш уровень выше требуемого!<br>
        Время работы: -${minutesReduction} минут
      </div>`
    }

    const reward = order.baseReward || order.reward || 0

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
      <button class="window-action" id="work-btn">
        Работать (${timeText}, ${energyText})
      </button>
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
    const workBtn = document.getElementById("work-btn")
    if (workBtn) {
      workBtn.addEventListener("click", () => this.workOnOrder())
    }
  }

  workOnOrder() {
    const state = this.gameState.getState()
    const order = this.activeOrder

    if (!order) return

    const playerLevel = state.skills[order.skill].level

    if (playerLevel === 0) {
      this.ui.showToast("⚠️ Нужен хотя бы 1 уровень навыка! Учитесь сначала.")
      return
    }

    const levelDiff = order.requiredLevel - playerLevel
    const workData = this.calculateWorkCost(order, levelDiff)

    if (state.energy < workData.energyCost) {
      this.ui.showToast(MESSAGES.NO_ENERGY)
      return
    }

    if (!this.hasEnoughTime(state)) {
      this.ui.showToast("Недостаточно времени! Поспите.")
      return
    }

    this.processWork(state, workData.energyCost, workData.timeRequired)
    this.updateOrderProgress()
    this.checkOrderCompletion(state)
    this.renderWZCode()
  }

  calculateWorkCost(order, levelDiff) {
    let energyCost = order.energyCost
    let timeRequired = order.timeRequired

    if (levelDiff > 0) {
      energyCost = Math.floor(
        order.energyCost *
          (1 + levelDiff * GAME_CONSTANTS.ENERGY_PENALTY_PER_LEVEL_DIFF)
      )
    } else if (levelDiff < 0) {
      const levelAdvantage = Math.abs(levelDiff)
      const minutesReduction = levelAdvantage * 10
      timeRequired = Math.max(
        0.5,
        order.timeRequired - minutesReduction / GAME_CONSTANTS.MINUTES_IN_HOUR
      )
      timeRequired = Math.round(timeRequired * 10) / 10
    }

    timeRequired = Math.max(0.5, timeRequired)

    return { energyCost, timeRequired }
  }

  hasEnoughEnergy(state) {
    return state.energy >= this.activeOrder.energyCost
  }

  hasEnoughTime(state) {
    const newTime = state.time + this.activeOrder.timeRequired
    return newTime < 24
  }

  processWork(state, energyCost, timeRequired) {
    this.timeManager.addTime(timeRequired)
    this.gameState.updateState({
      energy: state.energy - energyCost,
    })
  }

  updateOrderProgress() {
    this.activeOrder.progress += GAME_CONSTANTS.WORK_PROGRESS_STEP

    const state = this.gameState.getState()
    if (state.activeOrder) {
      state.activeOrder.progress = this.activeOrder.progress
      this.gameState.updateState(state)
    }
  }

  checkOrderCompletion(state) {
    if (this.activeOrder.progress >= GAME_CONSTANTS.PROGRESS_COMPLETE) {
      this.completeOrder(state)
    }
  }

  completeOrder(state) {
    const order = this.activeOrder
    const acceptedDay = order.acceptedDay || state.day
    const daysLeft = acceptedDay + order.deadline - state.day

    const baseReward = order.baseReward || order.reward || 0
    let reward = baseReward
    let reputationGain = order.reputation || 1
    let message = `${MESSAGES.ORDER_COMPLETED} +${reward.toLocaleString()} ₽`

    if (daysLeft < 0) {
      const penalty =
        Math.abs(daysLeft) * GAME_CONSTANTS.PENALTY_PER_OVERDUE_DAY
      reward = Math.floor(reward * (1 - penalty))
      reputationGain = 0
      message = `⚠️ Заказ выполнен с просрочкой! +${reward.toLocaleString()} ₽ (штраф ${Math.floor(
        penalty * 100
      )}%)`
    }

    state.money += reward
    state.reputation += reputationGain

    const xpGain = this.skillsManager.calculateXPGain(reward)
    this.skillsManager.addXP(order.skill, xpGain)

    state.portfolio.push({
      title: order.title,
      description: `Выполнен заказ: ${order.description}`,
    })

    if (!state.completedOrders) {
      state.completedOrders = []
    }
    state.completedOrders.push(order)

    state.activeOrder = null
    this.activeOrder = null

    this.gameState.updateState(state)
    this.ui.showToast(message)
  }
}
