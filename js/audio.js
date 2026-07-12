/**
 * Audio manager — synthesized ambient drone + heartbeat.
 */
export function createAudio() {
  let ctx = null;
  let ambientGain = null;

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // iOS / some browsers start context suspended — resume on user gesture
    if (ctx.state === 'suspended') ctx.resume();
  }

  async function startAmbient() {
    ensureContext();
    if (ambientGain) return; // already started

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.connect(ctx.destination);

    _synthDrone();

    // Gentle fade-in over 4 seconds
    ambientGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 4);
  }

  function _synthDrone() {
    ensureContext();
    // A-major triad at audible frequencies — A3 / E4 / A4
    // (55 Hz is pure sub-bass, inaudible on phone speakers)
    [220, 329.6, 440].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo  = ctx.createOscillator();
      const lfoG = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slow vibrato
      lfo.type = 'sine';
      lfo.frequency.value = 0.08 + i * 0.04;
      lfoG.gain.value = 1.5;

      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);

      // Upper partials are quieter
      gain.gain.value = 0.22 / (i + 1);
      osc.connect(gain);
      gain.connect(ambientGain);
      lfo.start();
      osc.start();
    });
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
    if (!ambientGain || !ctx) return;
    ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  }

  return { startAmbient, heartbeat, heartbeatDouble, fadeOutAmbient };
}
