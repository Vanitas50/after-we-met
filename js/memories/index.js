import * as THREE from 'three';

// ── Shared diorama builder ────────────────────────────────────────────────
function createDiorama(scene, options) {
  const {
    label,
    emoji,
    buildFn,
    position = new THREE.Vector3(0, 0, 0),
  } = options;

  const group = new THREE.Group();
  group.position.copy(position);
  group.visible = false;

  // Floating island base
  const baseGeo = new THREE.CylinderGeometry(1.8, 1.2, 0.3, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1a0a2a,
    roughness: 0.9,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.5;
  group.add(base);

  // Rim glow
  const rimGeo = new THREE.TorusGeometry(1.8, 0.06, 8, 64);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0xf2c9a8,
    transparent: true,
    opacity: 0.5,
  });
  group.add(new THREE.Mesh(rimGeo, rimMat));

  // Custom scene elements
  if (buildFn) buildFn(group);

  // Lights for diorama
  const dLight = new THREE.PointLight(0xf5c8a0, 1.5, 6);
  dLight.position.set(0, 2, 0);
  group.add(dLight);

  scene.add(group);

  let visible = false;
  let opacity = 0;
  let hoverBob = Math.random() * Math.PI * 2;

  function show(cb) {
    group.visible = true;
    visible = true;
    if (cb) setTimeout(cb, 1500);
  }

  function hide() {
    visible = false;
  }

  function update(time) {
    hoverBob += 0.01;
    if (group.visible) {
      const targetOpacity = visible ? 1 : 0;
      opacity += (targetOpacity - opacity) * 0.04;
      baseMat.opacity = opacity * 0.9;
      rimMat.opacity  = opacity * 0.5;
      group.position.y = position.y + Math.sin(hoverBob) * 0.08;
      if (!visible && opacity < 0.02) {
        group.visible = false;
        opacity = 0;
      }
    }
  }

  return { group, show, hide, update, label, emoji };
}

// ── Individual memory builders ────────────────────────────────────────────

function buildHackerSchool(group) {
  // Monitor-like shape
  const screenGeo = new THREE.BoxGeometry(0.7, 0.45, 0.04);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x111122, emissive: 0x002244, emissiveIntensity: 1 });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.3, 0);
  group.add(screen);

  // Code lines (thin boxes)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  for (let i = 0; i < 5; i++) {
    const lineGeo = new THREE.BoxGeometry(0.3 + Math.random() * 0.25, 0.02, 0.01);
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(-0.1, 0.38 - i * 0.07, 0.03);
    group.add(line);
  }

  // Robot emoji as glowing sphere
  const botGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const botMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x2244bb, emissiveIntensity: 0.8 });
  const bot = new THREE.Mesh(botGeo, botMat);
  bot.position.set(0.4, 0.15, 0);
  group.add(bot);
}

function buildWilhelmsburg(group) {
  // Industrial chimney stacks
  const colors = [0x3a2a1a, 0x2a1a0a];
  for (let i = 0; i < 3; i++) {
    const h = 0.6 + i * 0.2;
    const chimneyGeo = new THREE.CylinderGeometry(0.07, 0.1, h, 8);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: colors[i % 2], roughness: 0.9 });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(-0.5 + i * 0.45, h / 2, 0);
    group.add(chimney);

    // Smoke puff
    const smokeGeo = new THREE.SphereGeometry(0.08 + Math.random() * 0.05, 6, 6);
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.4 });
    const smoke = new THREE.Mesh(smokeGeo, smokeMat);
    smoke.position.set(-0.5 + i * 0.45, h + 0.15, 0);
    group.add(smoke);
  }
  // Water reflection (flat disc)
  const waterGeo = new THREE.CircleGeometry(1.4, 32);
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x111133, transparent: true, opacity: 0.6 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.38;
  group.add(water);
}

function buildFlottbek(group) {
  // Park trees
  for (let i = 0; i < 5; i++) {
    const trunkGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.4, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    const x = -0.8 + i * 0.4;
    trunk.position.set(x, 0, 0);
    group.add(trunk);

    const leafGeo = new THREE.SphereGeometry(0.18 + Math.random() * 0.08, 6, 6);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a2d, roughness: 0.8 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(x, 0.35, 0);
    group.add(leaf);
  }
  // Path
  const pathGeo = new THREE.BoxGeometry(1.8, 0.02, 0.3);
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xc8b090 });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.position.y = -0.35;
  group.add(path);
}

function buildAlster(group) {
  // Lake
  const lakeGeo = new THREE.CircleGeometry(1.2, 32);
  const lakeMat = new THREE.MeshStandardMaterial({
    color: 0x1a3a5a, roughness: 0.1, metalness: 0.8,
    transparent: true, opacity: 0.85,
  });
  const lake = new THREE.Mesh(lakeGeo, lakeMat);
  lake.rotation.x = -Math.PI / 2;
  lake.position.y = -0.35;
  group.add(lake);

  // Sailboat
  const hullGeo = new THREE.BoxGeometry(0.3, 0.08, 0.1);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xfff8f0 });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.set(0, -0.2, 0);
  group.add(hull);

  const sailGeo = new THREE.ConeGeometry(0.01, 0.5, 3);
  sailGeo.scale(1, 1, 15);
  const sailMat = new THREE.MeshBasicMaterial({ color: 0xfffaf5, side: THREE.DoubleSide });
  const sail = new THREE.Mesh(sailGeo, sailMat);
  sail.position.set(0, 0.05, 0);
  group.add(sail);
}

