import {
  MARKETPLACE_ITEMS,
  BOOKS,
  FOOD_ITEMS,
  SKILL_INFO,
  ORDER_TEMPLATES,
} from "./config.js"
import { SKILL_NAMES, GAME_CONSTANTS } from "./constants.js"
import { UIManager } from "./ui.js"
import { GameUtils } from "./utils.js"

export class BrowserManager {
  constructor(gameState, appsManager) {
    this.gameState = gameState
    this.appsManager = appsManager
    this.ui = new UIManager()
    this.activeTab = "kwork"
    this.marketplaceSubTab = "upgrades"
    this.deliverySubTab = "food"
  }

  render() {
    const browserBody = document.getElementById("browser-body")

    browserBody.innerHTML = `
      <div class="browser-tabs" id="browser-tabs"></div>
      <div class="browser-content" id="browser-content"></div>
    `

    this.updateWindowTitle()
    this.renderTabs()
    this.renderContent()
  }

  updateWindowTitle() {
    const browserWindow = document.getElementById("browser-window")
    const titleElement = browserWindow?.querySelector(".window-header span")

    if (titleElement) {
      const titles = {
        kwork: "Браузер - Krork",
        marketplace: "Браузер - Маркетплейс",
        delivery: "Браузер - Доставка",
      }
      titleElement.textContent = titles[this.activeTab] || "Браузер"
    }
  }

