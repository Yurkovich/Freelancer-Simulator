export class UIManager {
  showToast(message) {
    const toast = document.getElementById("toast")
    if (!toast) return

    toast.innerHTML = message
    toast.classList.add("show")

    const displayDuration = 3000
    setTimeout(() => {
      toast.classList.remove("show")
    }, displayDuration)
  }

  closeWindow(windowId) {
    const window = document.getElementById(`${windowId}-window`)
    if (window) {
      window.classList.add("hidden")
    }
  }
}
