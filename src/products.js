// The Retardino catalogue. Each builder returns a THREE.Group standing on y = 0
// plus an optional update(t, focus) for its little animation (focus: 0..1).
import * as THREE from 'three';
import { INK, PAPER, toon, ink, mesh, glass, label, write, frame, boxMats } from './kit.js';

const TAU = Math.PI * 2;

// ---------------------------------------------------------------- Pocket House
function pocketHouse() {
  const g = new THREE.Group();
  const bag = '#f6f0df';

  const wall = (door) => label(512, 432, (x, w, h) => {
    x.fillStyle = bag; x.fillRect(0, 0, w, h);
    x.strokeStyle = INK; x.lineWidth = 9;
    const win = (wx, wy) => {
      x.fillStyle = '#9fd8ff';
      x.fillRect(wx, wy, 120, 120); x.strokeRect(wx, wy, 120, 120);
      x.beginPath(); x.moveTo(wx + 60, wy); x.lineTo(wx + 60, wy + 120);
      x.moveTo(wx, wy + 60); x.lineTo(wx + 120, wy + 60); x.stroke();
    };
    if (door) {
      win(70, 130);
      x.fillStyle = '#ff5a36';
      x.beginPath(); x.roundRect(310, 190, 120, 250, [60, 60, 0, 0]); x.fill(); x.stroke();
      x.fillStyle = INK; x.beginPath(); x.arc(405, 330, 9, 0, TAU); x.fill();
    } else {
      win(196, 150);
    }
    // tea-bag crinkles
    x.lineWidth = 5; x.globalAlpha = 0.45;
    x.beginPath(); x.moveTo(20, 50); x.lineTo(120, 80); x.lineTo(230, 40); x.lineTo(360, 85); x.lineTo(490, 45); x.stroke();
  });
  const top = label(256, 256, (x, w, h) => {
    x.fillStyle = bag; x.fillRect(0, 0, w, h);
    x.strokeStyle = INK; x.lineWidth = 4; x.globalAlpha = 0.45;
    for (let i = 0; i < 5; i++) {
      x.beginPath(); x.moveTo(20, 40 + i * 45); x.quadraticCurveTo(128, 10 + i * 45 + (i % 2) * 50, 236, 40 + i * 45); x.stroke();
    }
  });
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.1, 1.3),
    boxMats(bag, { pz: wall(true), px: wall(false), nx: wall(false), nz: wall(false), py: top })
  );
  body.position.y = 0.55;
  ink(body);
  g.add(body);

  g.add(mesh(new THREE.BoxGeometry(0.16, 0.05, 0.1), toon('#b9b9b9'), [0.56, 1.12, 0], 0.02)); // staple

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.6, 1.13, 0), new THREE.Vector3(0.95, 1.2, 0.15),
    new THREE.Vector3(1.12, 0.75, 0.35), new THREE.Vector3(1.02, 0.42, 0.5),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.018, 6), new THREE.MeshBasicMaterial({ color: INK })));

  const tagTex = label(256, 320, (x, w, h) => {
    frame(x, w, h, '#ffd23f', 8);
    write(x, 'POCKET', w / 2, 110, 54);
    write(x, 'HOUSE', w / 2, 170, 54);
    write(x, '1 hab.', w / 2, 250, 40, { family: 'Patrick Hand' });
  });
  const tag = new THREE.Group();
  tag.position.set(1.02, 0.42, 0.5);
  const card = mesh(new THREE.BoxGeometry(0.34, 0.42, 0.03), boxMats('#ffd23f', { pz: tagTex, nz: tagTex }), [0, -0.21, 0], 0.025);
  tag.add(card);
  g.add(tag);

  return { group: g, update: (t) => { tag.rotation.z = Math.sin(t * 2.2) * 0.25; tag.rotation.x = Math.cos(t * 1.7) * 0.15; } };
}

