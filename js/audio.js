/**
 * Audio manager — lo-fi Blue Bird melody + heartbeat sounds.
 * Entirely synthesized via Web Audio API; no external files required.
 */
export function createAudio() {
  let ctx            = null;
  let masterGain     = null;
  let melodyChain    = null;
  let scheduleTimer  = null;
  let nextNoteTime   = 0;
  let noteIndex      = 0;
  let running        = false;
  let crackleRunning = false;

  // ── Blue Bird (Naruto Shippuden OP5) — A major, lo-fi, ~74 BPM ──────────────
  // Frequencies (Hz): A3=220 B3=246.9 C#4=277.2 D4=293.7 E4=329.6 F#4=370
  //                   A4=440 B4=493.9 C#5=554.4 D5=587.3 E5=659.3 F#5=740
  const BPM  = 74;
  const BEAT = 60 / BPM; // seconds per quarter note ≈ 0.811 s
  // [freq|null, quarterBeats]   null = rest
  const MELODY = [
    // Bars 1-2 — opening descend then ascend
    [659.3, 0.5], [587.3, 0.5], [554.4, 0.5], [493.9, 0.5],
    [440.0, 0.5], [493.9, 0.5], [554.4, 0.5], [587.3, 0.5],
    // Bars 3-4 — hold high, land on A
    [659.3, 0.5], [659.3, 0.5], [587.3, 0.5], [554.4, 0.5],
    [493.9, 1.0], [null,  0.5], [440.0, 0.5],
    // Bars 5-6 — chorus upswing to F#5, settle
    [554.4, 0.5], [659.3, 0.5], [740.0, 0.5], [659.3, 0.5],
    [554.4, 0.5], [493.9, 0.5], [440.0, 1.0],
    // Bars 7-8 — walking phrase, resolve
    [493.9, 0.5], [554.4, 0.5], [659.3, 0.5], [587.3, 0.5],
    [554.4, 0.5], [493.9, 0.5], [440.0, 1.0], [null,  1.0],
  ];

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function ensureContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }

  // ── Public: start ─────────────────────────────────────────────────────────────

  async function startAmbient() {
    ensureContext();
    if (masterGain) return;

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.connect(ctx.destination);

    melodyChain = _buildLoFiChain();
    _startBassLayer();
    _startVinylCrackle();
    _startMelodyScheduler();

    masterGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 6);
  }

  // ── Lo-fi signal chain ────────────────────────────────────────────────────────

  function _buildLoFiChain() {
    // Warm cassette-tape lowpass
    const lopass = ctx.createBiquadFilter();
    lopass.type = 'lowpass';
    lopass.frequency.value = 3200;
    lopass.Q.value = 0.75;

    // Slow wobble on filter cutoff (tape speed variation)
    const wobble = ctx.createOscillator();
    const wobbleG = ctx.createGain();
    wobble.frequency.value = 0.22;
    wobbleG.gain.value = 260;
    wobble.connect(wobbleG);
    wobbleG.connect(lopass.frequency);
    wobble.start();

    // Gentle tape saturation
    const shaper = ctx.createWaveShaper();
    const n = 256;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = (Math.PI + 14) * x / (Math.PI + 14 * Math.abs(x));
    }
    shaper.curve = curve;
    shaper.oversample = '2x';

    // Two-tap reverb delay for room ambience
    const d1 = ctx.createDelay(0.5);
    const d2 = ctx.createDelay(0.5);
    d1.delayTime.value = 0.228;
    d2.delayTime.value = 0.152;
    const fb1 = ctx.createGain(); fb1.gain.value = 0.20;
    const fb2 = ctx.createGain(); fb2.gain.value = 0.16;
    const dMix = ctx.createGain(); dMix.gain.value = 0.26;
    d1.connect(fb1); fb1.connect(d2);
    d2.connect(fb2); fb2.connect(d1);
    d1.connect(dMix); d2.connect(dMix);

    // piano → lopass → shaper → masterGain
    //                  shaper → d1 → dMix → masterGain
    lopass.connect(shaper);
    shaper.connect(masterGain);
    shaper.connect(d1);
    dMix.connect(masterGain);

    return lopass;
  }

  // ── Soft A-major bass layer ───────────────────────────────────────────────────

  function _startBassLayer() {
    [110, 164.8, 220].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      lfo.type = 'sine'; lfo.frequency.value = 0.07 + i * 0.03;
      lfoG.gain.value = 0.7;
      lfo.connect(lfoG); lfoG.connect(osc.frequency);
      g.gain.value = 0.055 / (i + 1);
      osc.connect(g); g.connect(masterGain);
      lfo.start(); osc.start();
    });
  }

  // ── Vinyl crackle ─────────────────────────────────────────────────────────────

  function _startVinylCrackle() {
    const bufLen = Math.floor(ctx.sampleRate * 0.7);
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.60 : 0;
    }

    crackleRunning = true;
    function tick() {
      if (!crackleRunning || !masterGain) return;
      const src = ctx.createBufferSource();
      const g   = ctx.createGain();
      src.buffer = buf;
      g.gain.value = 0.04;
      src.connect(g); g.connect(masterGain);
      src.start();
      setTimeout(tick, (0.35 + Math.random() * 0.9) * 1000);
    }
    tick();
  }

  // ── Melody scheduler (Web Audio lookahead pattern) ────────────────────────────

  function _scheduleNote(freq, durBeats, when) {
    const dur  = durBeats * BEAT;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gN   = ctx.createGain();

    osc1.type = 'triangle'; osc1.frequency.value = freq;
    osc2.type = 'sine';     osc2.frequency.value = freq * 1.0022;

    const atk = 0.012;
    gN.gain.setValueAtTime(0, when);
    gN.gain.linearRampToValueAtTime(0.28, when + atk);
    gN.gain.exponentialRampToValueAtTime(0.07, when + atk + dur * 0.45);
    gN.gain.setValueAtTime(0.07, when + dur * 0.72);
    gN.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.04);

    osc1.connect(gN); osc2.connect(gN);
    gN.connect(melodyChain);

    const end = when + dur + 0.06;
    osc1.start(when); osc1.stop(end);
    osc2.start(when); osc2.stop(end);
  }

  function _startMelodyScheduler() {
    running = true;
    nextNoteTime = ctx.currentTime + 0.9;
    noteIndex = 0;

    function tick() {
      if (!running) return;
      while (nextNoteTime < ctx.currentTime + 0.12) {
        const [freq, beats] = MELODY[noteIndex % MELODY.length];
        if (freq !== null) _scheduleNote(freq, beats, nextNoteTime);
        nextNoteTime += beats * BEAT;
        noteIndex++;
      }
      scheduleTimer = setTimeout(tick, 25);
    }
    tick();
  }

  // ── Heartbeat sounds (used by storyboard) ────────────────────────────────────

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
    running = false;
    crackleRunning = false;
    if (scheduleTimer) clearTimeout(scheduleTimer);
  }

  return { startAmbient, heartbeat, heartbeatDouble, fadeOutAmbient };
}
