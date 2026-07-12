import * as THREE from 'three';

const RADIUS = 5;

// ── Canvas text helper ────────────────────────────────────────────────────────
function textTex(lines, { w = 512, h = 256, bg = 'transparent', color = '#f2c9a8',
  font = '300 52px Cormorant Garamond, Georgia, serif', align = 'center',
  glow = null, lineHeight = 1.35 } = {}) {
  const c   = document.createElement('canvas');
  c.width   = w;
  c.height  = h;
  const ctx = c.getContext('2d');
  if (bg !== 'transparent') {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur  = 28;
  }
  ctx.fillStyle   = color;
  ctx.font        = font;
  ctx.textAlign   = align;
  ctx.textBaseline = 'middle';
  const x = align === 'center' ? w / 2 : 24;
  const lh = parseInt(font) * lineHeight;
  const startY = h / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lh));
  return new THREE.CanvasTexture(c);
}

// ── Island base shared helper ────────────────────────────────────────────────
function makeBase(group, { color = 0x1a0a2e, light = 0xf5c8a0 } = {}) {
  const mats = [];

  const baseMat = new THREE.MeshStandardMaterial({
    color, roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0,
  });
  mats.push({ mat: baseMat, target: 0.9 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.1, 0.28, 32), baseMat);
  base.position.y = -0.5;
  group.add(base);

  const rimMat = new THREE.MeshBasicMaterial({ color: 0xf2c9a8, transparent: true, opacity: 0 });
  mats.push({ mat: rimMat, target: 0.65 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 8, 64), rimMat);
  rim.position.y = -0.36;
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  const mistMat = new THREE.MeshBasicMaterial({
    color: 0xd4a8f0, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  mats.push({ mat: mistMat, target: 0.09 });
  const mist = new THREE.Mesh(new THREE.CircleGeometry(2.8, 32), mistMat);
  mist.rotation.x = -Math.PI / 2;
  mist.position.y = -0.72;
  group.add(mist);

  const pointLight = new THREE.PointLight(light, 0, 7);
  pointLight.position.set(0, 2.5, 0);
  group.add(pointLight);

  return { mats, pointLight };
}

// ── Hacker School ─────────────────────────────────────────────────────────────
function buildHackerSchool(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x080c1e, light: 0x44ffee });

  // Robot body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a2040, metalness: 0.6, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.28), bodyMat);
  body.position.y = 0.28;
  group.add(body);

  // Robot head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.26), bodyMat);
  head.position.y = 0.78;
  group.add(head);

  // Cyan eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffee });
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.04), eyeMat);
  eyeL.position.set(-0.08, 0.79, 0.135);
  group.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.04), eyeMat);
  eyeR.position.set(0.08, 0.79, 0.135);
  group.add(eyeR);

  const eyeGlow = new THREE.PointLight(0x00ffee, 1.5, 2.5);
  eyeGlow.position.set(0, 0.79, 0.2);
  group.add(eyeGlow);

  // Antenna
  const antStick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8), bodyMat);
  antStick.position.set(0, 1.07, 0);
  group.add(antStick);
  const antTipMat = new THREE.MeshBasicMaterial({ color: 0xff88bb });
  const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), antTipMat);
  antTip.position.set(0, 1.19, 0);
  group.add(antTip);
  const antLight = new THREE.PointLight(0xff88bb, 0.8, 1.2);
  antLight.position.copy(antTip.position);
  group.add(antLight);

  // Left arm (waves)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.32, 0.46, 0);
  group.add(leftArmPivot);
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.14), bodyMat);
  leftArm.position.y = -0.19;
  leftArmPivot.add(leftArm);

  // Right arm (static)
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.14), bodyMat);
  rightArm.position.set(0.37, 0.28, 0);
  group.add(rightArm);

  // Legs
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.16), bodyMat);
  legL.position.set(-0.13, -0.15, 0);
  group.add(legL);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.3, 0.16), bodyMat);
  legR.position.set(0.13, -0.15, 0);
  group.add(legR);

  // Small floating heart above robot
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0);
  heartShape.bezierCurveTo( 0,  0.06, -0.12,  0.06, -0.12, 0);
  heartShape.bezierCurveTo(-0.12, -0.09, 0, -0.14, 0, -0.2);
  heartShape.bezierCurveTo( 0, -0.14,  0.12, -0.09,  0.12, 0);
  heartShape.bezierCurveTo( 0.12, 0.06,  0, 0.06,  0, 0);
  const heartGeo = new THREE.ShapeGeometry(heartShape);
  const heartMat = new THREE.MeshBasicMaterial({
    color: 0xff6688, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
  });
  const floatHeart = new THREE.Mesh(heartGeo, heartMat);
  floatHeart.position.set(0, 1.42, 0);
  group.add(floatHeart);

  // "day one" label
  const labelTex = textTex(['day one'], {
    w: 256, h: 80, color: 'rgba(242,201,168,0.75)',
    font: 'italic 300 34px Cormorant Garamond, Georgia, serif',
  });
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.31),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, side: THREE.DoubleSide }),
  );
  labelMesh.position.set(0, -0.78, 0);
  group.add(labelMesh);

  function update(time) {
    leftArmPivot.rotation.z = Math.sin(time * 2.2) * 0.6 + 0.3;
    floatHeart.position.y   = 1.42 + Math.sin(time * 1.8) * 0.06;
    heartMat.opacity        = 0.65 + Math.sin(time * 2.5) * 0.3;
    antLight.intensity      = 0.6 + Math.sin(time * 4) * 0.3;
  }

  return { mats, pointLight, update };
}

