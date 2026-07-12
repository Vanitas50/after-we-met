import * as THREE from 'three';

export const PHASE = {
  IDLE:       0,
  PARTICLES:  1,
  HEART_FORM: 2,
  HEART_LIVE: 3,
  HINT:       4,
  MEMORIES:   5,
  FINALE:     6,
};

export function createStoryboard({ camera, heart, particles, audio, memories, onFinale }) {
  let phase    = PHASE.IDLE;
  let phaseTime = 0;

  const p1 = _makeParticle(0xf2c9a8);
  const p2 = _makeParticle(0xf2c9a8);
  p1.visible = false;
  p2.visible = false;

  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  const camTarget = new THREE.Vector3(0, 0, 10);

  let currentMemoryIndex = -1;

  const hint       = document.createElement('div');
  hint.id          = 'hint';
  hint.textContent = '✦  touch the heart  ✦';
  document.body.appendChild(hint);

  const memoryLabel = document.getElementById('memory-label');
  const weiterBtn   = document.getElementById('weiter-btn');

  function _makeParticle(color) {
    const geo  = new THREE.SphereGeometry(0.09, 12, 12);
    const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
    const glow = new THREE.PointLight(color, 5, 6);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(glow);
    return mesh;
  }

  let started = false;

  function start(scene) {
    if (started) return;
    started = true;

    scene.add(p1);
    scene.add(p2);
    p1.position.set(-5, 0.3, 0);
    p2.position.set(5, -0.3, 0);
    p1.visible = true;
    p2.visible = true;

    audio.startAmbient();
    phase     = PHASE.PARTICLES;
    phaseTime = 0;
  }

  function _nextMemory() {
    currentMemoryIndex++;

    if (currentMemoryIndex >= memories.count) {
      _toFinale();
      return;
    }

    memories.showMemory(currentMemoryIndex);

    // Camera: same direction as memory but twice the distance so we look at it
    const pos = memories.getPosition(currentMemoryIndex);
    camTarget.set(pos.x * 2, 2.5, pos.z * 2);

    if (memoryLabel) {
      const label = memories.getLabel(currentMemoryIndex);
      memoryLabel.innerHTML =
        `<span class="mem-count">${currentMemoryIndex + 1} / ${memories.count}</span>${label}`;
      memoryLabel.classList.add('visible');
    }

    if (weiterBtn) {
      const isLast = currentMemoryIndex === memories.count - 1;
      weiterBtn.textContent = isLast ? 'Finale ✦' : 'Weiter →';
      weiterBtn.classList.add('visible');
    }
  }

  function _toFinale() {
    phase     = PHASE.FINALE;
    phaseTime = 0;
    heart.close();
    memories.hideAll();
    audio.fadeOutAmbient(3);
    camTarget.set(0, 0, 9);

    if (weiterBtn)   weiterBtn.classList.remove('visible');
    if (memoryLabel) memoryLabel.classList.remove('visible');

    setTimeout(() => {
      const titleScreen = document.getElementById('title-screen');
      if (titleScreen) titleScreen.classList.add('visible');
      if (onFinale) onFinale();
    }, 4000);
  }

  function handleHeartClick() {
    if (phase !== PHASE.HINT) return;

    heart.showHint(false);
    hint.classList.remove('visible');
    heart.open();
    audio.heartbeatDouble();

    phase     = PHASE.MEMORIES;
    phaseTime = 0;
    camTarget.set(0, 1, 9);

    setTimeout(() => _nextMemory(), 1200);
  }

  function handleWeiterClick() {
    if (phase !== PHASE.MEMORIES) return;

    if (memoryLabel) memoryLabel.classList.remove('visible');
    if (weiterBtn)   weiterBtn.classList.remove('visible');

    setTimeout(() => _nextMemory(), 700);
  }

  function update(delta, scene) {
    phaseTime += delta;

    camera.position.lerp(camTarget, 0.025);
    camera.lookAt(0, 0, 0);

    switch (phase) {

      case PHASE.IDLE:
        break;

      case PHASE.PARTICLES: {
        // One clean, smooth sweep — no bouncing or misses
        const t    = Math.min(phaseTime / 1.8, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        p1.position.set(-5 * (1 - ease),  0.3 * (1 - ease), 0);
        p2.position.set( 5 * (1 - ease), -0.3 * (1 - ease), 0);

        if (t >= 1) {
          p1.visible = false;
          p2.visible = false;
          audio.heartbeatDouble(250);
          phase     = PHASE.HEART_FORM;
          phaseTime = 0;
        }
        break;
      }

      case PHASE.HEART_FORM: {
        if (phaseTime < 0.05) {
          heart.group.visible = true;
          heart.group.scale.setScalar(0.01);
        }
        const s = Math.min(phaseTime / 2, 1);
        heart.group.scale.setScalar(1 - Math.pow(1 - s, 3));

        // Throttled particle burst (every 0.5 s)
        if (phaseTime % 0.5 < delta) particles.triggerHeartbeat();

        if (phaseTime > 2.2) {
          phase     = PHASE.HEART_LIVE;
          phaseTime = 0;
          heart.triggerHeartbeat();
          camTarget.set(0, 0.5, 8);
        }
        break;
      }

      case PHASE.HEART_LIVE:
        if (Math.floor(phaseTime) % 2 === 0 && phaseTime % 1 < delta * 2) {
          heart.triggerHeartbeat();
          particles.triggerHeartbeat();
        }
        if (phaseTime > 1.8) {
          phase     = PHASE.HINT;
          phaseTime = 0;
          heart.showHint(true);
          hint.classList.add('visible');
        }
        break;

      case PHASE.HINT:
        if (Math.floor(phaseTime) % 2 === 0 && phaseTime % 1 < delta * 2) {
          heart.triggerHeartbeat();
          particles.triggerHeartbeat();
        }
        break;

      case PHASE.MEMORIES:
        if (Math.floor(phaseTime * 0.5) % 3 === 0 && phaseTime % 2 < delta * 2) {
          heart.triggerHeartbeat();
        }
        break;

      case PHASE.FINALE:
        break;
    }
  }

  return { start, update, handleHeartClick, handleWeiterClick, introParticles: [p1, p2] };
}
