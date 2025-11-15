export class DialogSystem {
  constructor(ui) {
    this.ui = ui
    this.dialogTextEl = document.getElementById("dialog-text")
    this.dialogNextEl = document.getElementById("dialog-next")
    this.dialogues = [
      "Наконец-то я смог накопить на курс Арокена по веб-разработке.",
      "Говорят, после него можно начать зарабатывать на фрилансе.",
      "Пора начинать новую жизнь!",
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

    let charIndex = 0
    const typingSpeed = 30
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
      if (charIndex < text.length) {
        this.dialogTextEl.textContent += text[charIndex]

        if (text[charIndex] !== " " && window.audio) {
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
