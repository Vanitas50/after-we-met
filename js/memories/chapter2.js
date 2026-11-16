import * as THREE from 'three';
import { circleTex, makeBase } from './index.js';

// Him / her lights, same look as chapter 1 (café). Returns the parts so a
// station can move or pulse them.
function addLight(group, mats, who, x, y, z) {
  const isHer = who === 'her';
  const bodyMat = new THREE.MeshBasicMaterial({ color: isHer ? 0xff6699 : 0x2a2a4e, transparent: true, opacity: 0 });
  mats.push({ mat: bodyMat, target: 1 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(isHer ? 0.11 : 0.12, 16, 16), bodyMat);
  body.position.set(x, y, z);
  group.add(body);
  const spriteMat = new THREE.SpriteMaterial({
    map: isHer ? circleTex(255, 136, 204) : circleTex(220, 220, 255), transparent: true, opacity: 0,
  });
  mats.push({ mat: spriteMat, target: isHer ? 0.55 : 0.5 });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.46, 0.46, 1);
  body.add(sprite); // sprite follows the body
  const light = new THREE.PointLight(isHer ? 0xff99cc : 0xaaaaff, isHer ? 1.0 : 0.6, 1.4);
  body.add(light);
  return { body, light };
}

// ── Das Versprechen ──────────────────────────────────────────────────────────
function buildVersprechen(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x0c0a1c, light: 0xf5c8a0 });
  const fade = (mat, target) => { mats.push({ mat, target }); return mat; };
  const std = (color, target = 1) => fade(new THREE.MeshStandardMaterial({ color, roughness: 0.85, transparent: true, opacity: 0 }), target);

  // Crescent moon outside, on the side of the room's window
  const R = 0.2;
  const moonShape = new THREE.Shape();
  moonShape.moveTo(0, R);
  moonShape.absarc(0, 0, R, Math.PI / 2, Math.PI * 1.5, false);
  moonShape.absellipse(0, 0, R * 0.45, R, Math.PI * 1.5, Math.PI / 2, true);
  const moonMat = fade(new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0, side: THREE.DoubleSide }), 0.95);
  const moon = new THREE.Mesh(new THREE.ShapeGeometry(moonShape, 32), moonMat);
  moon.position.set(-1.15, 0.55, -0.4);
  moon.rotation.z = -0.35;
  group.add(moon);
  const moonGlowMat = fade(new THREE.SpriteMaterial({ map: circleTex(255, 236, 200), transparent: true, opacity: 0, depthWrite: false }), 0.3);
  const moonGlow = new THREE.Sprite(moonGlowMat);
  moonGlow.scale.set(0.75, 0.75, 1);
  moonGlow.position.set(-1.2, 0.55, -0.45);
  group.add(moonGlow);

  // Her room: cut open towards the camera, turned a little so the left
  // (moon-side) wall with the window faces the viewer
  const room = new THREE.Group();
  room.position.set(-0.15, 0.08, -0.1);
  room.rotation.y = -0.45;
  room.scale.setScalar(1.3);
  group.add(room);
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); room.add(m); return m; };

  const wallMat = std(0x5a3a4e);
  add(new THREE.BoxGeometry(1.0, 0.04, 0.7), std(0x3a2633), 0, -0.34, 0);      // floor
  add(new THREE.BoxGeometry(1.0, 0.62, 0.04), wallMat, 0, -0.03, -0.35);        // back wall
  add(new THREE.BoxGeometry(0.04, 0.62, 0.7), wallMat, -0.5, -0.03, 0);         // left wall (moon side)
  add(new THREE.BoxGeometry(0.04, 0.62, 0.7), wallMat, 0.5, -0.03, 0);          // right wall
  const roof = add(new THREE.ConeGeometry(0.78, 0.3, 4), std(0x3a2c4a), 0, 0.43, 0);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1, 1, 0.72);

  // Window in the left wall, looking out to the moon (night sky + cross bars)
  const glass = add(new THREE.PlaneGeometry(0.26, 0.22),
    fade(new THREE.MeshBasicMaterial({ color: 0x24346e, transparent: true, opacity: 0, side: THREE.DoubleSide }), 1),
    -0.477, 0.04, -0.02);
  glass.rotation.y = Math.PI / 2;
  const barMat = fade(new THREE.MeshBasicMaterial({ color: 0x3a2433, transparent: true, opacity: 0, side: THREE.DoubleSide }), 1);
  const vBar = add(new THREE.PlaneGeometry(0.018, 0.22), barMat, -0.475, 0.04, -0.02);
  vBar.rotation.y = Math.PI / 2;
  const hBar = add(new THREE.PlaneGeometry(0.26, 0.018), barMat, -0.475, 0.04, -0.02);
  hBar.rotation.y = Math.PI / 2;
  const moonLight = new THREE.PointLight(0x9fb4ff, 0.6, 1.2);
  moonLight.position.set(-0.4, 0.05, 0);
  room.add(moonLight);

  // Bed along the back wall
  add(new THREE.BoxGeometry(0.62, 0.1, 0.34), std(0x4a2f3f), 0.05, -0.27, -0.15);   // frame
  add(new THREE.BoxGeometry(0.6, 0.06, 0.32), std(0xeadfe6), 0.05, -0.19, -0.15);   // mattress
  add(new THREE.BoxGeometry(0.38, 0.025, 0.33), std(0xd47a9c), 0.15, -0.15, -0.15); // blanket
  add(new THREE.BoxGeometry(0.13, 0.05, 0.22), std(0xf6eef3), -0.17, -0.14, -0.15); // pillow
  add(new THREE.BoxGeometry(0.04, 0.24, 0.34), std(0x4a2f3f), -0.26, -0.15, -0.15); // headboard

  // Warm lamp light in the room
  const roomLight = new THREE.PointLight(0xffc89a, 1.3, 1.6);
  roomLight.position.set(0.2, 0.15, 0.05);
  room.add(roomLight);

  // The two of them, sitting side by side on the edge of the bed
  const him = addLight(room, mats, 'him', -0.02, -0.11, 0.0);
  const her = addLight(room, mats, 'her', 0.14, -0.11, 0.0);
  // smaller here so the bed stays readable behind them
  him.body.scale.setScalar(0.6);
  her.body.scale.setScalar(0.6);

  function reset() {}

  function update(time) {
    roomLight.intensity = 1.2 + Math.sin(time * 0.8) * 0.15;
    her.light.intensity = 0.9 + Math.sin(time * 1.5) * 0.25;
  }

  return { mats, pointLight, update, reset };
}

