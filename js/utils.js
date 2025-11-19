import { GAME_CONSTANTS } from "./constants.js"

export class GameUtils {
  static calculateXPBonus(state) {
    let xpBonus = 0

    if (state.upgrades?.monitorPro) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_MONITOR_PRO
    } else if (state.upgrades?.monitor) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_MONITOR
    }

    if (state.upgrades?.headphones) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_HEADPHONES
    }

    if (state.upgrades?.apartment) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_APARTMENT
    }

    if (state.upgrades?.coworking) {
      xpBonus += GAME_CONSTANTS.XP_BONUS_COWORKING
    }

    return xpBonus
  }

  static formatTime(time) {
    const hours = Math.floor(time)
    const minutes = Math.round((time - hours) * GAME_CONSTANTS.MINUTES_IN_HOUR)
    return `${hours
      .toString()
      .padStart(GAME_CONSTANTS.TIME_FORMAT_MIN_DIGITS, "0")}:${minutes
      .toString()
      .padStart(GAME_CONSTANTS.TIME_FORMAT_MIN_DIGITS, "0")}`
  }

  static parseOrderId(value) {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed <= 0) {
      return null
    }
    return parsed
  }

  static parseHours(value) {
    const parsed = parseFloat(value)
    if (isNaN(parsed) || parsed < 0) {
      return null
    }
    return parsed
  }

  static shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  static getStatColor(value, maxValue = 100) {
    const percent = maxValue > 0 ? (value / maxValue) * 100 : 0

    if (percent > GAME_CONSTANTS.STAT_COLOR_HIGH_THRESHOLD) {
      return "var(--accent)"
    } else if (percent > GAME_CONSTANTS.STAT_COLOR_MEDIUM_THRESHOLD) {
      return "orange"
    } else {
      return "var(--danger)"
    }
  }

  static replaceEmojiWithIcon(text) {
    if (!text || typeof text !== "string") {
      return text
    }

    try {
      const emojiMap = {
        "⚡": "energy",
        "⚠️": "warning",
        "🔥": "fire",
        "⭐": "star",
        "💪": "muscle",
        "🚀": "rocket",
        "💎": "diamond",
        "🎯": "target",
        "✨": "sparks",
        "🌟": "star",
        "💼": "briefcase",
        "🎓": "hat",
        ℹ️: "information",
        "📅": "calendar",
        "❌": "cross",
        "⏱️": "timer",
        "⏭️": "reset",
        "❤️": "heart",
        "💡": "light",
        "🖥️": "monitor",
        "⌨️": "keyboard",
        "🖱️": "mouse",
        "⚕️": "medical",
        "🔊": "energy",
        "🔄": "reset",
        "🏠": "house",
        "🌐": "internet",
        "📚": "book",
        "💻": "laptop",
        "💬": "message",
        "💰": "moneybag",
        "🔧": "wrench",
        "🏪": "shop",
        "👤": "human",
        "😴": "sleeping",
        "🎮": "gamepad",
        "🎉": "firework",
        "✅": "accept",
        "🪑": "chair",
        "🎧": "headphones",
        "📷": "camera",
        "🎤": "microphone",
        "☕": "coffee",
      }

      const allEmojis = Object.keys(emojiMap)
        .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")
      const emojiPattern = `(?:${allEmojis})`

      let result = text
      const sortedEmojis = Object.entries(emojiMap).sort(
        (a, b) => b[0].length - a[0].length
      )

      sortedEmojis.forEach(([emoji, iconName]) => {
        const escapedEmoji = emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const regex = new RegExp(
          `(${escapedEmoji})([\\s\\S]*?)(?=${emojiPattern}|<|$)`,
          "gu"
        )

        result = result.replace(regex, (match, emojiMatch, textAfter) => {
          let finalIconName = iconName

          if (emoji === "🪑" && textAfter) {
            const text = textAfter.trim().toLowerCase()
            if (text.includes("стол")) {
              finalIconName = "stool"
            } else {
              finalIconName = "chair"
            }
          }

          const iconSize = GAME_CONSTANTS.ICON_SIZE_PX
          const iconGap = GAME_CONSTANTS.ICON_TEXT_GAP_PX
          const iconHtml = `<img src="img/icons/mini/${finalIconName}.webp" alt="${emojiMatch}" class="stat-icon" style="width: ${iconSize}px; height: ${iconSize}px; vertical-align: middle; display: inline-block;">`

          if (textAfter && textAfter.trim()) {
            const text = textAfter.trim()
            return `<span style="display: inline-flex; align-items: center; gap: ${iconGap}px;">${iconHtml}${text}</span>`
          }

          return iconHtml
        })
      })

      return result
    } catch (error) {
      console.error("Error replacing emoji with icon:", error)
      return text
    }
  }
}
