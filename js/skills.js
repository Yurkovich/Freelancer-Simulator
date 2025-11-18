import { GAME_CONSTANTS, MESSAGES, SKILL_LABELS } from "./constants.js"
import { UIManager } from "./ui.js"

export class SkillsManager {
  constructor(gameState) {
    this.gameState = gameState
    this.ui = new UIManager()
  }

  addXP(skillName, amount) {
    const state = this.gameState.getState()
    const skill = state.skills[skillName]

    if (!skill) return false

    if (skill.level >= GAME_CONSTANTS.MAX_SKILL_LEVEL) {
      return false
    }

    skill.xp += amount

    const xpForNextLevel = this.calculateXPForNextLevel(skill.level)

    let leveledUp = false
    if (
      skill.xp >= xpForNextLevel &&
      skill.level < GAME_CONSTANTS.MAX_SKILL_LEVEL
    ) {
      this.levelUp(skill, skillName)
      leveledUp = true
    }

    this.gameState.updateState({ skills: state.skills })
    return leveledUp
  }

  calculateXPForNextLevel(level) {
    if (level >= GAME_CONSTANTS.MAX_SKILL_LEVEL) {
      return 0
    }
    return (
      GAME_CONSTANTS.XP_FOR_FIRST_LEVEL +
      level * GAME_CONSTANTS.XP_PER_LEVEL_INCREMENT
    )
  }

  levelUp(skill, skillName) {
    if (skill.level >= GAME_CONSTANTS.MAX_SKILL_LEVEL) {
      return
    }

    const xpForCurrentLevel = this.calculateXPForNextLevel(skill.level)
    skill.level += 1
    skill.xp = skill.xp - xpForCurrentLevel

    if (skill.level >= GAME_CONSTANTS.MAX_SKILL_LEVEL) {
      skill.xp = 0
    }

    if (window.audio) {
      window.audio.playSound("levelUp")
    }

    const skillLabel = SKILL_LABELS[skillName]
    this.ui.showToast(
      `${MESSAGES.LEVEL_UP} ${skillLabel} теперь ${skill.level} уровня!`
    )

    if (
      window.game &&
      window.game.appsManager &&
      window.game.appsManager.jobsManager
    ) {
      window.game.appsManager.updateIconStates()
    }
  }

  calculateXPGain(reward) {
    return Math.floor(reward / GAME_CONSTANTS.XP_GAIN_DIVIDER)
  }

  renderSkillsWindow() {
    const state = this.gameState.getState()
    const skillsHtml = Object.entries(state.skills)
      .filter(
        ([key, skill]) =>
          SKILL_LABELS[key] && skill && typeof skill === "object"
      )
      .map(([key, skill]) => this.createSkillCard(key, skill))
      .join("")

    return `
      <div class="message">
        <strong>Не забывай постоянно обучаться!</strong><br>
      </div>
      <div class="skill-list">
        ${skillsHtml}
      </div>
    `
  }

  createSkillCard(skillName, skill) {
    if (!skill || typeof skill !== "object") {
      return ""
    }

    const level = skill.level || 0
    const xp = skill.xp || 0
    const label = SKILL_LABELS[skillName]
    const isMaxLevel = level >= GAME_CONSTANTS.MAX_SKILL_LEVEL
    const xpForNext = this.calculateXPForNextLevel(level)
    const progressPercent = isMaxLevel ? 100 : (xp / xpForNext) * 100

    let xpDisplay = ""
    if (isMaxLevel) {
      xpDisplay = "Макс. уровень"
    } else {
      xpDisplay = `XP: ${xp} / ${xpForNext}`
    }

    return `
      <div class="skill-item">
        <div class="skill-header">
          <strong>${label}</strong>
          <span>Уровень ${level}</span>
        </div>
        <div class="skill-progress">
          <span style="width: ${progressPercent}%;"></span>
        </div>
        <div class="skill-meta">
          ${xpDisplay}
        </div>
      </div>
    `
  }
}
