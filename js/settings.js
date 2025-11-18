export class SettingsManager {
  constructor(gameState, ui, audioManager) {
    this.gameState = gameState
    this.ui = ui
    this.audioManager = audioManager
  }

  render() {
    const settingsBody = document.getElementById("settings-body")

    settingsBody.innerHTML = `
      <div class="message">
        <strong>Настройки игры</strong>
      </div>

      <div class="settings-section">
        <h3 style="font-size: 0.75rem; margin: 0 0 1rem 0; color: var(--accent);">Звук</h3>
        
        <div class="settings-item">
          <div class="settings-item-header">
            <span>🔊 Звуковые эффекты</span>
            <button id="toggle-sound" class="window-action settings-toggle">
              ${this.audioManager.isMuted ? "Выключено" : "Включено"}
            </button>
          </div>
          <div class="settings-item-description">
            Звуки кликов, уведомлений и действий
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 style="font-size: 0.75rem; margin: 0 0 1rem 0; color: var(--accent);">Игра</h3>
        
        <div class="settings-item">
          <div class="settings-item-header">
            <span>🔄 Сбросить прогресс</span>
            <button id="reset-progress" class="window-action" style="background: var(--danger);">
              Сбросить
            </button>
          </div>
          <div class="settings-item-description">
            Удалить все сохранения и начать заново
          </div>
        </div>
      </div>
    `

    this.attachEventHandlers()
  }

  attachEventHandlers() {
    const toggleSoundBtn = document.getElementById("toggle-sound")
    const resetProgressBtn = document.getElementById("reset-progress")

    if (toggleSoundBtn) {
      toggleSoundBtn.addEventListener("click", () => {
        this.audioManager.initAudioContext()
        this.audioManager.toggleMute()
        this.audioManager.playSound("click")
        this.render()
      })
    }

    if (resetProgressBtn) {
      resetProgressBtn.addEventListener("click", () => {
        if (confirm("Вы уверены? Весь прогресс будет удален!")) {
          localStorage.clear()
          sessionStorage.clear()

          if ("caches" in window) {
            caches.keys().then((names) => {
              names.forEach((name) => {
                caches.delete(name)
              })
            })
          }

          const baseUrl = location.origin + location.pathname
          const timestamp = Date.now()
          location.replace(
            `${baseUrl}?reset=${timestamp}&nocache=${timestamp}#${timestamp}`
          )
        }
      })
    }
  }
}
