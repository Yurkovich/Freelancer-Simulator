import GameState from "./state.js"
import { AppsManager } from "./apps.js"
import { MESSAGES } from "./constants.js"
import { UIManager } from "./ui.js"

class Game {
  constructor() {
    this.gameState = new GameState()
    this.appsManager = new AppsManager(this.gameState)
    this.ui = new UIManager()
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.setupUI()
      this.attachEventListeners()
    })
  }

  setupUI() {
    this.gameState.updateUI()
  }

  attachEventListeners() {
    this.attachIconListeners()
    this.attachWindowCloseListeners()
  }

  attachIconListeners() {
    const icons = document.querySelectorAll(".icon")
    icons.forEach((icon) => {
      icon.addEventListener("click", (e) => this.handleIconClick(e))
    })
  }

  handleIconClick(event) {
    const app = event.currentTarget.dataset.app

    if (this.isAppAvailable(app)) {
      this.appsManager.openApp(app)
    } else {
      this.ui.showToast(MESSAGES.APP_IN_DEVELOPMENT)
    }
  }

  isAppAvailable(app) {
    const availableApps = [
      "portfolio",
      "wzcode",
      "browser",
      "skills",
      "learning",
      "sleep",
      "telehlam",
      "character",
      "sidejob",
      "bills",
    ]
    return availableApps.includes(app)
  }

  attachWindowCloseListeners() {
    const closeButtons = document.querySelectorAll(".window-close")
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleWindowClose(e))
    })
  }

  handleWindowClose(event) {
    const window = event.target.closest(".window")
    if (window) {
      window.classList.add("hidden")
    }
  }
}

const game = new Game()
game.init()