// ── Flottbek ──────────────────────────────────────────────────────────────────
function buildFlottbek(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x080f08, light: 0xaaffaa });

  const groundMat = new THREE.MeshStandardMaterial({ color: 0x112211, roughness: 0.9 });
  const ground    = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.35;
  group.add(ground);

  // School building — centred and forward so it's always visible
  const buildMat = new THREE.MeshStandardMaterial({ color: 0x9a8a7a, roughness: 0.82 });
  const building = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.44, 0.32), buildMat);
  building.position.set(0, -0.13, 0.18);
  group.add(building);

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a4535, roughness: 0.78 });
  const roof    = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.28, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 0.11, 0.18);
  group.add(roof);

  const winMat = new THREE.MeshBasicMaterial({ color: 0xfff5c0 });
  [-0.2, 0.2].forEach(x => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.01), winMat);
    win.position.set(x, -0.12, 0.345);
    group.add(win);
  });
  const winGlow = new THREE.PointLight(0xfff5a0, 0.7, 1.1);
  winGlow.position.set(0, -0.12, 0.4);
  group.add(winGlow);

  const doorMat = new THREE.MeshBasicMaterial({ color: 0x3d2a18 });
  const door    = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.17, 0.01), doorMat);
  door.position.set(0, -0.215, 0.345);
  group.add(door);

  // Trees on the SIDES — not blocking the building (negative Z = behind building)
  const treeMat  = new THREE.MeshStandardMaterial({ color: 0x1a4d1a, roughness: 0.8 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4d3520, roughness: 0.9 });
  const treePos  = [[-0.9, -0.3], [-1.1, 0.1], [0.9, -0.35], [1.1, 0.05], [-0.5, -0.9], [0.5, -0.85]];
  treePos.forEach(([tx, tz]) => {
    const h     = 0.48 + Math.abs(tx) * 0.12;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.22, 6), trunkMat);
    trunk.position.set(tx, -0.24, tz);
    group.add(trunk);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.19, h, 7), treeMat);
    leaves.position.set(tx, -0.24 + 0.11 + h / 2, tz);
    group.add(leaves);
  });

  const flottbekTex = textTex(['FLOTTBEK'], {
    w: 512, h: 128, color: '#ff88bb',
    font: '300 68px Cormorant Garamond, Georgia, serif',
    glow: '#ff44aa',
  });
  const flottbekMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 0.52),
    new THREE.MeshBasicMaterial({ map: flottbekTex, transparent: true, side: THREE.DoubleSide }),
  );
  flottbekMesh.position.set(0, 0.85, 0);
  group.add(flottbekMesh);

  const kursMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.27),
    new THREE.MeshBasicMaterial({
      map: textTex(['erster kurs'], {
        w: 320, h: 80, color: 'rgba(242,201,168,0.65)',
        font: 'italic 300 34px Cormorant Garamond, Georgia, serif',
      }),
      transparent: true, side: THREE.DoubleSide,
    }),
  );
  kursMesh.position.set(0, 0.42, 0);
  group.add(kursMesh);

  function update(time) {
    flottbekMesh.position.y = 0.85 + Math.sin(time * 1.2) * 0.03;
    winGlow.intensity = 0.55 + Math.sin(time * 2.5) * 0.18;
  }

  return { mats, pointLight, update };
}

