import { SIDE_JOBS } from "./config.js"

export class SideJobManager {
  constructor(gameState, ui, timeManager) {
    this.gameState = gameState
    this.ui = ui
    this.timeManager = timeManager
  }

  render() {
    const sidejobBody = document.getElementById("sidejob-body")

    const jobsHtml = Object.entries(SIDE_JOBS)
      .map(
        ([key, job]) => `
        <div class="sidejob-card">
          <div class="sidejob-header">
            <strong>${job.name}</strong>
            <span style="color: var(--accent)">${job.minPay}-${
          job.maxPay
        } ₽</span>
          </div>
          <div class="sidejob-meta">
            ${job.description}
          </div>
          <div class="sidejob-cost">
            <img src="img/icons/clock.png" alt="⏱" class="stat-icon"> ${
              job.time
            }ч <img src="img/icons/energy.png" alt="⚡" class="stat-icon"> -${
          job.energy
        } энергии <img src="img/icons/food.png" alt="🍔" class="stat-icon"> -${
          job.satiety
        } сытость
            ${
              job.health > 0
                ? ` <img src="img/icons/heart.png" alt="❤️" class="stat-icon"> -${job.health} здоровье`
                : ""
            }
          </div>
          <button class="window-action sidejob-btn" data-job="${key}">
            Устроиться
          </button>
        </div>
      `
      )
      .join("")

    sidejobBody.innerHTML = `
      <div class="message">
        <strong>Подработка</strong><br>
        Заработайте деньги, пока прокачиваете навыки
      </div>
      <div class="sidejob-list">${jobsHtml}</div>
    `

    sidejobBody.querySelectorAll(".sidejob-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const jobKey = e.target.dataset.job
        this.doSideJob(jobKey)
      })
    })
  }

  doSideJob(jobKey) {
    const state = this.gameState.getState()
    const job = SIDE_JOBS[jobKey]

    if (state.energy < job.energy) {
      this.ui.showToast("⚡ Недостаточно энергии!")
      return
    }

    if (state.satiety < job.satiety) {
      this.ui.showToast("🍔 Недостаточно сытости! Поешьте сначала.")
      return
    }

    state.energy -= job.energy
    state.satiety = Math.max(0, state.satiety - job.satiety)
    state.health = Math.max(0, state.health - job.health)

    const earned =
      Math.floor(Math.random() * (job.maxPay - job.minPay + 1)) + job.minPay
    state.money += earned

    this.gameState.updateState(state)
    this.timeManager.addTime(job.time)
    this.ui.closeWindow("sidejob")
    this.ui.showToast(
      `💰 Заработано: ${earned.toLocaleString()}₽ на подработке`
    )
  }
}
