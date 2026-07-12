/**
 * Audio manager — real MP3 ambient track + synthesized heartbeat sounds.
 */
export function createAudio() {
  let ctx          = null;
  let masterGain   = null;
  let ambientSrc   = null;
  let started      = false;

  function ensureContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }

  async function startAmbient() {
    ensureContext();
    if (started) return;
    started = true;

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);

    try {
      const res    = await fetch('audio/ambient.mp3');
      const raw    = await res.arrayBuffer();
      const buffer = await ctx.decodeAudioData(raw);

      ambientSrc        = ctx.createBufferSource();
      ambientSrc.buffer = buffer;
      ambientSrc.loop   = true;
      ambientSrc.connect(masterGain);
      ambientSrc.start(0);

      // Gentle fade-in over 4 seconds
      masterGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 4);
    } catch (e) {
      console.warn('Audio load failed:', e);
    }
  }

  function heartbeat() {
    ensureContext();
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
    if (!masterGain || !ctx) return;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  }

  return { startAmbient, heartbeat, heartbeatDouble, fadeOutAmbient };
}
