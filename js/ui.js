export class UIManager {
  constructor() {
    this.toastQueue = []
    this.maxToasts = 1
    this.toastDuration = 3000
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

    const toast = document.createElement("div")
    toast.className = "toast"
    toast.innerHTML = message

    toast.addEventListener("click", () => {
      this.removeToast(toast)
    })

    if (this.toastQueue.length >= this.maxToasts) {
      const oldestToast = this.toastQueue.shift()
      if (oldestToast && oldestToast.parentElement) {
        oldestToast.remove()
      }
    }

    container.appendChild(toast)
    this.toastQueue.push(toast)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add("show")
      })
    })

    setTimeout(() => {
      if (this.toastQueue.includes(toast)) {
        this.removeToast(toast)
      }
    }, this.toastDuration)
  }

  removeToast(toast) {
    if (!toast || !toast.parentElement) return

    const index = this.toastQueue.indexOf(toast)
    if (index > -1) {
      this.toastQueue.splice(index, 1)
    }

    toast.classList.remove("show")
    toast.classList.add("hide")

    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove()
      }
    }, 300)
  }

  closeWindow(windowId) {
    const window = document.getElementById(`${windowId}-window`)
    if (window) {
      window.classList.add("hidden")
    }
  }
}
