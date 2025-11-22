import {
  UI_SELECTORS,
  MESSAGES,
} from "./constants.js"
import { SkillsManager } from "./skills.js"
import { LearningManager } from "./learning.js"
import { BrowserManager } from "./browser.js"
import { TimeManager } from "./time.js"
import { CharacterManager } from "./character.js"
import { TelehlamManager } from "./telehlam.js"
import { SideJobManager } from "./sidejob.js"
import { BillsManager } from "./bills.js"
import { ShopManager } from "./shop.js"
import { SettingsManager } from "./settings.js"
import { JobsManager } from "./jobs.js"
import { UIManager } from "./ui.js"
import { WindowManager } from "./window-manager.js"
import { OrderManager } from "./order-manager.js"
import { SleepManager } from "./sleep-manager.js"

export class AppsManager {
  constructor(gameState, audioManager) {
    this.gameState = gameState
    this.audioManager = audioManager
    this.ui = new UIManager()
    this.windowManager = new WindowManager()
    this.skillsManager = new SkillsManager(gameState)
    this.timeManager = new TimeManager(gameState)
    this.timeManager.setAppsManager(this)
    this.orderManager = new OrderManager(
      gameState,
      this.skillsManager,
      this.timeManager,
      this.ui,
      this.windowManager
    )
    this.sleepManager = new SleepManager(
      gameState,
      this.timeManager,
      this.ui,
      this.windowManager
    )
    this.learningManager = new LearningManager(gameState, this.skillsManager)
    this.learningManager.setTimeManager(this.timeManager)
    this.browserManager = new BrowserManager(gameState, this)
    this.characterManager = new CharacterManager(gameState)
    this.telehlamManager = new TelehlamManager(gameState, this.skillsManager)
    this.sideJobManager = new SideJobManager(
      gameState,
      this.ui,
      this.timeManager
    )
    this.billsManager = new BillsManager(gameState, this.ui)
    this.billsManager.setAppsManager(this)
    this.shopManager = new ShopManager(gameState, this.ui, this.timeManager)
    this.settingsManager = new SettingsManager(gameState, this.ui, audioManager)
    this.jobsManager = new JobsManager(gameState, this.ui)
    this.windowManager.updateIconStates(gameState, this.jobsManager, this.ui)
  }


  openApp(appName) {
    const state = this.gameState.getState()

    if (appName === "jobs") {
      if (!this.jobsManager.isUnlocked()) {
        this.ui.showToast(
          "⚠️ Вакансии доступны только когда все навыки достигли 3 уровня!"
        )
        return
      }
    }

    const rentOverdue = state.day > state.bills.rent.due
    const internetOverdue = state.day > state.bills.internet.due
    const hasDebt = rentOverdue || internetOverdue

    if (
      hasDebt &&
      ![
        "sidejob",
        "bills",
        "character",
        "sleep",
        "shop",
        "settings",
        "jobs",
      ].includes(appName)
    ) {
      this.ui.showToast(
        "⚠️ Оплатите просроченные счета! Доступны только подработки и магазин."
      )
      return
    }

    this.windowManager.closeAllWindows()
    if (this.windowManager.openWindow(appName)) {
      this.renderApp(appName)
    }
  }

  updateIconStates() {
    this.windowManager.updateIconStates(this.gameState, this.jobsManager, this.ui)
  }

  renderApp(appName) {
    const renderMap = {
      wzcode: () => this.orderManager.renderWZCode(),
      browser: () => this.browserManager.render(),
      skills: () => this.renderSkills(),
      learning: () => this.renderLearning(),
      telehlam: () => this.telehlamManager.render(),
      sleep: () => this.sleepManager.render(),
      portfolio: () => this.renderPortfolio(),
      character: () => this.renderCharacter(),
      sidejob: () => this.sideJobManager.render(),
      bills: () => this.billsManager.render(),
      shop: () => this.shopManager.render(),
      settings: () => this.settingsManager.render(),
      jobs: () => this.jobsManager.render(),
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


  renderSkills() {
    const body = document.getElementById(UI_SELECTORS.SKILLS_BODY)
    body.innerHTML = this.skillsManager.renderSkillsWindow()
  }

  renderLearning() {
    this.learningManager.render()
  }

  renderCharacter() {
    this.characterManager.render()
  }

  getActiveOrder() {
    return this.orderManager?.getActiveOrder() || null
  }

  updateAllApps() {
    this.updateIconStates()
  }
}
