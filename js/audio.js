/**
 * Audio manager — wraps the Web Audio API.
 * Ambient music file is optional; heartbeat is synthesized.
 */
export function createAudio() {
  let ctx = null;
  let ambientSource = null;
  let ambientGain = null;
  let started = false;

  function ensureContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  async function startAmbient() {
    ensureContext();
    if (ambientSource) return;

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.connect(ctx.destination);

    // Try loading ambient.mp3 if provided; otherwise generate a simple drone
    try {
      const resp = await fetch('audio/ambient.mp3');
      if (resp.ok) {
        const arrayBuffer = await resp.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const src = ctx.createBufferSource();
        src.buffer = audioBuffer;
        src.loop = true;
        src.connect(ambientGain);
        src.start();
        ambientSource = src;
      } else {
        throw new Error('no file');
      }
    } catch {
      // Synthesize a soft drone
      _synthDrone();
    }

    // Fade in
    ambientGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3);
    started = true;
  }

  function _synthDrone() {
    ensureContext();
    [55, 82.4, 110].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo  = ctx.createOscillator();
      const lfoG = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      lfo.type = 'sine';
      lfo.frequency.value = 0.1 + i * 0.03;
      lfoG.gain.value = 2;

      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);
      gain.gain.value = 0.04 / (i + 1);
      osc.connect(gain);
      gain.connect(ambientGain);
      lfo.start();
      osc.start();
    });
  }

  function heartbeat() {
    ensureContext();
    // BUM sound via short sine burst
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
    if (!ambientGain || !ctx) return;
    ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  }

  return { startAmbient, heartbeat, heartbeatDouble, fadeOutAmbient };
}