// ── Dom ──────────────────────────────────────────────────────────────────────
function buildDom(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x140a1a, light: 0xffb3d9 });

  // Pole
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0xd9c2a0, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0,
  });
  mats.push({ mat: poleMat, target: 1 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.0, 12), poleMat);
  pole.position.y = 0.14;
  group.add(pole);

  // Rotating crown
  const crown = new THREE.Group();
  crown.position.y = 0.62;
  group.add(crown);

  const discMat = new THREE.MeshStandardMaterial({ color: 0x7a2b55, roughness: 0.6, transparent: true, opacity: 0 });
  mats.push({ mat: discMat, target: 1 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 32), discMat);
  crown.add(disc);

  const topMat = new THREE.MeshStandardMaterial({ color: 0xb04a7a, roughness: 0.5, transparent: true, opacity: 0 });
  mats.push({ mat: topMat, target: 1 });
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.25, 32), topMat);
  top.position.y = 0.15;
  crown.add(top);

  // Bulbs around the rim
  const bulbs = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 ? 0xfff0c0 : 0xff88bb, transparent: true, opacity: 0,
    });
    mats.push({ mat, target: 0.95 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), mat);
    bulb.position.set(Math.cos(a) * 0.56, 0, Math.sin(a) * 0.56);
    crown.add(bulb);
    bulbs.push(mat);
  }

  // Swings
  const swings = [];
  const chainMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0 });
  mats.push({ mat: chainMat, target: 0.8 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x3a2c4a, roughness: 0.8, transparent: true, opacity: 0 });
  mats.push({ mat: seatMat, target: 1 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.position.set(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5);
    pivot.rotation.y = -a;
    pivot.rotation.z = 0.55;
    crown.add(pivot);

    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.42, 4), chainMat);
    chain.position.y = -0.21;
    pivot.add(chain);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.08), seatMat);
    seat.position.y = -0.42;
    pivot.add(seat);

    swings.push(pivot);
  }

  // Him and her ride in two neighbouring seats
  const him = addLight(group, mats, 'him', 0, 0, 0);
  const her = addLight(group, mats, 'her', 0, 0, 0);
  swings[0].add(him.body);
  him.body.position.set(0, -0.36, 0);
  swings[1].add(her.body);
  her.body.position.set(0, -0.36, 0);

  function update(time) {
    crown.rotation.y = time * 0.9;
    bulbs.forEach((m, i) => {
      m.opacity = ((Math.floor(time * 6) + i) % 3 === 0 ? 0.95 : 0.3) * (mats[0].mat.opacity / 0.9);
    });
    him.body.position.x = Math.sin(time * 40) * 0.006;
    her.light.intensity = 0.9 + Math.sin(time * 1.5) * 0.25;
  }

  return { mats, pointLight, update };
}

