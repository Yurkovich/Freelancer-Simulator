import GameState from "./state.js"
import { AppsManager } from "./apps.js"

const gameState = new GameState()
const appsManager = new AppsManager(gameState)

document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll(".icon")

  gameState.updateUI()

  icons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const app = e.currentTarget.dataset.app

      if (app === "portfolio" || app === "wzcode") {
        appsManager.openApp(app)
      } else {
        alert("Приложение в разработке")
      }
    })
  })

  document.querySelectorAll(".window-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.target.closest(".window").classList.add("hidden")
    })
  })

  document.getElementById("test-time-btn")?.addEventListener("click", () => {
    const state = gameState.getState()
    gameState.addTime(2)
    gameState.updateState({
      energy: Math.min(100, state.energy + 20),
      money: state.money + 500,
    })
  })
})
