/**
 * Audio manager — MP3 via HTML Audio (mobile-safe) + synthesized heartbeat.
 */
export function createAudio() {
  let audioEl    = null;
  let started    = false;
  let fadeTimer  = null;

  // Web Audio context only needed for heartbeat sounds
  let ctx = null;
  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }

  async function startAmbient() {
    if (started) return;
    started = true;

    audioEl        = new Audio('audio/ambient.mp3');
    audioEl.loop   = true;
    audioEl.volume = 0;

    try {
      await audioEl.play(); // must be called directly inside user gesture chain
    } catch (e) {
      console.warn('Audio play failed:', e);
      return;
    }

    // Fade in over ~5 seconds
    let vol = 0;
    const TARGET = 0.55;
    fadeTimer = setInterval(() => {
      vol = Math.min(vol + 0.012, TARGET);
      audioEl.volume = vol;
      if (vol >= TARGET) { clearInterval(fadeTimer); fadeTimer = null; }
    }, 100);
  }

  function heartbeat() {
    ensureCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  function heartbeatDouble(delay = 0) {
    setTimeout(() => heartbeat(), delay);
    setTimeout(() => heartbeat(), delay + 400);
  }

  function fadeOutAmbient(duration = 3) {
    if (!audioEl) return;
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    const steps = duration * 10;
    const dec   = audioEl.volume / steps;
    fadeTimer = setInterval(() => {
      audioEl.volume = Math.max(0, audioEl.volume - dec);
      if (audioEl.volume <= 0) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        audioEl.pause();
      }
    }, 100);
  }

  return { startAmbient, heartbeat, heartbeatDouble, fadeOutAmbient };
}
