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

  // ── Circular glow texture (avoids square sprite hitbox) ──────────────────
  function _glowTex(r, g, b) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,    `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.45, `rgba(${r},${g},${b},0.35)`);
    grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  // ── Particle builders ────────────────────────────────────────────────────
  function _makeHimParticle() {
    const group = new THREE.Group();

    // Slightly visible dark sphere
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x1a1a3a }),
    );
    group.add(mesh);

    // Circular white glow sprite
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: _glowTex(238, 238, 255), transparent: true, opacity: 0.75 }),
    );
    sprite.scale.set(0.65, 0.65, 1);
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

    // Circular pink glow sprite
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: _glowTex(255, 136, 204), transparent: true, opacity: 0.72 }),
    );
    sprite.scale.set(0.56, 0.56, 1);
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
    // Start positions — match where ORBIT phase begins at angle=0 (radius 3.5)
    p1.position.set(-7, 1.2, 0);
    p2.position.set( 7, -1.2, 0);
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

      // Fly in from opposite sides, land at orbit start (angle=0 → x=±3.5, y=0, z=0)
      case PHASE.ENTER: {
        const t    = Math.min(phaseTime / 1.5, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        p1.position.set(-7 + 10.5 * ease, 0, 0);  // → (3.5, 0, 0)
        p2.position.set( 7 - 10.5 * ease, 0, 0);  // → (-3.5, 0, 0)

        if (t >= 1) { phase = PHASE.ORBIT; phaseTime = 0; }
        break;
      }

      // XY-plane orbit — camera at +Z sees a clear circle, not a line
      case PHASE.ORBIT: {
        const duration = 3.5;
        const t        = Math.min(phaseTime / duration, 1);
        const radius   = 3.5 - t * 2.85;          // 3.5 → 0.65
        const speed    = 1.8 + t * 5.0;            // accelerates as they close in
        const angle    = phaseTime * speed;

        // XY orbit: camera at (0,0,10) sees this as a proper circle
        p1.position.set(
           Math.cos(angle) * radius,
           Math.sin(angle) * radius * 0.8,
           Math.sin(angle * 0.6) * 0.35,           // subtle Z ripple for depth
        );
        p2.position.set(
          -Math.cos(angle) * radius,
          -Math.sin(angle) * radius * 0.8,
          -Math.sin(angle * 0.6) * 0.35,
        );

        if (t >= 1) {
          missP1.copy(p1.position);
          missP2.copy(p2.position);
          phase = PHASE.MISS; phaseTime = 0;
        }
        break;
      }

      // Rush through center at different Y heights — a near-miss
      // Continuous: at ease=0, positions equal missP1/missP2 exactly (no jump)
      case PHASE.MISS: {
        const t    = Math.min(phaseTime / 0.55, 1);
        const ease = t * t * (3 - 2 * t);
        p1.position.set(
          missP1.x * (1 - 2 * ease),          // rushes from missP1.x through 0 to the other side
          missP1.y + 0.5 * ease,               // rises — passes above p2
          missP1.z * (1 - 2 * ease),
        );
        p2.position.set(
          missP2.x * (1 - 2 * ease),
          missP2.y - 0.5 * ease,               // falls — passes below p1
          missP2.z * (1 - 2 * ease),
        );

        if (t >= 1) {
          missP1.copy(p1.position);
          missP2.copy(p2.position);
          phase = PHASE.RECOVER; phaseTime = 0;
        }
        break;
      }

      // Slow drift — moment of hesitation before they turn back
      case PHASE.RECOVER: {
        const t    = Math.min(phaseTime / 0.8, 1);
        const ease = t * t * (3 - 2 * t);
        // Drift slightly further apart from miss-end positions
        p1.position.set(
          missP1.x + (missP1.x > 0 ? 0.3 : -0.3) * ease,
          missP1.y * (1 - ease * 0.3),
          missP1.z,
        );
        p2.position.set(
          missP2.x + (missP2.x > 0 ? 0.3 : -0.3) * ease,
          missP2.y * (1 - ease * 0.3),
          missP2.z,
        );

        if (t >= 1) {
          missP1.copy(p1.position);
          missP2.copy(p2.position);
          phase = PHASE.MEET; phaseTime = 0;
        }
        break;
      }

      // They come back — direct smoothstep to center, fully reaches (0,0,0)
      case PHASE.MEET: {
        const t    = Math.min(phaseTime / 1.2, 1);
        const ease = t * t * (3 - 2 * t);
        p1.position.set(
          missP1.x * (1 - ease),
          missP1.y * (1 - ease),
          missP1.z * (1 - ease),
        );
        p2.position.set(
          missP2.x * (1 - ease),
          missP2.y * (1 - ease),
          missP2.z * (1 - ease),
        );

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
