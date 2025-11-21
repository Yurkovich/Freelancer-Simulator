import {
  GAME_CONSTANTS,
  UI_SELECTORS,
  SKILL_NAMES,
  STORAGE_KEY,
} from "./constants.js"
import { GameUtils } from "./utils.js"

class GameState {
  constructor() {
    this.state = this.loadState()
  }

  createInitialState() {
    return {
      day: GAME_CONSTANTS.INITIAL_DAY,
      time: GAME_CONSTANTS.INITIAL_TIME,
      money: GAME_CONSTANTS.INITIAL_MONEY,
      energy: GAME_CONSTANTS.INITIAL_ENERGY,
      maxEnergy: GAME_CONSTANTS.MAX_ENERGY,
      health: GAME_CONSTANTS.INITIAL_HEALTH,
      maxHealth: GAME_CONSTANTS.INITIAL_HEALTH,
      satiety: GAME_CONSTANTS.INITIAL_SATIETY,
      reputation: GAME_CONSTANTS.INITIAL_REPUTATION,
      skills: this.createInitialSkills(),
      activeOrder: null,
      completedOrders: [],
      portfolio: [],
      upgrades: {},
      pendingUpgrades: [],
      booksRead: [],
      lastBookDay: 0,
      kworkOrders: [],
      rejectedOrders: {},
      activeChat: null,
      activeModule: null,
      chatLogs: this.createInitialChatLogs(),
      telehlamXPToday: {},
      bills: {
        rent: { lastPaid: 0, due: 7 },
        internet: { lastPaid: 0, due: 7 },
      },
      hasRent: true,
      hasInternet: true,
      tutorialCompleted: false,
      tutorialStep: 0,
    }
  }