// ------------------------------------------------------- Concejal de Urbanismo
function concejal() {
  const g = new THREE.Group();
  const red = '#ff5a36';

  const front = label(512, 760, (x, w, h) => {
    frame(x, w, h, red, 12);
    x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 8;
    x.beginPath(); x.roundRect(196, 36, 120, 34, 17); x.fill(); x.stroke(); // hang slot
    write(x, 'CONCEJAL', w / 2, 128, 76, { color: PAPER, stroke: INK, max: 440 });
    write(x, 'DE URBANISMO', w / 2, 690, 54, { color: '#ffd23f', stroke: INK, max: 440 });
    // starburst
    x.save(); x.translate(420, 215); x.rotate(0.3);
    x.fillStyle = '#ffd23f'; x.beginPath();
    for (let i = 0; i < 20; i++) { const r = i % 2 ? 44 : 64; x.lineTo(Math.cos(i / 20 * TAU) * r, Math.sin(i / 20 * TAU) * r); }
    x.closePath(); x.fill(); x.lineWidth = 6; x.stroke();
    write(x, '¡NEW!', 0, 0, 30);
    x.restore();
  });
  const back = label(512, 760, (x, w, h) => {
    frame(x, w, h, PAPER, 12);
    write(x, 'INCLUYE:', w / 2, 120, 56);
    ['· 1 concejal', '· 1 saco (lleno)', '· 0 escrúpulos', '· firma no incluida'].forEach((s, i) =>
      write(x, s, 70, 230 + i * 80, 50, { family: 'Patrick Hand', align: 'left' }));
    write(x, 'Colecciónalos todos', w / 2, 640, 44, { family: 'Patrick Hand' });
  });
  const card = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.93, 0.05), boxMats(red, { pz: front, nz: back }));
  card.position.y = 0.965;
  ink(card);
  g.add(card);

  // the little man
  const man = new THREE.Group();
  const suit = toon('#2b3a67'), skin = toon('#f1c7a1');
  const part = (geo, mat, p, t = 0.022) => { const m = mesh(geo, mat, p, t); man.add(m); return m; };
  part(new THREE.CapsuleGeometry(0.075, 0.2, 4, 10), suit, [-0.1, 0.17, 0]);
  part(new THREE.CapsuleGeometry(0.075, 0.2, 4, 10), suit, [0.1, 0.17, 0]);
  const belly = part(new THREE.SphereGeometry(0.25, 20, 14), suit, [0, 0.55, 0]);
  belly.scale.set(1, 1.05, 0.62);
  const armL = part(new THREE.CapsuleGeometry(0.06, 0.2, 4, 10), suit, [-0.25, 0.6, 0.06]); armL.rotation.z = -0.9;
  const armR = part(new THREE.CapsuleGeometry(0.06, 0.2, 4, 10), suit, [0.25, 0.6, 0.06]); armR.rotation.z = 0.9;
  part(new THREE.SphereGeometry(0.16, 18, 14), skin, [0, 0.93, 0.02]);
  part(new THREE.SphereGeometry(0.04, 10, 8), skin, [0, 0.9, 0.17], 0.015); // nose
  part(new THREE.ConeGeometry(0.045, 0.2, 4), toon('#ff5a36'), [0, 0.64, 0.155], 0.012).rotation.x = Math.PI;
  const eye = new THREE.MeshBasicMaterial({ color: INK });
  man.add(new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), eye).translateX(-0.06).translateY(0.97).translateZ(0.16));
  man.add(new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), eye).translateX(0.06).translateY(0.97).translateZ(0.16));
  const sackTex = label(128, 128, (x, w, h) => { x.fillStyle = '#d9c08a'; x.fillRect(0, 0, w, h); write(x, '€', w * 0.25, h / 2, 70); write(x, '€', w * 0.75, h / 2, 70); });
  const sack = part(new THREE.SphereGeometry(0.13, 16, 12), toon('#ffffff', { map: sackTex }), [0, 0.5, 0.2]);
  sack.rotation.y = -Math.PI / 2;
  man.position.set(0, 0.34, 0.1);
  g.add(man);

  g.add(glass(new THREE.BoxGeometry(0.9, 1.3, 0.4), [0, 0.9, 0.225], '#d7efff', 0.26, 0.03));

  return { group: g, update: (t, f) => { man.rotation.z = Math.sin(t * 5) * 0.06 * f; sack.position.y = 0.5 + Math.abs(Math.sin(t * 5)) * 0.03 * f; } };
}