// ── Alsterbank ────────────────────────────────────────────────────────────────
function buildAlster(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x08101a, light: 0x8888ff });

  // Water surface
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x1a2840, metalness: 0.95, roughness: 0.05, transparent: true, opacity: 0.8,
  });
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.55, 48), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.34;
  group.add(water);

  // Bench seat
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x3d2e1e, roughness: 0.85 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.18), benchMat);
  seat.position.set(0, -0.08, 0);
  group.add(seat);

  // Bench back
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.03), benchMat);
  back.position.set(0, 0.07, -0.08);
  group.add(back);

  // Bench legs
  [-0.22, 0.22].forEach(x => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.17), benchMat);
    leg.position.set(x, -0.18, 0);
    group.add(leg);
  });

  // Him: dark sphere sitting on bench left
  const himMat  = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
  const himBody = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), himMat);
  himBody.position.set(-0.16, 0.04, 0);
  group.add(himBody);

  // Her: pink sphere, starts upright, leans over time
  const herMat  = new THREE.MeshBasicMaterial({ color: 0xff88bb });
  const herBody = new THREE.Mesh(new THREE.SphereGeometry(0.082, 12, 12), herMat);
  herBody.position.set(0.1, 0.04, 0);
  group.add(herBody);

  const herLight = new THREE.PointLight(0xff99cc, 0.8, 1.2);
  herLight.position.copy(herBody.position);
  group.add(herLight);

  // Rain lines
  const rainCount = 40;
  const rainPositions = new Float32Array(rainCount * 6);
  for (let i = 0; i < rainCount; i++) {
    const x = (Math.random() - 0.5) * 3.2;
    const y = (Math.random() - 0.5) * 2.5 + 0.5;
    const z = (Math.random() - 0.5) * 1.5;
    rainPositions[i * 6 + 0] = x;
    rainPositions[i * 6 + 1] = y + 0.12;
    rainPositions[i * 6 + 2] = z;
    rainPositions[i * 6 + 3] = x - 0.04;
    rainPositions[i * 6 + 4] = y;
    rainPositions[i * 6 + 5] = z;
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rainMat = new THREE.LineBasicMaterial({
    color: 0xaaccff, transparent: true, opacity: 0.25,
  });
  const rain = new THREE.LineSegments(rainGeo, rainMat);
  group.add(rain);

  let leanStart = null;

  function reset() { leanStart = null; herBody.position.set(0.1, 0.04, 0); }

  function update(time) {
    if (leanStart === null) leanStart = time + 3;
    const leanT = Math.max(0, Math.min((time - leanStart) / 4, 1));
    const ease  = leanT * leanT * (3 - 2 * leanT);

    herBody.position.set(0.1 - ease * 0.14, 0.04 - ease * 0.025, 0);
    herLight.position.copy(herBody.position);

    waterMat.roughness = 0.05 + Math.sin(time * 0.8) * 0.03;
    rain.position.y = ((time * 0.8) % 0.5) * -0.18;
  }

  return { mats, pointLight, update, reset };
}

