export class AudioManager {
  constructor() {
    this.sounds = {}
    this.music = null
    this.isMuted = false
    this.musicVolume = 0.3
    this.sfxVolume = 0.5
    this.audioContext = null
    this.isInitialized = false
    this.lastSoundTime = 0
    this.minSoundInterval = 30
    this.loadSettings()
  }

  initAudioContext() {
    if (this.isInitialized) return

    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)()
      this.isInitialized = true

      if (this.audioContext.state === "suspended") {
        this.audioContext.resume()
      }
    } catch (error) {
      console.warn("Web Audio API не поддерживается:", error)
    }
  }

  loadSettings() {
    const savedMuted = localStorage.getItem("audio-muted")
    const savedMusicVolume = localStorage.getItem("music-volume")
    const savedSfxVolume = localStorage.getItem("sfx-volume")

    if (savedMuted !== null) {
      this.isMuted = savedMuted === "true"
    }
    if (savedMusicVolume !== null) {
      this.musicVolume = parseFloat(savedMusicVolume)
    }
    if (savedSfxVolume !== null) {
      this.sfxVolume = parseFloat(savedSfxVolume)
    }
  }

  saveSettings() {
    localStorage.setItem("audio-muted", this.isMuted.toString())
    localStorage.setItem("music-volume", this.musicVolume.toString())
    localStorage.setItem("sfx-volume", this.sfxVolume.toString())
  }

  playSound(soundName) {
    if (this.isMuted) return

    if (!this.isInitialized) {
      this.initAudioContext()
    }

    if (!this.audioContext) return

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume()
    }

    if (soundName !== "textBlip" && soundName !== "uiClick") {
      const now = Date.now()
      if (now - this.lastSoundTime < this.minSoundInterval) {
        return
      }
      this.lastSoundTime = now
    }

    const soundGenerators = {
      click: () => this.generate8BitClick(),
      uiClick: () => this.generate8BitUIClick(),
      success: () => this.generate8BitSuccess(),
      notification: () => this.generate8BitNotification(),
      error: () => this.generate8BitError(),
      levelUp: () => this.generate8BitLevelUp(),
      textBlip: () => this.generateTextBlip(),
    }

    const generator = soundGenerators[soundName]
    if (generator) {
      generator()
    }
  }

  generate8BitClick() {
    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 800
    oscillator.type = "square"

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }

  generate8BitUIClick() {
    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 600
    oscillator.type = "square"

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.03)
  }

  generate8BitSuccess() {
    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "square"

    const notes = [523.25, 659.25, 783.99]
    const noteDuration = 0.1

    notes.forEach((freq, index) => {
      const time = ctx.currentTime + index * noteDuration
      oscillator.frequency.setValueAtTime(freq, time)
      gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, time)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        time + noteDuration * 0.8
      )
    })

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + notes.length * noteDuration)
  }

  generate8BitNotification() {
    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "square"
    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.05)

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }

  generate8BitError() {
    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "sawtooth"
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      100,
      ctx.currentTime + 0.2
    )

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  generate8BitLevelUp() {
    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "square"

    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
    const noteDuration = 0.08

    notes.forEach((freq, index) => {
      const time = ctx.currentTime + index * noteDuration
      oscillator.frequency.setValueAtTime(freq, time)
      gainNode.gain.setValueAtTime(this.sfxVolume * 0.25, time)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        time + noteDuration * 0.9
      )
    })

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + notes.length * noteDuration)
  }

  generateTextBlip() {
    if (!this.audioContext) return

    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    const baseFreq = 400
    const variation = Math.random() * 200 - 100
    oscillator.frequency.value = baseFreq + variation
    oscillator.type = "square"

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.03)
  }

  playMusic(musicName) {
    if (!this.isInitialized) {
      this.initAudioContext()
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume()
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.pause()
      this.music = null
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    this.saveSettings()

    if (this.isMuted) {
      this.stopMusic()
    }

    return this.isMuted
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()

    if (this.music) {
      this.music.volume = this.musicVolume
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }
}