  renderTabs() {
    const tabsContainer = document.getElementById("browser-tabs")
    const tabs = [
      { id: "kwork", label: "Krork" },
      { id: "marketplace", label: "Маркетплейс" },
      { id: "delivery", label: "Доставка" },
    ]

    tabsContainer.innerHTML = tabs
      .map(
        (tab) => `
        <button 
          class="browser-tab ${this.activeTab === tab.id ? "active" : ""}" 
          data-tab="${tab.id}"
        >
          ${tab.label}
        </button>
      `
      )
      .join("")

    tabsContainer.querySelectorAll(".browser-tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (window.game && window.game.audio) {
          window.game.audio.playSound("uiClick")
        }
        this.activeTab = e.target.dataset.tab
        this.render()
      })
    })
  }

  renderContent() {
    const content = document.getElementById("browser-content")

    switch (this.activeTab) {
      case "kwork":
        this.renderKwork(content)
        break
      case "marketplace":
        this.renderMarketplace(content)
        break
      case "delivery":
        this.renderDelivery(content)
        break
    }
  }

  renderKwork(container) {
    let state = this.gameState.getState()

    if (!state.kworkOrders || state.kworkOrders.length === 0) {
      this.generateKworkOrders()
      state = this.gameState.getState()
    }

    const ordersHtml = (state.kworkOrders || [])
      .map((order) => this.createOrderCard(order, state))
      .join("")

    container.innerHTML = `
      <div class="message">
        <strong>Krork - биржа фриланса</strong><br>
        Откликайтесь на заказы. Шанс зависит от навыка "Фриланс".
      </div>
      <div class="kwork-orders">${ordersHtml}</div>
    `

    this.attachKworkHandlers(container)
  }

  generateKworkOrders() {
    const state = this.gameState.getState()
    const allTemplates = []

    const skillNames = [
      SKILL_NAMES.LAYOUT,
      SKILL_NAMES.WORKPRESS,
      SKILL_NAMES.FREELANCE,
    ]

    skillNames.forEach((skillName) => {
      const skillLevel = state.skills[skillName].level
      const templatesForSkill = this.getSuitableTemplates(skillName, skillLevel)
      allTemplates.push(...templatesForSkill)
    })

    if (allTemplates.length === 0) {
      state.kworkOrders = []
      this.gameState.updateState(state)
      return
    }

    const shuffled = GameUtils.shuffleArray(allTemplates)
    const uniqueTemplates = this.getUniqueTemplates(shuffled)

    const minCount = GAME_CONSTANTS.MIN_ORDERS_COUNT
    const maxCount = Math.min(
      GAME_CONSTANTS.MAX_ORDERS_COUNT,
      uniqueTemplates.length
    )
    const ordersCount =
      Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount

    const selectedTemplates = uniqueTemplates.slice(0, ordersCount)
    const orders = this.createOrdersFromTemplates(selectedTemplates)

    state.kworkOrders = orders
    this.gameState.updateState(state)
  }

  getSuitableTemplates(skillName, skillLevel) {
    const minLevel = Math.max(1, skillLevel - GAME_CONSTANTS.ORDER_LEVEL_RANGE)
    const maxLevel = skillLevel + GAME_CONSTANTS.ORDER_LEVEL_RANGE

    return ORDER_TEMPLATES.filter(
      (template) =>
        template.skill === skillName &&
        template.requiredLevel >= minLevel &&
        template.requiredLevel <= maxLevel
    )
  }

  getUniqueTemplates(templates) {
    const seenTitles = new Set()
    const unique = []

    for (const template of templates) {
      if (!seenTitles.has(template.title)) {
        seenTitles.add(template.title)
        unique.push(template)
      }
    }

    return unique
  }

  createOrdersFromTemplates(templates) {
    return templates.map((template) => {
      const deadline = this.calculateDeadline(template.requiredLevel)
      const energyCost = GameUtils.calculateOrderEnergy(template.requiredLevel)
      return {
        ...template,
        id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
        deadline: deadline,
        progress: 0,
        energyCost: energyCost,
      }
    })
  }

  calculateDeadline(requiredLevel) {
    const lowLevelMax = 2
    const midLevelMax = 4

    if (requiredLevel <= lowLevelMax) {
      return Math.floor(Math.random() * 3) + 2
    } else if (requiredLevel <= midLevelMax) {
      return Math.floor(Math.random() * 4) + 4
    } else {
      return Math.floor(Math.random() * 6) + 7
    }
  }

  createOrderCard(order, state) {
    const playerLevel = state.skills[order.skill].level
    const requiredLevel = order.requiredLevel || 1
    const canApply = playerLevel > 0

    const chanceData = this.calculateOrderChance(state)
    const rewardData = this.calculateOrderReward(order, state)

    return `
      <div class="kwork-order">
        <div class="kwork-order-header">
          <strong>${order.title}</strong>
          <span style="color: var(--accent)">${rewardData.finalReward.toLocaleString()} ₽</span>
        </div>
        <div class="kwork-order-meta">
          ${order.description}<br>
          <span style="color: var(--muted);">
            Навык: ${
              SKILL_INFO[order.skill]?.label || "Неизвестно"
            } (${requiredLevel} ур.)<br>
            Дедлайн: ${order.deadline} дн. | Шанс: ${chanceData.totalChance}%
            ${this.createReputationBonus(chanceData.reputationBonus)}
          </span>
        </div>
        <button 
          class="window-action kwork-apply-btn" 
          data-order-id="${order.id}"
          ${!canApply ? "disabled" : ""}
        >
          ${this.getButtonText(canApply)}
        </button>
      </div>
    `
  }

  calculateOrderChance(state) {
    const freelanceLevel = state.skills[SKILL_NAMES.FREELANCE]?.level || 0
    const baseChance = Math.min(
      GAME_CONSTANTS.ORDER_CHANCE_MAX_BASE,
      freelanceLevel * GAME_CONSTANTS.ORDER_CHANCE_PER_LEVEL
    )

    const reputationBonus = Math.min(
      GAME_CONSTANTS.ORDER_CHANCE_MAX_REPUTATION_BONUS,
      state.reputation * GAME_CONSTANTS.ORDER_CHANCE_REPUTATION_MULTIPLIER
    )

    const microphoneBonus = state.upgrades?.microphone
      ? GAME_CONSTANTS.ORDER_CHANCE_MICROPHONE_BONUS
      : 0

    const totalChance = Math.min(
      GAME_CONSTANTS.ORDER_CHANCE_MAX_TOTAL,
      baseChance + reputationBonus + microphoneBonus
    )

    return { baseChance, reputationBonus, totalChance }
  }

  calculateOrderReward(order, state) {
    const rewardBonus =
      state.reputation * GAME_CONSTANTS.ORDER_REWARD_REPUTATION_MULTIPLIER
    const finalReward = Math.floor(order.baseReward * (1 + rewardBonus))

    return { rewardBonus, finalReward }
  }

  createReputationBonus(reputationBonus) {
    return reputationBonus > 0
      ? `<br><span style="color: var(--accent);">+${reputationBonus.toFixed(
          1
        )}% от репутации</span>`
      : ""
  }

  getButtonText(canApply) {
    return canApply ? "Откликнуться" : "Нужен 1+ уровень"
  }

  attachKworkHandlers(container) {
    const buttons = container.querySelectorAll(".kwork-apply-btn")
    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const orderId = GameUtils.parseOrderId(e.currentTarget.dataset.orderId)
        if (orderId !== null) {
          this.applyToKworkOrder(orderId)
        }
      })
    })
  }

  applyToKworkOrder(orderId) {
    const state = this.gameState.getState()
    const order = state.kworkOrders.find((o) => o.id === orderId)

    if (!order) {
      return
    }

    if (!state.rejectedOrders) state.rejectedOrders = {}
    const rejectedKey = `${state.day}_${orderId}`

    if (state.rejectedOrders[rejectedKey]) {
      this.ui.showToast(`❌ Вы уже получили отказ по этому заказу сегодня`)
      return
    }

    const chanceData = this.calculateOrderChance(state)

    if (chanceData.totalChance === 0) {
      this.ui.showToast(`❌ Отклик отклонен. Прокачайте навык "Фриланс"!`)
      state.rejectedOrders[rejectedKey] = true
      this.gameState.updateState(state)
      return
    }

    const randomValue = Math.random() * 100
    const success = randomValue < chanceData.totalChance

    if (success) {
      this.acceptOrder(state, order)
    } else {
      this.rejectOrder(state, rejectedKey)
    }
  }

  acceptOrder(state, order) {
    if (!state.hasInternet) {
      this.ui.showToast("⚠️ Нет интернета! Оплатите счет.")
      return
    }

    const activeOrder = {
      ...order,
      progress: order.progress !== undefined ? order.progress : 0,
      acceptedDay: state.day,
      deadline: order.deadline || GAME_CONSTANTS.DEFAULT_ORDER_DEADLINE,
    }

    state.activeOrder = activeOrder
    state.kworkOrders = state.kworkOrders.filter((o) => o.id !== order.id)

    this.appsManager.activeOrder = activeOrder
    if (this.appsManager.availableOrders) {
      this.appsManager.availableOrders =
        this.appsManager.availableOrders.filter((o) => o.id !== order.id)
    }

    this.gameState.updateState(state)
    this.closeWindow()
    this.ui.showToast(`✅ Заказ получен! Приступайте к работе в WZ Code`)
  }

  rejectOrder(state, rejectedKey) {
    state.rejectedOrders[rejectedKey] = true
    this.gameState.updateState(state)
    this.ui.showToast(`❌ Отклик отклонен. Попробуйте другой заказ.`)
    this.render()
  }

  closeWindow() {
    const browserWindow = document.getElementById("browser-window")
    if (browserWindow) {
      browserWindow.classList.add("hidden")
    }
  }

  renderMarketplace(container) {
    const subTabs = `
      <div class="browser-subtabs">
        <button 
          class="browser-subtab ${
            this.marketplaceSubTab === "upgrades" ? "active" : ""
          }" 
          data-subtab="upgrades"
        >
          Улучшения
        </button>
        <button 
          class="browser-subtab ${
            this.marketplaceSubTab === "books" ? "active" : ""
          }" 
          data-subtab="books"
        >
          Книги
        </button>
      </div>
    `

    container.innerHTML = subTabs

    container.querySelectorAll(".browser-subtab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (window.game && window.game.audio) {
          window.game.audio.playSound("uiClick")
        }
        this.marketplaceSubTab = e.target.dataset.subtab
        this.renderMarketplace(container)
      })
    })

    if (this.marketplaceSubTab === "upgrades") {
      this.renderMarketplaceUpgrades(container)
    } else {
      this.renderMarketplaceBooks(container)
    }
  }

  renderMarketplaceUpgrades(container) {
    const state = this.gameState.getState()

    if (!state.upgrades) {
      state.upgrades = {}
    }
    if (!state.pendingUpgrades) {
      state.pendingUpgrades = []
    }

    const upgradesHtml = Object.entries(MARKETPLACE_ITEMS)
      .map(([key, item]) => {
        const owned = state.upgrades[key]
        const isPending = state.pendingUpgrades.some((p) => p.key === key)
        const requirementMet = !item.requires || state.upgrades[item.requires]
        const requirementPending =
          item.requires &&
          state.pendingUpgrades.some((p) => p.key === item.requires)
        const canBuy = !owned && !isPending && requirementMet

        let buttonText = "Купить"
        if (owned) buttonText = "Куплено"
        else if (isPending) buttonText = "Ожидает доставки"
        else if (requirementPending) {
          const requiredItem = MARKETPLACE_ITEMS[item.requires]
          buttonText = `Ждем: ${requiredItem.name}`
        } else if (!requirementMet) {
          const requiredItem = MARKETPLACE_ITEMS[item.requires]
          buttonText = `Нужно: ${requiredItem.name}`
        }

        return `
        <div class="marketplace-item">
          <div class="marketplace-item-header">
            <strong>${item.name}</strong>
            <span style="color: var(--accent)">${item.price.toLocaleString()} ₽</span>
          </div>
          <div class="marketplace-item-meta">
            ${item.description}
            ${
              item.requires && !owned
                ? `<br><span style="color: var(--muted); font-size: 0.5rem;">Требуется: ${
                    MARKETPLACE_ITEMS[item.requires].name
                  }</span>`
                : ""
            }
            ${
              isPending
                ? `<br><span style="color: var(--accent); font-size: 0.5rem;">📦 Доставка завтра</span>`
                : ""
            }
          </div>
          <button 
            class="window-action marketplace-buy-btn" 
            data-item="${key}"
            ${!canBuy ? "disabled" : ""}
          >
            ${buttonText}
          </button>
        </div>
      `
      })
      .join("")

    const content = `
      <div class="message">
        <strong>Улучшения ПК и образа жизни</strong><br>
        Повышайте производительность и комфорт
      </div>
      <div class="marketplace-items">${upgradesHtml}</div>
    `

    container.insertAdjacentHTML("beforeend", content)

    container.querySelectorAll(".marketplace-buy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemKey = e.target.dataset.item
        this.buyUpgrade(itemKey)
      })
    })
  }

  buyUpgrade(itemKey) {
    const state = this.gameState.getState()
    const item = MARKETPLACE_ITEMS[itemKey]

    if (item.requires) {
      const hasRequired = state.upgrades[item.requires]
      const isPending = state.pendingUpgrades.some(
        (p) => p.key === item.requires
      )

      if (!hasRequired) {
        if (isPending) {
          this.ui.showToast(
            `Дождитесь доставки: ${MARKETPLACE_ITEMS[item.requires].name}`
          )
        } else {
          this.ui.showToast(
            `Сначала купите: ${MARKETPLACE_ITEMS[item.requires].name}`
          )
        }
        return
      }
    }

    if (state.money < item.price) {
      this.ui.showToast("Недостаточно денег!")
      return
    }

    state.money -= item.price

    if (item.category === "upgrade") {
      state.pendingUpgrades.push({
        key: itemKey,
        orderedDay: state.day,
      })
      this.ui.showToast(`✅ Заказано: ${item.name}. Доставка завтра в 9:00!`)
    } else {
      state.upgrades[itemKey] = true

      if (item.effect.type === "maxEnergy") {
        state.maxEnergy += item.effect.value
      } else if (item.effect.type === "maxHealth") {
        state.maxHealth += item.effect.value
      }
      this.ui.showToast(`✅ Куплено: ${item.name}`)
    }

    this.gameState.updateState(state)
    this.render()
  }

  renderMarketplaceBooks(container) {
    const state = this.gameState.getState()

    if (!state.booksRead) {
      state.booksRead = []
    }
    if (!state.lastBookDay) {
      state.lastBookDay = 0
    }

    const booksHtml = Object.entries(BOOKS)
      .map(([key, book]) => {
        const read = state.booksRead.includes(key)
        const canBuy = state.day !== state.lastBookDay && !read
        return `
        <div class="marketplace-item">
          <div class="marketplace-item-header">
            <strong>${book.name}</strong>
            <span style="color: var(--accent)">${book.price.toLocaleString()} ₽</span>
          </div>
          <div class="marketplace-item-meta">
            ${book.description}<br>
            <span style="color: var(--muted);">+${book.xp} XP к навыку ${
          SKILL_INFO[book.skill].label
        }</span>
          </div>
          <button 
            class="window-action book-buy-btn" 
            data-book="${key}"
            ${!canBuy ? "disabled" : ""}
          >
            ${read ? "Прочитано" : !canBuy ? "1 книга в день" : "Купить"}
          </button>
        </div>
      `
      })
      .join("")

    const content = `
      <div class="message">
        <strong>Книги по программированию</strong><br>
        Можно купить 1 книгу в день
      </div>
      <div class="marketplace-items">${booksHtml}</div>
    `

    container.insertAdjacentHTML("beforeend", content)

    container.querySelectorAll(".book-buy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bookKey = e.target.dataset.book
        this.buyBook(bookKey)
      })
    })
  }

  buyBook(bookKey) {
    const state = this.gameState.getState()
    const book = BOOKS[bookKey]

    if (state.booksRead.includes(bookKey)) {
      this.ui.showToast("Вы уже читали эту книгу!")
      return
    }

    if (state.day === state.lastBookDay) {
      this.ui.showToast("Можно купить только 1 книгу в день!")
      return
    }

    if (state.money < book.price) {
      this.ui.showToast("Недостаточно денег!")
      return
    }

    state.money -= book.price
    state.booksRead.push(bookKey)
    state.lastBookDay = state.day

    let xpGain = book.xp
    xpGain += GameUtils.calculateXPBonus(state)

    const skill = state.skills[book.skill]
    skill.xp += xpGain

    const xpForNextLevel = skill.level === 0 ? 150 : skill.level * 100
    if (skill.xp >= xpForNextLevel) {
      skill.level += 1
      skill.xp = skill.xp - xpForNextLevel
      this.ui.showToast(
        `✅ Уровень повышен! ${SKILL_INFO[book.skill].label} теперь ${
          skill.level
        } уровня!`
      )
    } else {
      this.ui.showToast(`✅ Прочитано: ${book.name}. +${xpGain} XP`)
    }

    this.gameState.updateState(state)
    this.render()
  }

  renderDelivery(container) {
    const subTabs = `
      <div class="browser-subtabs">
        <button 
          class="browser-subtab ${
            this.deliverySubTab === "food" ? "active" : ""
          }" 
          data-subtab="food"
        >
          Еда
        </button>
        <button 
          class="browser-subtab ${
            this.deliverySubTab === "health" ? "active" : ""
          }" 
          data-subtab="health"
        >
          Здоровье
        </button>
      </div>
    `

    container.innerHTML = subTabs

    container.querySelectorAll(".browser-subtab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (window.game && window.game.audio) {
          window.game.audio.playSound("uiClick")
        }
        this.deliverySubTab = e.target.dataset.subtab
        this.renderDelivery(container)
      })
    })

    if (this.deliverySubTab === "food") {
      this.renderDeliveryFood(container)
    } else {
      this.renderDeliveryHealth(container)
    }
  }

  renderDeliveryFood(container) {
    const foodHtml = Object.entries(FOOD_ITEMS)
      .filter(([key, item]) => item.category === "food")
      .map(
        ([key, item]) => `
        <div class="delivery-item">
          <div class="delivery-item-header">
            <strong>${item.name}</strong>
            <span style="color: var(--accent)">${item.price} ₽</span>
          </div>
          <div class="delivery-item-meta">
            ${item.description}<br>
            <span style="color: var(--muted);">
              ${
                item.satiety > 0
                  ? `<img src="img/icons/food.png" alt="🍔" class="stat-icon">&nbsp;Сытость: +${item.satiety} `
                  : ""
              }
              ${
                item.energy > 0
                  ? `<img src="img/icons/energy.png" alt="⚡" class="stat-icon">&nbsp;Энергия: +${item.energy} `
                  : ""
              }
              ${
                item.health !== 0
                  ? `<img src="img/icons/heart.png" alt="❤" class="stat-icon">&nbsp;Здоровье: ${
                      item.health > 0 ? "+" : ""
                    }${item.health}`
                  : ""
              }
            </span>
          </div>
          <button 
            class="window-action delivery-buy-btn" 
            data-item="${key}"
          >
            Заказать
          </button>
        </div>
      `
      )
      .join("")

    const content = `
      <div class="message">
        <strong>Доставка еды</strong><br>
        Моментальная доставка еды и напитков
      </div>
      <div class="delivery-items">${foodHtml}</div>
    `

    container.insertAdjacentHTML("beforeend", content)

    container.querySelectorAll(".delivery-buy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemKey = e.target.dataset.item
        this.buyFood(itemKey)
      })
    })
  }

  renderDeliveryHealth(container) {
    const healthHtml = Object.entries(FOOD_ITEMS)
      .filter(([key, item]) => item.category === "health")
      .map(
        ([key, item]) => `
        <div class="delivery-item">
          <div class="delivery-item-header">
            <strong>${item.name}</strong>
            <span style="color: var(--accent)">${item.price} ₽</span>
          </div>
          <div class="delivery-item-meta">
            ${item.description}<br>
            <span style="color: var(--muted);">
              ${
                item.satiety > 0
                  ? `<img src="img/icons/food.png" alt="🍔" class="stat-icon">&nbsp;Сытость: +${item.satiety} `
                  : ""
              }
              ${
                item.energy > 0
                  ? `<img src="img/icons/energy.png" alt="⚡" class="stat-icon">&nbsp;Энергия: +${item.energy} `
                  : ""
              }
              ${
                item.health !== 0
                  ? `<img src="img/icons/heart.png" alt="❤" class="stat-icon">&nbsp;Здоровье: ${
                      item.health > 0 ? "+" : ""
                    }${item.health}`
                  : ""
              }
            </span>
          </div>
          <button 
            class="window-action delivery-buy-btn" 
            data-item="${key}"
          >
            Заказать
          </button>
        </div>
      `
      )
      .join("")

    const content = `
      <div class="message">
        <strong>Товары для здоровья</strong><br>
        Витамины и лекарства для восстановления
      </div>
      <div class="delivery-items">${healthHtml}</div>
    `

    container.insertAdjacentHTML("beforeend", content)

    container.querySelectorAll(".delivery-buy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemKey = e.target.dataset.item
        this.buyFood(itemKey)
      })
    })
  }

  buyFood(itemKey) {
    const state = this.gameState.getState()
    const item = FOOD_ITEMS[itemKey]

    if (state.money < item.price) {
      this.ui.showToast("Недостаточно денег!")
      return
    }

    if (item.satiety > 0 && state.satiety >= 100) {
      this.ui.showToast("Сытость уже максимальная!")
      return
    }

    const maxHealth = state.maxHealth || 100
    if (item.health > 0 && state.health >= maxHealth) {
      this.ui.showToast("Здоровье уже максимальное!")
      return
    }

    state.money -= item.price
    state.satiety = Math.min(100, state.satiety + item.satiety)
    state.energy = Math.min(state.maxEnergy, state.energy + item.energy)
    state.health = Math.max(0, Math.min(maxHealth, state.health + item.health))

    this.gameState.updateState(state)
    this.ui.showToast(
      `<img src="img/icons/food.png" alt="🍔" class="stat-icon"> Заказано: ${item.name}`
    )
    this.render()
  }
}
