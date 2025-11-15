import { GAME_CONSTANTS, UI_SELECTORS, SKILL_NAMES } from "./constants.js"

class GameState {
  constructor() {
    this.state = this.createInitialState()
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
      reputation: 0,
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
      activeChat: "course",
      activeModule: null,
      chatLogs: this.createInitialChatLogs(),
      telehlamXPToday: {},
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
    this.updateUI()
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
  }

  updateElement(elementId, value) {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = value
    }
  }

  formatTime(time) {
    const hours = Math.floor(time)
    const minutes = Math.floor((time - hours) * GAME_CONSTANTS.MINUTES_IN_HOUR)
    return `${this.padZero(hours)}:${this.padZero(minutes)}`
  }

  padZero(num) {
    const minDigits = 2
    return num.toString().padStart(minDigits, "0")
  }

  addTime(hours) {
    const newTime = this.state.time + hours
    const daysToAdd = Math.floor(newTime / GAME_CONSTANTS.HOURS_IN_DAY)
    const remainingTime = newTime % GAME_CONSTANTS.HOURS_IN_DAY

    this.updateState({
      time: remainingTime,
      day: this.state.day + daysToAdd,
    })
  }
}

export default GameState
