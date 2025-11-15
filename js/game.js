import GameState from "./state.js"
import { UIManager } from "./ui.js"
import { DialogSystem } from "./dialog.js"
import { AppsManager } from "./apps.js"
import { TutorialManager } from "./tutorial.js"

export class Game {
  constructor() {
    this.gameState = new GameState()
    this.ui = new UIManager()
    this.dialogSystem = new DialogSystem(this.ui)
    this.appsManager = new AppsManager(this.gameState)
    this.tutorialManager = new TutorialManager(this.gameState, this.ui)

    window.appManager = this.appsManager
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
      this.ui.switchScreen("dialog")
      this.dialogSystem.showNextDialog()
    })

    this.dialogSystem.setDesktopReadyCallback(() => this.startGame())
  }

  startGame() {
    this.ui.switchScreen("desktop")
    this.gameState.updateUI()

    const state = this.gameState.getState()

    if (!state.tutorialCompleted) {
      setTimeout(() => {
        this.tutorialManager.start()
      }, 700)
    }
  }
}