// ── Hafen bei Nacht ──────────────────────────────────────────────────────────
function buildHafen(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x060b16, light: 0x9fb8ff });

  // Water
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0a1a33, roughness: 0.25, metalness: 0.6, transparent: true, opacity: 0,
  });
  mats.push({ mat: waterMat, target: 0.95 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.34, -0.45);
  group.add(water);

  // Cranes
  const craneMat = new THREE.MeshStandardMaterial({ color: 0x3a3f5a, roughness: 0.8, transparent: true, opacity: 0 });
  mats.push({ mat: craneMat, target: 1 });
  const blinks = [];
  [-0.9, -0.2, 0.55].forEach(cx => {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.06), craneMat);
    tower.position.set(cx, 0.1, -0.8);
    group.add(tower);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), craneMat);
    arm.position.set(cx + 0.2, 0.55, -0.8);
    group.add(arm);

    const blinkMat = new THREE.MeshBasicMaterial({ color: 0xff4455, transparent: true, opacity: 0 });
    mats.push({ mat: blinkMat, target: 0.9 });
    const blink = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), blinkMat);
    blink.position.set(cx + 0.55, 0.55, -0.8);
    group.add(blink);
    blinks.push(blinkMat);
  });

  // Containers
  const contColors = [0xb0443a, 0x2f6f8f, 0xc98a2b, 0x5a7f4a];
  [0, 1].forEach(row => {
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: contColors[(row * 4 + i) % contColors.length], roughness: 0.85, transparent: true, opacity: 0,
      });
      mats.push({ mat, target: 1 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.1), mat);
      box.position.set(-1.0 + i * 0.27, i % 2 ? -0.19 : -0.29, row === 0 ? -0.35 : -0.5);
      group.add(box);
    }
  });

  // Harbor light reflections
  const reflections = [];
  for (let i = 0; i < 30; i++) {
    const spMat = new THREE.SpriteMaterial({
      map: circleTex(255, 210, 150), transparent: true, opacity: 0,
    });
    mats.push({ mat: spMat, target: 0.6 });
    const sp = new THREE.Sprite(spMat);
    sp.scale.set(0.08, 0.08, 1);
    sp.position.set(
      -1.2 + Math.random() * 2.4,
      -0.32,
      -1.2 + Math.random() * 1.0,
    );
    group.add(sp);
    reflections.push({ sp, offset: Math.random() * 6.28 });
  }

  // Slope
  const slopeMat = new THREE.MeshStandardMaterial({
    color: 0x1b2a1f, roughness: 0.95, transparent: true, opacity: 0,
  });
  mats.push({ mat: slopeMat, target: 1 });
  const slope = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), slopeMat,
  );
  slope.scale.set(1.6, 0.45, 0.8);
  slope.position.set(0, -0.36, 0.75);
  group.add(slope);

  // The two lights on the slope
  const him = addLight(group, mats, 'him', -0.12, 0.02, 0.9);
  const her = addLight(group, mats, 'her', 0.12, 0.02, 0.9);

  function update(time) {
    const fade = mats[0].mat.opacity / 0.9;
    blinks.forEach((m, i) => {
      m.opacity = (Math.sin(time * 2 + i * 1.7) > 0.6 ? 0.9 : 0.15) * (group.visible ? 1 : 0);
    });
    reflections.forEach(({ sp, offset }) => {
      sp.material.opacity = (0.35 + 0.3 * Math.sin(time * 1.6 + offset)) * fade;
    });
    her.light.intensity = 0.9 + Math.sin(time * 1.5) * 0.25;
  }

  return { mats, pointLight, update };
}

