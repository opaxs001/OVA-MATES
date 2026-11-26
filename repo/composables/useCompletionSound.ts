import { onBeforeUnmount } from 'vue'

export type SoundCue = 'complete' | 'evaluation' | 'achievement' | 'world'

export function useCompletionSound() {
  let context: AudioContext | null = null

  function ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    const AudioContextConstructor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextConstructor) return null

    try {
      context ??= new AudioContextConstructor()
      if (context.state === 'suspended') void context.resume()
      return context
    } catch {
      return null
    }
  }

  function playNotes(
    notes: Array<{ freq: number; delay: number; duration: number; peak: number; type?: OscillatorType }>,
    totalDuration = 0.85
  ) {
    const ctx = ensureContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const master = ctx.createGain()
      master.gain.setValueAtTime(0.0001, now)
      master.gain.exponentialRampToValueAtTime(0.11, now + 0.03)
      master.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration)
      master.connect(ctx.destination)

      notes.forEach((note) => {
        const oscillator = ctx.createOscillator()
        const voice = ctx.createGain()
        const start = now + note.delay
        const end = start + note.duration

        oscillator.type = note.type ?? 'sine'
        oscillator.frequency.setValueAtTime(note.freq, start)

        voice.gain.setValueAtTime(0.0001, start)
        voice.gain.exponentialRampToValueAtTime(note.peak, start + 0.025)
        voice.gain.exponentialRampToValueAtTime(0.0001, end)

        oscillator.connect(voice)
        voice.connect(master)

        oscillator.start(start)
        oscillator.stop(end + 0.02)
      })
    } catch {
      // El sonido es complementario y nunca interrumpe la experiencia.
    }
  }

  function playCompletionSound() {
    playNotes(
      [
        { freq: 659.25, delay: 0, duration: 0.42, peak: 0.42, type: 'sine' },
        { freq: 783.99, delay: 0.12, duration: 0.42, peak: 0.42, type: 'sine' },
        { freq: 987.77, delay: 0.24, duration: 0.44, peak: 0.45, type: 'sine' }
      ],
      0.85
    )
  }

  function playEvaluationSound() {
    playNotes(
      [
        { freq: 523.25, delay: 0, duration: 0.32, peak: 0.35, type: 'sine' },
        { freq: 659.25, delay: 0.1, duration: 0.34, peak: 0.36, type: 'sine' },
        { freq: 783.99, delay: 0.2, duration: 0.38, peak: 0.38, type: 'sine' },
        { freq: 1046.5, delay: 0.31, duration: 0.48, peak: 0.42, type: 'triangle' }
      ],
      0.95
    )
  }

  function playAchievementSound() {
    playNotes(
      [
        { freq: 587.33, delay: 0, duration: 0.28, peak: 0.34, type: 'triangle' },
        { freq: 783.99, delay: 0.11, duration: 0.3, peak: 0.36, type: 'triangle' },
        { freq: 987.77, delay: 0.22, duration: 0.34, peak: 0.38, type: 'sine' },
        { freq: 1174.66, delay: 0.34, duration: 0.52, peak: 0.44, type: 'sine' }
      ],
      1.05
    )
  }

  function playWorldChangeSound() {
    playNotes(
      [
        { freq: 440, delay: 0, duration: 0.26, peak: 0.28, type: 'sine' },
        { freq: 554.37, delay: 0.09, duration: 0.32, peak: 0.3, type: 'sine' }
      ],
      0.55
    )
  }

  function playSoundCue(cue: SoundCue) {
    if (cue === 'complete') playCompletionSound()
    else if (cue === 'evaluation') playEvaluationSound()
    else if (cue === 'achievement') playAchievementSound()
    else if (cue === 'world') playWorldChangeSound()
  }

  onBeforeUnmount(() => {
    if (context && context.state !== 'closed') void context.close()
    context = null
  })

  return {
    playCompletionSound,
    playEvaluationSound,
    playAchievementSound,
    playWorldChangeSound,
    playSoundCue
  }
}
