import { UIManager } from "./ui.js"
import { GAME_CONSTANTS } from "./constants.js"
import { GameUtils } from "./utils.js"

export class CharacterManager {
  constructor(gameState) {
    this.gameState = gameState
    this.ui = new UIManager()
  }

  render() {
    const state = this.gameState.getState()
    const characterBody = document.getElementById("character-body")

    const maxHealth = state.maxHealth || GAME_CONSTANTS.INITIAL_HEALTH
    const healthPercent = (state.health / maxHealth) * 100
    const healthColor = GameUtils.getStatColor(state.health, maxHealth)
    const satietyColor = GameUtils.getStatColor(state.satiety)
    const energyColor = GameUtils.getStatColor(
      state.energy,
      state.maxEnergy || GAME_CONSTANTS.MAX_ENERGY
    )

    characterBody.innerHTML = `
      <div class="message">
        <strong>Состояние персонажа</strong><br>
        Следите за здоровьем и сытостью!
      </div>
      
      <div class="character-stats">
        <div class="character-stat-item">
          <div class="character-stat-header">
            <span><img src="img/icons/heart.png" alt="❤️" class="stat-icon"> Здоровье</span>
            <span style="color: ${healthColor}">${
      state.health
    }/${maxHealth}</span>
          </div>
          <div class="skill-progress">
            <span style="width: ${healthPercent}%; background: ${healthColor}"></span>
          </div>
          <div class="character-stat-info">
            Падает от недосыпа, голода, энергетиков
          </div>
        </div>

        <div class="character-stat-item">
          <div class="character-stat-header">
            <span><img src="img/icons/food.png" alt="🍔" class="stat-icon"> Сытость</span>
            <span style="color: ${satietyColor}">${state.satiety}%</span>
          </div>
          <div class="skill-progress">
            <span style="width: ${
              state.satiety
            }%; background: ${satietyColor}"></span>
          </div>
          <div class="character-stat-info">
            Падает на -10 каждые 3 часа
          </div>
        </div>

        <div class="character-stat-item">
          <div class="character-stat-header">
            <span><img src="img/icons/energy.png" alt="⚡" class="stat-icon"> Энергия</span>
            <span style="color: ${energyColor}">${state.energy}/${
      state.maxEnergy
    }</span>
          </div>
          <div class="skill-progress">
            <span style="width: ${
              (state.energy / state.maxEnergy) * 100
            }%; background: ${energyColor}"></span>
          </div>
          <div class="character-stat-info">
            Восстанавливается сном
          </div>
        </div>
      </div>

      <div class="character-warnings">
        ${
          state.health === 0
            ? '<div style="color: var(--danger);">⚠️ Критическое состояние! Вы попадете в больницу!</div>'
            : ""
        }
        ${
          healthPercent < 30
            ? '<div style="color: orange;">⚠️ Низкое здоровье! Купите витамины или отдохните.</div>'
            : ""
        }
        ${
          state.satiety === 0
            ? '<div style="color: var(--danger);">⚠️ Вы голодаете! Здоровье падает!</div>'
            : ""
        }
        ${
          state.satiety < 30
            ? '<div style="color: orange;">⚠️ Низкая сытость! Закажите еду.</div>'
            : ""
        }
        ${
          state.energy < 20
            ? '<div style="color: orange;">⚠️ Низкая энергия! Пора спать.</div>'
            : ""
        }
      </div>

      <div class="character-upgrades">
        <h3 style="margin: 1rem 0 0.5rem; font-size: 0.65rem;">Купленные улучшения:</h3>
        ${this.renderUpgrades()}
      </div>
    `
  }

  renderUpgrades() {
    const state = this.gameState.getState()
    const upgrades = []

    if (state.upgrades.monitorPro)
      upgrades.push("🖥️ Профессиональный монитор 4K (+15 XP)")
    else if (state.upgrades.monitor) upgrades.push("🖥️ Игровой монитор (+5 XP)")

    if (state.upgrades.pcUltra)
      upgrades.push("💻 Топовая рабочая станция (-30% энергии)")
    else if (state.upgrades.pc) upgrades.push("💻 Мощный ПК (-15% энергии)")

    if (state.upgrades.chairPremium)
      upgrades.push("🪑 Премиум кресло Herman Miller (+50 энергии)")
    else if (state.upgrades.chair)
      upgrades.push("🪑 Эргономичное кресло (+20 энергии)")

    if (state.upgrades.keyboard)
      upgrades.push("⌨️ Механическая клавиатура (-10 мин)")
    if (state.upgrades.mouse) upgrades.push("🖱️ Игровая мышь (-10 мин)")
    if (state.upgrades.secondMonitor)
      upgrades.push("🖥️ Второй монитор (-20 мин)")
    if (state.upgrades.headphones)
      upgrades.push("🎧 Наушники с шумоподавлением (+10 XP)")
    if (state.upgrades.desk) upgrades.push("🪑 Регулируемый стол (+5 здоровье)")
    if (state.upgrades.lamp) upgrades.push("💡 Настольная лампа (+5 энергии)")
    if (state.upgrades.webcam)
      upgrades.push("📷 Профессиональная веб-камера (+5% репутации)")
    if (state.upgrades.microphone)
      upgrades.push("🎤 Студийный микрофон (+3% шанс заказа)")

    if (state.upgrades.apartment) upgrades.push("🏠 Квартира в центре (+15 XP)")
    if (state.upgrades.coworking)
      upgrades.push("💼 Абонемент в коворкинг (+8 XP)")
    if (state.upgrades.gym)
      upgrades.push("💪 Абонемент в спортзал (+15 здоровье)")
    if (state.upgrades.coffeeSubscription)
      upgrades.push("☕ Подписка на кофе (+5 энергии каждое утро)")

    if (upgrades.length === 0) {
      return '<div style="color: var(--muted); font-size: 0.6rem;">Нет улучшений. Купите в Маркетплейсе!</div>'
    }

    return upgrades
      .map(
        (u) => `<div style="font-size: 0.6rem; margin: 0.3rem 0;">${u}</div>`
      )
      .join("")
  }
}