// ----------------------------------------------------------- Agua que te roban
function agua() {
  const g = new THREE.Group();
  const blue = '#2f6bff';

  const water = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1, 1.0), toon('#4fa8ff'));
  g.add(water);

  const sticker = label(512, 256, (x, w, h) => {
    frame(x, w, h, PAPER, 10);
    write(x, 'AGUA', w / 2, 92, 110, { color: blue, stroke: INK, sw: 14 });
    write(x, 'que te roban', w / 2, 192, 54);
  });
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.43), toon('#ffffff', { map: sticker }));
  lab.position.set(0, 0.62, 0.556);
  g.add(lab);
  const lab2 = lab.clone(); lab2.position.z = -0.556; lab2.rotation.y = Math.PI; g.add(lab2);

  g.add(glass(new THREE.BoxGeometry(1.1, 1.1, 1.1), [0, 0.55, 0]));
  const shoulder = new THREE.CylinderGeometry(0.24, 0.55 * Math.SQRT2, 0.34, 4);
  shoulder.rotateY(Math.PI / 4);
  g.add(glass(shoulder, [0, 1.27, 0]));
  g.add(glass(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 16), [0, 1.5, 0]));
  g.add(mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.15, 18), toon(blue), [0, 1.63, 0], 0.03));

  // someone is always drinking it
  const straw = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), toon('#ff5a36'), [0.75, 1.3, 0], 0.02);
  straw.rotation.z = 0.9;
  g.add(straw);

  return {
    group: g,
    update: (t, f) => {
      const cycle = (t * 0.16) % 1; // drains slowly, refills at your expense
      const level = 0.12 + 0.86 * (cycle < 0.85 ? 1 - cycle / 0.85 : (cycle - 0.85) / 0.15);
      water.scale.y = level;
      water.position.y = 0.05 + level / 2;
      straw.position.y = 1.3 + Math.sin(t * 9) * 0.015 * f;
    },
  };
}

