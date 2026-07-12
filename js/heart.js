import * as THREE from 'three';

/**
 * Living Rose Crystal heart — with `appear` uniform for smooth fade-in.
 */

class HeartCurve extends THREE.Curve {
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }
  getPoint(t) {
    const a = t * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    return new THREE.Vector2(x * this.scale, y * this.scale);
  }
}

// ── Glass / Living Rose Crystal shader ───────────────────────────────────────
const heartVertShader = /* glsl */`
  uniform float time;
  uniform float heartbeat;
  uniform float openAmount;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPos;
  varying float vFresnel;

  void main() {
    vec3 pos = position;
    float breathe = sin(time * 0.8) * 0.02;
    pos.y += breathe;

    float pulse = 1.0 + heartbeat * 0.06;
    pos *= pulse;

    vNormal   = normalMatrix * normal;
    vPosition = pos;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;

    vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
    vFresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.5);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const heartFragShader = /* glsl */`
  uniform float time;
  uniform float heartbeat;
  uniform float appear;
  uniform vec3  lightColor;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPos;
  varying float vFresnel;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i),             hash(i + vec3(1,0,0)), f.x),
          mix(hash(i+vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i+vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i+vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vec3 norm = normalize(vNormal);
    vec3 n = vPosition * 2.5 + time * 0.15;

    float vein = noise(n);
    vein = smoothstep(0.45, 0.55, vein);
    vec3 veinColor = vec3(0.95, 0.72, 0.3) * vein * (1.0 + heartbeat * 1.2);

    vec3 crystalBase = vec3(0.85, 0.55, 0.55);
    vec3 rimColor    = vec3(0.98, 0.82, 0.72);

    float NdotL = max(dot(norm, normalize(vec3(1.0, 2.0, 1.5))), 0.0);
    vec3 diffuse = mix(crystalBase, rimColor, NdotL);

    vec3 fresnelColor = vec3(0.96, 0.78, 0.52) * vFresnel * 1.5;
    vec3 beatGlow     = vec3(0.98, 0.65, 0.6) * heartbeat * 0.8;
    float shimmer     = noise(vPosition * 6.0 + time * 0.3) * 0.15;

    vec3 finalColor = diffuse + fresnelColor + veinColor + beatGlow + shimmer;
    float alpha = (0.25 + vFresnel * 0.45 + vein * 0.15 + heartbeat * 0.1) * appear;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ── Inner galaxy shader ───────────────────────────────────────────────────────
const galaxyVertShader = /* glsl */`
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const galaxyFragShader = /* glsl */`
  uniform float time;
  uniform float openAmount;
  uniform float appear;
  varying vec3 vPos;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  void main() {
    float stars = hash(floor(vPos * 12.0));
    stars = pow(stars, 12.0) * 4.0;

    vec3 glow = vec3(0.9, 0.6, 0.9) * stars;
    glow += vec3(0.3, 0.15, 0.5) * smoothstep(0.4, 0.0, length(vPos));

    float angle = atan(vPos.z, vPos.x) + time * 0.2;
    float swirl = sin(angle * 3.0 + length(vPos.xz) * 8.0) * 0.5 + 0.5;
    glow += vec3(0.4, 0.1, 0.6) * swirl * 0.2;

    gl_FragColor = vec4(glow, openAmount * 0.85 * appear);
  }
`;

// ── Petal shader ──────────────────────────────────────────────────────────────
const petalVertShader = /* glsl */`
  uniform float time;
  uniform float openAmount;
  uniform float petalIndex;

  varying vec3 vNormal;
  varying float vFresnel;

  void main() {
    vec3 pos = position;
    float angle = openAmount * 0.6;
    float s = sin(angle), c = cos(angle);
    float rx = pos.x * c - pos.y * s;
    float ry = pos.x * s + pos.y * c;
    pos.x = rx;
    pos.y = ry;

    vNormal = normalMatrix * normal;
    vec3 viewDir = normalize(cameraPosition - (modelMatrix * vec4(pos,1.0)).xyz);
    vFresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const petalFragShader = /* glsl */`
  uniform float time;
  uniform float openAmount;
  uniform float appear;

  varying vec3 vNormal;
  varying float vFresnel;

  void main() {
    vec3 base  = vec3(0.92, 0.72, 0.68);
    vec3 edge  = vec3(0.98, 0.88, 0.78);
    vec3 color = mix(base, edge, vFresnel);
    float alpha = (0.35 + vFresnel * 0.4) * max(0.2, openAmount) * appear;
    gl_FragColor = vec4(color, alpha);
  }
`;

// ── Build the heart ───────────────────────────────────────────────────────────
export function createHeart(scene) {
  const group = new THREE.Group();

  // Shared appear uniform (same object ref across all materials)
  const appear = { value: 0.0 };

  // Main heart shape
  const heartShape = new THREE.Shape();
  for (let t = 0; t <= 1; t += 0.02) {
    const a = t * Math.PI * 2;
    const x = 0.065 * 16 * Math.pow(Math.sin(a), 3);
    const y = 0.065 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    if (t === 0) heartShape.moveTo(x, y);
    else heartShape.lineTo(x, y);
  }

  const extrudeSettings = {
    depth: 0.7,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.12,
    bevelSegments: 5,
    steps: 2,
  };

  const geo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
  geo.center();

  const uniforms = {
    time:       { value: 0 },
    heartbeat:  { value: 0 },
    openAmount: { value: 0 },
    lightColor: { value: new THREE.Color(0xf5c8a0) },
    appear,
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader:   heartVertShader,
    fragmentShader: heartFragShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const heart = new THREE.Mesh(geo, mat);
  heart.rotation.x = 0.1;
  group.add(heart);

  // Inner galaxy sphere
  const galaxyMat = new THREE.ShaderMaterial({
    uniforms: {
      time:       { value: 0 },
      openAmount: uniforms.openAmount,
      appear,
    },
    vertexShader:   galaxyVertShader,
    fragmentShader: galaxyFragShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), galaxyMat));

  // Crystal petals
  const petalCount = 12;
  const petals     = [];
  for (let i = 0; i < petalCount; i++) {
    const angle  = (i / petalCount) * Math.PI * 2;
    const radius = 0.85;
    const pMat   = new THREE.ShaderMaterial({
      uniforms: {
        time:       { value: 0 },
        openAmount: uniforms.openAmount,
        petalIndex: { value: i },
        appear,
      },
      vertexShader:   petalVertShader,
      fragmentShader: petalFragShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const petal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 5), pMat);
    petal.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.6,
      (Math.random() - 0.5) * 0.3
    );
    petal.rotation.z = angle + Math.PI;
    petal.rotation.x = (Math.random() - 0.5) * 0.4;
    petals.push({ mesh: petal, mat: pMat, angle });
    group.add(petal);
  }

  // Interaction hint glow
  const hintMat  = new THREE.MeshBasicMaterial({ color: 0xf2c0a0, transparent: true, opacity: 0 });
  const hintMesh = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), hintMat);
  group.add(hintMesh);

  scene.add(group);
  group.position.y = 0.3;

  // State
  let heartbeatTarget  = 0;
  let heartbeatCurrent = 0;
  let openTarget       = 0;
  let openCurrent      = 0;
  let hintVisible      = false;
  let appearTarget     = 0;
  let appearCurrent    = 0;

  let beatPhase = 0;
  let beatTimer = 0;

  function triggerHeartbeat() { beatPhase = 1; beatTimer = 0; }
  function showHint(show)     { hintVisible = show; }
  function open()             { openTarget  = 1; }
  function close()            { openTarget  = 0; }
  function fadeIn()           { appearTarget = 1; }

  function update(time, delta) {
    // Heartbeat
    if (beatPhase > 0) {
      beatTimer += delta;
      if (beatPhase === 1) {
        heartbeatTarget = Math.max(0, 1 - beatTimer * 6);
        if (beatTimer > 0.18) { beatPhase = 2; beatTimer = 0; }
      } else if (beatPhase === 2) {
        heartbeatTarget = 0;
        if (beatTimer > 0.25) { beatPhase = 3; beatTimer = 0; }
      } else if (beatPhase === 3) {
        heartbeatTarget = Math.max(0, 0.7 - beatTimer * 5);
        if (beatTimer > 0.15) { beatPhase = 0; heartbeatTarget = 0; }
      }
    }

    heartbeatCurrent += (heartbeatTarget  - heartbeatCurrent) * 0.15;
    openCurrent      += (openTarget       - openCurrent)      * 0.03;
    appearCurrent    += (appearTarget     - appearCurrent)    * 0.025;

    uniforms.time.value       = time;
    uniforms.heartbeat.value  = heartbeatCurrent;
    uniforms.openAmount.value = openCurrent;
    appear.value              = appearCurrent;

    galaxyMat.uniforms.time.value = time;
    petals.forEach(({ mat: pm }) => { pm.uniforms.time.value = time; });

    group.position.y = 0.3 + Math.sin(time * 0.8) * 0.05;
    group.rotation.y = time * 0.15;

    if (hintVisible) {
      hintMat.opacity = ((Math.sin(time * 2) + 1) / 2) * 0.12;
    } else {
      hintMat.opacity *= 0.95;
    }
  }

  return { group, update, triggerHeartbeat, showHint, open, close, fadeIn };
}
