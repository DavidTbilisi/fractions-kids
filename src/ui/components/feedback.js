// Immediate correct/incorrect feedback: a cheerful banner plus a sound cue.
// Correct plays a little rising arpeggio; wrong plays a soft low note. All audio
// is guarded so it never breaks the game (private mode, no WebAudio, etc.).
import { el } from '../dom.js'
import { t, tList } from '../../i18n/index.js'

let audioCtx = null

function tone(ctx, freq, start, dur, gainPeak = 0.14) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.start(start)
  osc.stop(start + dur)
}

function sound(correct) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    audioCtx = audioCtx || new Ctx()
    const t = audioCtx.currentTime
    if (correct) {
      // Bright rising arpeggio (C–E–G–C).
      ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(audioCtx, f, t + i * 0.07, 0.18))
    } else {
      tone(audioCtx, 196, t, 0.28, 0.1)
    }
  } catch {
    // ignore — audio is a nice-to-have
  }
}

// A tiny deterministic-ish picker so the message isn't always the same. The
// cheer/try wordings are pulled fresh from i18n each call so they follow the
// active language.
let cheerI = 0
let tryI = 0

// Returns a banner element. `answerText` is shown when the answer was wrong.
export function renderFeedback(correct, answerText, { sound: playSound = true } = {}) {
  if (playSound) sound(correct)
  if (correct) {
    const cheers = tList('feedback.cheers')
    const msg = `🎉 ${cheers[cheerI++ % cheers.length]}`
    return el('div', { class: 'feedback good' }, el('span', {}, msg))
  }
  const tries = tList('feedback.tries')
  const lead = tries[tryI++ % tries.length]
  return el(
    'div',
    { class: 'feedback bad' },
    el('span', {}, t('feedback.wrongLead', { lead }), el('strong', {}, answerText)),
  )
}
