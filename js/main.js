import { Game } from "./game.js"
import { MESSAGES, AVAILABLE_APPS } from "./constants.js"

const attachIconListeners = (game) => {
  const icons = document.querySelectorAll(".icon")
  icons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      if (game.lifecycleManager.checkHospital()) {
        return
      }

      const isBlocked = icon.classList.contains("blocked")
      if (!isBlocked && game.audio) {
        game.audio.playSound("uiClick")
      }

      const app = e.currentTarget.dataset.app

      if (AVAILABLE_APPS.includes(app)) {
        game.appsManager.openApp(app)
      } else {
        game.ui.showToast(MESSAGES.APP_IN_DEVELOPMENT)
      }
    })
  })
}

const attachWindowCloseListeners = () => {
  const closeButtons = document.querySelectorAll(".window-close")
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (window.game && window.game.audio) {
        window.game.audio.playSound("uiClick")
      }
      const windowElement = e.target.closest(".window")
      if (windowElement) {
        windowElement.classList.add("hidden")
      }
    })
  })
}

const initGame = () => {
  if (window.game && window.game.gameState) {
    window.game.audio?.initAudioContext()
    window.game.dialogSystem?.reset()
    window.game.init()
    return
  }

  const game = new Game()
  game.init()

  attachIconListeners(game)
  attachWindowCloseListeners()
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame)
} else {
  initGame()
}
