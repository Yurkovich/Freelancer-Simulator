import { ORDERS } from "./config.js"
import { UI_SELECTORS, MESSAGES, GAME_CONSTANTS } from "./constants.js"

export class AppsManager {
  constructor(gameState) {
    this.gameState = gameState
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
    }

    const windowId = windowMap[appName]
    return windowId ? document.getElementById(windowId) : null
  }

  renderApp(appName) {
    const renderMap = {
      wzcode: () => this.renderWZCode(),
      browser: () => this.renderBrowser(),
    }

    const renderFunction = renderMap[appName]
    if (renderFunction) {
      renderFunction()
    }
  }

  renderBrowser() {
    const body = document.getElementById(UI_SELECTORS.BROWSER_BODY)

    if (this.availableOrders.length === 0) {
      body.innerHTML = this.createNoOrdersMessage()
      return
    }

    body.innerHTML = this.createBrowserContent()
    this.attachOrderHandlers()
  }

  createNoOrdersMessage() {
    return `
      <div class="message">
        <strong>Krork - биржа фриланса</strong><br><br>
        ${MESSAGES.NO_ORDERS}
      </div>
    `
  }

  createBrowserContent() {
    const ordersHtml = this.availableOrders
      .map((order) => this.createOrderCard(order))
      .join("")

    return `
      <div class="message">
        <strong>Krork - биржа фриланса</strong><br>
        Выбери заказ и начни работать!
      </div>
      ${ordersHtml}
    `
  }

  createOrderCard(order) {
    return `
      <div style="border: 2px solid #314a74; padding: 1rem; margin-bottom: 1rem; background: rgba(12, 22, 41, 0.5);">
        <strong>${order.title}</strong><br>
        ${order.description}<br><br>
        <strong>Оплата:</strong> ${order.reward} ₽<br>
        <strong>Время:</strong> ${order.timeRequired}ч | <strong>Энергия:</strong> ${order.energyCost}<br><br>
        <button class="take-order-btn" data-order-id="${order.id}" style="padding: 0.5rem 1rem; background: #53f5c8; border: none; cursor: pointer; font-family: inherit; font-size: 0.6rem;">
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
    if (this.activeOrder) {
      alert(MESSAGES.ACTIVE_ORDER_EXISTS)
      return
    }

    const order = this.findOrder(orderId)
    if (!order) return

    this.setActiveOrder(order)
    this.removeOrderFromAvailable(orderId)
    this.showOrderTakenMessage(order)
    this.closeBrowserWindow()
  }

  findOrder(orderId) {
    return this.availableOrders.find((o) => o.id === orderId)
  }

  setActiveOrder(order) {
    this.activeOrder = { ...order, progress: 0 }
  }

  removeOrderFromAvailable(orderId) {
    this.availableOrders = this.availableOrders.filter((o) => o.id !== orderId)
  }

  showOrderTakenMessage(order) {
    alert(`Заказ "${order.title}" ${MESSAGES.ORDER_TAKEN}`)
  }

  closeBrowserWindow() {
    document.getElementById(UI_SELECTORS.BROWSER_WINDOW).classList.add("hidden")
  }

  renderWZCode() {
    const body = document.getElementById(UI_SELECTORS.WZCODE_BODY)

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

    return `
      <div class="message">
        <strong>Активная задача:</strong> ${order.title}<br>
        ${order.description}<br><br>
        <strong>Оплата:</strong> ${order.reward} ₽<br>
        <strong>Прогресс:</strong> ${order.progress}%<br><br>
        ${this.createProgressBar(order.progress)}
        <button id="work-btn" style="padding: 0.6rem 1rem; background: #53f5c8; border: none; cursor: pointer; font-family: inherit; font-size: 0.6rem; margin-top: 10px;">
          Работать (${order.timeRequired}ч, -${order.energyCost} энергии)
        </button>
      </div>
    `
  }

  createProgressBar(progress) {
    return `
      <div style="background: #0a1628; height: 20px; border: 2px solid #314a74; margin: 10px 0;">
        <div style="background: #53f5c8; height: 100%; width: ${progress}%;"></div>
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

    if (!this.hasEnoughEnergy(state)) {
      alert(MESSAGES.NO_ENERGY)
      return
    }

    this.processWork(state)
    this.updateOrderProgress()
    this.checkOrderCompletion(state)
    this.renderWZCode()
  }

  hasEnoughEnergy(state) {
    return state.energy >= this.activeOrder.energyCost
  }

  processWork(state) {
    this.gameState.addTime(this.activeOrder.timeRequired)
    this.gameState.updateState({
      energy: state.energy - this.activeOrder.energyCost,
    })
  }

  updateOrderProgress() {
    this.activeOrder.progress += GAME_CONSTANTS.WORK_PROGRESS_STEP
  }

  checkOrderCompletion(state) {
    if (this.activeOrder.progress >= GAME_CONSTANTS.PROGRESS_COMPLETE) {
      this.completeOrder(state)
    }
  }

  completeOrder(state) {
    this.gameState.updateState({
      money: state.money + this.activeOrder.reward,
    })
    alert(`${MESSAGES.ORDER_COMPLETED} +${this.activeOrder.reward} ₽`)
    this.activeOrder = null
  }
}
