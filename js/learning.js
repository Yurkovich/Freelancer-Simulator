import { LEARNING_ACTIVITIES, SKILL_INFO } from "./config.js"
import { SKILL_NAMES } from "./constants.js"
import { UIManager } from "./ui.js"

export class LearningManager {
  constructor(gameState, skillsManager, timeManager = null) {
    this.gameState = gameState
    this.skillsManager = skillsManager
    this.timeManager = timeManager
    this.ui = new UIManager()
    this.selectedSkill = SKILL_NAMES.LAYOUT
  }

  setTimeManager(timeManager) {
    this.timeManager = timeManager
  }

  render() {
    const learningBody = document.getElementById("learning-body")

    learningBody.innerHTML = `
      <div class="message">
        <strong>Выберите навык для изучения:</strong>
      </div>
      <div class="skill-selector" id="skill-selector"></div>
      <div class="learning-activities" id="learning-activities"></div>
    `

    this.renderSkillSelector()
    this.renderActivities()
  }

  renderSkillSelector() {
    const state = this.gameState.getState()
    const selector = document.getElementById("skill-selector")

    const skillsHtml = Object.entries(SKILL_INFO)
      .map(
        ([key, info]) => `
        <button 
          class="skill-selector-button ${
            this.selectedSkill === key ? "active" : ""
          }" 
          data-skill="${key}"
        >
          ${info.label} (ур. ${state.skills[key].level})
        </button>
      `
      )
      .join("")

    selector.innerHTML = skillsHtml

    selector.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.selectedSkill = e.target.dataset.skill
        this.render()
      })
    })
  }

  renderActivities() {
    const container = document.getElementById("learning-activities")

    const activitiesHtml = Object.entries(LEARNING_ACTIVITIES)
      .map(
        ([key, activity]) => `
        <div class="learning-activity-card">
          <div class="learning-activity-header">
            <strong>${activity.label}</strong>
            <span>+${activity.xp} XP</span>
          </div>
          <div class="learning-activity-meta">
            ${activity.description}
          </div>
          <div class="learning-activity-cost">
            <img src="img/icons/clock.png" alt="⏱" class="stat-icon"> ${activity.time}ч | <img src="img/icons/energy.png" alt="⚡" class="stat-icon"> ${activity.energy} энергии
          </div>
          <button class="window-action" data-activity="${key}">
            Начать
          </button>
        </div>
      `
      )
      .join("")

    container.innerHTML = activitiesHtml

    container.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const activityKey = e.target.dataset.activity
        this.startLearning(activityKey)
      })
    })
  }

  startLearning(activityKey) {
    const activity = LEARNING_ACTIVITIES[activityKey]
    let state = this.gameState.getState()

    if (!state.hasInternet) {
      this.ui.showToast("⚠️ Нет интернета! Оплатите счет.")
      return
    }

    if (state.energy < activity.energy) {
      this.ui.showToast("⚡ Недостаточно энергии!")
      return
    }

    let xpGain = activity.xp
    let xpBonus = 0
    if (state.upgrades.monitorPro) xpBonus += 15
    else if (state.upgrades.monitor) xpBonus += 5
    if (state.upgrades.headphones) xpBonus += 10
    if (state.upgrades.apartment) xpBonus += 15
    if (state.upgrades.coworking) xpBonus += 8

    xpGain += xpBonus

    const isNight = this.timeManager.isNightTime(state.time)

    this.gameState.updateState({
      energy: state.energy - activity.energy,
    })

    if (this.timeManager) {
      this.timeManager.addTime(activity.time)

      if (isNight) {
        this.timeManager.applyNightPenalty(activity.time)
      }
    }

    if (window.game && window.game.lifecycleManager) {
      if (window.game.lifecycleManager.checkHospital()) {
        this.closeWindow()
        return
      }
    }

    const leveledUp = this.skillsManager.addXP(this.selectedSkill, xpGain)

    if (!leveledUp) {
      this.ui.showToast(
        `✅ Изучено! +${xpGain} XP к навыку ${
          SKILL_INFO[this.selectedSkill].label
        }`
      )
    }

    this.closeWindow()
  }

  closeWindow() {
    const window = document.getElementById("learning-window")
    if (window) {
      window.classList.add("hidden")
    }
  }
}
