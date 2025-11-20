export class DialogSystem {
  constructor(ui) {
    this.ui = ui
    this.dialogTextEl = document.getElementById("dialog-text")
    this.dialogNextEl = document.getElementById("dialog-next")
    this.dialogues = [
      "Я долго собирался... и наконец приобрел курс Арокен.ру.",
      "Хочу не просто научиться — хочу изменить свою жизнь.",
      "Сегодня начинается путь, который, возможно, приведёт меня к чему-то большему.",
    ]
    this.currentDialogIndex = 0
    this.isTyping = false
    this.desktopReadyCallback = null
    this.init()
  }

  init() {
    this.dialogNextEl.addEventListener("click", () => this.showNextDialog())
  }

  setDesktopReadyCallback(callback) {
    this.desktopReadyCallback = callback
  }

  reset() {
    this.currentDialogIndex = 0
    this.isTyping = false
    if (this.dialogTextEl) {
      this.dialogTextEl.textContent = ""
    }
  }

  showNextDialog() {
    if (this.isTyping) return

    if (this.currentDialogIndex < this.dialogues.length) {
      this.typeDialog(this.dialogues[this.currentDialogIndex++])
    } else {
      if (this.desktopReadyCallback) {
        this.desktopReadyCallback()
      }
    }
  }

  typeDialog(text) {
    this.isTyping = true
    this.dialogTextEl.textContent = ""
    this.dialogNextEl.disabled = true
    this.dialogNextEl.style.opacity = "0.5"
    this.dialogNextEl.style.cursor = "not-allowed"

    const textChars = Array.from(text)
    let charIndex = 0
    const typingSpeed = 25
    let timeoutId = null

    const skipTyping = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      this.dialogTextEl.textContent = text
      this.isTyping = false
      this.dialogNextEl.disabled = false
      this.dialogNextEl.style.opacity = "1"
      this.dialogNextEl.style.cursor = "pointer"
      this.dialogTextEl.removeEventListener("click", skipTyping)
    }

    this.dialogTextEl.addEventListener("click", skipTyping, { once: true })

    const typeChar = () => {
      if (charIndex < textChars.length) {
        this.dialogTextEl.textContent += textChars[charIndex]

        if (textChars[charIndex] !== " " && window.audio) {
          window.audio.playSound("textBlip")
        }

        charIndex++
        timeoutId = setTimeout(typeChar, typingSpeed)
      } else {
        this.isTyping = false
        this.dialogNextEl.disabled = false
        this.dialogNextEl.style.opacity = "1"
        this.dialogNextEl.style.cursor = "pointer"
        this.dialogTextEl.removeEventListener("click", skipTyping)
      }
    }

    typeChar()
  }
}
