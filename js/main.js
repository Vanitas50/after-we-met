import * as THREE from 'three';
import { createWorld } from './world.js';
import { createHeart } from './heart.js';
import { createParticles } from './particles.js';
import { createMemories } from './memories/index.js';
import { createStoryboard } from './storyboard.js';
import { createAudio } from './audio.js';

// ── Renderer ───────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ── Scene ──────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// ── Camera ────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 0, 10);

// ── Lighting ──────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x0a0a1a, 1);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xf5d9c8, 1.5);
keyLight.position.set(3, 6, 4);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x7070ff, 2, 20);
rimLight.position.set(-4, 2, -4);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0xff7799, 1, 15);
fillLight.position.set(3, -2, 5);
scene.add(fillLight);

// ── Sub-systems ───────────────────────────────────────────────────────────
const world     = createWorld(scene);
const heartSys  = createHeart(scene);
const particles = createParticles(scene);
const memories  = createMemories(scene);
const audio     = createAudio();

// Heart starts hidden until the HEART_FORM phase
heartSys.group.visible = false;

// ── Storyboard ────────────────────────────────────────────────────────────
const storyboard = createStoryboard({
  camera,
  heart: heartSys,
  particles,
  audio,
  memories,
  onFinale: () => console.log('After We Met — fin.'),
});

// ── Raycaster (click on heart) ────────────────────────────────────────────
const raycaster  = new THREE.Raycaster();
const pointer    = new THREE.Vector2();

const startScreen = document.getElementById('start-screen');
const weiterBtn   = document.getElementById('weiter-btn');

// Weiter button: advance memory
if (weiterBtn) {
  weiterBtn.addEventListener('pointerdown', e => {
    e.stopPropagation();
    storyboard.handleWeiterClick();
  });
}

function onPointerDown(e) {
  pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  // Hide start screen on first click
  if (startScreen && !startScreen.classList.contains('hidden')) {
    startScreen.classList.add('hidden');
  }

  // Start storyboard on very first click anywhere
  storyboard.start(scene);

  // Check if clicking the heart
  const heartMeshes = [];
  heartSys.group.traverse(obj => { if (obj.isMesh) heartMeshes.push(obj); });
  const hits = raycaster.intersectObjects(heartMeshes);
  if (hits.length > 0) {
    storyboard.handleHeartClick();
  }
}

window.addEventListener('pointerdown', onPointerDown);

// ── Mouse parallax ────────────────────────────────────────────────────────
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── Resize ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Render loop ────────────────────────────────────────────────────────────
let lastTime = 0;

function animate(now) {
  requestAnimationFrame(animate);

  const time  = now * 0.001;
  const delta = Math.min(time - lastTime, 0.1);
  lastTime = time;

  // World
  world.update(time);

  // Heart
  heartSys.update(time, delta);

  // Particles
  particles.update(delta);

  // Memories
  memories.update(time);

  // Storyboard
  storyboard.update(delta, scene);

  // Subtle camera parallax from mouse
  camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.02;
  camera.position.y += (-mouse.y * 0.2 - camera.position.y + 0.3) * 0.02;

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
