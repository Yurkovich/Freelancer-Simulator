import {
  GAME_CONSTANTS,
  MESSAGES,
  SKILL_LABELS,
  SKILL_NAMES,
} from "./constants.js"

const LEARNING_ACTIVITIES = {
  [SKILL_NAMES.LAYOUT]: [
    {
      id: "layout_basics",
      name: "Основы HTML/CSS",
      description: "Изучить базовые теги и свойства",
      xp: 30,
      time: 2,
      energy: 20,
    },
    {
      id: "layout_flexbox",
      name: "Flexbox на практике",
      description: "Освоить современную верстку",
      xp: 50,
      time: 3,
      energy: 30,
    },
  ],
  [SKILL_NAMES.WORKPRESS]: [
    {
      id: "wp_basics",
      name: "Введение в Workpress",
      description: "Установка и базовая настройка",
      xp: 30,
      time: 2,
      energy: 20,
    },
    {
      id: "wp_themes",
      name: "Создание тем",
      description: "Разработка кастомных тем",
      xp: 50,
      time: 3,
      energy: 30,
    },
  ],
  [SKILL_NAMES.FREELANCE]: [
    {
      id: "freelance_communication",
      name: "Общение с клиентами",
      description: "Как правильно вести переговоры",
      xp: 30,
      time: 2,
      energy: 20,
    },
    {
      id: "freelance_portfolio",
      name: "Создание портфолио",
      description: "Презентация своих работ",
      xp: 50,
      time: 3,
      energy: 30,
    },
  ],
}

export class LearningManager {
  constructor(gameState, skillsManager) {
    this.gameState = gameState
    this.skillsManager = skillsManager
    this.selectedSkill = SKILL_NAMES.LAYOUT
  }

  renderLearningWindow() {
    return `
      <div class="message">
        <strong>Обучение</strong><br>
        Выбери навык и активность для изучения
      </div>
      ${this.renderSkillTabs()}
      ${this.renderActivities()}
    `
  }

  renderSkillTabs() {
    const tabs = Object.entries(SKILL_LABELS)
      .map(([skillKey, label]) => {
        const isActive = this.selectedSkill === skillKey
        return `
          <button 
            class="skill-tab ${isActive ? "active" : ""}" 
            data-skill="${skillKey}"
            style="padding: 0.5rem 1rem; background: ${
              isActive ? "var(--accent)" : "rgba(49, 74, 116, 0.5)"
            }; border: 2px solid ${
          isActive ? "var(--accent)" : "rgba(255, 255, 255, 0.08)"
        }; cursor: pointer; font-family: inherit; font-size: 0.55rem; margin: 0.5rem 0.25rem 0 0; color: ${
          isActive ? "#0c182c" : "var(--text-color)"
        };"
          >
            ${label}
          </button>
        `
      })
      .join("")

    return `<div style="margin: 1rem 0;">${tabs}</div>`
  }

  renderActivities() {
    const activities = LEARNING_ACTIVITIES[this.selectedSkill] || []

    const activitiesHtml = activities
      .map((activity) => this.createActivityCard(activity))
      .join("")

    return `<div>${activitiesHtml}</div>`
  }

  createActivityCard(activity) {
    return `
      <div class="learning-activity-card">
        <div class="learning-activity-header">
          <strong>${activity.name}</strong>
          <span>+${activity.xp} XP</span>
        </div>
        <div class="learning-activity-meta">
          ${activity.description}
        </div>
        <div class="learning-activity-cost">
          ⏱ ${activity.time}ч | ⚡ ${activity.energy} энергии
        </div>
        <button 
          class="window-action learn-btn" 
          data-activity-id="${activity.id}"
        >
          Изучить
        </button>
      </div>
    `
  }

  attachHandlers() {
    document.querySelectorAll(".skill-tab").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.selectedSkill = e.target.dataset.skill
        this.render()
      })
    })

    document.querySelectorAll(".learn-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const activityId = e.target.dataset.activityId
        this.startLearning(activityId)
      })
    })
  }

  startLearning(activityId) {
    const activity = this.findActivity(activityId)
    if (!activity) return

    const state = this.gameState.getState()

    if (state.energy < activity.energy) {
      alert(MESSAGES.NO_ENERGY)
      return
    }

    this.gameState.addTime(activity.time)
    this.gameState.updateState({
      energy: state.energy - activity.energy,
    })

    this.skillsManager.addXP(this.selectedSkill, activity.xp)

    alert(
      `Изучено! +${activity.xp} XP к навыку ${SKILL_LABELS[this.selectedSkill]}`
    )
    this.render()
  }

  findActivity(activityId) {
    const activities = LEARNING_ACTIVITIES[this.selectedSkill] || []
    return activities.find((a) => a.id === activityId)
  }

  render() {
    const body = document.getElementById("learning-body")
    if (body) {
      body.innerHTML = this.renderLearningWindow()
      this.attachHandlers()
    }
  }
}
