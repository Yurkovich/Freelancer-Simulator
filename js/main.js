import { Game } from "./game.js"
import { MESSAGES } from "./constants.js"

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game()
  game.init()

  attachIconListeners(game)
  attachWindowCloseListeners()
  attachAudioToggle(game)
})

function attachIconListeners(game) {
  const icons = document.querySelectorAll(".icon")
  icons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const app = e.currentTarget.dataset.app

      if (isAppAvailable(app)) {
        game.appsManager.openApp(app)
      } else {
        game.ui.showToast(MESSAGES.APP_IN_DEVELOPMENT)
      }
    })
  })
}

function isAppAvailable(app) {
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
    "shop",
  ]
  return availableApps.includes(app)
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

function attachAudioToggle(game) {
  const audioToggle = document.getElementById("audio-toggle")
  if (!audioToggle) return

  const updateButton = () => {
    if (game.audio.isMuted) {
      audioToggle.textContent = "🔇"
      audioToggle.classList.add("muted")
    } else {
      audioToggle.textContent = "🔊"
      audioToggle.classList.remove("muted")
    }
  }

  updateButton()

  audioToggle.addEventListener("click", () => {
    game.audio.initAudioContext()
    game.audio.toggleMute()
    updateButton()

    if (!game.audio.isMuted && game.audio.music === null) {
      const state = game.gameState.getState()
      if (state.tutorialCompleted) {
        game.audio.playMusic("ambient")
      }
    }
  })
}
