import * as THREE from 'three';

const RADIUS = 5;

const MEMORY_DEFS = [
  {
    label:   'Hacker School',
    caption: '"Good thing you stopped pretending."',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Jugend_hackt_Hamburg_2019_-JHHH_-JugendHackt_-JHHH19_%2848715764043%29.jpg/960px-Jugend_hackt_Hamburg_2019_-JHHH_-JugendHackt_-JHHH19_%2848715764043%29.jpg',
    color: '#0a0f2e', icon: '🤖',
  },
  {
    label:   'Wilhelmsburg',
    caption: 'Der Rückweg, der nie weit genug war.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Wilhelmsburg%2C_Hamburg%2C_Germany_%28Unsplash%29.jpg/960px-Wilhelmsburg%2C_Hamburg%2C_Germany_%28Unsplash%29.jpg',
    color: '#1a100a', icon: '🚆',
  },
  {
    label:   'Flottbek',
    caption: 'Alles andere war weit weg.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Jenischpark_27Apr2020_03.jpg/960px-Jenischpark_27Apr2020_03.jpg',
    color: '#0a1a0a', icon: '🌳',
  },
  {
    label:   'Alsterbank',
    caption: 'Unsere Bank.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Sonnenuntergang_auf_Binnenalster_-_Hamburg.jpg/960px-Sonnenuntergang_auf_Binnenalster_-_Hamburg.jpg',
    color: '#0a1020', icon: '🌊',
  },
  {
    label:   'Regen',
    caption: 'Es hat geregnet. Dir war es egal.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Frankfurt_-_49830061946.jpg/960px-Frankfurt_-_49830061946.jpg',
    color: '#0d0d18', icon: '🌧️',
  },
  {
    label:   'Café',
    caption: 'Zwei Tassen. Keine Uhr.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Caf%C3%A9_Paris_%28Hamburg%29_%28165454837%29.jpg/960px-Caf%C3%A9_Paris_%28Hamburg%29_%28165454837%29.jpg',
    color: '#1a0e08', icon: '☕',
  },
  {
    label:   'Kunsthalle',
    caption: 'Du hättest ewig erklärt. Ich hätte ewig zugehört.',
    photo:   'images/kunsthalle.jpg',   // personal photo
    color: '#12100e', icon: '🖼️',
  },
  {
    label:   'Erster Kuss',
    caption: '.',
    photo:   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Sunset_beach_couple_%28Unsplash%29.jpg/960px-Sunset_beach_couple_%28Unsplash%29.jpg',
    color: '#18080e', icon: '✨',
  },
];

function _fallbackTexture(icon, color) {
  const c   = document.createElement('canvas');
  c.width   = 512;
  c.height  = 384;
  const ctx = c.getContext('2d');
  // gradient background
  const grad = ctx.createRadialGradient(256, 192, 0, 256, 192, 280);
  grad.addColorStop(0, color);
  grad.addColorStop(1, '#000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 384);
  // emoji
  ctx.font = '110px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 256, 192);
  return new THREE.CanvasTexture(c);
}

function createPhotoDiorama(scene, { label, caption, photo, color, icon, position }) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.visible = false;

  // ── Island base ──────────────────────────────────────────────────────────
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1a0a2e, roughness: 0.9, metalness: 0.1,
    transparent: true, opacity: 0,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.1, 0.28, 32), baseMat);
  base.position.y = -0.5;
  group.add(base);

  // Rose-gold rim
  const rimMat = new THREE.MeshBasicMaterial({ color: 0xf2c9a8, transparent: true, opacity: 0 });
  group.add(new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.05, 8, 64), rimMat));

  // Soft mist halo below island
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0xd4a8f0, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  const mist = new THREE.Mesh(new THREE.CircleGeometry(2.8, 32), mistMat);
  mist.rotation.x = -Math.PI / 2;
  mist.position.y = -0.72;
  group.add(mist);

  // ── Photo panel ──────────────────────────────────────────────────────────
  const PW = 2.6, PH = 2.0;

  // Panel material with emoji fallback, replaced when photo loads
  const panelMat = new THREE.MeshBasicMaterial({
    map: _fallbackTexture(icon, color),
    side: THREE.DoubleSide,
  });
  if (photo) {
    const loader = new THREE.TextureLoader();
    loader.load(photo, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      panelMat.map = tex;
      panelMat.needsUpdate = true;
    }, undefined, () => { /* keep fallback */ });
  }

  // White polaroid-style frame (slightly larger, sits behind photo)
  const frameMat = new THREE.MeshBasicMaterial({
    color: 0xfff6ee, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(PW + 0.22, PH + 0.38), frameMat);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH * 0.88), panelMat);

  // Orient outward from center so camera (at pos * 2) sees the front face
  const ang   = Math.atan2(position.z, position.x);
  const panelY = Math.PI / 2 - ang;

  // Photo sits in the upper area of the frame (polaroid style — more white at bottom)
  frame.rotation.y = panelY;
  frame.position.set(0, 0.75, 0);

  panel.rotation.y = panelY;
  // Shift panel slightly outward so it's in front of the white frame
  panel.position.set(
    Math.cos(ang) * 0.015,
    0.82,
    Math.sin(ang) * 0.015,
  );

  group.add(frame);
  group.add(panel);

  // Subtle glow light above
  const light = new THREE.PointLight(0xf5c8a0, 0, 7);
  light.position.set(0, 2.5, 0);
  group.add(light);

  scene.add(group);

  // ── Animation state ──────────────────────────────────────────────────────
  let visible = false;
  let opacity = 0;
  let bob     = Math.random() * Math.PI * 2;

  function show() { group.visible = true; visible = true; }
  function hide() { visible = false; }

  function update(time) {
    bob += 0.007;
    if (!group.visible && opacity < 0.005) return;

    group.visible = true;
    const target = visible ? 1 : 0;
    opacity += (target - opacity) * 0.03;

    baseMat.opacity  = opacity * 0.9;
    rimMat.opacity   = opacity * 0.65;
    mistMat.opacity  = opacity * 0.10;
    frameMat.opacity = opacity * 0.97;
    light.intensity  = opacity * 2.2;

    group.position.y = position.y + Math.sin(bob) * 0.07;

    if (!visible && opacity < 0.005) {
      group.visible = false;
      opacity = 0;
    }
  }

  return { group, show, hide, update, label, caption, position };
}

// ── Public API ────────────────────────────────────────────────────────────
export function createMemories(scene) {
  const dioramas = MEMORY_DEFS.map((def, i) => {
    const angle    = (i / MEMORY_DEFS.length) * Math.PI * 2;
    const position = new THREE.Vector3(
      Math.cos(angle) * RADIUS,
      -0.5,
      Math.sin(angle) * RADIUS,
    );
    return createPhotoDiorama(scene, { ...def, position });
  });

  let current = -1;

  return {
    count:       dioramas.length,
    getLabel:    i => dioramas[i]?.label   ?? '',
    getCaption:  i => dioramas[i]?.caption ?? '',
    getPosition: i => dioramas[i]?.position.clone() ?? new THREE.Vector3(),

    showMemory(index) {
      if (current >= 0) dioramas[current]?.hide();
      current = index;
      if (index >= 0 && index < dioramas.length) dioramas[index].show();
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
