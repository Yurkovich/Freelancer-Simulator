import { SKILL_INFO } from "./config.js"
import { UIManager } from "./ui.js"

const CHATS = {
  course: {
    name: "Премиум Арокен.ру",
    hasModules: true,
  },
  mentor: {
    name: "Куратор Альберт",
    hasModules: false,
  },
  aroken: {
    name: "Максим Арокен",
    hasModules: false,
  },
}

export class TelehlamManager {
  constructor(gameState, skillsManager) {
    this.gameState = gameState
    this.skillsManager = skillsManager
    this.ui = new UIManager()
  }

  render() {
    const state = this.gameState.getState()
    const telehlamBody = document.getElementById("telehlam-body")

    if (!state.activeChat) {
      state.activeChat = "course"
    }
    if (!state.activeModule) {
      state.activeModule = Object.keys(SKILL_INFO)[0]
    }
    if (!state.chatLogs) {
      state.chatLogs = { course: {}, mentor: [], aroken: [] }
    }
    if (!state.chatLogs.aroken) {
      state.chatLogs.aroken = []
    }
    if (!state.telehlamXPToday) {
      state.telehlamXPToday = {}
    }

    telehlamBody.innerHTML = `
      <div class="telehlam-layout">
        <div class="telehlam-sidebar" id="telehlam-sidebar"></div>
        <div class="telehlam-main" id="telehlam-main"></div>
      </div>
    `

    this.renderSidebar()
    this.renderMainPanel()
  }

