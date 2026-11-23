// Shared "sketchbook" rendering kit: flat toon colours, wobbly ink outlines,
// see-through plastic, and hand-lettered canvas labels.
import * as THREE from 'three';

export const INK = '#151515';
export const PAPER = '#fffdf6';

const ramp = new THREE.DataTexture(new Uint8Array([120, 200, 255]), 3, 1, THREE.RedFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
ramp.needsUpdate = true;

export const toon = (color, opts = {}) =>
  new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...opts });

// One shared outline material. `boil.value` is stepped a few times a second so
// the lines jitter like a redrawn sketch.
export const boil = { value: 0 };
const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
inkMat.onBeforeCompile = (sh) => {
  sh.uniforms.uBoil = boil;
  sh.vertexShader = 'uniform float uBoil;\n' + sh.vertexShader.replace(
    '#include <begin_vertex>',
    '#include <begin_vertex>\ntransformed += 0.008 * sin(position.yzx * 7.0 + uBoil * vec3(1.3, 2.1, 1.7));'
  );
};

const noRaycast = () => {};

// Inverted-hull outline: a back-faced copy grown by `t` world-ish units per side.
function hull(mesh, t, geometry = mesh.geometry) {
  geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  const c = geometry.boundingBox.getCenter(new THREE.Vector3());
  const o = new THREE.Mesh(geometry, inkMat);
  const s = new THREE.Vector3(
    1 + (2 * t) / Math.max(size.x * mesh.scale.x, 1e-3),
    1 + (2 * t) / Math.max(size.y * mesh.scale.y, 1e-3),
    1 + (2 * t) / Math.max(size.z * mesh.scale.z, 1e-3)
  );
  o.scale.copy(s);
  o.position.set(c.x * (1 - s.x), c.y * (1 - s.y), c.z * (1 - s.z));
  o.raycast = noRaycast;
  return o;
}

export function ink(mesh, t = 0.035, geometry) {
  const o = hull(mesh, t, geometry);
  if (geometry) { o.scale.set(1, 1, 1); o.position.set(0, 0, 0); } // pre-fattened geometry
  mesh.add(o);
  return mesh;
}

export function mesh(geometry, material, pos, t = 0.035) {
  const m = new THREE.Mesh(geometry, material);
  if (pos) m.position.set(...pos);
  if (t) ink(m, t);
  return m;
}

// Clear plastic with an ink rim. A depth-only mask stops the outline hull from
// showing through the tinted shell, while anything inside still renders first.
export function glass(geometry, pos, color = '#bfe6ff', opacity = 0.28, t = 0.035) {
  const g = new THREE.Group();
  const mask = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ colorWrite: false }));
  mask.renderOrder = 1;
  const rim = hull(mask, t);
  rim.renderOrder = 2;
  const shell = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
  );
  shell.renderOrder = 3;
  shell.raycast = noRaycast;
  g.add(mask, rim, shell);
  if (pos) g.position.set(...pos);
  return g;
}

// ---------- canvas labels ----------
export const font = (px, family = 'Permanent Marker') =>
  `${px}px "${family}", "Comic Sans MS", cursive`;

export function label(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.lineJoin = x.lineCap = 'round';
  draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function write(x, str, cx, cy, px, o = {}) {
  x.save();
  x.translate(cx, cy);
  if (o.rot) x.rotate(o.rot);
  x.font = font(px, o.family);
  x.textAlign = o.align || 'center';
  x.textBaseline = 'middle';
  if (o.stroke) {
    x.strokeStyle = o.stroke;
    x.lineWidth = o.sw || px * 0.22;
    x.strokeText(str, 0, 0, o.max);
  }
  x.fillStyle = o.color || INK;
  x.fillText(str, 0, 0, o.max);
  x.restore();
}

export function frame(x, w, h, bg, lw = 10) {
  x.fillStyle = bg;
  x.fillRect(0, 0, w, h);
  x.strokeStyle = INK;
  x.lineWidth = lw;
  x.strokeRect(lw * 1.5, lw * 1.5, w - lw * 3, h - lw * 3);
}

// Material array for a BoxGeometry: [+x, -x, +y, -y, +z, -z]
export function boxMats(base, faces = {}) {
  return ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((k) =>
    faces[k] ? toon('#ffffff', { map: faces[k] }) : toon(base)
  );
}
