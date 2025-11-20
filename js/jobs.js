import {
  GAME_CONSTANTS,
  SKILL_NAMES,
  SKILL_LABELS,
  UI_SELECTORS,
} from "./constants.js"
import { UIManager } from "./ui.js"

export class JobsManager {
  constructor(gameState, ui) {
    this.gameState = gameState
    this.ui = ui
    this.videoOverlay = null
    this.videoElement = null
    this.dialogIndex = 0
    this.dialogs = []
  }

  isUnlocked() {
    const state = this.gameState.getState()
    const skillNames = [
      SKILL_NAMES.LAYOUT,
      SKILL_NAMES.WORKPRESS,
      SKILL_NAMES.FREELANCE,
    ]

    return skillNames.every(
      (skillName) =>
        state.skills[skillName]?.level >=
        GAME_CONSTANTS.JOBS_UNLOCK_MIN_SKILL_LEVEL
    )
  }

  checkRequirements() {
    const state = this.gameState.getState()
    const skillNames = [
      SKILL_NAMES.LAYOUT,
      SKILL_NAMES.WORKPRESS,
      SKILL_NAMES.FREELANCE,
    ]

    const skillsCompleted = skillNames.every(
      (skillName) =>
        state.skills[skillName]?.level >=
        GAME_CONSTANTS.JOBS_REQUIRED_SKILL_LEVEL
    )

    const reputationCompleted =
      state.reputation >= GAME_CONSTANTS.JOBS_REQUIRED_REPUTATION

    return {
      skillsCompleted,
      reputationCompleted,
      allCompleted: skillsCompleted && reputationCompleted,
    }
  }

  render() {
    const state = this.gameState.getState()
    const jobsBody = document.getElementById(UI_SELECTORS.JOBS_BODY)
    const requirements = this.checkRequirements()

    const skillNames = [
      SKILL_NAMES.LAYOUT,
      SKILL_NAMES.WORKPRESS,
      SKILL_NAMES.FREELANCE,
    ]

    const skillsHtml = skillNames
      .map((skillName) => {
        const skill = state.skills[skillName]
        const currentLevel = skill?.level || 0
        const requiredLevel = GAME_CONSTANTS.JOBS_REQUIRED_SKILL_LEVEL
        const isCompleted = currentLevel >= requiredLevel
        const progressColor = isCompleted ? "var(--accent)" : "orange"

        return `
          <div class="job-requirement">
            <div class="job-requirement-header">
              <span>${SKILL_LABELS[skillName]}</span>
              <span style="color: ${progressColor}">
                ${currentLevel} / ${requiredLevel}
              </span>
            </div>
            <div class="skill-progress">
              <span style="width: ${Math.min(
                100,
                (currentLevel / requiredLevel) * 100
              )}%; background: ${progressColor}"></span>
            </div>
            ${
              isCompleted
                ? '<span style="color: var(--accent);">✓ Выполнено</span>'
                : ""
            }
          </div>
        `
      })
      .join("")

    const reputationCurrent = state.reputation || 0
    const reputationRequired = GAME_CONSTANTS.JOBS_REQUIRED_REPUTATION
    const reputationCompleted = reputationCurrent >= reputationRequired
    const reputationColor = reputationCompleted ? "var(--accent)" : "orange"

    jobsBody.innerHTML = `
      <div class="message">
        <strong>Требования для трудоустройства</strong><br>
        Достигните всех целей, чтобы подать резюме
      </div>

      <div class="jobs-requirements">
        ${skillsHtml}

        <div class="job-requirement">
          <div class="job-requirement-header">
            <span>Репутация</span>
            <span style="color: ${reputationColor}">
              ${reputationCurrent} / ${reputationRequired}
            </span>
          </div>
          <div class="skill-progress">
            <span style="width: ${Math.min(
              100,
              (reputationCurrent / reputationRequired) * 100
            )}%; background: ${reputationColor}"></span>
          </div>
          ${
            reputationCompleted
              ? '<span style="color: var(--accent);">✓ Выполнено</span>'
              : ""
          }
        </div>
      </div>

      <button 
        class="window-action ${!requirements.allCompleted ? "disabled" : ""}" 
        id="jobs-apply-btn"
        ${!requirements.allCompleted ? "disabled" : ""}
        style="${
          !requirements.allCompleted ? "opacity: 0.5; cursor: not-allowed;" : ""
        }"
      >
        Подать резюме
      </button>
    `

    const applyBtn = document.getElementById("jobs-apply-btn")
    if (applyBtn && requirements.allCompleted) {
      applyBtn.addEventListener("click", () => this.startEnding())
    }
  }

  startEnding() {
    const state = this.gameState.getState()
    if (state.endingViewed) {
      return
    }

    this.ui.closeWindow("jobs")
    this.fadeToVideo()
  }

