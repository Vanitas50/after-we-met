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

  // Crescent moon
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: 0 });
  mats.push({ mat: moonMat, target: 0.9 });
  const moon = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 32, Math.PI * 1.25), moonMat);
  moon.position.set(-1.15, 0.55, -0.4);
  moon.rotation.z = 0.6;
  group.add(moon);

  // The two lights, close together
  const him = addLight(group, mats, 'him', -0.18, -0.12, 0.4);
  const her = addLight(group, mats, 'her', 0.18, -0.12, 0.4);

  // Mama's house
  const houseMat = new THREE.MeshStandardMaterial({ color: 0x2b2238, roughness: 0.9, transparent: true, opacity: 0 });
  mats.push({ mat: houseMat, target: 1 });
  const house = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.36), houseMat);
  house.position.set(1.05, -0.1, -0.7);
  group.add(house);

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a2c4a, roughness: 0.9, transparent: true, opacity: 0 });
  mats.push({ mat: roofMat, target: 1 });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.24, 4), roofMat);
  roof.position.set(1.05, 0.23, -0.7);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const windowMat = new THREE.MeshBasicMaterial({ color: 0xffc27a, transparent: true, opacity: 0 });
  mats.push({ mat: windowMat, target: 0 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), windowMat);
  win.position.set(1.05, -0.06, -0.519);
  group.add(win);

  const windowLight = new THREE.PointLight(0xffc27a, 0, 1.2);
  windowLight.position.set(1.05, -0.06, -0.519);
  group.add(windowLight);

  // Thread of light from him to the window
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.18, -0.05, 0.4),
    new THREE.Vector3(0.5, 0.75, 0),
    new THREE.Vector3(1.05, -0.06, -0.5),
  );
  const threadMat = new THREE.MeshBasicMaterial({ color: 0xffd9b0, transparent: true, opacity: 0 });
  mats.push({ mat: threadMat, target: 0.7 });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.008, 6, false), threadMat);
  group.add(tube);

  let t0 = null;
  function reset() { t0 = null; }

  function update(time) {
    if (t0 === null) t0 = time;
    const e = time - t0;

    const grow = Math.min(Math.max((e - 1.5) / 3.0, 0), 1);
    tube.geometry.setDrawRange(0, Math.floor(tube.geometry.index.count * grow / 6) * 6);

    const glow = Math.min(Math.max((e - 4.5) / 1.5, 0), 1);
    windowMat.opacity = glow * 0.95;
    windowLight.intensity = glow * 1.4;

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
