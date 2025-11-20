import { GameUtils } from "./utils.js"
import { GAME_CONSTANTS } from "./constants.js"

export class UIManager {
  constructor() {
    this.currentToast = null
    this.toastDuration = GAME_CONSTANTS.TOAST_DURATION_MS
    this.screens = {
      menu: document.getElementById("menu-screen"),
      dialog: document.getElementById("dialog-screen"),
      desktop: document.getElementById("desktop-screen"),
    }
  }

  switchScreen(screenName) {
    Object.values(this.screens).forEach((screen) => {
      if (screen) {
        screen.classList.remove("active")
      }
    })

    const targetScreen = this.screens[screenName]
    if (targetScreen) {
      targetScreen.classList.add("active")

      if (screenName === "desktop") {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            targetScreen.style.display = ""
            targetScreen.style.alignItems = ""
            targetScreen.style.justifyContent = ""
          })
        })
      }
    }
  }

  showToast(message) {
    const container = document.getElementById("toast-container")
    if (!container) return

    if (this.currentToast) {
      try {
        if (this.currentToast.parentElement) {
          this.removeToast(this.currentToast, true)
        } else {
          this.currentToast = null
        }
      } catch (e) {
        this.currentToast = null
      }
    }

    this.playSoundForMessage(message)

    const toast = document.createElement("div")
    toast.className = "toast"
    toast.innerHTML = GameUtils.replaceEmojiWithIcon(message)

    toast.addEventListener("click", () => {
      this.removeToast(toast, true)
    })

    container.appendChild(toast)
    this.currentToast = toast

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (toast.parentElement && this.currentToast === toast) {
          toast.classList.add("show")
        }
      })
    })

    setTimeout(() => {
      if (this.currentToast === toast && toast.parentElement) {
        this.removeToast(toast, false)
      }
    }, this.toastDuration)
  }

  playSoundForMessage(message) {
    if (!window.audio) return

    setTimeout(() => {
      if (message.includes("✅") || message.includes("📦")) {
        window.audio.playSound("success")
      } else if (message.includes("⚠️") || message.includes("❌")) {
        window.audio.playSound("error")
      } else {
        window.audio.playSound("notification")
      }
    }, 50)
  }

  removeToast(toast, immediate = false) {
    if (!toast) return

    try {
      if (!toast.parentElement) {
        if (this.currentToast === toast) {
          this.currentToast = null
        }
        return
      }

      if (this.currentToast === toast) {
        this.currentToast = null
      }

      toast.classList.remove("show")
      toast.classList.add("hide")

      const delay = immediate ? 100 : 300

      setTimeout(() => {
        try {
          if (toast && toast.parentElement) {
            toast.remove()
          }
        } catch (e) {}
      }, delay)
    } catch (e) {
      if (this.currentToast === toast) {
        this.currentToast = null
      }
    }
  }

  closeWindow(windowId) {
    const window = document.getElementById(`${windowId}-window`)
    if (window) {
      window.classList.add("hidden")
    }
  }
}
