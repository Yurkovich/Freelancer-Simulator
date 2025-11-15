export class UIManager {
  constructor() {
    this.currentToast = null
    this.toastDuration = 2000
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
    }
  }

  showToast(message) {
    const container = document.getElementById("toast-container")
    if (!container) return

    if (this.currentToast && this.currentToast.parentElement) {
      this.removeToast(this.currentToast, true)
    }

    this.playSoundForMessage(message)

    const toast = document.createElement("div")
    toast.className = "toast"
    toast.innerHTML = message

    toast.addEventListener("click", () => {
      this.removeToast(toast, true)
    })

    container.appendChild(toast)
    this.currentToast = toast

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add("show")
      })
    })

    setTimeout(() => {
      if (this.currentToast === toast) {
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
    if (!toast || !toast.parentElement) return

    if (this.currentToast === toast) {
      this.currentToast = null
    }

    toast.classList.remove("show")
    toast.classList.add("hide")

    const delay = immediate ? 100 : 300

    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove()
      }
    }, delay)
  }

  closeWindow(windowId) {
    const window = document.getElementById(`${windowId}-window`)
    if (window) {
      window.classList.add("hidden")
    }
  }
}