// ----------------------------------------------------------------- Legal Loops
function legalLoops() {
  const g = new THREE.Group();
  const yellow = '#ffd23f';
  const loopColors = ['#ff5a36', '#2f6bff', '#3ccf7a', '#ff7ab6', '#9b5cff', '#ffffff'];

  const drawLoop = (x, cx, cy, r, col) => {
    x.strokeStyle = INK; x.lineWidth = r * 0.95; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke();
    x.strokeStyle = col; x.lineWidth = r * 0.6; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke();
  };
  const front = label(512, 760, (x, w, h) => {
    frame(x, w, h, yellow, 12);
    write(x, 'LEGAL', 170, 96, 60, { rot: -0.08 });
    write(x, 'LOOPS', w / 2, 200, 136, { color: '#ff5a36', stroke: INK, sw: 22, rot: -0.05, max: 450 });
    // bowl
    x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 10;
    x.beginPath(); x.ellipse(256, 450, 170, 40, 0, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(86, 450); x.quadraticCurveTo(256, 690, 426, 450); x.fill(); x.stroke();
    [[190, 430], [260, 410], [320, 440], [240, 455], [150, 350], [370, 330], [300, 300], [100, 290], [430, 400]]
      .forEach(([a, b], i) => drawLoop(x, a, b, 20, loopColors[i % 5]));
    // spoon
    x.lineWidth = 14; x.beginPath(); x.moveTo(350, 430); x.lineTo(450, 300); x.stroke();
    write(x, '¡CONSIGUE UNA', w / 2, 650, 40, { max: 440 });
    write(x, 'CONCESIÓN DE SUELO!', w / 2, 700, 40, { max: 440 });
  });
  const back = label(512, 760, (x, w, h) => {
    frame(x, w, h, PAPER, 12);
    write(x, 'Nutrition Facts', w / 2, 100, 58);
    x.fillRect(50, 140, 412, 10);
    [['Loopholes', '100%'], ['Ethics', '0%'], ['Fibre (moral)', '0g'], ['Recalificación', '12g'], ['Sobres', '2 uds.'], ['Sugar', 'sí']]
      .forEach(([k, v], i) => {
        const y = 210 + i * 80;
        write(x, k, 60, y, 46, { family: 'Patrick Hand', align: 'left' });
        write(x, v, 452, y, 46, { family: 'Patrick Hand', align: 'right' });
        x.fillRect(50, y + 36, 412, 3);
      });
    write(x, '* may contain traces of law', w / 2, 705, 30, { family: 'Patrick Hand' });
  });
  const side = label(192, 760, (x, w, h) => {
    x.fillStyle = '#ff5a36'; x.fillRect(0, 0, w, h);
    write(x, 'LEGAL LOOPS', w / 2, h / 2, 84, { rot: -Math.PI / 2, color: PAPER, stroke: INK });
  });
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.75, 0.45), boxMats(yellow, { pz: front, nz: back, px: side, nx: side }));
  box.position.y = 0.875;
  ink(box);
  g.add(box);

  const geo = new THREE.TorusGeometry(0.1, 0.045, 8, 18);
  const fat = new THREE.TorusGeometry(0.1, 0.07, 8, 18);
  const loops = loopColors.map((c, i) => {
    const m = new THREE.Mesh(geo, toon(c));
    ink(m, 0, fat);
    m.userData.phase = (i / loopColors.length) * TAU;
    g.add(m);
    return m;
  });

  return {
    group: g,
    update: (t, f) => {
      loops.forEach((m, i) => {
        const a = m.userData.phase + t * 0.9;
        const r = 0.95 + 0.1 * Math.sin(t * 1.3 + i);
        m.position.set(Math.cos(a) * r, 1.0 + Math.sin(a * 2 + i) * 0.45, Math.sin(a) * r);
        m.rotation.set(t * 1.1 + i, t * 0.8 + i * 2, 0);
        m.scale.setScalar(0.35 + 0.65 * f);
      });
    },
  };
}

