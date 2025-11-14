const initialState = {
  day: 1,
  time: 9,
  money: 5000,
  energy: 100,
  maxEnergy: 100,
  health: 100,
  satiety: 100,
}

class GameState {
  constructor() {
    this.state = { ...initialState }
  }

  getState() {
    return this.state
  }

  updateState(newState) {
    this.state = { ...this.state, ...newState }
    this.updateUI()
  }

  updateUI() {
    document.getElementById("stat-day").textContent = this.state.day
    document.getElementById("stat-time").textContent = this.formatTime(
      this.state.time
    )
    document.getElementById("stat-energy").textContent = `${this.state.energy}%`
    document.getElementById(
      "stat-money"
    ).textContent = `${this.state.money.toLocaleString()} ₽`
  }

  formatTime(time) {
    const hours = Math.floor(time)
    const minutes = Math.floor((time - hours) * 60)
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`
  }

  addTime(hours) {
    let newTime = this.state.time + hours
    let newDay = this.state.day

    if (newTime >= 24) {
      newDay += Math.floor(newTime / 24)
      newTime = newTime % 24
    }

    this.updateState({ time: newTime, day: newDay })
  }
}

export default GameState
