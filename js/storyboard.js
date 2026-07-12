import * as THREE from 'three';

export const PHASE = {
  IDLE:       0,
  ENTER:      1,
  ORBIT:      2,
  MISS:       3,
  RECOVER:    4,
  MEET:       5,
  HEART_FORM: 6,
  HEART_LIVE: 7,
  HINT:       8,
  MEMORIES:   9,
  FINALE:     10,
};

export function createStoryboard({ camera, heart, particles, audio, memories, onFinale }) {
  let phase     = PHASE.IDLE;
  let phaseTime = 0;

  const p1 = _makeHimParticle();
  const p2 = _makeHerParticle();
  p1.visible = false;
  p2.visible = false;

  const missP1 = new THREE.Vector3();
  const missP2 = new THREE.Vector3();

  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  const camTarget = new THREE.Vector3(0, 0, 10);

  // Camera yield: when true, storyboard skips lerp (user is orbiting)
  let cameraYield = false;

  let currentMemoryIndex = -1;

  const hint = document.createElement('div');
  hint.id = 'hint';
  hint.textContent = '✦  touch the heart  ✦';
  document.body.appendChild(hint);

  const memoryLabel = document.getElementById('memory-label');
  const weiterBtn   = document.getElementById('weiter-btn');

  // ── Particle builders ────────────────────────────────────────────────────
  function _makeHimParticle() {
    const group = new THREE.Group();

    // Slightly visible dark sphere
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x1a1a3a }),
    );
    group.add(mesh);

    // White glow sprite — always faces camera, no angle issues
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }),
    );
    sprite.scale.set(0.58, 0.58, 1);
    group.add(sprite);

    const glow = new THREE.PointLight(0xeeeeff, 9, 6);
    group.add(glow);

    return group;
  }

  function _makeHerParticle() {
    const group = new THREE.Group();

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.10, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff6699 }),
    );
    group.add(mesh);

    // Pink glow sprite
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xff88cc, transparent: true, opacity: 0.55 }),
    );
    sprite.scale.set(0.50, 0.50, 1);
    group.add(sprite);

    const glow = new THREE.PointLight(0xff99cc, 10, 6);
    group.add(glow);

    return group;
  }

  let started = false;

  function start(scene) {
    if (started) return;
    started = true;

    scene.add(p1);
    scene.add(p2);
    p1.position.set(-6, 0, 0);
    p2.position.set( 6, 0, 0);
    p1.visible = true;
    p2.visible = true;

    audio.startAmbient();
    phase     = PHASE.ENTER;
    phaseTime = 0;
  }

  function _nextMemory() {
    currentMemoryIndex++;

    if (currentMemoryIndex >= memories.count) {
      _toFinale();
      return;
    }

    memories.showMemory(currentMemoryIndex);

    const pos = memories.getPosition(currentMemoryIndex);
    camTarget.set(pos.x * 2.2, 2.0, pos.z * 2.2);
    cameraYield = false; // take camera back for the lerp to new position

    if (memoryLabel) {
      const name    = memories.getLabel(currentMemoryIndex);
      const caption = memories.getCaption(currentMemoryIndex);
      memoryLabel.innerHTML =
        `<span class="mem-count">${currentMemoryIndex + 1}  /  ${memories.count}</span>` +
        (name    ? `<span class="mem-name">${name}</span>`       : '') +
        (caption ? `<span class="mem-caption">${caption}</span>` : '');
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
    cameraYield = false;

    if (memoryLabel) memoryLabel.classList.remove('visible');
    if (weiterBtn)   weiterBtn.classList.remove('visible');

    setTimeout(() => {
      document.getElementById('title-screen')?.classList.add('visible');
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

    setTimeout(() => _nextMemory(), 1200);
  }

  function handleWeiterClick() {
    if (phase !== PHASE.MEMORIES) return;

    memories.hideCurrent();
    if (memoryLabel) memoryLabel.classList.remove('visible');
    if (weiterBtn)   weiterBtn.classList.remove('visible');

    setTimeout(() => _nextMemory(), 700);
  }

  function yieldCamera(v) {
    // Only allow yield during MEMORIES phase
    if (phase >= PHASE.MEMORIES) cameraYield = v;
  }

  function update(delta, _scene) {
    phaseTime += delta;

    if (!cameraYield) {
      const lerpSpeed = phase >= PHASE.MEMORIES ? 0.06 : 0.025;
      camera.position.lerp(camTarget, lerpSpeed);
      camera.lookAt(0, 0, 0);
    }

    switch (phase) {

      case PHASE.IDLE:
        break;

      // Particles fly in from opposite sides
      case PHASE.ENTER: {
        const t    = Math.min(phaseTime / 1.2, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        p1.position.set(-6 + 6 * ease, 0.25, 0);
        p2.position.set( 6 - 6 * ease, -0.25, 0);

        if (t >= 1) { phase = PHASE.ORBIT; phaseTime = 0; }
        break;
      }

      // Spiral toward each other
      case PHASE.ORBIT: {
        const duration = 2.8;
        const t        = Math.min(phaseTime / duration, 1);
        const radius   = 3 - t * 2.4;
        const speed    = 1.5 + t * 3;
        const angle    = phaseTime * speed;
        p1.position.set( Math.cos(angle) * radius,  0.25 * (1 - t),  Math.sin(angle) * radius * 0.4);
        p2.position.set(-Math.cos(angle) * radius, -0.25 * (1 - t), -Math.sin(angle) * radius * 0.4);

        if (t >= 1) {
          missP1.copy(p1.position);
          missP2.copy(p2.position);
          phase = PHASE.MISS; phaseTime = 0;
        }
        break;
      }

      // Near miss — rush past each other at different Y heights
      case PHASE.MISS: {
        const t    = Math.min(phaseTime / 0.45, 1);
        const ease = t * t * (3 - 2 * t);
        p1.position.set(
          missP1.x * (1 - ease) - missP2.x * ease,
          0.4 * (1 - 2 * ease),
          missP1.z * (1 - ease) - missP2.z * ease,
        );
        p2.position.set(
          -missP1.x * (1 - ease) + missP2.x * ease,
          -0.4 * (1 - 2 * ease),
          -missP1.z * (1 - ease) + missP2.z * ease,
        );

        if (t >= 1) {
          missP1.copy(p1.position);
          missP2.copy(p2.position);
          phase = PHASE.RECOVER; phaseTime = 0;
        }
        break;
      }

      // Brief pause — they slow down
      case PHASE.RECOVER: {
        const t = Math.min(phaseTime / 0.55, 1);
        p1.position.lerp(new THREE.Vector3(-0.7,  0.25, 0), t * 0.08);
        p2.position.lerp(new THREE.Vector3( 0.7, -0.25, 0), t * 0.08);

        if (t >= 1) {
          missP1.copy(p1.position);
          missP2.copy(p2.position);
          phase = PHASE.MEET; phaseTime = 0;
        }
        break;
      }

      // They find each other and meet at the center
      case PHASE.MEET: {
        const t    = Math.min(phaseTime / 1.0, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        p1.position.lerp(new THREE.Vector3(0, 0, 0), ease * 0.12);
        p2.position.lerp(new THREE.Vector3(0, 0, 0), ease * 0.12);

        if (t >= 1) {
          p1.visible = false;
          p2.visible = false;
          audio.heartbeatDouble(250);
          phase = PHASE.HEART_FORM; phaseTime = 0;
        }
        break;
      }

      case PHASE.HEART_FORM: {
        if (phaseTime < 0.05) {
          heart.group.visible = true;
          heart.fadeIn(); // smooth opacity fade-in via appear uniform
        }

        if (phaseTime % 0.5 < delta) particles.triggerHeartbeat();

        if (phaseTime > 2.5) {
          phase = PHASE.HEART_LIVE; phaseTime = 0;
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
          phase = PHASE.HINT; phaseTime = 0;
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
        if (Math.floor(phaseTime * 0.4) % 3 === 0 && phaseTime % 2.5 < delta * 2) {
          heart.triggerHeartbeat();
        }
        break;

      case PHASE.FINALE:
        break;
    }
  }

  function isOrbiting() {
    return started && phase >= PHASE.MEMORIES;
  }

  return { start, update, handleHeartClick, handleWeiterClick, yieldCamera, introParticles: [p1, p2], isOrbiting };
}
