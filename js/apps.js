export class AppsManager {
  constructor(gameState) {
    this.gameState = gameState
    this.activeOrder = null
  }

  openApp(appName) {
    const windows = {
      portfolio: document.getElementById("portfolio-window"),
      wzcode: document.getElementById("wzcode-window"),
    }

    Object.values(windows).forEach((w) => w?.classList.add("hidden"))

    if (windows[appName]) {
      windows[appName].classList.remove("hidden")

      if (appName === "wzcode") {
        this.renderWZCode()
      }
    }
  }

  renderWZCode() {
    const body = document.getElementById("wzcode-body")

    if (!this.activeOrder) {
      this.activeOrder = {
        title: "Тестовый лендинг",
        description: "Простая одностраничка для кафе",
        reward: 3000,
        timeRequired: 4,
        energyCost: 40,
        progress: 0,
      }
    }

    const order = this.activeOrder

    body.innerHTML = `
      <div class="message">
        <strong>Активная задача:</strong> ${order.title}<br>
        ${order.description}<br><br>
        <strong>Оплата:</strong> ${order.reward} ₽<br>
        <strong>Прогресс:</strong> ${order.progress}%<br><br>
        <div style="background: #0a1628; height: 20px; border: 2px solid #314a74; margin: 10px 0;">
          <div style="background: #53f5c8; height: 100%; width: ${order.progress}%;"></div>
        </div>
        <button id="work-btn" style="padding: 0.6rem 1rem; background: #53f5c8; border: none; cursor: pointer; font-family: inherit; font-size: 0.6rem; margin-top: 10px;">
          Работать (${order.timeRequired}ч, -${order.energyCost} энергии)
        </button>
      </div>
    `

    document.getElementById("work-btn")?.addEventListener("click", () => {
      this.workOnOrder()
    })
  }

  workOnOrder() {
    const state = this.gameState.getState()
    const order = this.activeOrder

    if (state.energy < order.energyCost) {
      alert("Недостаточно энергии!")
      return
    }

    this.gameState.addTime(order.timeRequired)
    this.gameState.updateState({
      energy: state.energy - order.energyCost,
    })

    order.progress += 25

    if (order.progress >= 100) {
      this.gameState.updateState({
        money: state.money + order.reward,
      })
      alert(`Заказ выполнен! +${order.reward} ₽`)
      this.activeOrder = null
    }

    this.renderWZCode()
  }
}
