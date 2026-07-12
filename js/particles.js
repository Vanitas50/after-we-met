import * as THREE from 'three';

/**
 * Ambient particle system — slow-drifting crystal shards around the heart.
 */
export function createParticles(scene) {
  const COUNT = 400;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const velocities = new Float32Array(COUNT * 3);
  const lifetimes = new Float32Array(COUNT);
  const sizes = new Float32Array(COUNT);

  function resetParticle(i) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 5;
    positions[i * 3]     = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    velocities[i * 3]     = (Math.random() - 0.5) * 0.005;
    velocities[i * 3 + 1] = 0.003 + Math.random() * 0.005;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    lifetimes[i] = Math.random();
    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  for (let i = 0; i < COUNT; i++) resetParticle(i);

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      heartbeatIntensity: { value: 0 },
    },
    vertexShader: `
      attribute float size;
      attribute float lifetime;
      uniform float time;
      uniform float heartbeatIntensity;
      varying float vLifetime;
      void main() {
        vLifetime = lifetime;
        float pulse = 1.0 + heartbeatIntensity * 0.4;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pulse * (150.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying float vLifetime;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        // Rose-gold tint
        vec3 color = mix(
          vec3(0.95, 0.75, 0.55),
          vec3(1.0, 0.9, 0.8),
          vLifetime
        );
        float alpha = smoothstep(0.5, 0.0, d) * (0.3 + vLifetime * 0.5);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let heartbeatTarget = 0;
  let heartbeatCurrent = 0;

  function triggerHeartbeat() {
    heartbeatTarget = 1.0;
  }

  function update(delta) {
    const pos = geo.attributes.position.array;
    const life = geo.attributes.lifetime.array;

    heartbeatCurrent += (heartbeatTarget - heartbeatCurrent) * 0.1;
    heartbeatTarget *= 0.95;
    mat.uniforms.heartbeatIntensity.value = heartbeatCurrent;

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];
      life[i] += delta * 0.1;

      if (life[i] > 1.0 || pos[i * 3 + 1] > 4) {
        resetParticle(i);
        life[i] = 0;
      }
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.lifetime.needsUpdate = true;
  }

  return { update, triggerHeartbeat };
}

/**
 * Burst particles emitted from the heart on open.
 */
export function createMemoryParticle(scene, targetPosition) {
  const geo = new THREE.SphereGeometry(0.05, 6, 6);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xf2c9a8,
    transparent: true,
    opacity: 0.9,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, 0);
  scene.add(mesh);

  const duration = 1.8;
  let elapsed = 0;
  const startPos = new THREE.Vector3(0, 0, 0);

  function update(delta) {
    elapsed += delta;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    mesh.position.lerpVectors(startPos, targetPosition, eased);
    mat.opacity = t < 0.8 ? 0.9 : 1 - (t - 0.8) / 0.2;
    return t >= 1;
  }

  function dispose() {
    scene.remove(mesh);
    geo.dispose();
    mat.dispose();
  }

  return { update, dispose };
}