// ── Café ──────────────────────────────────────────────────────────────────────
function buildCafe(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x18100a, light: 0xf5c8a0 });

  const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.4, metalness: 0.05 });
  const coffeeMat  = new THREE.MeshBasicMaterial({ color: 0x3d1a08 });
  const saucerMat  = new THREE.MeshStandardMaterial({ color: 0xede8e0, roughness: 0.4 });

  // Build one cup at xPos, return steam data
  function addCup(xPos) {
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.21, 0.03, 32), saucerMat.clone());
    saucer.position.set(xPos, -0.22, 0);
    group.add(saucer);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.21, 32), ceramicMat.clone());
    cup.position.set(xPos, -0.075, 0);
    group.add(cup);

    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.135, 32), coffeeMat.clone());
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(xPos, 0.03, 0);
    group.add(disc);

    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.072, 0.018, 8, 18, Math.PI),
      ceramicMat.clone(),
    );
    handle.position.set(xPos + 0.16, -0.075, 0);
    handle.rotation.y = Math.PI / 2;
    group.add(handle);

    // Steam — 3 wisps per cup
    const steams = [];
    for (let i = 0; i < 3; i++) {
      const baseX = xPos + (i - 1) * 0.04;
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.025 + i * 0.008, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }),
      );
      s.position.set(baseX, 0.05, 0);
      group.add(s);
      steams.push({ mesh: s, baseX, offset: i * (Math.PI * 2 / 3) });
    }
    return steams;
  }

  const steamsL = addCup(-0.38);
  const steamsR = addCup( 0.38);
  const allSteams = [...steamsL, ...steamsR];

  // Him — dark sphere to the left of left cup
  const himMat  = new THREE.MeshBasicMaterial({ color: 0x1a1a3a });
  const himBody = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), himMat);
  himBody.position.set(-0.78, -0.06, 0);
  group.add(himBody);

  // Her — pink sphere to the right of right cup
  const herMat  = new THREE.MeshBasicMaterial({ color: 0xff6699 });
  const herBody = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), herMat);
  herBody.position.set(0.78, -0.06, 0);
  group.add(herBody);

  const herLight = new THREE.PointLight(0xff99cc, 1.0, 1.2);
  herLight.position.set(0.78, -0.06, 0.1);
  group.add(herLight);

  // Floating heart between the cups
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0);
  heartShape.bezierCurveTo( 0,  0.06, -0.11,  0.06, -0.11, 0);
  heartShape.bezierCurveTo(-0.11, -0.08, 0, -0.16, 0, -0.20);
  heartShape.bezierCurveTo( 0, -0.16,  0.11, -0.08,  0.11, 0);
  heartShape.bezierCurveTo( 0.11, 0.06,  0, 0.06,  0, 0);
  const heartMat = new THREE.MeshBasicMaterial({
    color: 0xff6688, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
  });
  const floatHeart = new THREE.Mesh(new THREE.ShapeGeometry(heartShape), heartMat);
  floatHeart.position.set(0, 0.55, 0);
  group.add(floatHeart);

  function update(time) {
    allSteams.forEach(({ mesh, baseX, offset }) => {
      const t = ((time * 0.5 + offset) % 1);
      mesh.position.y       = 0.05 + t * 0.45;
      mesh.material.opacity = (t < 0.5 ? t * 2 : (1 - t) * 2) * 0.2;
      mesh.position.x       = baseX + Math.sin(time * 0.9 + offset) * 0.03;
    });

    floatHeart.position.y = 0.55 + Math.sin(time * 1.8) * 0.07;
    heartMat.opacity      = 0.6 + Math.sin(time * 2.2) * 0.27;
    herLight.intensity    = 0.8 + Math.sin(time * 1.5) * 0.25;
  }

  return { mats, pointLight, update };
}

// ── Kunsthalle ────────────────────────────────────────────────────────────────
function buildKunsthalle(group) {
  const { mats, pointLight } = makeBase(group, { color: 0x10100e, light: 0xf0d8c0 });

  const PW = 2.8, PH = 2.0;

  // Subtle rose-gold bloom plane behind photo
  const bloomMat = new THREE.MeshBasicMaterial({
    color: 0xf2c9a8, transparent: true, opacity: 0,
  });
  const bloom = new THREE.Mesh(new THREE.PlaneGeometry(PW + 0.4, PH + 0.4), bloomMat);
  bloom.position.set(0, 0.82, -0.01);
  group.add(bloom);

  // White frame
  const frameMat = new THREE.MeshBasicMaterial({
    color: 0xfff8f2, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(PW + 0.18, PH + 0.18), frameMat);
  frame.position.set(0, 0.82, 0);
  group.add(frame);

  // Photo
  const photoMat = new THREE.MeshBasicMaterial({
    color: 0x888888, side: THREE.DoubleSide, transparent: true, opacity: 0,
  });
  const photoMesh = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), photoMat);
  photoMesh.position.set(0, 0.82, 0.01);
  group.add(photoMesh);

  // Load photo
  const loader = new THREE.TextureLoader();
  loader.load('images/kunsthalle.jpg', tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    photoMat.map = tex;
    photoMat.needsUpdate = true;
  });

  // Track in mats for fade
  mats.push({ mat: bloomMat,  target: 0.06 });
  mats.push({ mat: frameMat,  target: 0.95 });
  mats.push({ mat: photoMat,  target: 1.0 });

  // White "developing" overlay — fades away to reveal the photo (like a Polaroid)
  const devMat = new THREE.MeshBasicMaterial({
    color: 0xfff8f2, transparent: true, opacity: 1.0, side: THREE.DoubleSide,
  });
  const devOverlay = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), devMat);
  devOverlay.position.set(0, 0.82, 0.025);
  group.add(devOverlay);

  // Sparkle sprites
  const sparkles = [];
  for (let i = 0; i < 10; i++) {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xf2c9a8, transparent: true, opacity: 0 }),
    );
    sp.scale.set(0.08, 0.08, 1);
    sp.position.set(
      (Math.random() - 0.5) * 3.4,
      Math.random() * 2.8 - 0.2,
      (Math.random() - 0.5) * 0.3,
    );
    group.add(sp);
    sparkles.push({ sp, offset: Math.random() * Math.PI * 2, speed: 0.22 + Math.random() * 0.3 });
  }

  // Developing timer — reset on each show
  let devStart = null;

  function reset() {
    devStart = null;
    devMat.opacity = 1.0;
    devOverlay.visible = true;
  }

  function update(time) {
    // Photo developing: white overlay fades away over 3.5 s
    if (devStart === null) devStart = time;
    const devT = Math.min((time - devStart) / 3.5, 1);
    devMat.opacity = 1 - devT * devT * (3 - 2 * devT); // smoothstep fade

    // Gentle sway after fully developed
    const sway = Math.sin(time * 0.22) * 0.035 * devT;
    bloom.rotation.y = sway;
    frame.rotation.y = sway;
    photoMesh.rotation.y = sway;
    devOverlay.rotation.y = sway;

    bloomMat.opacity = 0.04 + Math.sin(time * 0.75) * 0.02;

    // Sparkles only visible after photo has developed
    sparkles.forEach(({ sp, offset, speed }) => {
      sp.position.y += speed * 0.003;
      if (sp.position.y > 2.8) sp.position.y = -0.5;
      sp.material.opacity = Math.max(0, Math.sin(time * 1.4 + offset)) * 0.45 * devT;
    });
  }

  return { mats, pointLight, update, reset };
}

