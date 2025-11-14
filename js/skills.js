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

    if (!skill) return

    skill.xp += amount

    const xpForNextLevel = this.calculateXPForNextLevel(skill.level)

    if (skill.xp >= xpForNextLevel) {
      this.levelUp(skill, skillName)
    }

    this.gameState.updateState({ skills: state.skills })
  }

  calculateXPForNextLevel(level) {
    if (level === 0) {
      return GAME_CONSTANTS.XP_FOR_FIRST_LEVEL
    }
    return level * GAME_CONSTANTS.XP_PER_LEVEL_MULTIPLIER
  }

  levelUp(skill, skillName) {
    skill.level += 1
    skill.xp = skill.xp - this.calculateXPForNextLevel(skill.level - 1)

    const skillLabel = SKILL_LABELS[skillName]
    this.ui.showToast(
      `${MESSAGES.LEVEL_UP} ${skillLabel} теперь ${skill.level} уровня!`
    )
  }

  calculateXPGain(reward) {
    return Math.floor(reward / GAME_CONSTANTS.XP_GAIN_DIVIDER)
  }

  renderSkillsWindow() {
    const state = this.gameState.getState()
    const skillsHtml = Object.entries(state.skills)
      .map(([key, skill]) => this.createSkillCard(key, skill))
      .join("")

    return `
      <div class="message">
        <strong>Прокачивай навыки, выполняя заказы!</strong><br>
      </div>
      <div class="skill-list">
        ${skillsHtml}
      </div>
    `
  }

  createSkillCard(skillName, skill) {
    const label = SKILL_LABELS[skillName]
    const xpForNext = this.calculateXPForNextLevel(skill.level)
    const progressPercent = (skill.xp / xpForNext) * 100

    return `
      <div class="skill-item">
        <div class="skill-header">
          <strong>${label}</strong>
          <span>Уровень ${skill.level}</span>
        </div>
        <div class="skill-progress">
          <span style="width: ${progressPercent}%;"></span>
        </div>
        <div class="skill-meta">
          XP: ${skill.xp} / ${xpForNext}
        </div>
      </div>
    `
  }
}