  fadeToVideo() {
    const fadeOverlay = document.createElement("div")
    fadeOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0);
      z-index: 19999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.6s ease;
      pointer-events: none;
    `
    document.body.appendChild(fadeOverlay)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fadeOverlay.style.background = "rgba(0, 0, 0, 1)"
      })
    })

    setTimeout(() => {
      if (fadeOverlay.parentElement) {
        fadeOverlay.remove()
      }
      this.showVideo()
    }, 600)
  }

  showVideo() {
    this.videoOverlay = document.createElement("div")
    this.videoOverlay.className = "video-overlay"
    this.videoOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      z-index: ${GAME_CONSTANTS.VIDEO_OVERLAY_Z_INDEX};
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `

    this.videoElement = document.createElement("video")
    this.videoElement.src = GAME_CONSTANTS.ENDING_VIDEO_PATH
    this.videoElement.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
    `
    this.videoElement.controls = false
    this.videoElement.autoplay = true
    this.videoElement.muted = false

    this.videoOverlay.appendChild(this.videoElement)
    document.body.appendChild(this.videoOverlay)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.videoOverlay.style.opacity = "1"
      })
    })

    this.videoElement.addEventListener("ended", () => {
      this.onVideoEnded()
    })

    this.videoElement.addEventListener("error", () => {
      this.ui.showToast("Ошибка загрузки видео. Переход к финалу...")
      this.onVideoEnded()
    })

    this.videoElement.play().catch((error) => {
      console.warn("Ошибка воспроизведения видео:", error)
      this.onVideoEnded()
    })
  }

  onVideoEnded() {
    if (this.videoOverlay && this.videoOverlay.parentElement) {
      this.videoOverlay.remove()
    }
    this.videoOverlay = null
    this.videoElement = null

    this.startDialogs()
  }

  setDialogs(dialogs) {
    this.dialogs = dialogs
  }

  startDialogs() {
    if (this.dialogs.length === 0) {
      this.completeEnding()
      return
    }

    this.dialogIndex = 0
    this.showNextDialog()
  }

  showNextDialog() {
    if (this.dialogIndex >= this.dialogs.length) {
      this.completeEnding()
      return
    }

    const dialogText = this.dialogs[this.dialogIndex]
    this.ui.switchScreen("dialog")

    const dialogTextEl = document.getElementById("dialog-text")
    const dialogNextEl = document.getElementById("dialog-next")

    if (!dialogTextEl || !dialogNextEl) {
      this.completeEnding()
      return
    }

    const clonedButton = dialogNextEl.cloneNode(true)
    dialogNextEl.parentNode.replaceChild(clonedButton, dialogNextEl)
    const newDialogNextEl = clonedButton

    dialogTextEl.textContent = ""
    newDialogNextEl.disabled = true
    newDialogNextEl.style.opacity = "0.5"
    newDialogNextEl.style.cursor = "not-allowed"

    const textChars = Array.from(dialogText)
    let charIndex = 0
    const typingSpeed = GAME_CONSTANTS.TYPING_SPEED_ENDING_MS
    let timeoutId = null

    const typeChar = () => {
      if (charIndex < textChars.length) {
        dialogTextEl.textContent += textChars[charIndex]

        if (textChars[charIndex] !== " " && window.audio) {
          window.audio.playSound("textBlip")
        }

        charIndex++
        timeoutId = setTimeout(typeChar, typingSpeed)
      } else {
        newDialogNextEl.disabled = false
        newDialogNextEl.style.opacity = "1"
        newDialogNextEl.style.cursor = "pointer"
      }
    }

    typeChar()

    const handleNext = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (charIndex < textChars.length) {
        dialogTextEl.textContent = dialogText
        charIndex = textChars.length
        newDialogNextEl.disabled = false
        newDialogNextEl.style.opacity = "1"
        newDialogNextEl.style.cursor = "pointer"
        return
      }
      newDialogNextEl.removeEventListener("click", handleNext)
      this.dialogIndex++
      this.showNextDialog()
    }

    newDialogNextEl.addEventListener("click", handleNext)
  }

  completeEnding() {
    const state = this.gameState.getState()
    state.endingViewed = true
    this.gameState.updateState(state)

    if (window.game) {
      window.game.ui.switchScreen("menu")
    }
  }

  updateIconState() {
    const jobsIcon = document.getElementById("jobs-icon")
    if (!jobsIcon) return

    const isUnlocked = this.isUnlocked()

    if (!isUnlocked) {
      jobsIcon.classList.add("blocked")
      jobsIcon.style.opacity = "0.4"
      jobsIcon.style.filter = "grayscale(1)"
    } else {
      jobsIcon.classList.remove("blocked")
      jobsIcon.style.opacity = "1"
      jobsIcon.style.filter = "none"
    }
  }
}
