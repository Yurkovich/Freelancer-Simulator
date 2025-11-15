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

    let charIndex = 0
    const typingSpeed = 30

    const typeChar = () => {
      if (charIndex < text.length) {
        this.dialogTextEl.textContent += text[charIndex]
        charIndex++
        setTimeout(typeChar, typingSpeed)
      } else {
        this.isTyping = false
        this.dialogNextEl.disabled = false
      }
    }

    typeChar()
  }
}
