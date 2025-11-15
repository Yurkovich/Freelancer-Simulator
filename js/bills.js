import { BILLS } from "./config.js"

export class BillsManager {
  constructor(gameState, ui, appsManager = null) {
    this.gameState = gameState
    this.ui = ui
    this.appsManager = appsManager
  }

  setAppsManager(appsManager) {
    this.appsManager = appsManager
  }

  render() {
    const state = this.gameState.getState()
    const billsBody = document.getElementById("bills-body")

    const rentDaysLeft = state.bills.rent.due - state.day
    const internetDaysLeft = state.bills.internet.due - state.day

    const rentOverdue = rentDaysLeft < 0
    const internetOverdue = internetDaysLeft < 0

    let rentAmount = BILLS.rent.amount
    if (state.upgrades.apartment) {
      rentAmount = 20000
    }
    if (state.upgrades.coworking) {
      rentAmount += 2000
    }

    billsBody.innerHTML = `
      <div class="message">
        <strong>Обязательные платежи</strong><br>
        Оплачивайте счета вовремя!
      </div>

      <div class="bills-list">
        <div class="bill-card ${rentOverdue ? "bill-overdue" : ""}">
          <div class="bill-header">
            <strong>🏠 Квартира${
              state.upgrades.coworking ? " + Коворкинг" : ""
            }</strong>
            <span style="color: var(--accent)">${rentAmount.toLocaleString()} ₽</span>
          </div>
          <div class="bill-meta">
            ${
              rentDaysLeft > 0
                ? `Следующий платеж через: ${rentDaysLeft} дн.`
                : rentDaysLeft === 0
                ? `<span style="color: orange;">Сегодня день оплаты!</span>`
                : `<span style="color: var(--danger);">Просрочен на ${Math.abs(
                    rentDaysLeft
                  )} дн.!</span>`
            }
          </div>
          ${
            !state.hasRent
              ? `<div class="bill-warning">⚠️ Без оплаты квартиры доступны только подработки!</div>`
              : ""
          }
          <button class="window-action bill-pay-btn" data-bill="rent" ${
            state.hasRent && rentDaysLeft > 1 ? 'style="opacity: 0.7;"' : ""
          }>
            ${
              !state.hasRent ? "Оплатить сейчас" : "Оплатить"
            } ${rentAmount.toLocaleString()} ₽
          </button>
        </div>

        <div class="bill-card ${internetOverdue ? "bill-overdue" : ""}">
          <div class="bill-header">
            <strong>🌐 Интернет</strong>
            <span style="color: var(--accent)">${BILLS.internet.amount.toLocaleString()} ₽</span>
          </div>
          <div class="bill-meta">
            ${
              internetDaysLeft > 0
                ? `Следующий платеж через: ${internetDaysLeft} дн.`
                : internetDaysLeft === 0
                ? `<span style="color: orange;">Сегодня день оплаты!</span>`
                : `<span style="color: var(--danger);">Просрочен на ${Math.abs(
                    internetDaysLeft
                  )} дн.!</span>`
            }
          </div>
          ${
            !state.hasInternet
              ? `<div class="bill-warning">⚠️ Без интернета нельзя учиться и работать удаленно!</div>`
              : ""
          }
          <button class="window-action bill-pay-btn" data-bill="internet" ${
            state.hasInternet && internetDaysLeft > 1
              ? 'style="opacity: 0.7;"'
              : ""
          }>
            ${
              !state.hasInternet ? "Оплатить сейчас" : "Оплатить"
            } ${BILLS.internet.amount.toLocaleString()} ₽
          </button>
        </div>
      </div>

      <div class="bills-info">
        <h3 style="margin: 1rem 0 0.5rem; font-size: 0.65rem;">Информация:</h3>
        <div style="font-size: 0.6rem; color: var(--muted); line-height: 1.6;">
          • Счета приходят каждые 7 дней<br>
          • Автоматическое списание в день оплаты<br>
          • Если нет денег - услуга отключается<br>
          • Можно оплатить вручную досрочно
        </div>
      </div>
    `

    billsBody.querySelectorAll(".bill-pay-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const billType = e.target.dataset.bill
        this.payBill(billType)
      })
    })
  }

  payBill(billType) {
    const state = this.gameState.getState()
    const bill = BILLS[billType]

    let billAmount = bill.amount
    if (billType === "rent") {
      if (state.upgrades.apartment) {
        billAmount = 20000
      }
      if (state.upgrades.coworking) {
        billAmount += 2000
      }
    }

    if (state.money < billAmount) {
      this.ui.showToast("Недостаточно денег!")
      return
    }

    state.money -= billAmount
    state.bills[billType].lastPaid = state.day

    const currentDue = state.bills[billType].due

    if (state.day < currentDue) {
      state.bills[billType].due = currentDue + bill.period
    } else {
      state.bills[billType].due = state.day + bill.period
    }

    if (billType === "rent") {
      state.hasRent = true
    } else if (billType === "internet") {
      state.hasInternet = true
    }

    this.gameState.updateState(state)
    this.render()
    if (this.appsManager) {
      this.appsManager.updateIconStates()
    }
    this.ui.showToast(
      `✅ Оплачено: ${bill.name} (${billAmount.toLocaleString()}₽)`
    )
  }
}