// ── Deine Tür ────────────────────────────────────────────────────────────────
function buildTuer(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x0a0812, light: 0xf5c8a0 });

  // Four facades side by side
  const houses = [-1.05, -0.35, 0.35, 1.05];
  const facadeColors = [0x4a3d5c, 0x42374f, 0x4e4060, 0x3e3350];
  const windows = [];
  houses.forEach((x, k) => {
    const wallMat = new THREE.MeshStandardMaterial({
      color: facadeColors[k], roughness: 0.9, transparent: true, opacity: 0,
    });
    mats.push({ mat: wallMat, target: 1 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.95, 0.3), wallMat);
    wall.position.set(x, 0.12, -0.3);
    group.add(wall);

    const doorMat = new THREE.MeshBasicMaterial({ color: 0x120e18, transparent: true, opacity: 0 });
    mats.push({ mat: doorMat, target: 1 });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.3), doorMat);
    door.position.set(x, -0.2, -0.149);
    group.add(door);

    const winMat = new THREE.MeshBasicMaterial({ color: 0xffd6e6, transparent: true, opacity: 0 });
    mats.push({ mat: winMat, target: 0.08 });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.1), winMat);
    win.position.set(x, 0.25, -0.149);
    group.add(win);
    windows.push(winMat);
  });

  // Street lamps
  const postMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.7, transparent: true, opacity: 0 });
  mats.push({ mat: postMat, target: 1 });
  const lampSpriteMat = new THREE.SpriteMaterial({
    map: circleTex(255, 220, 170), transparent: true, opacity: 0,
  });
  mats.push({ mat: lampSpriteMat, target: 0.8 });
  [-0.7, 0, 0.7].forEach(x => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6), postMat);
    post.position.set(x, -0.06, 0.35);
    group.add(post);

    const glow = new THREE.Sprite(lampSpriteMat);
    glow.scale.set(0.34, 0.34, 1);
    glow.position.set(x, 0.26, 0.35);
    group.add(glow);
  });

  // Him and her
  const him = addLight(group, mats, 'him', -1.3, -0.22, 0.15);
  const her = addLight(group, mats, 'her', 0.35, -0.22, -0.1);
  her.body.visible = false;
  // Her opacity is driven by the search in update(), not by the station fade.
  mats.splice(mats.length - 2, 2);

  // Search path
  const path = [
    [0, -1.3], [1.6, -1.05], [2.6, -1.05], [3.8, -0.35], [4.8, -0.35],
    [5.6, 0.6], [6.2, 1.05], [7.0, 1.05], [8.2, 0.35],
  ];
  // Pauses in front of the wrong doors: [house index, start, end]
  const pauses = [[0, 1.6, 2.6], [1, 3.8, 4.8], [3, 6.2, 7.0]];

  let t0 = null;
  function reset() { t0 = null; her.body.visible = false; }

  function update(time) {
    if (t0 === null) t0 = time;
    const e = time - t0;

    // Walk along the keyframes with smoothstep easing
    let x = path[0][1];
    let moving = false;
    for (let i = 0; i < path.length - 1; i++) {
      const [tA, xA] = path[i];
      const [tB, xB] = path[i + 1];
      if (e >= tA && e < tB) {
        const u = (e - tA) / (tB - tA);
        const ease = u * u * (3 - 2 * u);
        x = xA + (xB - xA) * ease;
        moving = Math.abs(xB - xA) > 0.001;
        break;
      }
      if (e >= tB && i === path.length - 2) x = xB;
    }

    him.body.position.x = x;
    him.body.position.y = -0.22 + (moving ? Math.abs(Math.sin(e * 5)) * 0.03 : 0);

    // Wrong doors flicker while he pauses there
    pauses.forEach(([k, start, end]) => {
      if (e >= start && e < end) {
        const phase = (e - start) / (end - start);
        windows[k].opacity = 0.08 + Math.max(0, Math.sin(phase * Math.PI * 3)) * 0.17;
      } else {
        windows[k].opacity = 0.08;
      }
    });

    // The right door is found
    if (e >= 8.2) {
      const found = Math.min((e - 8.2) / 1.2, 1);
      windows[2].opacity = 0.08 + found * 0.87;
      her.body.visible = true;
      her.body.material.opacity = found;
      her.body.children[0].material.opacity = found * 0.55;
      her.body.position.set(0.35, -0.22, -0.1 + found * 0.2);
      him.body.position.x = 0.35 - 0.15 * found;
    }
  }

  return { mats, pointLight, update, reset };
}

export const CHAPTER2_DEFS = [
  { label: 'Das Versprechen', caption: 'ich erzähl meiner Mama von dir', build: buildVersprechen, color: 0x0c0a1c },
  { label: 'Hafen bei Nacht', caption: 'ganz oben, der ganze Hafen unter uns', build: buildHafen, color: 0x060b16 },
  { label: 'Dom', caption: 'trotz Höhenangst, für dich', build: buildDom, color: 0x140a1a },
  { label: 'Deine Tür', caption: 'eine Stunde gesucht – endlich gefunden', build: buildTuer, color: 0x0a0812 },
];
