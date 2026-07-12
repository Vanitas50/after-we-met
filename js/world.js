import * as THREE from 'three';

export function createWorld(scene) {
  // ── Stars ────────────────────────────────────────────────────────────────
  const starCount = 3000;
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 400;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    sizes[i] = Math.random() * 1.5 + 0.3;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xffeedd) },
    },
    vertexShader: `
      attribute float size;
      uniform float time;
      varying float vAlpha;
      void main() {
        vAlpha = 0.4 + 0.3 * sin(time * 0.5 + position.x * 0.1);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d) * vAlpha;
        gl_FragColor = vec4(color, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ── Nebula (large translucent sprites) ───────────────────────────────────
  const nebulas = [];
  const nebulaColors = [
    new THREE.Color(0x4a1a3a),
    new THREE.Color(0x1a1a4a),
    new THREE.Color(0x3a1a2a),
    new THREE.Color(0x2a1040),
  ];

  for (let i = 0; i < 6; i++) {
    const nebulaGeo = new THREE.PlaneGeometry(60, 60);
    const nebulaMat = new THREE.MeshBasicMaterial({
      color: nebulaColors[i % nebulaColors.length],
      transparent: true,
      opacity: 0.04 + Math.random() * 0.04,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebula.position.set(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 40,
      -50 - Math.random() * 60
    );
    nebula.rotation.z = Math.random() * Math.PI;
    nebulas.push(nebula);
    scene.add(nebula);
  }

  // ── Fog ──────────────────────────────────────────────────────────────────
  scene.fog = new THREE.FogExp2(0x000000, 0.008);

  // ── Ground mist (large flat disc) ────────────────────────────────────────
  const mistGeo = new THREE.CircleGeometry(40, 64);
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0x1a0a1a,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mist = new THREE.Mesh(mistGeo, mistMat);
  mist.rotation.x = -Math.PI / 2;
  mist.position.y = -6;
  scene.add(mist);

  // ── Update function ───────────────────────────────────────────────────────
  function update(time) {
    starMat.uniforms.time.value = time;
    stars.rotation.y = time * 0.005;

    nebulas.forEach((n, i) => {
      n.rotation.z += 0.0001 * (i % 2 === 0 ? 1 : -1);
    });
  }

  return { update };
}