// ── Builder map ──────────────────────────────────────────────────────────────
const MEMORY_DEFS = [
  { label: 'Hacker School',  caption: '',           build: buildHackerSchool, color: 0x080c1e },
  { label: 'Flottbek',       caption: '',           build: buildFlottbek,     color: 0x080f08 },
  { label: 'Alster',         caption: 'a rainy day', build: buildAlster,      color: 0x08101a },
  { label: 'Café',           caption: '',           build: buildCafe,         color: 0x18100a },
  { label: 'Kunsthalle',     caption: '',           build: buildKunsthalle,   color: 0x10100e },
];

// ── createMemory ──────────────────────────────────────────────────────────────
function createMemory(scene, def, position) {
  const group = new THREE.Group();
  group.position.copy(position);

  // Rotate group so local +Z faces outward (toward orbiting camera)
  const angle = Math.atan2(position.z, position.x);
  group.rotation.y = Math.PI / 2 - angle;

  group.visible = false;
  scene.add(group);

  const { mats, pointLight, update: buildUpdate, reset: buildReset } = def.build(group);

  let isVisible = false;
  let opacity   = 0;
  const bob     = Math.random() * Math.PI * 2;
  let bobTime   = bob;

  function show() { group.visible = true; isVisible = true; if (buildReset) buildReset(); }
  function hide() { isVisible = false; }

  function update(time) {
    bobTime += 0.007;
    if (!group.visible && opacity < 0.005) return;

    group.visible = true;
    const target = isVisible ? 1 : 0;
    opacity += (target - opacity) * 0.03;

    mats.forEach(({ mat, target: t }) => {
      mat.opacity = opacity * t;
    });
    pointLight.intensity = opacity * 2.2;

    group.position.y = position.y + Math.sin(bobTime) * 0.07;

    if (buildUpdate) buildUpdate(time);

    if (!isVisible && opacity < 0.005) {
      group.visible = false;
      opacity = 0;
    }
  }

  return { group, show, hide, update, label: def.label, caption: def.caption, position };
}

// ── Public API ────────────────────────────────────────────────────────────────
export function createMemories(scene) {
  const dioramas = MEMORY_DEFS.map((def, i) => {
    const a   = (i / MEMORY_DEFS.length) * Math.PI * 2;
    const pos = new THREE.Vector3(Math.cos(a) * RADIUS, -0.5, Math.sin(a) * RADIUS);
    return createMemory(scene, def, pos);
  });

  let current = -1;

  return {
    count:       dioramas.length,
    getLabel:    i => dioramas[i]?.label   ?? '',
    getCaption:  i => dioramas[i]?.caption ?? '',
    getPosition: i => dioramas[i]?.position.clone() ?? new THREE.Vector3(),

    showMemory(index) {
      if (current >= 0 && current !== index) dioramas[current]?.hide();
      current = index;
      if (index >= 0 && index < dioramas.length) dioramas[index].show();
    },

    hideCurrent() {
      if (current >= 0) dioramas[current]?.hide();
    },

    hideAll() {
      dioramas.forEach(d => d.hide());
      current = -1;
    },

    update(time) {
      dioramas.forEach(d => d.update(time));
    },
  };
}
