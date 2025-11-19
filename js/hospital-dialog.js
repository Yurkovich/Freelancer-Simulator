import { GameUtils } from "./utils.js"

export class HospitalDialog {
  constructor() {
    this.overlay = null
  }

  show(moneyCost, timePenalty, onClose) {
    this.createOverlay()
    this.createDialog(moneyCost, timePenalty)
    this.attachEventHandlers(onClose)
  }

  createOverlay() {
    this.overlay = document.createElement("div")
    this.overlay.className = "hospital-overlay"
    document.body.appendChild(this.overlay)
  }

  createDialog(moneyCost, timePenalty) {
    const dialog = document.createElement("div")
    dialog.className = "hospital-window"
    dialog.innerHTML = this.getDialogContent(moneyCost, timePenalty)
    this.overlay.appendChild(dialog)
  }

  getDialogContent(moneyCost, timePenalty) {
    return `
      <div class="hospital-header">
        <span><span class="hospital-icon">🏥</span>БОЛЬНИЦА</span>
      </div>
      
      <div class="hospital-body">
        <div class="hospital-alert">
          <strong style="color: var(--danger);">${GameUtils.replaceEmojiWithIcon("⚠️ КРИТИЧЕСКОЕ СОСТОЯНИЕ")}</strong><br>
          Вы потеряли сознание от истощения и были доставлены в больницу.
        </div>

        <div class="hospital-stats">
          <div class="hospital-stat">
            <span>💰 Стоимость лечения</span>
            <strong style="color: var(--danger);">${moneyCost.toLocaleString()}₽</strong>
          </div>

          <div class="hospital-stat">
            <span>${GameUtils.replaceEmojiWithIcon("⏱️ Время в больнице")}</span>
            <strong style="color: var(--danger);">${timePenalty} дня</strong>
          </div>

          <div class="hospital-stat">
            <span>📉 Потеря навыков</span>
            <strong style="color: orange;">-10%</strong>
          </div>

          <div class="hospital-stat positive">
            <span>${GameUtils.replaceEmojiWithIcon("❤️ Здоровье восстановлено")}</span>
            <strong style="color: var(--accent);">50%</strong>
          </div>
        </div>

        <div class="hospital-warning">
          ${GameUtils.replaceEmojiWithIcon("⚕️ Следите за своим состоянием! Не допускайте истощения.")}
        </div>

        <button id="hospital-ok-btn" class="window-action" style="width: 100%; background: var(--danger); color: white;">
          Выписаться из больницы
        </button>
      </div>
    `
  }

  attachEventHandlers(onClose) {
    const button = document.getElementById("hospital-ok-btn")
    if (button) {
      button.addEventListener("click", () => this.close(onClose))
    }
  }

  close(onClose) {
    if (this.overlay && this.overlay.parentNode) {
      document.body.removeChild(this.overlay)
      this.overlay = null
    }

    if (typeof onClose === "function") {
      onClose()
    }
  }
}
