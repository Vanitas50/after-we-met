/**
 * Cinematic storyboard controller.
 *
 * Phases:
 *   0  – BLACK         total darkness (2 s)
 *   1  – PARTICLE_1    first rose-gold particle appears (3 s)
 *   2  – PARTICLE_2    second particle appears (3 s)
 *   3  – MISS          particles almost meet, separate (4 s)
 *   4  – MEET          particles meet — silence — (2 s)
 *   5  – HEART_FORM    heart crystal forms (5 s)
 *   6  – HEART_LIVE    heart floats, ambient world fully visible (8 s)
 *   7  – HINT          subtle interaction hint on the heart
 *   8  – MEMORIES      user interacts: memories emerge one by one
 *   9  – FINALE        everything dissolves, title screen
 */

import * as THREE from 'three';

export const PHASE = {
  BLACK:       0,
  PARTICLE_1:  1,
  PARTICLE_2:  2,
  MISS:        3,
  MEET:        4,
  HEART_FORM:  5,
  HEART_LIVE:  6,
  HINT:        7,
  MEMORIES:    8,
  FINALE:      9,
};

export function createStoryboard({ camera, heart, particles, audio, memories, onFinale }) {
  let phase = PHASE.BLACK;
  let phaseTime = 0;

  // Two intro particles (simple spheres)
  const p1 = _makeParticle(0xf2c9a8);
  const p2 = _makeParticle(0xf2c9a8);
  p1.visible = false;
  p2.visible = false;

  const introParticles = [p1, p2];

  // Camera initial position
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  const camTarget = new THREE.Vector3(0, 0, 10);

  let currentMemoryIndex = -1;
  const memoryLabel = document.getElementById('memory-label');
  const hint = document.createElement('div');
  hint.id = 'hint';
  hint.textContent = '✦  touch the heart  ✦';
  document.body.appendChild(hint);

  function _makeParticle(color) {
    // Caller must add to scene
    const geo  = new THREE.SphereGeometry(0.06, 10, 10);
    const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const glow = new THREE.PointLight(color, 2, 3);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.add(glow);
    return mesh;
  }

  // Start: triggered on first user interaction (click anywhere)
  let started = false;

  function start(scene) {
    if (started) return;
    started = true;

    scene.add(p1);
    scene.add(p2);

    audio.startAmbient();
    phase = PHASE.PARTICLE_1;
    phaseTime = 0;
    p1.visible = true;
    p1.position.set(-6, 0, 0);
  }

  function _nextMemory() {
    currentMemoryIndex++;
    if (currentMemoryIndex >= memories.count) {
      // All memories shown → finale
      _toFinale();
      return;
    }

    const pos = memories.getPosition(currentMemoryIndex);
    memories.showMemory(currentMemoryIndex);

    // Camera pan to diorama
    camTarget.copy(pos).add(new THREE.Vector3(0, 1, 3));

    if (memoryLabel) {
      memoryLabel.textContent = memories.getLabel(currentMemoryIndex);
      memoryLabel.classList.add('visible');
      setTimeout(() => memoryLabel.classList.remove('visible'), 4000);
    }
  }

  function _toFinale() {
    phase = PHASE.FINALE;
    phaseTime = 0;
    heart.close();
    memories.hideAll();
    audio.fadeOutAmbient(3);
    // Camera back to center
    camTarget.set(0, 0, 8);

    setTimeout(() => {
      const titleScreen = document.getElementById('title-screen');
      if (titleScreen) titleScreen.classList.add('visible');
      if (onFinale) onFinale();
    }, 4000);
  }

  // Click handler on heart during HINT phase
  function handleHeartClick() {
    if (phase !== PHASE.HINT && phase !== PHASE.MEMORIES) return;
    if (phase === PHASE.HINT) {
      heart.showHint(false);
      hint.classList.remove('visible');
      heart.open();
      audio.heartbeatDouble();
      phase = PHASE.MEMORIES;
      phaseTime = 0;
      setTimeout(() => _nextMemory(), 2000);
    } else if (phase === PHASE.MEMORIES) {
      _nextMemory();
    }
  }

  function update(delta, scene) {
    phaseTime += delta;

    // Smooth camera
    camera.position.lerp(camTarget, 0.02);
    camera.lookAt(0, 0, 0);

    switch (phase) {
      case PHASE.BLACK:
        break;

      case PHASE.PARTICLE_1:
        p1.position.x = -6 + phaseTime * 2.5;
        if (phaseTime > 1.5) {
          phase = PHASE.PARTICLE_2;
          phaseTime = 0;
          p2.visible = true;
          p2.position.set(6, 0, 0);
        }
        break;

      case PHASE.PARTICLE_2:
        p1.position.x = -6 + (1.5 + phaseTime) * 2.5;
        p2.position.x = 6 - phaseTime * 2.5;
        if (phaseTime > 1.2) {
          phase = PHASE.MISS;
          phaseTime = 0;
        }
        break;

      case PHASE.MISS: {
        // Almost meet but miss
        const t = phaseTime / 1.5;
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        p1.position.x = -1.5 + ease * 2;
        p2.position.x = 1.5 - ease * 2;
        p1.position.y = Math.sin(phaseTime * 2) * 0.25;
        p2.position.y = -Math.sin(phaseTime * 2) * 0.25;
        if (phaseTime > 1.5) {
          phase = PHASE.MEET;
          phaseTime = 0;
        }
        break;
      }

      case PHASE.MEET: {
        // Second attempt — they meet
        const t = Math.min(phaseTime / 1, 1);
        p1.position.x = (-1.5 + t * 1.5);
        p2.position.x = (1.5 - t * 1.5);
        p1.position.y = 0;
        p2.position.y = 0;
        if (phaseTime > 1) {
          p1.visible = false;
          p2.visible = false;
          audio.heartbeatDouble(500);
          phase = PHASE.HEART_FORM;
          phaseTime = 0;
        }
        break;
      }

      case PHASE.HEART_FORM:
        // Heart scale in
        if (phaseTime < 0.1) {
          heart.group.visible = true;
          heart.group.scale.setScalar(0.01);
        }
        {
          const s = Math.min(phaseTime / 2, 1);
          const eased = 1 - Math.pow(1 - s, 3);
          heart.group.scale.setScalar(eased);
        }
        particles.triggerHeartbeat();
        if (phaseTime > 2.5) {
          phase = PHASE.HEART_LIVE;
          phaseTime = 0;
          heart.triggerHeartbeat();
        }
        break;

      case PHASE.HEART_LIVE:
        // Heartbeat every ~2 s
        if (Math.floor(phaseTime) % 2 === 0 && phaseTime % 1 < delta * 2) {
          heart.triggerHeartbeat();
          particles.triggerHeartbeat();
        }
        // Camera drift closer
        camTarget.set(0, 0.5, 7 - phaseTime * 0.1);
        if (phaseTime > 2) {
          phase = PHASE.HINT;
          phaseTime = 0;
          heart.showHint(true);
          hint.classList.add('visible');
        }
        break;

      case PHASE.HINT:
        // Heartbeat pulses continue
        if (Math.floor(phaseTime) % 2 === 0 && phaseTime % 1 < delta * 2) {
          heart.triggerHeartbeat();
          particles.triggerHeartbeat();
        }
        break;

      case PHASE.MEMORIES:
        // Gentle heartbeat while exploring
        if (Math.floor(phaseTime * 0.5) % 3 === 0 && phaseTime % 2 < delta * 2) {
          heart.triggerHeartbeat();
        }
        break;

      case PHASE.FINALE:
        break;
    }
  }

  return { start, update, handleHeartClick, introParticles };
}
