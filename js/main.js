import { Game } from "./game.js"
import { MESSAGES, AVAILABLE_APPS } from "./constants.js"

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game()
  game.init()

  attachIconListeners(game)
  attachWindowCloseListeners()
})

function attachIconListeners(game) {
  const icons = document.querySelectorAll(".icon")
  icons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      if (game.lifecycleManager.checkHospital()) {
        return
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

function attachWindowCloseListeners() {
  const closeButtons = document.querySelectorAll(".window-close")
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const window = e.target.closest(".window")
      if (window) {
        window.classList.add("hidden")
      }
    })
  })
}
