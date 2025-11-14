import GameState from "./state.js"
import { AppsManager } from "./apps.js"
import { MESSAGES, GAME_CONSTANTS } from "./constants.js"

class Game {
  constructor() {
    this.gameState = new GameState()
    this.appsManager = new AppsManager(this.gameState)
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
    this.attachTestButtonListener()
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
      alert(MESSAGES.APP_IN_DEVELOPMENT)
    }
  }

  isAppAvailable(app) {
    const availableApps = [
      "portfolio",
      "wzcode",
      "browser",
      "skills",
      "learning",
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

  attachTestButtonListener() {
    const testBtn = document.getElementById("test-time-btn")
    if (testBtn) {
      testBtn.addEventListener("click", () => this.handleTestButton())
    }
  }

  handleTestButton() {
    const state = this.gameState.getState()
    const timeToAdd = 2
    const energyToAdd = 20
    const moneyToAdd = 500

    this.gameState.addTime(timeToAdd)
    this.gameState.updateState({
      energy: Math.min(GAME_CONSTANTS.MAX_ENERGY, state.energy + energyToAdd),
      money: state.money + moneyToAdd,
    })
  }
}

const game = new Game()
game.init()