  deepMerge(target, source) {
    const output = { ...target }

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target) || !this.isObject(target[key])) {
            output[key] = source[key]
          } else {
            output[key] = this.deepMerge(target[key], source[key])
          }
        } else {
          output[key] = source[key]
        }
      })
    }

    return output
  }

  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item)
  }

  migratePendingUpgrades(state) {
    if (
      state.pendingUpgrades &&
      state.pendingUpgrades.length > 0 &&
      typeof state.pendingUpgrades[0] === "string"
    ) {
      state.pendingUpgrades = state.pendingUpgrades.map((key) => ({
        key,
        orderedDay: state.day - 1,
      }))
    }
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return this.createInitialState()
      }

      const saved = JSON.parse(raw)
      const base = this.createInitialState()

      const merged = this.deepMerge(base, saved)

      if (typeof merged.time !== "number" || isNaN(merged.time)) {
        merged.time = GAME_CONSTANTS.INITIAL_TIME
      }

      this.migratePendingUpgrades(merged)
      this.migrateSkills(merged)
      this.migrateOrders(merged)
      this.migrateActiveOrder(merged)

      return merged
    } catch (error) {
      console.warn("[STATE] Не удалось загрузить сохранение:", error)
      return this.createInitialState()
    }
  }

  migrateSkills(state) {
    const skillNames = [
      SKILL_NAMES.LAYOUT,
      SKILL_NAMES.WORKPRESS,
      SKILL_NAMES.FREELANCE,
    ]

    const validSkills = {}

    skillNames.forEach((skillName) => {
      const skill = state.skills[skillName]

      if (!skill || typeof skill !== "object") {
        validSkills[skillName] = {
          level: GAME_CONSTANTS.INITIAL_SKILL_LEVEL,
          xp: GAME_CONSTANTS.INITIAL_SKILL_XP,
        }
        return
      }

      if (
        typeof skill.level !== "number" ||
        isNaN(skill.level) ||
        skill.level === undefined
      ) {
        skill.level = GAME_CONSTANTS.INITIAL_SKILL_LEVEL
      }

      if (
        typeof skill.xp !== "number" ||
        isNaN(skill.xp) ||
        skill.xp === undefined
      ) {
        skill.xp = GAME_CONSTANTS.INITIAL_SKILL_XP
      }

      validSkills[skillName] = skill
    })

    state.skills = validSkills
  }

  migrateOrders(state) {
    if (state.kworkOrders && Array.isArray(state.kworkOrders)) {
      state.kworkOrders = state.kworkOrders.filter(
        (order) => order.skill && order.requiredLevel
      )
    }
  }

  migrateActiveOrder(state) {
    if (state.activeOrder) {
      const order = state.activeOrder
      const validSkills = [
        SKILL_NAMES.LAYOUT,
        SKILL_NAMES.WORKPRESS,
        SKILL_NAMES.FREELANCE,
      ]

      if (
        !order ||
        typeof order !== "object" ||
        !order.skill ||
        !validSkills.includes(order.skill)
      ) {
        state.activeOrder = null
        return
      }

      const orderSkill = state.skills[order.skill]
      if (!orderSkill || typeof orderSkill !== "object") {
        state.activeOrder = null
        return
      }

      if (!("level" in orderSkill) || typeof orderSkill.level !== "number") {
        state.activeOrder = null
        return
      }

      state.activeOrder = {
        ...order,
        progress: order.progress !== undefined ? order.progress : 0,
        acceptedDay: order.acceptedDay !== undefined ? order.acceptedDay : state.day,
        deadline: order.deadline || GAME_CONSTANTS.DEFAULT_ORDER_DEADLINE,
      }
    }
  }

  persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.warn("[STATE] Не удалось сохранить состояние:", error)
    }
  }

  createInitialSkills() {
    const skillNames = [
      SKILL_NAMES.LAYOUT,
      SKILL_NAMES.WORKPRESS,
      SKILL_NAMES.FREELANCE,
    ]

    return skillNames.reduce((skills, skillName) => {
      skills[skillName] = {
        level: GAME_CONSTANTS.INITIAL_SKILL_LEVEL,
        xp: GAME_CONSTANTS.INITIAL_SKILL_XP,
      }
      return skills
    }, {})
  }

  createInitialChatLogs() {
    return {
      course: {
        [SKILL_NAMES.LAYOUT]: [
          {
            from: "mentor",
            text: "Привет! Это модуль по верстке. Если возникнут вопросы - смело задавай!",
          },
        ],
        [SKILL_NAMES.WORKPRESS]: [
          {
            from: "mentor",
            text: "Добро пожаловать в модуль Workpress! Здесь ты научишься работать с CMS!",
          },
        ],
        [SKILL_NAMES.FREELANCE]: [
          {
            from: "mentor",
            text: "Привет! Это модуль по фрилансу. Тут тебе расскажут, как работать с заказчиками и находить клиентов!",
          },
        ],
      },
      mentor: [
        {
          from: "mentor",
          text: "Привет! Я Альберт, твой куратор. Если возникнут вопросы по работе или учебе - пиши мне. Всегда рад помочь!",
        },
      ],
      aroken: [
        {
          from: "aroken",
          text: "Поздравляю с приобретением курса! Желаю тебе успехов в твоем становлении веб-разработчиком!",
        },
      ],
    }
  }

  getState() {
    return { ...this.state }
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState }
    if (newState.activeOrder !== undefined) {
      this.state.activeOrder =
        newState.activeOrder === null
          ? null
          : { ...newState.activeOrder }
    }
    this.updateUI()
    this.persistState()
  }

  updateUI() {
    const uiUpdates = [
      { selector: UI_SELECTORS.STAT_DAY, value: this.state.day },
      {
        selector: UI_SELECTORS.STAT_TIME,
        value: this.formatTime(this.state.time),
      },
      { selector: UI_SELECTORS.STAT_ENERGY, value: `${this.state.energy}%` },
      {
        selector: UI_SELECTORS.STAT_HEALTH,
        value: `${this.state.health}/${this.state.maxHealth}`,
      },
      {
        selector: UI_SELECTORS.STAT_SATIETY,
        value: `${this.state.satiety}%`,
      },
      {
        selector: UI_SELECTORS.STAT_MONEY,
        value: `${this.state.money.toLocaleString()} ₽`,
      },
      { selector: UI_SELECTORS.STAT_REP, value: this.state.reputation },
    ]

    uiUpdates.forEach(({ selector, value }) => {
      this.updateElement(selector, value)
    })

    this.updateStatColors()
  }

  updateStatColors() {
    const satietyEl = document.getElementById(UI_SELECTORS.STAT_SATIETY)
    if (satietyEl) {
      satietyEl.classList.remove("low", "critical")
      if (this.state.satiety === 0) {
        satietyEl.classList.add("critical")
      } else if (this.state.satiety < GAME_CONSTANTS.LOW_SATIETY_THRESHOLD) {
        satietyEl.classList.add("low")
      }
    }

    const energyEl = document.getElementById(UI_SELECTORS.STAT_ENERGY)
    if (energyEl) {
      energyEl.classList.remove("low", "critical")
      if (this.state.energy === 0) {
        energyEl.classList.add("critical")
      } else if (this.state.energy < GAME_CONSTANTS.LOW_ENERGY_THRESHOLD) {
        energyEl.classList.add("low")
      }
    }

    const healthEl = document.getElementById(UI_SELECTORS.STAT_HEALTH)
    if (healthEl) {
      healthEl.classList.remove("low", "critical")
      const maxHealth = this.state.maxHealth || GAME_CONSTANTS.INITIAL_HEALTH
      const healthPercent = (this.state.health / maxHealth) * 100
      if (healthPercent === 0) {
        healthEl.classList.add("critical")
      } else if (healthPercent < GAME_CONSTANTS.LOW_HEALTH_THRESHOLD) {
        healthEl.classList.add("low")
      }
    }
  }

  updateElement(elementId, value) {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = value
    }
  }

  formatTime(time) {
    return GameUtils.formatTime(time)
  }
}

export default GameState
