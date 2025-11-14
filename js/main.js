import GameState from "./state.js"

const gameState = new GameState()

document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll(".icon")
  const portfolioWindow = document.getElementById("portfolio-window")
  const closeBtn = document.querySelector(".window-close")

  gameState.updateUI()

  icons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const app = e.currentTarget.dataset.app

      if (app === "portfolio") {
        portfolioWindow.classList.remove("hidden")
      } else {
        alert("Приложение в разработке")
      }
    })
  })

  closeBtn.addEventListener("click", () => {
    portfolioWindow.classList.add("hidden")
  })

  document.getElementById("test-time-btn")?.addEventListener("click", () => {
    gameState.addTime(2)
    gameState.updateState({
      energy: Math.max(0, gameState.getState().energy - 20),
      money: gameState.getState().money + 500,
    })
  })
})
