import * as THREE from 'three';
import { toon, mesh, boil, INK } from './kit.js';
import { catalogue, mascot } from './products.js';

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const euro = (n) => '€' + n.toFixed(2);

// Labels are drawn to canvas, so the marker fonts must be in before we build.
await Promise.race([
  Promise.all([document.fonts.load('40px "Permanent Marker"'), document.fonts.load('40px "Patrick Hand"')]),
  new Promise((r) => setTimeout(r, 2500)),
]).catch(() => {});

// ------------------------------------------------------------------ scene
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
scene.add(new THREE.AmbientLight('#ffffff', 1.5));
const sun = new THREE.DirectionalLight('#ffffff', 2.2);
sun.position.set(3, 6, 5);
scene.add(sun);

const N = catalogue.length;
const STEP = (Math.PI * 2) / N;
const R = 3.1;

// the lazy susan
const ring = new THREE.Group();
scene.add(ring);
ring.add(mesh(new THREE.CylinderGeometry(4.3, 4.3, 0.14, 48), toon('#e4d6b8'), [0, -0.07, 0], 0.05));
const dash = new THREE.Mesh(
  new THREE.RingGeometry(R - 0.02, R + 0.02, 64, 1),
  new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.25 })
);
dash.rotation.x = -Math.PI / 2;
dash.position.y = 0.004;
ring.add(dash);

const shadowGeo = new THREE.CircleGeometry(0.95, 28);
const shadowMat = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.16, depthWrite: false });

const items = catalogue.map((p, i) => {
  const built = p.build();
  const slot = new THREE.Group();
  const a = i * STEP;
  slot.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.006;
  slot.add(shadow, built.group);
  ring.add(slot);
  built.group.traverse((o) => { o.userData.item = i; });
  return { ...p, ...built, slot, shadow, spin: 0, focus: 0 };
});

// the shopkeeper, on a pedestal in the middle
const keeper = mascot();
keeper.group.position.set(0, 2.75, 0);
keeper.group.scale.setScalar(1.05);
scene.add(keeper.group);
scene.add(mesh(new THREE.CylinderGeometry(0.62, 0.75, 1.3, 24), toon('#e4d6b8'), [0, 0.65, 0], 0.045));

// ------------------------------------------------------------------ state
let sel = 0;          // unbounded integer, so the ring never unwinds
let angle = 0;        // current ring rotation
let dragAngle = 0;
const index = () => ((sel % N) + N) % N;

const basket = new Map();
const tag = $('tag');

function showProduct() {
  const p = items[index()];
  document.documentElement.style.setProperty('--accent', p.accent);
  $('pAisle').textContent = p.aisle;
  $('pName').textContent = p.name;
  $('pTagline').textContent = p.tagline;
  $('pDesc').textContent = p.desc;
  $('pPrice').textContent = euro(p.price);
  tag.classList.remove('swap');
  void tag.offsetWidth;
  tag.classList.add('swap');
}

function go(delta) {
  if (!delta) return;
  sel += delta;
  showProduct();
  $('hint').classList.add('gone');
}

function renderBasket() {
  let count = 0, total = 0;
  const lines = $('lines');
  lines.replaceChildren();
  for (const [id, qty] of basket) {
    const p = catalogue.find((c) => c.id === id);
    count += qty; total += qty * p.price;
    const li = document.createElement('li');
    const l = document.createElement('span'); l.textContent = `${qty} x ${p.name}`;
    const r = document.createElement('span'); r.textContent = euro(qty * p.price);
    li.append(l, r);
    lines.append(li);
  }
  if (!count) {
    const li = document.createElement('li');
    li.className = 'empty'; li.textContent = '(nada. como tu nómina)';
    lines.append(li);
  }
  $('basketCount').textContent = count;
  $('total').textContent = euro(total);
}

$('add').addEventListener('click', () => {
  const p = items[index()];
  basket.set(p.id, (basket.get(p.id) || 0) + 1);
  $('payMsg').textContent = '';
  renderBasket();
  keeper.chomp();
  p.hop = 1;
  const b = $('basketBtn');
  b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
});
$('basketBtn').addEventListener('click', () => { $('receipt').hidden = !$('receipt').hidden; });
$('closeReceipt').addEventListener('click', () => { $('receipt').hidden = true; });
$('pay').addEventListener('click', () => {
  $('payMsg').textContent = basket.size
    ? 'TARJETA RECHAZADA. Try the Pocket House.'
    : 'No se puede pagar la nada. Todavía.';
});
$('prev').addEventListener('click', () => go(-1));
$('next').addEventListener('click', () => go(1));
addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') go(-1);
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'Escape') $('receipt').hidden = true;
});

