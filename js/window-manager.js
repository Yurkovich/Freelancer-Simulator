import { UI_SELECTORS } from "./constants.js"

export class WindowManager {
  constructor() {
    this.windowIds = [
      UI_SELECTORS.PORTFOLIO_WINDOW,
      UI_SELECTORS.WZCODE_WINDOW,
      UI_SELECTORS.BROWSER_WINDOW,
      UI_SELECTORS.SKILLS_WINDOW,
      UI_SELECTORS.LEARNING_WINDOW,
      UI_SELECTORS.TELEHLAM_WINDOW,
      UI_SELECTORS.SLEEP_WINDOW,
      UI_SELECTORS.CHARACTER_WINDOW,
      UI_SELECTORS.JOBS_WINDOW,
      "sidejob-window",
      "bills-window",
      "shop-window",
      "settings-window",
    ]
  }

  closeAllWindows() {
    this.windowIds.forEach((id) => {
      const window = document.getElementById(id)
      window?.classList.add("hidden")
    })
  }

  getWindow(appName) {
    const windowMap = {
      portfolio: UI_SELECTORS.PORTFOLIO_WINDOW,
      wzcode: UI_SELECTORS.WZCODE_WINDOW,
      browser: UI_SELECTORS.BROWSER_WINDOW,
      skills: UI_SELECTORS.SKILLS_WINDOW,
      learning: UI_SELECTORS.LEARNING_WINDOW,
      telehlam: UI_SELECTORS.TELEHLAM_WINDOW,
      sleep: UI_SELECTORS.SLEEP_WINDOW,
      character: UI_SELECTORS.CHARACTER_WINDOW,
      sidejob: "sidejob-window",
      bills: "bills-window",
      shop: "shop-window",
      settings: "settings-window",
      jobs: UI_SELECTORS.JOBS_WINDOW,
    }

    const windowId = windowMap[appName]
    return windowId ? document.getElementById(windowId) : null
  }

  openWindow(appName) {
    const window = this.getWindow(appName)
    if (window) {
      window.classList.remove("hidden")
      return true
    }
    return false
  }

  closeWindow(appName) {
    const window = this.getWindow(appName)
    if (window) {
      window.classList.add("hidden")
      return true
    }
    return false
  }

  updateIconStates(gameState, jobsManager, ui) {
    const state = gameState.getState()

    const rentOverdue = state.day > state.bills.rent.due
    const internetOverdue = state.day > state.bills.internet.due
    const hasDebt = rentOverdue || internetOverdue

    const allowedAppsWithDebt = [
      "sidejob",
      "bills",
      "character",
      "sleep",
      "shop",
      "settings",
      "jobs",
    ]

    document.querySelectorAll(".icon").forEach((icon) => {
      const appName = icon.dataset.app

      if (appName === "jobs") {
        if (jobsManager) {
          jobsManager.updateIconState()
        }
        return
      }

      const isBlocked = hasDebt && !allowedAppsWithDebt.includes(appName)

      if (isBlocked) {
        icon.classList.add("blocked")
        icon.style.opacity = "0.4"
        icon.style.filter = "grayscale(1)"
      } else {
        icon.classList.remove("blocked")
        icon.style.opacity = "1"
        icon.style.filter = "none"
      }
    })
  }
}