function buildRegen(group) {
  // Rain streaks
  const rainMat = new THREE.MeshBasicMaterial({ color: 0x8899bb, transparent: true, opacity: 0.6 });
  for (let i = 0; i < 30; i++) {
    const rainGeo = new THREE.BoxGeometry(0.005, 0.12, 0.005);
    const rain = new THREE.Mesh(rainGeo, rainMat);
    rain.position.set(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 0.5
    );
    rain.userData.speed = 0.01 + Math.random() * 0.02;
    group.add(rain);
  }
  // Puddle
  const puddleGeo = new THREE.CircleGeometry(0.5, 16);
  const puddleMat = new THREE.MeshBasicMaterial({ color: 0x445566, transparent: true, opacity: 0.7 });
  const puddle = new THREE.Mesh(puddleGeo, puddleMat);
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.y = -0.38;
  group.add(puddle);
}

function buildCafe(group) {
  // Table
  const tableGeo = new THREE.CylinderGeometry(0.35, 0.05, 0.5, 8);
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.7 });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.y = -0.1;
  group.add(table);

  const topGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16);
  const topMat = new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.5 });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 0.16;
  group.add(top);

  // Two cups
  const cupPositions = [[-0.15, 0], [0.15, 0]];
  cupPositions.forEach(([x, z]) => {
    const cupGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.1, 8);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xfff5ee, emissive: 0x4a2200, emissiveIntensity: 0.2 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(x, 0.23, z);
    group.add(cup);
  });
}

function buildKunsthalle(group) {
  // Museum facade
  const wallGeo = new THREE.BoxGeometry(1.4, 0.8, 0.1);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xc8b890, roughness: 0.9 });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.y = 0.1;
  group.add(wall);

  // Columns
  for (let i = 0; i < 4; i++) {
    const colGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.8, 8);
    const colMat = new THREE.MeshStandardMaterial({ color: 0xd4c8aa });
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(-0.5 + i * 0.33, 0.1, 0.06);
    group.add(col);
  }

  // Art frame (glowing picture)
  const frameGeo = new THREE.BoxGeometry(0.5, 0.35, 0.02);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xff9966, emissive: 0xff6644, emissiveIntensity: 0.5,
    transparent: true, opacity: 0.9,
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 0.2, 0.07);
  group.add(frame);
}

function buildErsterKuss(group) {
  // Two silhouette spheres (close together)
  const colors = [0xf2c9a8, 0xd4a0c0];
  const positions = [[-0.2, 0, 0], [0.2, 0, 0]];
  colors.forEach((color, i) => {
    const sGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const sMat = new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(color).multiplyScalar(0.4),
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const s = new THREE.Mesh(sGeo, sMat);
    s.position.set(...positions[i]);
    s.position.y = 0.1;
    group.add(s);
  });

  // Glow between them
  const glowGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffddcc,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = 0.1;
  group.add(glow);

  // Sparkles
  const sparkMat = new THREE.PointsMaterial({ color: 0xffddb0, size: 0.05, transparent: true, opacity: 0.8 });
  const sparkPositions = [];
  for (let i = 0; i < 20; i++) {
    sparkPositions.push((Math.random() - 0.5) * 1.2, 0.1 + Math.random() * 0.8, (Math.random() - 0.5) * 0.5);
  }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(sparkPositions, 3));
  group.add(new THREE.Points(sparkGeo, sparkMat));
}

// ── Public API ────────────────────────────────────────────────────────────
const MEMORY_DEFS = [
  { id: 'hackerSchool', label: 'Hacker School',  emoji: '🤖', buildFn: buildHackerSchool },
  { id: 'wilhelmsburg', label: 'Wilhelmsburg',    emoji: '🏭', buildFn: buildWilhelmsburg },
  { id: 'flottbek',     label: 'Flottbek',        emoji: '🌳', buildFn: buildFlottbek     },
  { id: 'alster',       label: 'Alster',           emoji: '⛵', buildFn: buildAlster       },
  { id: 'regen',        label: 'Regen',            emoji: '🌧️', buildFn: buildRegen        },
  { id: 'cafe',         label: 'Café',             emoji: '☕', buildFn: buildCafe         },
  { id: 'kunsthalle',   label: 'Kunsthalle',       emoji: '🎨', buildFn: buildKunsthalle   },
  { id: 'ersterKuss',   label: 'Erster Kuss',      emoji: '💫', buildFn: buildErsterKuss   },
];

export function createMemories(scene) {
  // Place memories in a circle around the heart
  const radius = 5;
  const dioramas = MEMORY_DEFS.map((def, i) => {
    const angle = (i / MEMORY_DEFS.length) * Math.PI * 2;
    const pos = new THREE.Vector3(
      Math.cos(angle) * radius,
      -0.5,
      Math.sin(angle) * radius
    );
    return createDiorama(scene, { ...def, position: pos });
  });

  let currentMemory = -1;

  function showMemory(index, onShown) {
    if (currentMemory >= 0) dioramas[currentMemory].hide();
    currentMemory = index;
    if (index >= 0 && index < dioramas.length) {
      dioramas[index].show(onShown);
    }
  }

  function hideAll() {
    dioramas.forEach(d => d.hide());
    currentMemory = -1;
  }

  function update(time) {
    dioramas.forEach(d => d.update(time));
  }

  function getPosition(index) {
    return dioramas[index]?.group.position.clone() ?? new THREE.Vector3();
  }

  function getLabel(index) {
    return dioramas[index] ? `${dioramas[index].emoji} ${dioramas[index].label}` : '';
  }

  return { showMemory, hideAll, update, getPosition, getLabel, count: dioramas.length };
}