// ------------------------------------------------------------------ pointer
const ray = new THREE.Raycaster();
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, moved: 0 };
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  drag.moved = Math.max(drag.moved, Math.abs(dx));
  dragAngle = (dx / innerWidth) * (innerWidth < 640 ? 2.6 : 1.8);
});
const release = (e) => {
  if (!drag) return;
  canvas.classList.remove('dragging');
  if (drag.moved < 6) {
    // a tap: bring the tapped product to the front
    const ndc = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(items.map((i) => i.group), true)[0];
    if (hit) {
      let d = hit.object.userData.item - index();
      if (d > N / 2) d -= N;
      if (d < -N / 2) d += N;
      go(d);
    }
  } else {
    angle += dragAngle; // keep the ring where the hand left it, then snap
    go(Math.round(-dragAngle / STEP) || (Math.abs(dragAngle) > STEP * 0.18 ? -Math.sign(dragAngle) : 0));
  }
  dragAngle = 0;
  drag = null;
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', () => { angle += dragAngle; dragAngle = 0; drag = null; canvas.classList.remove('dragging'); });

let wheelLock = 0;
addEventListener('wheel', (e) => {
  const now = performance.now();
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (now < wheelLock || Math.abs(d) < 12) return;
  wheelLock = now + 380;
  go(Math.sign(d));
}, { passive: true });

// ------------------------------------------------------------------ layout
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const portrait = camera.aspect < 0.9;
  const halfWidth = portrait ? 2.3 : 5.5; // how much of the ring must stay in view
  const dist = THREE.MathUtils.clamp(halfWidth / (Math.tan(THREE.MathUtils.degToRad(17)) * camera.aspect), 11, 19);
  camera.position.set(0, portrait ? 4.2 : 3.6, R + dist - 3);
  camera.lookAt(0, portrait ? 0.45 : 1.25, 1.2);
  // on wide screens nudge the whole shelf right, away from the price tag
  if (w > 900) camera.setViewOffset(w, h, -w * 0.07, 0, w, h); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ------------------------------------------------------------------ loop
const clock = new THREE.Clock();
let t = 0;
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;
  boil.value = reduceMotion ? 0 : Math.floor(t * 7);

  const target = -sel * STEP;
  angle += (target - angle) * (1 - Math.exp(-dt * 7));
  ring.rotation.y = angle + dragAngle;

  for (let i = 0; i < N; i++) {
    const it = items[i];
    // 1 when this slot faces the camera, 0 a slot away or more
    const facing = Math.cos(ring.rotation.y + i * STEP);
    const f = THREE.MathUtils.smoothstep(facing, Math.cos(STEP), 1);
    it.focus = f;
    it.spin += dt * (reduceMotion ? 0.12 : 0.55) * f;
    if (f < 0.02) it.spin *= 1 - Math.min(1, dt * 4); // unwind when out of the spotlight
    it.hop = Math.max(0, (it.hop || 0) - dt * 2.2);
    const hop = Math.sin((it.hop || 0) * Math.PI) * 0.6;
    it.group.rotation.y = -ring.rotation.y + 0.35 * (1 - f) + it.spin - 0.3 * f;
    it.group.position.y = f * (0.18 + (reduceMotion ? 0 : Math.sin(t * 1.8) * 0.05)) + hop;
    it.group.scale.setScalar(1 + 0.32 * f);
    it.shadow.scale.setScalar((1 + 0.2 * f) * (1 - hop * 0.4));
    it.update?.(t, f);
  }

  keeper.group.rotation.y = Math.sin(t * 0.5) * 0.45 + dragAngle * 0.5 + (target - angle) * 0.6;
  keeper.group.rotation.z = Math.sin(t * 0.9) * 0.04;
  keeper.group.position.y = 2.75 + (reduceMotion ? 0 : Math.sin(t * 1.4) * 0.04);
  keeper.update(t, dt);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

showProduct();
renderBasket();
tag.classList.remove('swap');
tick();
window.__retardino = { go, items }; // handy for poking at it from the console