  renderSidebar() {
    const state = this.gameState.getState()
    const sidebar = document.getElementById("telehlam-sidebar")

    const chatsHtml = Object.entries(CHATS)
      .map(
        ([key, chat]) => `
        <button 
          class="telehlam-chat-button ${
            state.activeChat === key ? "active" : ""
          }" 
          data-chat="${key}"
        >
          ${chat.name}
        </button>
      `
      )
      .join("")

    sidebar.innerHTML = chatsHtml

    sidebar.querySelectorAll(".telehlam-chat-button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const chatKey = e.target.dataset.chat
        state.activeChat = chatKey
        this.gameState.updateState(state)
        this.render()
      })
    })
  }

  renderMainPanel() {
    const state = this.gameState.getState()
    const mainPanel = document.getElementById("telehlam-main")
    const currentChat = CHATS[state.activeChat]

    if (currentChat.hasModules) {
      const today = state.day
      const lastXPDay = state.telehlamXPToday?.[state.activeModule] || 0
      const canGetXP = lastXPDay !== today

      mainPanel.innerHTML = `
        <div class="telehlam-module-bar" id="telehlam-module-bar"></div>
        <div class="telehlam-chat-panel">
          ${
            !canGetXP
              ? `
            <div style="padding: 0.6rem; background: rgba(255, 165, 0, 0.1); border: 2px solid orange; margin-bottom: 0.5rem; font-size: 0.55rem; color: orange;">
              ℹ️ Вы уже получили опыт сегодня. Приходите завтра!
            </div>
          `
              : ""
          }
          <div class="telehlam-chat-log" id="telehlam-chat-log"></div>
          <div class="telehlam-input">
            <input 
              type="text" 
              id="telehlam-message-input" 
              placeholder="Напишите вопрос..."
              maxlength="200"
            />
            <button class="window-action" id="telehlam-send-btn">Отправить</button>
          </div>
        </div>
      `

      this.renderModuleBar()
      this.renderChatLog()
      this.attachSendHandler()
    } else {
      mainPanel.innerHTML = `
        <div class="telehlam-chat-panel">
          <div class="telehlam-chat-log" id="telehlam-chat-log"></div>
          <div class="telehlam-input">
            <input 
              type="text" 
              id="telehlam-message-input" 
              placeholder="Напишите сообщение..."
              maxlength="200"
            />
            <button class="window-action" id="telehlam-send-btn">Отправить</button>
          </div>
        </div>
      `

      this.renderChatLog()
      this.attachSendHandler()
    }
  }

  renderModuleBar() {
    const state = this.gameState.getState()
    const moduleBar = document.getElementById("telehlam-module-bar")

    const modulesHtml = Object.entries(SKILL_INFO)
      .map(
        ([key, info]) => `
        <button 
          class="skill-selector-button ${
            state.activeModule === key ? "active" : ""
          }" 
          data-module="${key}"
        >
          ${info.label}
        </button>
      `
      )
      .join("")

    moduleBar.innerHTML = modulesHtml

    moduleBar.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const moduleKey = e.target.dataset.module
        state.activeModule = moduleKey
        this.gameState.updateState(state)
        this.render()
      })
    })
  }

  renderChatLog() {
    const state = this.gameState.getState()
    const chatLog = document.getElementById("telehlam-chat-log")
    const currentChat = CHATS[state.activeChat]

    let messages = []

    if (currentChat.hasModules) {
      messages = state.chatLogs.course[state.activeModule] || []
    } else {
      messages = state.chatLogs[state.activeChat] || []
    }

    const messagesHtml = messages
      .map(
        (msg) => `
        <div class="telehlam-message ${msg.from === "player" ? "player" : ""}">
          ${msg.text}
        </div>
      `
      )
      .join("")

    chatLog.innerHTML = messagesHtml

    setTimeout(() => {
      chatLog.scrollTop = chatLog.scrollHeight
    }, 0)
  }

  attachSendHandler() {
    const sendBtn = document.getElementById("telehlam-send-btn")
    const input = document.getElementById("telehlam-message-input")

    const sendMessage = () => {
      const text = input.value.trim()
      if (!text) return

      this.sendMessage(text)
      input.value = ""
    }

    sendBtn.addEventListener("click", sendMessage)
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage()
      }
    })
  }

  sendMessage(text) {
    const state = this.gameState.getState()
    const currentChat = CHATS[state.activeChat]

    const playerMessage = { from: "player", text }

    if (currentChat.hasModules) {
      if (!state.chatLogs.course[state.activeModule]) {
        state.chatLogs.course[state.activeModule] = []
      }
      state.chatLogs.course[state.activeModule].push(playerMessage)

      const mentorResponse = this.generateMentorResponse()
      state.chatLogs.course[state.activeModule].push(mentorResponse)

      this.addSkillXP(state.activeModule)
    } else {
      if (!state.chatLogs[state.activeChat]) {
        state.chatLogs[state.activeChat] = []
      }
      state.chatLogs[state.activeChat].push(playerMessage)

      const response = this.generateResponse()
      state.chatLogs[state.activeChat].push(response)
    }

    this.gameState.updateState(state)
    this.renderChatLog()
  }

  generateMentorResponse() {
    const responses = [
      "Отличный вопрос! Попробуй поискать в документации.",
      "Я бы на твоем месте начал с основ.",
      "Это частая проблема. Проверь консоль браузера.",
      "Молодец, что спрашиваешь! Лучше уточнить, чем делать неправильно.",
      "Хороший подход! Продолжай в том же духе.",
      "Попробуй разбить задачу на более мелкие части.",
    ]

    return {
      from: "mentor",
      text: responses[Math.floor(Math.random() * responses.length)],
    }
  }

  generateResponse() {
    const state = this.gameState.getState()
    const currentChat = state.activeChat

    const responsesByChat = {
      mentor: [
        "Хорошо, жду результат.",
        "Отлично! Продолжайте в том же духе.",
        "Понял вас.",
        "Спасибо за информацию!",
      ],
      aroken: [
        "💪 Отличная работа! Продолжай в том же духе!",
        "🔥 Ты на правильном пути! Не останавливайся!",
        "⭐ Каждый день - это шаг к мастерству!",
        "🚀 Верю в тебя! У тебя все получится!",
        "💎 Главное - постоянство. Ты молодец!",
        "🎯 Фокусируйся на цели и двигайся вперед!",
        "✨ Твой прогресс впечатляет! Так держать!",
        "🌟 Помни: каждый эксперт когда-то был новичком!",
        "💼 Ты строишь свое будущее прямо сейчас!",
        "🎓 Учись, практикуйся, развивайся - успех придет!",
      ],
    }

    const responses = responsesByChat[currentChat] || responsesByChat.mentor

    return {
      from: currentChat,
      text: responses[Math.floor(Math.random() * responses.length)],
    }
  }

  addSkillXP(skillKey) {
    const state = this.gameState.getState()

    const today = state.day
    const lastXPDay = state.telehlamXPToday[skillKey] || 0

    if (lastXPDay === today) {
      this.ui.showToast(`Вы уже получили опыт сегодня. Приходите завтра!`)
      this.gameState.updateState(state)
      return
    }

    const xpGain = 15

    state.telehlamXPToday[skillKey] = today
    const leveledUp = this.skillsManager.addXP(skillKey, xpGain)

    if (!leveledUp) {
      this.ui.showToast(
        `+${xpGain} опыта в навыке ${SKILL_INFO[skillKey].label}`
      )
    }

    this.gameState.updateState(state)
  }
}