// --------------------------------------------------------------- Milk of Tears
function milk() {
  const g = new THREE.Group();
  const blue = '#2f6bff';

  const tear = (x, cx, cy, s) => {
    x.fillStyle = '#4fa8ff'; x.strokeStyle = INK; x.lineWidth = 7;
    x.beginPath(); x.moveTo(cx, cy - s * 1.5); x.quadraticCurveTo(cx + s * 1.3, cy + s * 0.3, cx, cy + s);
    x.quadraticCurveTo(cx - s * 1.3, cy + s * 0.3, cx, cy - s * 1.5); x.fill(); x.stroke();
  };
  const front = label(512, 740, (x, w, h) => {
    frame(x, w, h, PAPER, 12);
    x.fillStyle = blue; x.fillRect(18, 18, w - 36, 150);
    write(x, 'MILK', w / 2, 96, 120, { color: PAPER, stroke: INK, sw: 16 });
    write(x, 'OF', w / 2, 240, 70);
    write(x, 'TEARS', w / 2, 350, 124, { color: blue, stroke: INK, sw: 16, max: 440 });
    tear(x, 256, 540, 60);
    tear(x, 130, 600, 30); tear(x, 390, 610, 34);
    write(x, '100% local', w / 2, 690, 44, { family: 'Patrick Hand' });
  });
  const missing = label(512, 740, (x, w, h) => {
    frame(x, w, h, PAPER, 12);
    write(x, 'MISSING', w / 2, 100, 96, { color: '#ff5a36', stroke: INK, sw: 14, max: 440 });
    x.fillStyle = '#e8e2d2'; x.strokeStyle = INK; x.lineWidth = 9;
    x.fillRect(116, 170, 280, 340); x.strokeRect(116, 170, 280, 340);
    // the local
    x.fillStyle = PAPER;
    x.beginPath(); x.arc(256, 290, 62, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(150, 510); x.quadraticCurveTo(256, 330, 362, 510); x.fill(); x.stroke();
    x.fillStyle = INK;
    x.beginPath(); x.arc(234, 280, 7, 0, TAU); x.arc(278, 280, 7, 0, TAU); x.fill();
    x.lineWidth = 6; x.beginPath(); x.arc(256, 328, 20, Math.PI * 1.15, Math.PI * 1.85); x.stroke();
    write(x, 'HAVE YOU SEEN', w / 2, 570, 44);
    write(x, 'THIS LOCAL?', w / 2, 622, 44);
    write(x, 'last seen: before the rent went up', w / 2, 690, 30, { family: 'Patrick Hand', max: 440 });
  });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.9), boxMats(PAPER, { pz: front, nz: front, px: missing, nx: missing }));
  box.position.y = 0.65;
  ink(box);
  g.add(box);

  const tri = new THREE.Shape();
  tri.moveTo(-0.45, 0); tri.lineTo(0.45, 0); tri.lineTo(0, 0.36); tri.closePath();
  const gable = new THREE.ExtrudeGeometry(tri, { depth: 0.9, bevelEnabled: false });
  gable.translate(0, 0, -0.45);
  gable.rotateY(Math.PI / 2);
  g.add(mesh(gable, toon(blue), [0, 1.3, 0]));
  g.add(mesh(new THREE.BoxGeometry(0.9, 0.16, 0.05), toon(PAPER), [0, 1.72, 0], 0.03));

  const dropGeo = new THREE.SphereGeometry(0.07, 12, 10);
  dropGeo.scale(1, 1.35, 1);
  const drops = [0, 0.5].map((p) => { const d = mesh(dropGeo, toon('#4fa8ff'), null, 0.02); d.userData.p = p; g.add(d); return d; });

  return {
    group: g,
    update: (t, f) => {
      drops.forEach((d, i) => {
        const k = (t * 0.7 + d.userData.p) % 1;
        d.position.set(i ? -0.5 : 0.5, 1.5 - k * k * 1.45, 0.1);
        d.scale.setScalar(f * Math.min(1, k * 6) * (k > 0.9 ? (1 - k) * 10 : 1) + 0.001);
      });
    },
  };
}

// ------------------------------------------------------------------- catalogue
export const catalogue = [
  {
    id: 'pocket-house', build: pocketHouse, accent: '#ffd23f',
    aisle: 'Pasillo 1 · Vivienda',
    name: 'Pocket House', tagline: 'The one you can afford!',
    desc: 'One-bedroom tea bag with natural light and a string attached. Steep for 30 years.',
    price: 2.49,
  },
  {
    id: 'concejal', build: concejal, accent: '#ff5a36',
    aisle: 'Pasillo 2 · Juguetes',
    name: 'Concejal de Urbanismo', tagline: '',
    desc: 'Figura de acción. Brazos articulados para firmar. El saco viene lleno; la firma se vende aparte.',
    price: 29.99,
  },
  {
    id: 'agua', build: agua, accent: '#4fa8ff',
    aisle: 'Pasillo 3 · Bebidas',
    name: 'Agua que te roban', tagline: '',
    desc: 'Agua mineral de tu propio acuífero. Mira el nivel: alguien ya se la está bebiendo.',
    price: 3.5,
  },
  {
    id: 'legal-loops', build: legalLoops, accent: '#3ccf7a',
    aisle: 'Pasillo 4 · Desayuno',
    name: 'Legal Loops', tagline: '¡Consigue una concesión de suelo!',
    desc: 'Part of a balanced loophole. Check the back of the box for the nutrition facts.',
    price: 4.2,
  },
  {
    id: 'milk-of-tears', build: milk, accent: '#ff7ab6',
    aisle: 'Pasillo 5 · Lácteos',
    name: 'Milk of Tears', tagline: 'Milking the locals',
    desc: 'Fresh, whole, slightly salty. Have you seen the local on the side of the carton?',
    price: 1.1,
  },
];

