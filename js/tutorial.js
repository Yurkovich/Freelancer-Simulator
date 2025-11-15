export class TutorialManager {
  constructor(gameState, ui) {
    this.gameState = gameState
    this.ui = ui
    this.currentStep = 0
    this.overlay = null
    this.tooltip = null
    this.steps = [
      {
        target: '[data-app="learning"]',
        title: "📚 Обучение",
        text: "Здесь ты можешь изучать новые навыки. Начни с верстки!",
        action: "highlight",
      },
      {
        target: '[data-app="browser"]',
        title: "🌐 Браузер - Krork",
        text: "Биржа фриланса. Здесь ты будешь брать заказы и зарабатывать деньги.",
        action: "highlight",
      },
      {
        target: '[data-app="wzcode"]',
        title: "💻 WZ Code",
        text: "Редактор кода. Здесь ты будешь выполнять взятые заказы.",
        action: "highlight",
      },
      {
        target: '[data-app="telehlam"]',
        title: "💬 Telehlam",
        text: "Мессенджер с курсом и куратором. Задавай вопросы и получай опыт!",
        action: "highlight",
      },
      {
        target: '[data-app="bills"]',
        title: "💰 Счета",
        text: "Оплачивай квартиру и интернет вовремя! Без них доступны только подработки.",
        action: "highlight",
      },
      {
        target: '[data-app="sidejob"]',
        title: "🔧 Подработка",
        text: "Если денег мало - иди на подработку. Это не прокачивает навыки, но дает деньги.",
        action: "highlight",
      },
      {
        target: '[data-app="shop"]',
        title: "🏪 Магазин 24/7",
        text: "Круглосуточный магазин у дома. Покупай еду, когда нет интернета или денег на доставку.",
        action: "highlight",
      },
      {
        target: '[data-app="character"]',
        title: "👤 Персонаж",
        text: "Следи за здоровьем, сытостью и энергией. Не забывай спать и есть!",
        action: "highlight",
      },
      {
        target: '[data-app="sleep"]',
        title: "😴 Сон",
        text: "Восстанавливай энергию сном. Спи вовремя, чтобы не было штрафов!",
        action: "highlight",
      },
      {
        target: null,
        title: "🎮 Готово!",
        text: "Теперь ты знаешь основы. Удачи в карьере веб-разработчика!",
        action: "next",
      },
    ]
  }

  start() {
    const state = this.gameState.getState()
    if (state.tutorialCompleted) return

    this.currentStep = state.tutorialStep || 0
    this.createOverlay()
    this.showStep(this.currentStep)
  }

  createOverlay() {
    this.overlay = document.createElement("div")
    this.overlay.id = "tutorial-overlay"
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9998;
      pointer-events: none;
    `
    document.body.appendChild(this.overlay)

    this.developerPhoto = document.createElement("div")
    this.developerPhoto.className = "tutorial-developer"
    this.developerPhoto.innerHTML = `
      <img src="img/Developer.png" alt="Разработчик" class="tutorial-developer-photo">
      <div class="tutorial-developer-label">Разработчик</div>
    `
    document.body.appendChild(this.developerPhoto)

    this.tooltip = document.createElement("div")
    this.tooltip.id = "tutorial-tooltip"
    this.tooltip.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--window-bg);
      border: 4px solid var(--window-border);
      padding: 1.5rem;
      max-width: 400px;
      min-height: 200px;
      z-index: 9999;
      font-family: 'Press Start 2P', monospace;
      color: var(--text-color);
      font-size: 0.6rem;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `
    document.body.appendChild(this.tooltip)
  }

  showStep(stepIndex) {
    const step = this.steps[stepIndex]
    const state = this.gameState.getState()
    state.tutorialStep = stepIndex
    this.gameState.updateState(state)

    document.querySelectorAll(".tutorial-highlight").forEach((el) => {
      el.classList.remove("tutorial-highlight")
      el.style.position = ""
      el.style.pointerEvents = ""
      el.style.zIndex = ""
    })

    this.tooltip.innerHTML = `
      <div style="margin-bottom: 1rem; flex: 1; display: flex; flex-direction: column;">
        <div style="font-size: 0.7rem; color: var(--accent); margin-bottom: 0.5rem;">${
          step.title
        }</div>
        <div id="tutorial-text" style="min-height: 80px; flex: 1;"></div>
      </div>
      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
        ${
          stepIndex > 0
            ? '<button class="tutorial-btn tutorial-skip" style="background: var(--muted); padding: 0.5rem 1rem; border: none; font-family: inherit; font-size: 0.5rem; cursor: pointer; color: var(--text-color);">Пропустить</button>'
            : ""
        }
        ${
          step.action === "next" || step.action === "highlight"
            ? '<button class="tutorial-btn tutorial-next" style="background: var(--accent); padding: 0.5rem 1rem; border: none; font-family: inherit; font-size: 0.5rem; cursor: pointer; color: var(--text-color);">Далее</button>'
            : ""
        }
        ${
          step.action === "click"
            ? '<button class="tutorial-btn tutorial-next" style="background: var(--accent); padding: 0.5rem 1rem; border: none; font-family: inherit; font-size: 0.5rem; cursor: pointer; color: var(--text-color);">Понятно</button>'
            : ""
        }
      </div>
    `

    if (step.target) {
      const targetEl = document.querySelector(step.target)
      if (targetEl) {
        targetEl.classList.add("tutorial-highlight")
        targetEl.style.position = "relative"
        targetEl.style.zIndex = "9999"
        targetEl.style.pointerEvents = "auto"
      }
    }

    const nextBtn = this.tooltip.querySelector(".tutorial-next")
    const skipBtn = this.tooltip.querySelector(".tutorial-skip")

    if (nextBtn) {
      nextBtn.disabled = true
      nextBtn.style.opacity = "0.5"
      nextBtn.style.cursor = "not-allowed"

      nextBtn.addEventListener("click", () => {
        if (nextBtn.disabled) return

        if (stepIndex < this.steps.length - 1) {
          this.showStep(stepIndex + 1)
        } else {
          this.complete()
        }
      })
    }

    if (skipBtn) {
      skipBtn.addEventListener("click", () => this.complete())
    }

    this.typeText(step.text, () => {
      if (nextBtn) {
        nextBtn.disabled = false
        nextBtn.style.opacity = "1"
        nextBtn.style.cursor = "pointer"
      }
    })
  }

  typeText(text, onComplete) {
    const textEl = document.getElementById("tutorial-text")
    if (!textEl) {
      if (onComplete) onComplete()
      return
    }

    textEl.textContent = ""
    let charIndex = 0
    const typingSpeed = 20

    const typeChar = () => {
      if (charIndex < text.length) {
        textEl.textContent += text[charIndex]

        if (text[charIndex] !== " " && window.audio) {
          window.audio.playSound("textBlip")
        }

        charIndex++
        setTimeout(typeChar, typingSpeed)
      } else {
        if (onComplete) onComplete()
      }
    }

    typeChar()
  }

  complete() {
    const state = this.gameState.getState()
    state.tutorialCompleted = true
    this.gameState.updateState(state)

    if (this.overlay) this.overlay.remove()
    if (this.tooltip) this.tooltip.remove()
    if (this.developerPhoto) this.developerPhoto.remove()

    document.querySelectorAll(".tutorial-highlight").forEach((el) => {
      el.classList.remove("tutorial-highlight")
      el.style.position = ""
      el.style.pointerEvents = ""
      el.style.zIndex = ""
    })

    this.ui.showToast("🎉 Туториал завершен! Удачи!")
  }
}
