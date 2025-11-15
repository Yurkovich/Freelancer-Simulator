import { SHOP_ITEMS } from "./config.js"

export class ShopManager {
  constructor(gameState, ui, timeManager) {
    this.gameState = gameState
    this.ui = ui
    this.timeManager = timeManager
  }

  render() {
    const state = this.gameState.getState()
    const shopBody = document.getElementById("shop-body")

    shopBody.innerHTML = `
      <div class="message">
        <strong>Магазин 24/7</strong><br>
        Круглосуточный магазин у дома. Цены выше, чем в доставке, но всегда открыт.
      </div>

      <div class="shop-grid">
        ${Object.entries(SHOP_ITEMS)
          .map(
            ([key, item]) => `
          <div class="shop-item">
            <div class="shop-item-header">
              <strong>${item.name}</strong>
              <span style="color: var(--accent)">${item.price} ₽</span>
            </div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-effects">
              ${
                item.satiety > 0
                  ? `<img src="img/icons/food.png" alt="🍔" class="stat-icon"> +${item.satiety} сытость`
                  : ""
              }
              ${
                item.energy > 0
                  ? `<img src="img/icons/energy.png" alt="⚡" class="stat-icon"> +${item.energy} энергия`
                  : ""
              }
              ${
                item.health > 0
                  ? `<img src="img/icons/heart.png" alt="❤️" class="stat-icon"> +${item.health} здоровье`
                  : ""
              }
              ${
                item.health < 0
                  ? `<img src="img/icons/heart.png" alt="❤️" class="stat-icon"> ${item.health} здоровье`
                  : ""
              }
            </div>
            <button class="window-action shop-buy-btn" data-item="${key}" ${
              state.money < item.price ? "disabled" : ""
            }>
              Купить ${item.price} ₽
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    `

    shopBody.querySelectorAll(".shop-buy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemKey = e.target.dataset.item
        this.buyItem(itemKey)
      })
    })
  }

  buyItem(itemKey) {
    const state = this.gameState.getState()
    const item = SHOP_ITEMS[itemKey]

    if (state.money < item.price) {
      this.ui.showToast("Недостаточно денег!")
      return
    }

    if (item.satiety > 0 && state.satiety >= 100) {
      this.ui.showToast("Сытость уже максимальная!")
      return
    }

    const maxHealth = state.maxHealth || 100
    if (item.health > 0 && state.health >= maxHealth) {
      this.ui.showToast("Здоровье уже максимальное!")
      return
    }

    state.money -= item.price
    state.satiety = Math.min(100, state.satiety + item.satiety)
    state.energy = Math.min(state.maxEnergy, state.energy + item.energy)
    state.health = Math.max(
      0,
      Math.min(state.maxHealth, state.health + item.health)
    )

    this.gameState.updateState(state)
    this.ui.showToast(`✅ Куплено: ${item.name}`)
    this.render()
  }
}
