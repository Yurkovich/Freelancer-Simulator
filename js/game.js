import GameState from "./state.js"
import { UIManager } from "./ui.js"
import { DialogSystem } from "./dialog.js"
import { AppsManager } from "./apps.js"
import { TutorialManager } from "./tutorial.js"
import { AudioManager } from "./audio.js"
import { LifecycleManager } from "./lifecycle.js"
import { EventManager } from "./event-manager.js"

export class Game {
  constructor() {
    this.gameState = new GameState()
    this.ui = new UIManager()
    this.audio = new AudioManager()
    this.dialogSystem = new DialogSystem(this.ui)
    this.appsManager = new AppsManager(this.gameState, this.audio)
    this.tutorialManager = new TutorialManager(this.gameState, this.ui)
    this.lifecycleManager = new LifecycleManager(this.gameState, this.ui)
    this.eventManager = new EventManager(this.gameState, this.ui)

    window.appManager = this.appsManager
    window.audio = this.audio
    window.game = this
  }

  init() {
    const state = this.gameState.getState()

    if (state.tutorialCompleted) {
      this.ui.switchScreen("desktop")
      this.startGame()
    } else {
      this.ui.switchScreen("menu")
      this.setupMenuScreen()
    }
  }

  setupMenuScreen() {
    const playButton = document.getElementById("play-button")
    playButton.addEventListener("click", () => {
      this.audio.initAudioContext()
      this.audio.playMusic("menu")
      this.audio.playSound("click")
      this.ui.switchScreen("dialog")
      this.dialogSystem.showNextDialog()
    })

    this.dialogSystem.setDesktopReadyCallback(() => this.startGame())
  }

  startGame() {
    this.audio.stopMusic()
    this.audio.playMusic("ambient")
    this.ui.switchScreen("desktop")
    this.gameState.updateUI()

    const state = this.gameState.getState()

    if (!state.tutorialCompleted) {
      setTimeout(() => {
        this.tutorialManager.start()
      }, 500)
    }
  }

  updateAllUI() {
    this.gameState.updateUI()
    if (this.appsManager) {
      this.appsManager.updateAllApps()
    }
  }
}