// ---------------------------------------------------------------------- mascot
export function mascot() {
  const g = new THREE.Group();
  const green = toon('#6fd69a');
  const add = (m) => { g.add(m); return m; };

  const head = add(mesh(new THREE.SphereGeometry(0.8, 28, 20), green, [0, 0, 0], 0.045));
  head.scale.set(0.95, 1.05, 0.95);
  add(mesh(new THREE.SphereGeometry(0.5, 22, 16), green, [0, 0.72, -0.12], 0.045));
  const snout = add(mesh(new THREE.SphereGeometry(0.5, 22, 16), green, [0, -0.02, 0.62], 0.045));
  snout.scale.set(1.05, 0.62, 1.1);
  add(mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: INK }), [-0.14, 0.14, 1.08], 0));
  add(mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: INK }), [0.14, 0.14, 1.08], 0));

  const jaw = new THREE.Group();
  jaw.position.set(0, -0.3, 0.1);
  const chin = mesh(new THREE.SphereGeometry(0.42, 20, 14), green, [0, -0.08, 0.45], 0.045);
  chin.scale.set(1, 0.5, 1.15);
  jaw.add(chin);
  const tongue = mesh(new THREE.SphereGeometry(0.22, 14, 10), toon('#ff7ab6'), [0, 0.06, 0.6], 0.025);
  tongue.scale.set(1, 0.4, 1.3);
  jaw.add(tongue);
  g.add(jaw);
  add(mesh(new THREE.SphereGeometry(0.36, 16, 12), toon('#7a1f2b'), [0, -0.28, 0.42], 0));

  for (const s of [-1, 1]) {
    add(mesh(new THREE.SphereGeometry(0.24, 18, 14), toon('#ffffff'), [0.36 * s, 0.38, 0.56], 0.035));
    add(mesh(new THREE.SphereGeometry(0.09, 12, 10), new THREE.MeshBasicMaterial({ color: INK }), [0.4 * s, 0.38, 0.775], 0));
  }

  add(mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.6, 20), green, [0, -1.0, -0.05], 0.045));
  const collarGeo = new THREE.TorusGeometry(0.5, 0.11, 10, 28);
  const collar = new THREE.Mesh(collarGeo, toon('#ff5a36'));
  ink(collar, 0, new THREE.TorusGeometry(0.5, 0.15, 10, 28));
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, -0.95, -0.05);
  g.add(collar);

  const rTex = label(128, 128, (x, w, h) => {
    x.fillStyle = '#ffd23f'; x.fillRect(0, 0, w, h);
    write(x, 'R', w / 2, h / 2 + 4, 96);
  });
  const medal = new THREE.Group();
  medal.position.set(0, -1.05, 0.55);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), [toon('#ffd23f'), toon('#ffffff', { map: rTex }), toon('#ffd23f')]);
  disc.rotation.x = Math.PI / 2;
  disc.rotation.y = Math.PI / 2; // spin the cap so the R reads upright
  disc.position.y = -0.2;
  ink(disc, 0.03);
  medal.add(disc);
  g.add(medal);

  let chomp = 0;
  return {
    group: g,
    chomp: () => { chomp = 1; },
    update: (t, dt) => {
      chomp = Math.max(0, chomp - dt * 1.6);
      const bite = chomp > 0 ? Math.abs(Math.sin(chomp * Math.PI * 3)) : 0;
      jaw.rotation.x = 0.28 + Math.sin(t * 1.3) * 0.06 - bite * 0.3 + (chomp > 0 ? 0.25 : 0);
      medal.rotation.z = Math.sin(t * 2) * 0.2;
    },
  };
}
