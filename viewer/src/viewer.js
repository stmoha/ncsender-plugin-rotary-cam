// Rotary CAM 3D view: the rotary setup (chuck, jaws, stock, tailstock, axis), the part
// as placed, the tool of the selected operation, and that operation's toolpath drawn on
// the part. Machine frame: X along the rotary axis (chuck at -X), Y away from the
// operator, Z up. The part, its stock and its toolpaths turn together with the A slider.
// Bundled with esbuild into lib/rotary-viewer.js as window.RotaryCamViewer.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const DEG = Math.PI / 180;
export const OP_COLORS = { corners: '#a78bfa', rough: '#f59e0b', finish: '#38bdf8', index: '#facc15', parting: '#f472b6' };
export const TENON_COLOR = '#4ade80';

function textSprite(text, color, size = 34) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = `600 ${size}px system-ui, sans-serif`;
  const w = Math.ceil(g.measureText(text).width) + 16;
  c.width = w; c.height = size + 16;
  g.font = `600 ${size}px system-ui, sans-serif`;
  g.fillStyle = color; g.textBaseline = 'middle';
  g.fillText(text, 8, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.renderOrder = 10;
  s.userData.aspect = c.width / c.height;
  return s;
}

// a value in a filled pill that keeps the same size on screen however far the camera is
// (sizeAttenuation off: scale is a share of the view, not millimetres)
const PILL_H = 0.02;
function pillSprite(text, bg, fg, size = 40) {
  // (bg, fg: CSS colours)
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const font = `650 ${size}px system-ui, sans-serif`;
  g.font = font;
  const h = Math.round(size * 1.45), w = Math.max(h, Math.ceil(g.measureText(text).width + size * 1.0));
  c.width = w; c.height = h;
  const r = h / 2;
  g.fillStyle = bg;
  g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, h, r); g.arcTo(w, h, 0, h, r); g.arcTo(0, h, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.closePath(); g.fill();
  g.font = font; g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center';
  g.fillText(text, w / 2, h / 2 + size * 0.04);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false }));
  s.scale.set(PILL_H * w / h, PILL_H, 1);
  s.renderOrder = 32;
  s.userData.noHl = true;
  return s;
}

function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
  });
}

// cylinder along +X from x0 to x1
function xCylinder(r0, r1, x0, x1, mat, seg = 48, open = false) {
  const geo = new THREE.CylinderGeometry(r1, r0, x1 - x0, seg, 1, open);
  geo.rotateZ(-Math.PI / 2); // Y axis -> X axis (bottom at -X)
  geo.translate((x0 + x1) / 2, 0, 0);
  return new THREE.Mesh(geo, mat);
}

export function create(container, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.preserveDrawingBuffer });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;     // only the Indexed reach light casts shadows
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 1, 40000);
  camera.up.set(0, 0, 1);
  camera.position.set(-150, -600, 300);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.screenSpacePanning = true;
  controls.target.set(100, 0, 0);

  const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x3a4250, 1.6);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-0.4, -1, 1.3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd4ff, 0.8);
  rim.position.set(0.7, 1, 0.4);
  scene.add(rim);
  const camLight = new THREE.DirectionalLight(0xffffff, 0.7);
  camera.add(camLight); camLight.position.set(0, 0, 1);
  scene.add(camera);

  const machine = new THREE.Group(); scene.add(machine);
  const partGroup = new THREE.Group(); scene.add(partGroup);   // turns with A
  const stockGroup = new THREE.Group(); partGroup.add(stockGroup);
  const tenonGroup = new THREE.Group(); partGroup.add(tenonGroup);   // on the axis, so turning doesn't show
  const jawGroup = new THREE.Group(); partGroup.add(jawGroup);       // the chuck's jaws turn with the stock they hold
  let tenonList = [];
  let partMesh = null, pathLines = {}, aSign = 1, aDeg = 0, op = 'finish', tool = null;
  let simMesh = null, simOn = false, simTool = null, simToolKey = '', ghost = false, ovMesh = null, ovData = null;
  let theme = { ink: '#1e2a32', muted: '#5e6b75', accent: '#1abc9c', dark: false };
  const idxGroup = new THREE.Group(); partGroup.add(idxGroup);   // Indexed angles, fixed to the part
  let idx = { list: [], opts: {}, ghosts: [], drag: null }, lvMesh = null;
  const reach = new THREE.DirectionalLight(0xffd75e, 0);
  reach.castShadow = true;
  reach.shadow.mapSize.set(2048, 2048);
  reach.shadow.bias = -0.0004;
  partGroup.add(reach); partGroup.add(reach.target);
  let setup = null, bounds = null;

  const mats = {};
  function makeMats() {
    Object.values(mats).forEach((m) => m.dispose());
    delete mats.hl;
    const metal = theme.dark ? 0x7d8794 : 0x9aa3ad;
    mats.metal = new THREE.MeshStandardMaterial({ color: metal, metalness: 0.55, roughness: 0.42 });
    mats.metalDark = new THREE.MeshStandardMaterial({ color: theme.dark ? 0x4a525d : 0x5f6872, metalness: 0.6, roughness: 0.4 });
    // the headstock and tailstock housings: matt aluminium (flat metallic faces have nothing
    // to reflect here and come out nearly black)
    mats.housing = new THREE.MeshStandardMaterial({ color: theme.dark ? 0x9aa3ad : 0xc4cbd3, metalness: 0.15, roughness: 0.55 });
    mats.stock = new THREE.MeshStandardMaterial({ color: 0xd9b98c, transparent: true, opacity: theme.dark ? 0.12 : 0.16, roughness: 0.9, depthWrite: false, side: THREE.FrontSide });
    mats.stockEdge = new THREE.LineBasicMaterial({ color: 0xc49a5c, transparent: true, opacity: 0.7 });
    mats.keep = new THREE.MeshBasicMaterial({ color: 0xd64545, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide });
    mats.part = new THREE.MeshStandardMaterial({ color: theme.dark ? 0x9db4d6 : 0x7f9bc4, metalness: 0.08, roughness: 0.55, side: THREE.DoubleSide, shadowSide: THREE.BackSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    mats.partBad = new THREE.MeshStandardMaterial({ color: 0xd66a5a, metalness: 0.05, roughness: 0.6, side: THREE.DoubleSide });
    // Indexed reach: light where the picked angle's tool sees, dark slate where it can't
    mats.partReach = new THREE.MeshStandardMaterial({ color: 0xeef0f2, metalness: 0.0, roughness: 0.7, side: THREE.DoubleSide, shadowSide: THREE.BackSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    mats.shank = new THREE.MeshStandardMaterial({ color: 0xc7ccd2, metalness: 0.8, roughness: 0.25 });
    mats.sim = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.75, side: THREE.DoubleSide });
    mats.simGhost = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.75, side: THREE.DoubleSide, transparent: true, opacity: 0.16, depthWrite: false });
    mats.overlay = new THREE.MeshStandardMaterial({ color: new THREE.Color(OP_COLORS.index), roughness: 0.6, metalness: 0.05 });
    mats.ghost = new THREE.MeshStandardMaterial({ color: new THREE.Color(OP_COLORS.index), transparent: true, opacity: 0.32, depthWrite: false, roughness: 0.5 });
    mats.ghostOn = new THREE.MeshStandardMaterial({ color: new THREE.Color(OP_COLORS.index), transparent: true, opacity: 0.85, roughness: 0.4, emissive: new THREE.Color(OP_COLORS.index), emissiveIntensity: 0.25 });
    mats.ghostLine = new THREE.LineDashedMaterial({ color: new THREE.Color(OP_COLORS.index), dashSize: 2.5, gapSize: 2, transparent: true, opacity: 0.9 });
    mats.tenon = new THREE.MeshStandardMaterial({ color: new THREE.Color(TENON_COLOR), transparent: true, opacity: 0.5, roughness: 0.6, depthWrite: false, side: THREE.DoubleSide });
    mats.tenonEdge = new THREE.LineBasicMaterial({ color: new THREE.Color(TENON_COLOR), transparent: true, opacity: 0.95, depthTest: false });
    mats.axis = new THREE.LineDashedMaterial({ color: theme.dark ? 0xe6ecf2 : 0x1e2a32, dashSize: 4, gapSize: 3, transparent: true, opacity: 0.55 });
    for (const k of Object.keys(OP_COLORS)) {
      mats[k] = new THREE.LineBasicMaterial({ color: new THREE.Color(OP_COLORS[k]) });
      mats[k + 'Tool'] = new THREE.MeshStandardMaterial({ color: new THREE.Color(OP_COLORS[k]), metalness: 0.4, roughness: 0.35 });
    }
  }
  makeMats();

  let needsRender = true;
  const requestRender = () => { needsRender = true; };
  controls.addEventListener('change', requestRender);
  controls.addEventListener('start', () => { camMoved = true; if (opts.onUserCamera) opts.onUserCamera(); });
  let raf = 0, alive = true;
  const loop = () => {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    const moved = controls.update();
    if (needsRender || moved) { needsRender = false; try { fadeHolders(); } catch (e) { /* never stop drawing */ } renderer.render(scene, camera); }
  };
  loop();

  // The collet nut and spindle turn see-through when they hide the part (looking down from
  // the top, say): how much of the part's outline on screen they cover, if they're nearer.
  const fadeBox = new THREE.Box3(), fadeT = new THREE.Box3(), fv = new THREE.Vector3(), fv2 = new THREE.Vector3();
  function screenRect(box) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      fv.set(x, y, z).project(camera);
      x0 = Math.min(x0, fv.x); x1 = Math.max(x1, fv.x); y0 = Math.min(y0, fv.y); y1 = Math.max(y1, fv.y);
    }
    return [x0, x1, y0, y1];
  }
  const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  function fadeHolders() {
    const target = simOn ? simMesh : (partMesh || (refs.stock && refs.stock[0]));
    scene.updateMatrixWorld(); camera.updateMatrixWorld();
    for (const t of [tool, simTool]) {
      if (!t) continue;
      const parts = t.children.filter((c) => c.userData.fade);
      if (!parts.length) continue;
      let f = 0;
      if (t.visible && target) {
        fadeBox.makeEmpty(); parts.forEach((p) => fadeBox.expandByObject(p));
        fadeT.makeEmpty(); fadeT.expandByObject(target);
        if (!fadeT.isEmpty()) {
          const a = screenRect(fadeBox), b = screenRect(fadeT);
          const ix = Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0])), iy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[2], b[2]));
          const cover = ix * iy / Math.max(1e-9, (b[1] - b[0]) * (b[3] - b[2]));
          const near = camera.position.distanceTo(fadeBox.getCenter(fv2)) < camera.position.distanceTo(fadeT.getCenter(fv));
          if (near) f = smooth(0.1, 0.35, cover);
        }
      }
      const op = 1 - 0.8 * f;
      t.userData.opacity = op;
      parts.forEach((p) => setOpacity(p.material, op));
    }
    // the chuck end and the tailstock end: how much of the part they hide, sighting along
    // lines from the eye to points through it (looking down the axis from the end, say)
    if (!sides) return;
    const pts = target ? samplePoints(target) : [];
    for (const side of ['head', 'tail']) {
      const objs = sides[side].filter((o) => o.isMesh && o.visible !== false);
      let f = 0;
      if (pts.length && objs.length) {
        let hid = 0;
        for (const p of pts) {
          fv.copy(p).sub(camera.position);
          const d = fv.length();
          ray.set(camera.position, fv.normalize()); ray.far = d;
          if (ray.intersectObjects(objs, false).length) hid++;
        }
        f = smooth(0.08, 0.3, hid / pts.length);
      }
      const op = 1 - 0.75 * f;
      sides.opacity[side] = op;
      sides[side].forEach((o) => setOpacity(o.material, op));
    }
  }
  const ray = new THREE.Raycaster();
  let sides = null;
  function setOpacity(m, op) {
    if (!m || m === mats.hl) return;
    const tr = op < 0.995;
    if (m.transparent !== tr) { m.transparent = tr; m.depthWrite = !tr; m.needsUpdate = true; }
    m.opacity = tr ? op : 1;
  }
  // points through the part (or the stock): along it, on the axis and out toward its sides
  const samp = [];
  function samplePoints(obj) {
    fadeT.makeEmpty(); fadeT.expandByObject(obj);
    if (fadeT.isEmpty()) return [];
    const b = fadeT, cy = (b.min.y + b.max.y) / 2, cz = (b.min.z + b.max.z) / 2, hy = (b.max.y - b.min.y) * 0.35, hz = (b.max.z - b.min.z) * 0.35;
    let n = 0;
    for (let i = 0; i < 5; i++) {
      const x = b.min.x + (b.max.x - b.min.x) * (0.1 + 0.2 * i);
      for (const [y, z] of [[cy, cz], [cy + hy, cz], [cy - hy, cz], [cy, cz + hz], [cy, cz - hz]]) {
        if (!samp[n]) samp[n] = new THREE.Vector3();
        samp[n++].set(x, y, z);
      }
    }
    return samp.slice(0, n);
  }

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    requestRender();
  }
  const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(container);
  resize();

  // ---------------- machine
  // what each part of the rotary was drawn with, for highlighting the one a setting is about
  let refs = {};
  function buildMachine(s) {
    disposeTree(machine); machine.clear();
    disposeTree(stockGroup); stockGroup.clear();
    disposeTree(jawGroup); jawGroup.clear();
    setup = s;
    refs = { chuck: [], head: [], centre: [], tail: [], stock: [], keepChuck: [], keepTail: [], origin: [] };
    // the chuck end and the tailstock end each fade when they hide the part, so each piece
    // gets its own material (the housings and the jaws share theirs otherwise)
    sides = { head: [], tail: [], opacity: { head: 1, tail: 1 } };
    const own = (side, m) => { const c = m.clone(); c.userData.fadeSide = side; return c; };
    const add = (key, o) => { (refs[key] = refs[key] || []).push(o); machine.add(o); const sd = key === 'chuck' || key === 'head' ? 'head' : key === 'centre' || key === 'tail' ? 'tail' : null; if (sd && o.isMesh) sides[sd].push(o); return o; };
    const R = s.stockR, x0 = s.chuckX, fx = s.fixtures || [];
    const F = (name) => fx.find((f) => f.name === name);
    // the rotary at its real size (Rotary & spindle settings)
    const ch = F('chuck') || { x0: x0 - 48, x1: x0, r: Math.max(R * 1.5 + 6, 30) };
    const chuckR = ch.r, jawLen = Math.min(14, (ch.x1 - ch.x0) / 3), bodyLen = ch.x1 - ch.x0 - jawLen;
    // silver like the headstock and tailstock (matt: metallic faces look dark); the jaws, the
    // live centre's cone and the collet nut are the darker metal
    add('chuck', xCylinder(chuckR * 0.97, chuckR * 0.97, ch.x0, ch.x1 - jawLen, own('head', mats.housing), 64));
    const jawMat = own('head', mats.metalDark);
    // the jaws, from the stock out to the chuck's full diameter. Four (the default) sit on the
    // flats of square stock, at Y and Z with A at 0; three are 120 deg apart. They turn with A.
    const four = !(s.rig && s.rig.chuck && String(s.rig.chuck.jaws) === '3');
    const half = s.stockShape === 'round' || !s.stockHalf ? [R, R] : s.stockHalf;
    for (let k = 0; k < (four ? 4 : 3); k++) {
      const a = four ? k * 90 * DEG : k * 120 * DEG + 90 * DEG;
      // how far out the stock's face is in this direction, and how wide that face is
      const jawR = four ? (k % 2 ? half[1] : half[0]) : (s.stockShape === 'round' ? R : Math.min(R, Math.max(half[0], half[1])));
      const face = four ? 2 * (k % 2 ? half[0] : half[1]) : 2 * R;
      const h = Math.max(4, chuckR - jawR), w = Math.max(6, Math.min(R * 0.55, face * 0.7));
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(jawLen, w, h), jawMat);
      jaw.position.set(ch.x1 - jawLen / 2, Math.cos(a) * (jawR + h / 2), Math.sin(a) * (jawR + h / 2));
      jaw.rotation.x = a - 90 * DEG;
      jaw.userData.jaw = true;
      refs.chuck.push(jaw); jawGroup.add(jaw); sides.head.push(jaw);
    }
    // a box on the table, reaching y0 (toward you, -Y) to y1 (away, +Y) and up to `top`
    const box = (key, f, side) => {
      const lo = -Math.max(f.top, chuckR) - 10, g = new THREE.BoxGeometry(f.x1 - f.x0, f.y1 - f.y0, f.top - lo);
      g.translate((f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2, (f.top + lo) / 2);
      add(key, new THREE.Mesh(g, own(side, mats.housing)));
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(g), own(side, mats.stockEdge));
      machine.add(edges); sides[side].push(edges);
    };
    const hd = F('headstock');
    if (hd) box('head', hd, 'head');
    const xt = s.tailX, ce = F('live centre') || { x0: xt, x1: xt + Math.max(14, R * 0.8), r: Math.max(6, R * 0.45) };
    const coneL = ce.x1 - ce.x0, coneR = ce.r;
    add('centre', xCylinder(0.01, coneR, ce.x0, ce.x1, own('tail', mats.metalDark), 32));
    // behind the cone, its round body back to the tailstock (silver, like the housings)
    const cb = fx.find((f) => f.name === 'live centre' && f.part === 'body');
    if (cb) add('centre', xCylinder(cb.r, cb.r, cb.x0, cb.x1, own('tail', mats.housing), 48));
    const tl = F('tailstock');
    if (tl) box('tail', tl, 'tail');
    // stock: turns with the part
    const sx0 = x0 - (s.clamp > 0 ? s.clamp : 0), sx1 = xt;     // into the jaws by the clamping distance
    if (s.stockShape === 'round') {
      const stock = xCylinder(R, R, sx0, sx1, mats.stock, 72, true);
      stock.renderOrder = 2;
      stockGroup.add(stock); refs.stock.push(stock);
      for (const x of [x0, xt]) {
        stockGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 73 }, (_, i) => new THREE.Vector3(x, R * Math.cos(i * 5 * DEG), R * Math.sin(i * 5 * DEG)))), mats.stockEdge));
      }
    } else {
      const geo = new THREE.BoxGeometry(sx1 - sx0, s.stockHalf[0] * 2, s.stockHalf[1] * 2);
      geo.translate((sx0 + sx1) / 2, 0, 0);
      const box = new THREE.Mesh(geo, mats.stock);
      box.renderOrder = 2;
      stockGroup.add(box); refs.stock.push(box);
      stockGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), mats.stockEdge));
    }
    const kR = R + 1.5;
    if (s.chuckClear > 0) add('keepChuck', xCylinder(kR, kR, x0, x0 + s.chuckClear, mats.keep, 48, true));
    if (s.tailClear > 0) add('keepTail', xCylinder(kR, kR, xt - s.tailClear, xt, mats.keep, 48, true));
    const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(ch.x0 - 30, 0, 0), new THREE.Vector3(xt + coneL + 90, 0, 0)]), mats.axis);
    axis.computeLineDistances();
    machine.add(axis);
    // A+ arrow over the top, from back (+Y) to front (-Y); the head at the end the top of the
    // stock goes to when A turns +: the front with aSign +1, the back with -1
    const arcR = R + 7, ax = xt - Math.max(12, s.tailClear + 6);
    const arcPts = [];
    for (let i = 0; i <= 40; i++) {
      const t = (-50 + i * 2.5) * DEG;
      arcPts.push(new THREE.Vector3(ax, -Math.sin(t) * arcR, Math.cos(t) * arcR));
    }
    machine.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(aSign > 0 ? arcPts : arcPts.slice().reverse()), new THREE.LineBasicMaterial({ color: new THREE.Color(theme.accent) })));
    const end = aSign > 0 ? arcPts[arcPts.length - 1] : arcPts[0];
    const prev = aSign > 0 ? arcPts[arcPts.length - 3] : arcPts[2];
    const head = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.accent) }));
    head.position.copy(end);
    head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(prev).normalize());
    machine.add(head); refs.aHead = head;
    const aLabel = textSprite('A+', theme.accent);
    aLabel.position.set(ax, -arcR * 0.9 * aSign, arcR * 0.75);
    aLabel.scale.set(8 * aLabel.userData.aspect, 8, 1);
    machine.add(aLabel);
    // the G-code's zero: X0 at the jaw face, Y0 Z0 on the axis. Drawn through everything,
    // since it's inside the stock.
    const org = new THREE.Group(), OL = Math.max(10, Math.min(18, R * 0.55));
    org.position.set(x0, 0, 0);
    [[1, 0, 0, '#d64545', 'X'], [0, 1, 0, '#2fa36b', 'Y'], [0, 0, 1, '#2a78d6', 'Z']].forEach(([x, y, z, col, name]) => {
      const d = new THREE.Vector3(x, y, z);
      const ah = new THREE.ArrowHelper(d, new THREE.Vector3(), OL, new THREE.Color(col).getHex(), 3.4, 2.2);
      ah.traverse((o) => { if (o.material) { o.material.depthTest = false; o.material.transparent = true; } o.renderOrder = 22; });
      org.add(ah);
      const lab = textSprite(name, col);
      lab.position.copy(d.clone().multiplyScalar(OL + 3.5));
      lab.scale.set(4.5 * lab.userData.aspect, 4.5, 1);
      lab.renderOrder = 23;
      org.add(lab);
    });
    const od = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.ink), depthTest: false, transparent: true }));
    od.renderOrder = 23; org.add(od);
    const ol = pillSprite('G-code zero: X0 Y0 Z0', theme.dark ? '#e6ecf2' : '#1e2a32', theme.dark ? '#1e2a32' : '#ffffff');
    ol.scale.multiplyScalar(0.8); ol.center.set(1.06, 1.3); ol.renderOrder = 24; ol.userData.origin = true;
    org.add(ol);
    org.userData.origin = true;
    machine.add(org); refs.origin.push(org);
    const ls = Math.max(6, chuckR * 0.16);
    const lc = textSprite('chuck', theme.muted, 28);
    lc.position.set(ch.x0 + bodyLen / 2, 0, chuckR + 9);
    lc.scale.set(ls * lc.userData.aspect, ls, 1);
    machine.add(lc);
    const lt = textSprite('tailstock', theme.muted, 28);
    lt.position.set(tl ? (tl.x0 + tl.x1) / 2 : xt + coneL + 50, 0, (tl ? tl.top : chuckR * 0.75) + 9);
    lt.scale.set(ls * lt.userData.aspect, ls, 1);
    machine.add(lt);
    buildTool();
    if (hl.key) { try { applyHighlight(false); } catch (e) { clearHighlight(); hl.key = null; } }
    requestRender();
  }

  // the selected operation's tool, tip one retract above the stock
  function buildTool() {
    if (tool) { machine.remove(tool); disposeTree(tool); tool = null; }
    const t = setup && setup.tools && setup.tools[op];
    if (!t || !(t.dia > 0)) return;
    tool = makeTool(Object.assign({ stickout: setup.stickout && setup.stickout[op] }, t), op);
    tool.position.set(setup.toolX != null ? setup.toolX : (setup.chuckX + setup.tailX) / 2, 0, setup.stockR + setup.clear);
    tool.visible = !simOn && !(op === 'index' && idx.list.length);
    machine.add(tool);
  }
  // the collet nut and spindle above a tool that sticks out `so` from the nut
  function holder(tool, so) {
    const g = (setup && setup.rig) || {}, nd = (g.nut && g.nut.dia) || 35, nl = (g.nut && g.nut.len) || 20, sd = (g.spindle && g.spindle.dia) || 80;
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(nd / 2, nd / 2, nl, 6), mats.metalDark.clone());
    nut.rotation.x = Math.PI / 2; nut.position.z = so + nl / 2; nut.userData.part = 'nut'; nut.userData.fade = true;
    tool.add(nut);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(sd / 2, sd / 2, 90, 48), mats.housing.clone());
    sp.rotation.x = Math.PI / 2; sp.position.z = so + nl + 45; sp.userData.part = 'spindle'; sp.userData.fade = true;
    tool.add(sp);
    tool.userData.dims = { so, nd, nl, sd };
  }
  function makeTool(t, which) {
    const tr = t.dia / 2, len = t.len || 20, ball = !!t.ball, so = t.stickout > 0 ? t.stickout : len + 6;
    const tool = new THREE.Group();
    const flutes = mats[which + 'Tool'] || mats.finishTool;
    if (ball && t.taper > 0 && t.shank / 2 > tr) {
      // tapered ball: ball tip, cone out to the shank, then the shank
      const a = t.taper, rs = t.shank / 2, rc = tr * Math.cos(a), zt = tr - tr * Math.sin(a), ztop = zt + (rs - rc) / Math.tan(a);
      const pts = [];
      for (let k = 0; k <= 12; k++) { const f = k / 12 * (Math.PI / 2 - a); pts.push(new THREE.Vector2(tr * Math.sin(f), tr - tr * Math.cos(f))); }
      pts.push(new THREE.Vector2(rs, ztop));
      const top = Math.max(len, ztop);
      if (top > ztop) pts.push(new THREE.Vector2(rs, top));
      pts.push(new THREE.Vector2(0, top));
      const lathe = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), flutes);
      lathe.rotation.x = Math.PI / 2; lathe.userData.part = 'flutes';
      tool.add(lathe);
      if (so > top) {
        const shank = new THREE.Mesh(new THREE.CylinderGeometry(rs, rs, so - top, 32), mats.shank);
        shank.rotation.x = Math.PI / 2; shank.position.z = (top + so) / 2; shank.userData.part = 'shank';
        tool.add(shank);
      }
      tool.userData.cut = { tr, len, ball: true, taper: a, rs, rc, zt, ztop, top, so };
      holder(tool, so);
      return tool;
    }
    if (ball) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(tr, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), flutes);
      b.rotation.x = Math.PI / 2; b.position.z = tr; b.userData.part = 'flutes';
      tool.add(b);
    }
    const base = ball ? tr : 0, fl = Math.min(len, so);
    const flute = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, Math.max(0.1, fl - base), 32, 1, false), flutes);
    flute.rotation.x = Math.PI / 2; flute.position.z = base + (fl - base) / 2; flute.userData.part = 'flutes';
    tool.add(flute);
    if (so > fl) {
      const shank = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, so - fl, 32), mats.shank);
      shank.rotation.x = Math.PI / 2; shank.position.z = (fl + so) / 2; shank.userData.part = 'shank';
      tool.add(shank);
    }
    tool.userData.cut = { tr, len, ball, taper: 0, rs: tr, top: fl, so };
    holder(tool, so);
    return tool;
  }

  // ---------------- part
  function setPart(tris, opt = {}) {
    if (partMesh) { partGroup.remove(partMesh); partMesh.geometry.dispose(); partMesh = null; }
    bounds = null;
    if (!tris || !tris.length) { requestRender(); return; }
    let geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(tris, 3));
    geo = toCreasedNormals(geo, 35 * DEG);
    geo.computeBoundingBox();
    bounds = geo.boundingBox.clone();
    partBad = !!opt.bad;
    partMesh = new THREE.Mesh(geo, partMat());
    partMesh.castShadow = partMesh.receiveShadow = true;
    partGroup.add(partMesh);
    if (idx.list.length) buildIndex();
    if (hl.key) { try { applyHighlight(false); } catch (e) { clearHighlight(); hl.key = null; } }
    requestRender();
  }
  let partBad = false;
  const partMat = () => (reach.intensity > 0 ? mats.partReach : partBad ? mats.partBad : mats.part);
  function setPartBad(bad) { partBad = !!bad; if (partMesh) { partMesh.material = partMat(); requestRender(); } }

  // tenons: [{ x0, x1, r, in0, in1 }]. The cylinder shows wherever it sticks out of the
  // part; a ring (seen through the part) marks how far it reaches into the part.
  function setTenons(list) {
    tenonList = list || [];
    disposeTree(tenonGroup); tenonGroup.clear();
    for (const t of tenonList) {
      if (!(t.r > 0) || !(t.x1 > t.x0)) continue;
      const c = xCylinder(t.r, t.r, t.x0, t.x1, mats.tenon, 64);
      c.renderOrder = 4; c.userData.side = t.side;
      tenonGroup.add(c);
      for (const x of [t.side === 'chuck' ? t.in1 : t.in0]) {
        const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 64 }, (_, i) => new THREE.Vector3(x, t.r * Math.cos(i * 2 * Math.PI / 64), t.r * Math.sin(i * 2 * Math.PI / 64)))), mats.tenonEdge);
        ring.renderOrder = 11;
        tenonGroup.add(ring);
      }
    }
    tenonGroup.visible = !simOn;
    requestRender();
  }

  // points: Float32Array x, y, z, a per point (tool tip in machine coordinates at that A)
  function setToolpath(name, pts) {
    if (pathLines[name]) { partGroup.remove(pathLines[name]); pathLines[name].geometry.dispose(); delete pathLines[name]; }
    if (!pts || !pts.length) { requestRender(); return; }
    // NaN points separate passes; draw as segments so passes aren't joined
    const n = Math.floor(pts.length / 4), seg = [];
    let px = NaN, py = 0, pz = 0;
    for (let i = 0; i < n; i++) {
      const j = i * 4, x = pts[j], y = pts[j + 1], z = pts[j + 2], a = pts[j + 3] * aSign * DEG;
      if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(a)) { px = NaN; continue; }
      // tool tip at (x, y, z) with the part turned to A: in the part's own frame that is R(-A)
      const ca = Math.cos(a), sa = Math.sin(a);
      const y1 = y * ca + z * sa, z1 = -y * sa + z * ca;
      if (Number.isFinite(px)) seg.push(px, py, pz, x, y1, z1);
      px = x; py = y1; pz = z1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(seg), 3));
    const line = new THREE.LineSegments(geo, mats[name] || mats.finish);
    line.renderOrder = 3;
    line.visible = name === op && !simOn;
    pathLines[name] = line;
    partGroup.add(line);
    requestRender();
  }
  function setOp(name) {
    op = name;
    Object.keys(pathLines).forEach((k) => { pathLines[k].visible = k === op && !simOn; });
    buildTool();
    if (hl.key) { try { applyHighlight(false); } catch (e) { clearHighlight(); hl.key = null; } }
    requestRender();
  }

  function setA(deg) { aDeg = deg; partGroup.rotation.x = ((deg % 360) * aSign) * DEG; requestRender(); }

  // ---------------- simulation
  // geo: { index: Uint32Array, pos: Float32Array, col: Float32Array } in the part frame
  function simSet(geo) {
    if (simMesh) { partGroup.remove(simMesh); simMesh.geometry.dispose(); simMesh = null; }
    if (!geo) { requestRender(); return; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(geo.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(geo.col, 3));
    g.setIndex(new THREE.BufferAttribute(geo.index, 1));
    g.computeVertexNormals();
    simMesh = new THREE.Mesh(g, ghost ? mats.simGhost : mats.sim);
    simMesh.renderOrder = ghost ? 5 : 0;
    simMesh.visible = simOn;
    partGroup.add(simMesh);
    requestRender();
  }
  function simUpdate() {
    if (!simMesh) return;
    const g = simMesh.geometry;
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
    requestRender();
  }
  // what finishing left, as small blocks in the part frame: ov { n, x, y, z, alive, s }
  function simOverlay(ov) {
    if (!ov) {
      if (ovMesh) { partGroup.remove(ovMesh); ovMesh.geometry.dispose(); ovMesh.dispose(); ovMesh = null; }
      ovData = null; requestRender(); return;
    }
    if (!ovMesh || ovData !== ov) {
      if (ovMesh) { partGroup.remove(ovMesh); ovMesh.geometry.dispose(); ovMesh.dispose(); }
      const b = Math.max(0.2, ov.s * 0.9);
      ovMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(b, b, b), mats.overlay, Math.max(1, ov.n));
      ovMesh.frustumCulled = false;
      ovData = ov;
      partGroup.add(ovMesh);
    }
    const m = new THREE.Matrix4();
    let c = 0;
    for (let i = 0; i < ov.n; i++) if (ov.alive[i]) { m.makeTranslation(ov.x[i], ov.y[i], ov.z[i]); ovMesh.setMatrixAt(c++, m); }
    ovMesh.count = c;
    ovMesh.instanceMatrix.needsUpdate = true;
    ovMesh.visible = simOn;
    requestRender();
  }
  // see-through stock with the real part inside it (the stock model can't show a pocket under an overhang)
  function simGhost(on) {
    ghost = !!on;
    if (simMesh) { simMesh.material = ghost ? mats.simGhost : mats.sim; simMesh.renderOrder = ghost ? 5 : 0; }
    if (partMesh) partMesh.visible = !simOn || ghost;
    requestRender();
  }
  function simMode(on) {
    simOn = !!on;
    if (simMesh) simMesh.visible = simOn;
    if (ovMesh) ovMesh.visible = simOn;
    if (partMesh) partMesh.visible = !simOn || ghost;
    stockGroup.visible = !simOn;
    tenonGroup.visible = !simOn;
    if (tool) tool.visible = !simOn && !(op === 'index' && idx.list.length);
    if (simTool) simTool.visible = simOn;
    idxGroup.visible = !simOn;
    tcGroup.visible = !simOn;
    if (lvMesh) lvMesh.visible = !simOn;
    reach.intensity = simOn ? 0 : (idx.opts.pick >= 0 && idx.list[idx.opts.pick] ? REACH : 0);
    lightsForReach(!simOn && reach.intensity > 0);
    if (partMesh) partMesh.material = partMat();
    Object.keys(pathLines).forEach((k) => { pathLines[k].visible = k === op && !simOn; });
    requestRender();
  }
  // the tool doing the cutting at this moment, in machine coordinates
  function simToolAt(t, which, x, y, z) {
    const key = t ? which + ':' + t.dia + ':' + t.ball + ':' + (t.taper || 0) + ':' + (t.shank || 0) + ':' + (t.stickout || 0) : '';
    if (key !== simToolKey) {
      if (simTool) { scene.remove(simTool); disposeTree(simTool); simTool = null; }
      simToolKey = key;
      if (t) { simTool = makeTool(t, which); scene.add(simTool); }
    }
    if (simTool) { simTool.visible = simOn; simTool.position.set(x, y, z); }
    requestRender();
  }

  // ---------------- Indexed angles
  // A see-through Indexed tool at each A angle, coming straight down onto the part the way
  // it will with A locked there. They're fixed to the part, so turning A turns them too;
  // with the A slider at an angle, that angle's tool is the one pointing straight down.
  // The picked angle lights the part from its tool's direction: what's in shadow, that
  // tool can't see (and can't reach).
  //   list: [{ a }] degrees; opts: { tool, x, rTip, pick, editable, colour }
  const dirOf = (a) => a * aSign * DEG;
  const REACH = 3.4;
  function ghostTool(t, on) {
    const g = makeTool(Object.assign({ stickout: setup && setup.stickout && setup.stickout.index }, t), 'index');
    g.traverse((o) => { if (o.isMesh) { o.material = on ? mats.ghostOn : mats.ghost; o.renderOrder = 6; o.userData.idxGhost = true; } });
    return g;
  }
  function buildIndex() {
    disposeTree(idxGroup); idxGroup.clear(); idx.ghosts = [];
    const o = idx.opts, t = o.tool;
    reach.intensity = 0;
    if (!idx.list.length || !t || !(t.dia > 0)) { lightsForReach(false); if (tool) tool.visible = !simOn; requestRender(); return; }
    const x = o.x != null ? o.x : bounds ? (bounds.min.x + bounds.max.x) / 2 : 100, rt = o.rTip || 25;
    idx.list.forEach((e, i) => {
      const on = i === o.pick, pivot = new THREE.Group();
      pivot.position.set(x, 0, 0);
      pivot.rotation.x = -dirOf(e.a);
      const gt = ghostTool(t, on);
      gt.position.set(0, 0, rt);
      gt.traverse((m) => { if (m.isMesh) m.userData.idx = i; });
      pivot.add(gt);
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, rt)]), mats.ghostLine);
      ln.computeLineDistances();
      pivot.add(ln);
      const lab = textSprite('A' + (Math.round(e.a * 10) / 10) + '\u00b0', OP_COLORS.index, 30);
      const top = (t.len || 20) + 50;
      lab.position.set(0, 0, rt + top + 8);
      lab.scale.set(7 * lab.userData.aspect, 7, 1);
      pivot.add(lab);
      idx.ghosts.push({ pivot, label: lab, a: e.a });
      idxGroup.add(pivot);
    });
    const p = o.pick >= 0 && idx.list[o.pick];
    if (p) {
      // light from the picked tool's direction, shadows sized to the part
      const b = bounds || new THREE.Box3(new THREE.Vector3(0, -30, -30), new THREE.Vector3(200, 30, 30));
      const ext = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) * 0.6 + 10, cx = (b.min.x + b.max.x) / 2, d = dirOf(p.a);
      reach.position.set(cx, Math.sin(d) * ext * 3, Math.cos(d) * ext * 3);
      reach.target.position.set(cx, 0, 0);
      const cam = reach.shadow.camera;
      cam.left = -ext; cam.right = ext; cam.top = ext; cam.bottom = -ext; cam.near = 0.5; cam.far = ext * 6;
      cam.updateProjectionMatrix();
      reach.shadow.normalBias = Math.max(0.02, ext / 2048 * 1.5);
      reach.intensity = REACH;
    }
    lightsForReach(!!p);
    if (partMesh) partMesh.material = partMat();
    if (tool) tool.visible = !simOn && op !== 'index';
    requestRender();
  }
  // with the reach light on, dim the others so its shadows show
  function lightsForReach(on) {
    hemi.intensity = on ? 0.55 : 1.6; key.intensity = on ? 0 : 1.9; rim.intensity = on ? 0 : 0.8; camLight.intensity = on ? 0.25 : 0.7;
    hemi.color.set(on ? 0xb8c8ff : 0xf2f6ff);
  }
  function setIndexAngles(list, o = {}) {
    idx.list = (list || []).map((e) => ({ a: Number(e.a) || 0 }));
    idx.opts = o;
    if (!idx.drag) buildIndex();
  }
  // what's left to clean before Indexed, as small blocks in the part frame (3D tab)
  function setLeftover(ov) {
    if (lvMesh) { partGroup.remove(lvMesh); lvMesh.geometry.dispose(); lvMesh.dispose(); lvMesh = null; }
    if (ov && ov.n) {
      const b = Math.max(0.2, ov.s * 0.9);
      lvMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(b, b, b), mats.overlay, ov.n);
      const m = new THREE.Matrix4();
      for (let i = 0; i < ov.n; i++) { m.makeTranslation(ov.x[i], ov.y[i], ov.z[i]); lvMesh.setMatrixAt(i, m); }
      lvMesh.instanceMatrix.needsUpdate = true;
      lvMesh.visible = !simOn;
      partGroup.add(lvMesh);
    }
    requestRender();
  }
  // the A angle under the pointer: where its ray meets the cylinder the tool tips sit on
  // (or, looking along the axis, the plane across it)
  function angleAt(e) {
    const r = renderer.domElement.getBoundingClientRect();
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const o = ray.ray.origin, d = ray.ray.direction, rc = idx.opts.rTip || 25, x = idx.opts.x != null ? idx.opts.x : 0;
    let y = null, z = null;
    const A = d.y * d.y + d.z * d.z, B = 2 * (o.y * d.y + o.z * d.z), C = o.y * o.y + o.z * o.z - rc * rc, disc = B * B - 4 * A * C;
    if (Math.abs(d.x) < 0.45 && A > 1e-9 && disc >= 0) {
      const s0 = (-B - Math.sqrt(disc)) / (2 * A);
      y = o.y + s0 * d.y; z = o.z + s0 * d.z;
    } else if (Math.abs(d.x) > 1e-6) {
      const s1 = (x - o.x) / d.x;
      y = o.y + s1 * d.y; z = o.z + s1 * d.z;
    }
    if (y === null || Math.hypot(y, z) < 1e-6) return null;
    const w = Math.atan2(y, z) / DEG + aDeg * aSign;       // world angle back into the part's frame
    return ((w * aSign) % 360 + 360) % 360;
  }

  // ---------------- tool changes: where the change position and tool setter are, and the
  // way the program goes round the rotary to the change position (work coordinates)
  const tcGroup = new THREE.Group(); scene.add(tcGroup);
  let tcData = null;
  function setToolChanges(d) {
    tcData = d;
    disposeTree(tcGroup); tcGroup.clear();
    if (!d || !d.change) { requestRender(); return; }
    const fx = (setup && setup.fixtures) || [], hTop = Math.max(40, ...fx.map((f) => (f.kind === 'box' ? f.top : f.r))) + 25;
    const mark = (q, label, col, part) => {
      const g = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, hTop, 16), new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: 0.5 }));
      post.userData.part = part; g.userData.part = part;
      post.rotation.x = Math.PI / 2; post.position.z = hTop / 2 - 20;
      g.add(post);
      const lab = textSprite(label, col, 28);
      lab.position.set(0, 0, hTop + 8); lab.scale.set(13 * lab.userData.aspect, 13, 1);
      g.add(lab);
      g.position.set(q.x, q.y, 0);
      tcGroup.add(g);
    };
    mark(d.change, 'tool change', '#a855f7', 'change');
    if (d.setter) mark(d.setter, 'tool setter', '#64748b', 'setter');
    const mat = new THREE.LineDashedMaterial({ color: new THREE.Color('#a855f7'), dashSize: 6, gapSize: 4, transparent: true, opacity: 0.9 });
    (d.paths || []).slice(0, 1).forEach((path) => {
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.map(([x, y]) => new THREE.Vector3(x, y, hTop - 20))), mat);
      ln.computeLineDistances();
      ln.userData.part = 'route';
      tcGroup.add(ln);
    });
    if (d.setter) {
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(d.change.x, d.change.y, hTop - 20), new THREE.Vector3(d.setter.x, d.setter.y, hTop - 20)]), new THREE.LineDashedMaterial({ color: new THREE.Color(d.setterHits ? '#d64545' : '#64748b'), dashSize: 3, gapSize: 4 }));
      ln.computeLineDistances();
      tcGroup.add(ln);
    }
    tcGroup.visible = !simOn;
    if (hl.key) { try { applyHighlight(false); } catch (e) { clearHighlight(); hl.key = null; } }
    requestRender();
  }

  // ---------------- highlight: the part of the setup a setting is about, in the accent
  // colour, with a dimension line showing what the number measures
  const hlGroup = new THREE.Group(); scene.add(hlGroup);              // machine frame
  const hlPart = new THREE.Group(); partGroup.add(hlPart);             // turns with the stock
  let hl = { key: null, text: '', swapped: [] };
  const V3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
  // dimensions in a deep shade of the accent (a light one in the dark theme) so they show
  // against the part they're about, which is painted in the accent itself
  function dimColor() {
    const hsl = {}; new THREE.Color(theme.accent).getHSL(hsl, THREE.SRGBColorSpace);
    return new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * (theme.dark ? 0.75 : 1)), theme.dark ? 0.8 : 0.25, THREE.SRGBColorSpace);
  }
  function pill(text) { return pillSprite(text, '#' + dimColor().getHexString(), theme.dark ? '#0d1f1b' : '#ffffff'); }
  // extension lines f1 -> d1 and f2 -> d2 from the object, the dimension line d1 <-> d2 with
  // arrowheads, and the value in a pill on it. Drawn on top of everything.
  function dimLine(group, f1, d1, d2, f2, text, o = {}) {
    const col = dimColor(), lm = new THREE.LineBasicMaterial({ color: col, depthTest: false, transparent: true });
    const a = V3(d1), b = V3(d2), seg = [];
    if (f1) seg.push(V3(f1), a);
    if (f2) seg.push(V3(f2), b);
    seg.push(a, b);
    const ls = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), lm);
    ls.renderOrder = 30; group.add(ls);
    const len = a.distanceTo(b), dir = b.clone().sub(a).normalize(), hs = Math.max(1.2, Math.min(4, len / 4));
    if (len > 0.01 && !o.plain) for (const [p, d] of [[a, dir.clone().negate()], [b, dir]]) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(hs * 0.35, hs, 12), new THREE.MeshBasicMaterial({ color: col, depthTest: false, transparent: true }));
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
      cone.position.copy(p).addScaledVector(d, -hs / 2);
      cone.renderOrder = 30; group.add(cone);
    }
    if (text) {
      const lab = o.muted ? pillSprite(text, theme.dark ? '#3a4652' : '#e3e8ee', theme.dark ? '#e6ecf2' : '#1e2a32') : pill(text), mid = a.clone().add(b).multiplyScalar(0.5);
      beside(lab, mid, o.off ? V3(o.off) : f1 ? a.clone().sub(V3(f1)) : new THREE.Vector3(0, 0, 1));
      group.add(lab);
    }
  }
  // a label at `at`, just clear of it on screen toward `off` (a direction in the scene),
  // whichever way the view turns: the pill is shifted through its anchor every frame
  function beside(lab, at, off) {
    off = off.clone(); if (off.lengthSq() < 1e-9) off.set(0, 0, 1);
    off.normalize();
    lab.position.copy(at);
    const sz = new THREE.Vector2(), p0 = new THREE.Vector3(), p1 = new THREE.Vector3();
    lab.onBeforeRender = (r, sc, cam) => {
      r.getSize(sz);
      lab.parent.updateMatrixWorld();
      p0.copy(at).applyMatrix4(lab.parent.matrixWorld).project(cam); p1.copy(at).add(off).applyMatrix4(lab.parent.matrixWorld).project(cam);
      let ux = (p1.x - p0.x) * sz.x, uy = (p1.y - p0.y) * sz.y;
      const ul = Math.hypot(ux, uy);
      if (ul < 1e-6) { ux = 0; uy = 1; } else { ux /= ul; uy /= ul; }
      const hPx = (lab.scale.y / Math.tan((cam.fov || 26) * DEG / 2)) * sz.y / 2, wPx = hPx * lab.scale.x / lab.scale.y;
      const s = Math.abs(ux) * wPx / 2 + Math.abs(uy) * hPx / 2 + 5;
      lab.center.set(0.5 - (ux * s) / wPx, 0.5 - (uy * s) / hPx);
    };
    return lab;
  }
  function dot(group, p, r) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 8), new THREE.MeshBasicMaterial({ color: dimColor(), depthTest: false, transparent: true }));
    m.position.copy(V3(p)); m.renderOrder = 30; group.add(m);
  }
  function hlMat() {
    if (!mats.hl) mats.hl = new THREE.MeshStandardMaterial({ color: new THREE.Color(theme.accent), emissive: new THREE.Color(theme.accent), emissiveIntensity: 0.35, transparent: true, opacity: 0.88, roughness: 0.5, side: THREE.DoubleSide });
    return mats.hl;
  }
  function clearHighlight() {
    (refs.origin || []).forEach((g) => g.children.forEach((c) => { if (c.userData.origin) c.visible = true; }));
    hl.swapped.forEach(([m, mat]) => { m.material = mat; });
    hl.swapped = [];
    disposeTree(hlGroup); hlGroup.clear();
    disposeTree(hlPart); hlPart.clear();
  }
  function paint(objs) {
    objs.forEach((o) => o && o.traverse((m) => { if (m.isMesh && !m.isSprite && !m.userData.noHl) { hl.swapped.push([m, m.material]); m.material = hlMat(); } }));
  }
  // highlight(key, text): key is a setting's key (rig.chuck.dia, finish.stickout, ...),
  // text its value as shown (55 mm). Returns whether there's anything to show for it.
  // zoom: the setting is being edited. A tool's own sizes and the pass settings are a few mm
  // across, too small to read at the usual view, so the view closes in on the tool, and goes
  // back to where it was when the editing stops (unless you've moved it since)
  const DETAIL = /^op\.(tool_dia|tool_length|shank_dia|taper_deg|stepdown|pitch|stepover|leave)$/;
  let zoomBack = null, camMoved = false;
  function highlight(key, text, refit = true, zoom = false) {
    hl.key = key || null; hl.text = text || '';
    const detail = !!key && DETAIL.test(key.replace(/^(corners|rough|finish|index|parting)\./, 'op.'));
    if (zoomBack && (!key || (zoom && !detail))) { if (!camMoved) setCamera(zoomBack); zoomBack = null; }
    let any = false;
    try { any = applyHighlight(refit); } catch (e) { clearHighlight(); hl.key = null; requestRender(); return false; }
    if (any && zoom && detail) zoomIn();
    return any;
  }
  function zoomIn() {
    // the dimension lines and outlines (not the value's pill, which keeps its size on screen)
    const b = new THREE.Box3();
    hlGroup.children.forEach((c) => { if (!c.isSprite) b.expandByObject(c); });
    if (b.isEmpty()) return;
    camera.updateMatrixWorld();
    // how much of the view's height it takes now
    let y0 = Infinity, y1 = -Infinity;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
      const q = new THREE.Vector3(x, y, z).project(camera);
      y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y);
    }
    if ((y1 - y0) / 2 > 0.3) return;
    if (!zoomBack) zoomBack = getCamera();
    camMoved = false;
    const size = b.getSize(new THREE.Vector3()), m = Math.max(size.x, size.y, size.z);
    b.expandByScalar(Math.max(m * 0.35, 5));
    fitBox(b, camera.position.clone().sub(controls.target).normalize());
  }
  function applyHighlight(refit) {
    clearHighlight();
    const key = hl.key, text = hl.text;
    if (!key || !setup) { requestRender(); return false; }
    (refs.origin || []).forEach((g) => g.children.forEach((c) => { if (c.userData.origin) c.visible = false; }));
    const fx = setup.fixtures || [], F = (n) => fx.find((f) => f.name === n);
    const ch = F('chuck'), hd = F('headstock'), ce = F('live centre'), tl = F('tailstock');
    const R = setup.stockR, cx = setup.chuckX, tx = setup.tailX, targets = [];
    let n = 0;
    const dim = (...a) => { dimLine(hlGroup, ...a); n++; };
    const dimP = (...a) => { dimLine(hlPart, ...a); n++; };
    const td = tool && tool.userData.dims, tp = tool && tool.position;
    const toolParts = (want) => (tool ? tool.children.filter((c) => want(c.userData.part)) : []);
    // the tool on show is the operation being edited (a setting of another operation, only hovered, draws nothing on it)
    const kop = (key.match(/^(corners|rough|finish|index|parting)\./) || [])[1], mine = !kop || kop === op;
    const cutter = (p) => p !== 'nut' && p !== 'spindle', tc0 = mine && tool ? tool.userData.cut : null, st = (setup.steps && setup.steps[op]) || {};
    // a see-through outline of the cutter's end at (x, y), tip at z: where the next pass or layer goes
    const ghost = (x, y, z, h = Math.max(tc0.tr, 1)) => {
      const r = tc0.tr, m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.accent), wireframe: true, transparent: true, opacity: 0.5, depthTest: false }));
      m.rotation.x = Math.PI / 2; m.position.set(x, y, z + h / 2); m.renderOrder = 29; hlGroup.add(m);
    };
    // a solid slab of the cutter's width, from z0 up to z1: what one layer takes off
    const slab = (x, y, z0, z1) => {
      const r = tc0.tr, m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Math.max(0.05, z1 - z0), 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.accent), transparent: true, opacity: 0.6, depthTest: false }));
      m.rotation.x = Math.PI / 2; m.position.set(x, y, (z0 + z1) / 2); m.renderOrder = 29; hlGroup.add(m);
    };
    const k = key.replace(/^(corners|rough|finish|index|parting)\./, 'op.');
    const box = (b, which) => (b ? (targets.push(...(refs[which] || [])), b) : null);
    switch (k) {
      case 'rig.chuck.dia': if (box(ch, 'chuck')) { const x = (ch.x0 + ch.x1) / 2; dim([x, 0, ch.r], [x, -ch.r - 14, ch.r], [x, -ch.r - 14, -ch.r], [x, 0, -ch.r], text); } break;
      case 'rig.chuck.len': if (box(ch, 'chuck')) dim([ch.x0, 0, ch.r], [ch.x0, 0, ch.r + 14], [ch.x1, 0, ch.r + 14], [ch.x1, 0, ch.r], text); break;
      case 'rig.head.len': case 'rig.tail.len': {
        const b = box(/head/.test(k) ? hd : tl, /head/.test(k) ? 'head' : 'tail');
        if (b) dim([b.x0, b.y0, b.top], [b.x0, b.y0, b.top + 14], [b.x1, b.y0, b.top + 14], [b.x1, b.y0, b.top], text);
        break;
      }
      case 'rig.head.front': case 'rig.head.back': case 'rig.tail.front': case 'rig.tail.back': {
        const b = box(/head/.test(k) ? hd : tl, /head/.test(k) ? 'head' : 'tail');
        if (!b) break;
        // from the rotary axis out to that side, over the end nearer the part
        const y = /front/.test(k) ? b.y0 : b.y1, x = /head/.test(k) ? b.x1 : b.x0;
        dim([x, 0, b.top], [x, 0, b.top + 14], [x, y, b.top + 14], [x, y, b.top], text);
        dim([x, 0, 0], [x, 0, b.top + 14], [x, 0, b.top + 14], null, '');
        dot(hlGroup, [x, 0, 0], 2);
        break;
      }
      case 'rig.head.top': case 'rig.tail.top': {
        const b = box(/head/.test(k) ? hd : tl, /head/.test(k) ? 'head' : 'tail');
        if (!b) break;
        const x = /head/.test(k) ? b.x1 : b.x0;
        dim([x, b.y0, 0], [x, b.y0 - 14, 0], [x, b.y0 - 14, b.top], [x, b.y0, b.top], text);
        dim([x, 0, 0], [x, b.y0 - 14, 0], [x, b.y0 - 14, 0], null, '');
        dot(hlGroup, [x, 0, 0], 2);
        break;
      }
      case 'rig.chuck.jaws': box(ch, 'chuck'); break;
      case 'rig.tc.ztop': {
        // how high the tool tip can go above the axis: a dimension up to a see-through ceiling
        const zt = setup.rig && setup.rig.tc && Number(setup.rig.tc.ztop);
        if (!isFinite(zt) || setup.rig.tc.ztop === null) break;
        const x = tp ? tp.x : (cx + tx) / 2;
        dim([x, -R - 6, 0], [x, -R - 18, 0], [x, -R - 18, zt], [x, -R - 6, zt], text);
        const sheet = new THREE.Mesh(new THREE.PlaneGeometry(tx - cx + 80, 2 * R + 60), new THREE.MeshBasicMaterial({ color: dimColor(), transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }));
        sheet.position.set((cx + tx) / 2, 0, zt); sheet.renderOrder = 28; hlGroup.add(sheet);
        if (tool) targets.push(...toolParts(() => true));
        break;
      }
      case 'rig.corner': case 'rig.corner.dx': case 'rig.corner.dy': case 'rig.corner.dz': {
        // the corner you zero on and the legs from it to the G-code zero (measured, not the
        // keep-out box): X to the jaw face, Y to the axis, Z to the axis
        const T = text && typeof text === 'object' ? text : {}, c = (setup.rig && setup.rig.corner) || {};
        const nv = (v) => (v === null || v === undefined || v === '' || !isFinite(Number(v)) ? null : Number(v));
        const X = nv(c.dx) || 0, Y = nv(c.dy) || 0, Z = nv(c.dz) || 0, O = [cx, 0, 0];
        dot(hlGroup, O, 2.2);
        if (!X && !Y && !Z) {
          const lab = pill('set the offsets to see the corner'); lab.center.set(0.5, -0.6); lab.position.set(cx, 0, 0); hlGroup.add(lab); n++; break;
        }
        const C = [cx - X, -Y, -Z], P1 = [cx, -Y, -Z], P2 = [cx, 0, -Z], on = (q) => k === 'rig.corner' || k === 'rig.corner.' + q;
        if (Math.abs(X) > 0.01) dim(null, C, P1, null, T.x || '', { off: [0, 0, Math.sign(-Z) || 1], muted: !on('dx') });
        if (Math.abs(Y) > 0.01) dim(null, P1, P2, null, T.y || '', { off: [1, 0, 0], muted: !on('dy') });
        if (Math.abs(Z) > 0.01) dim(null, P2, O, null, T.z || '', { off: [0, -(Math.sign(Y) || 1), 0], muted: !on('dz') });
        // straight from the corner to the zero, like a tape across
        const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(C), V3(O)]), new THREE.LineDashedMaterial({ color: dimColor(), dashSize: 3, gapSize: 2.5, depthTest: false, transparent: true, opacity: 0.8 }));
        ln.computeLineDistances(); ln.renderOrder = 30; hlGroup.add(ln);
        // the corner, with the way to probe each face: X from the chuck side, Y and Z from
        // outside the housing toward the axis
        const cm = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.accent), depthTest: false, transparent: true }));
        cm.position.copy(V3(C)); cm.renderOrder = 31; hlGroup.add(cm);
        const dirs = [];
        if (Math.abs(X) > 0.01) dirs.push(new THREE.Vector3(-Math.sign(X), 0, 0));
        if (Math.abs(Y) > 0.01) dirs.push(new THREE.Vector3(0, Math.sign(Y), 0));
        if (Math.abs(Z) > 0.01) dirs.push(new THREE.Vector3(0, 0, Math.sign(Z)));
        dirs.forEach((d) => {
          const ah = new THREE.ArrowHelper(d, V3(C).addScaledVector(d, -17), 14, new THREE.Color(theme.accent).getHex(), 4.5, 3);
          ah.traverse((m) => { if (m.material) { m.material.depthTest = false; m.material.transparent = true; } m.renderOrder = 31; });
          hlGroup.add(ah);
        });
        // its label out past the corner, away from the legs
        hlGroup.add(beside(pill('touch off this corner'), V3(C), V3(C).sub(V3(O)).add(new THREE.Vector3(0, 0, 0.3 * Math.hypot(X, Y, Z)))));
        n++; break;
      }
      case 'tenons.chuck.dia': case 'tenons.chuck.depth': case 'tenons.chuck.len':
      case 'tenons.tailstock.dia': case 'tenons.tailstock.depth': case 'tenons.tailstock.len': {
        const want = /chuck/.test(k) ? 'chuck' : 'tailstock';
        const t = tenonList.find((q) => q.side === want) || tenonList[0];
        if (!t) break;
        tenonGroup.children.forEach((m) => { if (m.isMesh && m.userData.side === t.side) targets.push(m); });
        const r = t.r, zb = -Math.max(r, R) - 10;
        if (/\.dia$/.test(k)) { const x = t.side === 'chuck' ? t.x0 + 2 : t.x1 - 2; dim([x, 0, r], [x, -R - 10, r], [x, -R - 10, -r], [x, 0, -r], text); }
        else if (/\.depth$/.test(k)) dim([t.in0, 0, -r], [t.in0, 0, zb], [t.in1, 0, zb], [t.in1, 0, -r], text);
        else { const a = t.side === 'chuck' ? t.x0 : t.in1, b = t.side === 'chuck' ? t.in0 : t.x1; dim([a, 0, -r], [a, 0, zb], [b, 0, zb], [b, 0, -r], text); }
        break;
      }
      case 'rig.centre.dia': if (box(ce, 'centre')) dim([ce.x1, 0, ce.r], [ce.x1, -ce.r - 14, ce.r], [ce.x1, -ce.r - 14, -ce.r], [ce.x1, 0, -ce.r], text); break;
      case 'rig.centre.len': if (box(ce, 'centre')) dim([ce.x0, 0, 0], [ce.x0, 0, ce.r + 14], [ce.x1, 0, ce.r + 14], [ce.x1, 0, ce.r], text); break;
      case 'rig.centre.total': {
        if (!box(ce, 'centre')) break;
        const cb = fx.find((f) => f.name === 'live centre' && f.part === 'body'), x1 = cb ? cb.x1 : ce.x1;
        dim([ce.x0, 0, 0], [ce.x0, 0, ce.r + 22], [x1, 0, ce.r + 22], [x1, 0, ce.r], text);
        break;
      }
      case 'tailstock_x': {
        // the whole stock: from its end in the jaws to the live centre (the stock alone lights up)
        targets.push(...refs.stock);
        const x0 = cx - (setup.clamp || 0);
        dim([x0, 0, -R], [x0, 0, -R - 16], [tx, 0, -R - 16], [tx, 0, -R], text);
        break;
      }
      case 'stock.clamp': {
        // just the end in the jaws, seen through them
        const c = setup.clamp || 0;
        if (c > 0) {
          const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.accent), transparent: true, opacity: 0.55, depthTest: false });
          let o;
          if (setup.stockShape === 'round') o = xCylinder(R + 0.3, R + 0.3, cx - c, cx, m, 72);
          else { const h = setup.stockHalf || [R, R], g = new THREE.BoxGeometry(c, 2 * h[0] + 0.6, 2 * h[1] + 0.6); g.translate(cx - c / 2, 0, 0); o = new THREE.Mesh(g, m); }
          o.renderOrder = 29; hlPart.add(o);
        }
        dim([cx - c, 0, -R], [cx - c, 0, -R - 8], [cx, 0, -R - 8], [cx, 0, -R], text);
        break;
      }
      case 'chuck_clearance': targets.push(...refs.keepChuck); dim([cx, 0, -R], [cx, 0, -R - 10], [cx + setup.chuckClear, 0, -R - 10], [cx + setup.chuckClear, 0, -R], text); break;
      case 'tailstock_clearance': targets.push(...refs.keepTail); dim([tx - setup.tailClear, 0, -R], [tx - setup.tailClear, 0, -R - 10], [tx, 0, -R - 10], [tx, 0, -R], text); break;
      // to where the work starts: the chuck end tenon (setup.lead past it is the part)
      case 'model.part_start_x': if (bounds) { if (partMesh) targets.push(partMesh); const ws = bounds.min.x - (setup.lead || 0); dim([cx, 0, 0], [cx, 0, -R - 24], [ws, 0, -R - 24], [ws, 0, 0], text); } break;
      case 'model.scale': case 'model.roll': case 'model.centre': case 'model.axis': case 'model.flip': if (partMesh) targets.push(partMesh); break;
      case 'stock.dia': {
        targets.push(...refs.stock); const x = (cx + tx) / 2;
        dim([x, 0, R], [x, -R - 12, R], [x, -R - 12, -R], [x, 0, -R], text); break;
      }
      case 'stock.width': case 'stock.height': {
        targets.push(...refs.stock); const h = setup.stockHalf || [R, R], x = cx + 10;
        if (k === 'stock.width') dimP([x, -h[0], h[1]], [x, -h[0], h[1] + 12], [x, h[0], h[1] + 12], [x, h[0], h[1]], text);
        else dimP([x, -h[0], h[1]], [x, -h[0] - 12, h[1]], [x, -h[0] - 12, -h[1]], [x, -h[0], -h[1]], text);
        break;
      }
      case 'safe_clearance': if (tp) { targets.push(...toolParts(cutter)); dim([tp.x - 8, 0, R], [tp.x - 14, 0, R], [tp.x - 14, 0, tp.z], [tp.x - 8, 0, tp.z], text); } break;
      case 'op.stickout': if (td) { targets.push(...toolParts(cutter)); const y = -td.nd / 2 - 10; dim([tp.x, 0, tp.z], [tp.x, y, tp.z], [tp.x, y, tp.z + td.so], [tp.x, -td.nd / 2, tp.z + td.so], text); } break;
      case 'op.tool': if (tp) targets.push(...toolParts(cutter)); break;
      // the tool's own sizes: across its end (a ball at its widest), along its flutes, across
      // its shank, and a tapered ball's cone against its axis
      case 'op.tool_dia': if (tc0) {
        targets.push(...toolParts((p) => p === 'flutes'));
        const r = tc0.tr, z = tp.z + (tc0.ball ? r : 0), y = -Math.max(r, 3) - 8;
        dim([tp.x - r, 0, z], [tp.x - r, y, z], [tp.x + r, y, z], [tp.x + r, 0, z], text);
      } break;
      case 'op.tool_length': if (tc0) {
        targets.push(...toolParts((p) => p === 'flutes'));
        const r = Math.max(tc0.tr, tc0.taper ? tc0.rs : 0), x = tp.x + r + 8, z1 = tp.z + tc0.len;
        dim([tp.x + r, 0, tp.z], [x, 0, tp.z], [x, 0, z1], [tp.x + r, 0, z1], text);
      } break;
      case 'op.shank_dia': if (tc0) {
        targets.push(...toolParts((p) => p === 'shank' || (tc0.taper > 0 && p === 'flutes')));
        const r = tc0.rs, z = tp.z + (tc0.so > tc0.top ? (tc0.top + tc0.so) / 2 : tc0.top), y = -Math.max(r, 3) - 8;
        dim([tp.x - r, 0, z], [tp.x - r, y, z], [tp.x + r, y, z], [tp.x + r, 0, z], text);
      } break;
      case 'op.taper_deg': if (tc0 && tc0.taper > 0) {
        targets.push(...toolParts((p) => p === 'flutes'));
        const a = [tp.x + tc0.rc, 0, tp.z + tc0.zt], up = tp.z + tc0.ztop + 6;
        dimLine(hlGroup, null, a, [tp.x + tc0.rc, 0, up], null, '', { plain: true });
        dimLine(hlGroup, null, a, [tp.x + tc0.rs + (up - tp.z - tc0.ztop) * Math.tan(tc0.taper), 0, up], null, text, { plain: true, off: [1, 0, 0] });
        n++;
      } break;
      // the pass settings, at the tool: the next layer down, the next turn along X, the next
      // pass across in Y, what's left on the part
      case 'op.stepdown': if (tc0 && st.stepdown > 0) {
        // one layer: a slab as deep as the stepdown under the tool's end
        const r = tc0.tr, d = st.stepdown, x = tp.x - r - 8;
        slab(tp.x, 0, tp.z - d, tp.z);
        dim([tp.x - r, 0, tp.z], [x, 0, tp.z], [x, 0, tp.z - d], [tp.x - r, 0, tp.z - d], text);
      } break;
      case 'op.pitch': if (tc0 && st.pitch > 0) {
        const d = st.pitch, z = tp.z - 5;
        ghost(tp.x + d, 0, tp.z);
        dim([tp.x, 0, tp.z], [tp.x, 0, z], [tp.x + d, 0, z], [tp.x + d, 0, tp.z], text);
      } break;
      case 'op.stepover': if (tc0 && st.stepover > 0) {
        const d = st.stepover, z = tp.z - 5;
        ghost(tp.x, d, tp.z);
        dim([tp.x, 0, tp.z], [tp.x, 0, z], [tp.x, d, z], [tp.x, d, tp.z], text);
      } break;
      case 'op.leave': if (tc0 && st.leave >= 0) {
        targets.push(...toolParts((p) => p === 'flutes'));
        if (partMesh) targets.push(partMesh);
        const r = tc0.tr, d = st.leave, x = tp.x + r + 8;
        dim([tp.x + r, 0, tp.z], [x, 0, tp.z], [x, 0, tp.z - d], [tp.x - r, 0, tp.z - d], text);
      } break;
      // how far past the rotary axis the tool tip may go: from the axis down, at the tool
      case 'below_axis': if (tc0) {
        targets.push(...toolParts((p) => p === 'flutes'));
        const b = setup.below || {}, d = b.cap !== null && b.cap !== undefined ? b.cap : b.used || 0, y = -R - 14;
        dot(hlGroup, [tp.x, 0, 0], 2);
        if (d > 0) { ghost(tp.x, 0, -d); dim([tp.x, 0, 0], [tp.x, y, 0], [tp.x, y, -d], [tp.x, 0, -d], text); }
        else { const lab = pill(text); lab.center.set(0.5, 0); lab.position.set(tp.x, y, 4); hlGroup.add(lab); dim([tp.x, 0, 0], [tp.x, y, 4], [tp.x, y, 4], null, ''); }
        n++;
      } break;
      // the angle step: a spoke round the stock where the tool is, every step
      case 'angle_step_deg': if (tp) {
        const s = Math.max(0.5, Number(setup.angleStep) || 2), seg = [], x = tp.x;
        for (let a = 0; a < 360 - 1e-6; a += s) { const t = a * DEG; seg.push(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, R * Math.sin(t), R * Math.cos(t))); }
        const ls = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), new THREE.LineBasicMaterial({ color: dimColor(), depthTest: false, transparent: true, opacity: 0.7 }));
        ls.renderOrder = 30; hlPart.add(ls);
        const lab = pill(text + ' apart'); lab.center.set(0.5, 0); lab.position.set(x, 0, R + 4); hlGroup.add(lab);
        n++;
      } break;
      case 'stock.shape': targets.push(...refs.stock); break;
      case 'tenons.ends': case 'tenons.same': tenonGroup.children.forEach((m) => { if (m.isMesh) targets.push(m); }); break;
      case 'rig.nut.dia': if (td) { targets.push(...toolParts((p) => p === 'nut')); const z = tp.z + td.so + td.nl / 2, y = -td.nd / 2 - 10; dim([tp.x - td.nd / 2, -td.nd / 4, z], [tp.x - td.nd / 2, y, z], [tp.x + td.nd / 2, y, z], [tp.x + td.nd / 2, -td.nd / 4, z], text); } break;
      case 'rig.nut.len': if (td) { targets.push(...toolParts((p) => p === 'nut')); const x = tp.x + td.nd / 2 + 10; dim([tp.x + td.nd / 2, 0, tp.z + td.so], [x, 0, tp.z + td.so], [x, 0, tp.z + td.so + td.nl], [tp.x + td.nd / 2, 0, tp.z + td.so + td.nl], text); } break;
      case 'rig.spindle.dia': if (td) { targets.push(...toolParts((p) => p === 'spindle')); const z = tp.z + td.so + td.nl + 30, y = -td.sd / 2 - 12; dim([tp.x - td.sd / 2, 0, z], [tp.x - td.sd / 2, y, z], [tp.x + td.sd / 2, y, z], [tp.x + td.sd / 2, 0, z], text); } break;
      case 'rig.clear': if (td) {
        targets.push(...toolParts((p) => p === 'nut' || p === 'spindle'));
        const c = Number(String(text).replace(/[^\d.]/g, '')) || 0, g = (setup.rig && setup.rig.clear) || 2;
        const shell = (r, z0, h) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.accent), wireframe: true, transparent: true, opacity: 0.45, depthTest: false })); m.rotation.x = Math.PI / 2; m.position.set(tp.x, 0, z0 + h / 2); m.renderOrder = 29; hlGroup.add(m); };
        shell(td.nd / 2 + g, tp.z + td.so - g, td.nl + g); shell(td.sd / 2 + g, tp.z + td.so + td.nl, 90);
        const zc = tp.z + td.so + td.nl / 2;
        dim(null, [tp.x + td.nd / 2, -td.nd / 2 - 6, zc], [tp.x + td.nd / 2 + g, -td.nd / 2 - 6, zc], null, text);
        n++; break;
      }
      case 'rig.tc.change.x': case 'rig.tc.change.y': case 'rig.tc.setter.x': case 'rig.tc.setter.y': case 'rig.tc.route': case 'rig.tc.zsafe': {
        const want = /change/.test(k) ? 'change' : /setter/.test(k) ? 'setter' : 'route';
        tcGroup.children.forEach((g) => { if (g.userData.part === want || (want === 'route' && g.userData.part === 'change')) targets.push(g); });
        break;
      }
      case 'rig.tc.zero.x': case 'rig.tc.zero.y': {
        dot(hlGroup, [cx, 0, 0], 3.5);
        const lab = pill('rotary zero: X0 at the jaw face, Y0 Z0 on the axis');
        lab.center.set(0.5, 0); lab.position.set(cx, -R - 14, R + 8); hlGroup.add(lab);
        dim([cx, 0, 0], [cx, -R - 14, R + 8], [cx, -R - 14, R + 8], null, '');
        n++; break;
      }
      default: break;
    }
    paint(targets);
    const any = n > 0 || targets.length > 0;
    if (any && refit) keepInView(targets);
    requestRender();
    return any;
  }
  // if the highlight is off the screen, fit it (with the setup round it) from where the
  // camera already looks
  function keepInView(targets) {
    const b = new THREE.Box3();
    targets.forEach((o) => b.expandByObject(o));
    [hlGroup, hlPart].forEach((g) => { if (g.children.length) b.expandByObject(g); });
    if (b.isEmpty()) return;
    camera.updateMatrixWorld();
    let inside = true;
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
      const p = new THREE.Vector3(x, y, z).project(camera);
      if (p.z > 1 || Math.abs(p.x) > 1 || Math.abs(p.y) > 1) inside = false;
    }
    if (inside) return;
    const d = camera.position.clone().sub(controls.target).normalize();
    const c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3()).multiplyScalar(0.9);
    b.expandByVector(size);
    fitBox(b, d, c);
  }

  // ---------------- camera
  function frame(whole) {
    const b = new THREE.Box3();
    if (!whole && bounds && setup) {
      const R = Math.max(setup.stockR, 8) * 1.15;
      b.copy(bounds);
      b.expandByPoint(new THREE.Vector3(setup.chuckX - 20, -R, -R));
      b.expandByPoint(new THREE.Vector3(Math.min(setup.tailX, bounds.max.x + 20), R, R));
      return b;
    }
    if (setup) {
      const fx = setup.fixtures || [], R = Math.max(setup.stockR * 1.5 + 6, 30, ...fx.map((f) => (f.kind === 'box' ? Math.max(-f.y0, f.y1, f.top) : f.r)));
      const xa = Math.min(setup.chuckX - 75, ...fx.map((f) => f.x0)), xb = Math.max(setup.tailX + 75, ...fx.map((f) => f.x1));
      b.expandByPoint(new THREE.Vector3(xa, -R, -R));
      b.expandByPoint(new THREE.Vector3(xb, R, R));
    }
    if (bounds) b.union(bounds);
    // the whole setup takes in the tool change and tool setter too
    if (tcData && tcData.change) [tcData.change, tcData.setter].forEach((q) => { if (q) b.expandByPoint(new THREE.Vector3(q.x, q.y, 0)); });
    if (b.isEmpty()) b.set(new THREE.Vector3(-50, -50, -50), new THREE.Vector3(250, 50, 50));
    return b;
  }
  function view(name) {
    const whole = name === 'whole';
    const b = frame(whole);
    // the part view looks from the tailstock side so the chuck doesn't loom in front
    const dirs = { front: [0, -1, 0.001], top: [0, -0.001, 1], end: [1, -0.25, 0.25], iso: [0.42, -1, 0.6], whole: [-0.3, -1, 0.55] };
    fitBox(b, new THREE.Vector3(...(dirs[name] || dirs.iso)).normalize());
  }
  // fit a box into the view, looking along d
  function fitBox(b, d, centre) {
    const c = centre || b.getCenter(new THREE.Vector3());
    // fit the box's projected extent into the view
    const right = new THREE.Vector3().crossVectors(d, camera.up).normalize(), up = new THREE.Vector3().crossVectors(right, d).normalize();
    const corners = [];
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) corners.push(new THREE.Vector3(x, y, z).sub(c));
    let w = 0, h = 0, depth = 0;
    for (const p of corners) { w = Math.max(w, Math.abs(p.dot(right))); h = Math.max(h, Math.abs(p.dot(up))); depth = Math.max(depth, Math.abs(p.dot(d))); }
    const tanV = Math.tan(camera.fov * DEG / 2), tanH = tanV * camera.aspect;
    const dist = Math.max(h / tanV, w / tanH) * 1.12 + depth;
    controls.target.copy(c);
    camera.position.copy(c).addScaledVector(d, dist);
    camera.updateProjectionMatrix();
    controls.update();
    requestRender();
  }
  function getCamera() { return { p: camera.position.toArray(), t: controls.target.toArray() }; }
  function setCamera(v) {
    if (!v || !v.p || !v.t) return;
    camera.position.fromArray(v.p); controls.target.fromArray(v.t);
    controls.update(); requestRender();
  }

  // click (not drag) on the part -> point in the part's frame at A = 0
  let down = null;
  function ghostUnder(e) {
    if (!idx.ghosts.length || simOn) return -1;
    const r = renderer.domElement.getBoundingClientRect(), ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObject(idxGroup, true).find((h) => h.object.userData.idxGhost);
    return hit ? hit.object.userData.idx : -1;
  }
  renderer.domElement.addEventListener('pointerdown', (e) => {
    down = [e.clientX, e.clientY];
    const i = ghostUnder(e);
    if (i < 0) return;
    // a press on an angle's tool picks it; dragging it (when editable) turns it about the axis
    idx.drag = { i, moved: false, a: idx.list[i].a, startA: angleAt(e) };
    controls.enabled = false;
    renderer.domElement.setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, true);
  renderer.domElement.addEventListener('pointermove', (e) => {
    const g = idx.drag;
    if (!g) {
      if (idx.ghosts.length && !simOn && e.buttons === 0) renderer.domElement.style.cursor = ghostUnder(e) >= 0 ? (idx.opts.editable ? 'grab' : 'pointer') : '';
      return;
    }
    if (!idx.opts.editable || g.startA === null) return;
    if (!g.moved && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 4) return;
    const now = angleAt(e);
    if (now === null) return;
    g.moved = true;
    renderer.domElement.style.cursor = 'grabbing';
    const step = e.shiftKey ? 1 : 5;
    let a = Math.round((idx.list[g.i].a + ((now - g.startA + 540) % 360 - 180)) / step) * step;
    a = ((a % 360) + 360) % 360;
    g.a = a;
    const gh = idx.ghosts[g.i];
    gh.pivot.rotation.x = -dirOf(a);
    gh.pivot.remove(gh.label); gh.label.material.map.dispose(); gh.label.material.dispose();
    gh.label = textSprite('A' + a + '\u00b0', OP_COLORS.index, 30);
    gh.label.position.set(0, 0, (idx.opts.rTip || 25) + (idx.opts.tool.len || 20) + 58);
    gh.label.scale.set(7 * gh.label.userData.aspect, 7, 1);
    gh.pivot.add(gh.label);
    if (idx.opts.pick === g.i) { const d = dirOf(a), ext = reach.shadow.camera.right; reach.position.set(reach.target.position.x, Math.sin(d) * ext * 3, Math.cos(d) * ext * 3); }
    if (opts.onIndexDrag) opts.onIndexDrag(g.i, a, false);
    requestRender();
  });
  const endDrag = (e) => {
    const g = idx.drag;
    if (!g) return false;
    idx.drag = null;
    controls.enabled = true;
    renderer.domElement.style.cursor = '';
    try { renderer.domElement.releasePointerCapture(e.pointerId); } catch (err) {}
    if (g.moved) { idx.list[g.i].a = g.a; if (opts.onIndexDrag) opts.onIndexDrag(g.i, g.a, true); }
    else if (opts.onIndexPick) opts.onIndexPick(g.i);
    down = null;
    return true;
  };
  renderer.domElement.addEventListener('pointercancel', endDrag);
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (endDrag(e)) return;
    if (!down || !partMesh || !opts.onPick) return;
    if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    const r = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(partMesh, false)[0];
    if (!hit) return;
    const p = partGroup.worldToLocal(hit.point.clone());
    opts.onPick({ x: p.x, y: p.y, z: p.z });
  });

  return {
    setTheme(t) { theme = Object.assign(theme, t); makeMats(); if (setup) buildMachine(setup); setTenons(tenonList); if (partMesh) partMesh.material = partMat(); if (idx.list.length) buildIndex(); Object.keys(pathLines).forEach((k) => { pathLines[k].material = mats[k] || mats.finish; }); requestRender(); },
    setSetup(s) { aSign = s.aSign || 1; buildMachine(s); setA(aDeg); },
    setPart, setPartBad, setToolpath, setOp, setA, view, getCamera, setCamera, setTenons,
    tenonCount() { return tenonGroup.children.filter((o) => o.isMesh).length; },
    simSet, simUpdate, simMode, simToolAt, simOverlay, simGhost,
    setIndexAngles, setLeftover, setToolChanges, highlight,
    highlighted() { return hl.key ? { key: hl.key, parts: hl.swapped.length, dims: hlGroup.children.length + hlPart.children.length, onPart: hlPart.children.length } : null; },
    toolChangeShown() { return !!(tcData && tcData.change && tcGroup.children.length); },
    toolChangeRoutes() { return tcData && tcData.paths ? tcData.paths.length : 0; },
    fixtures() { return (setup && setup.fixtures || []).map((f) => Object.assign({}, f)); },
    origin() {
      const o = refs.origin && refs.origin[0];
      if (!o) return null;
      o.updateMatrixWorld(true);
      const p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld);
      let onTop = true; o.traverse((m) => { if (m.material && m.material.depthTest !== false) onTop = false; });
      return { x: p.x, y: p.y, z: p.z, onTop, label: o.children.some((c) => c.userData.origin) };
    },
    jaws() {
      partGroup.updateMatrixWorld(true);
      return jawGroup.children.map((j) => { const p = new THREE.Vector3().setFromMatrixPosition(j.matrixWorld); return { x: p.x, y: p.y, z: p.z }; });
    },
    headColor() { const h = refs.head && refs.head[0]; return h ? '#' + h.material.color.getHexString() : null; },
    chuckColor() { const c = refs.chuck && refs.chuck[0]; return c ? '#' + c.material.color.getHexString() : null; },
    // what each part of the setup is drawn in
    colors() {
      const hex = (m) => (m && m.material ? '#' + m.material.color.getHexString() : null);
      const part = (p) => (tool ? tool.children.find((c) => c.userData.part === p) : null);
      return { chuck: hex(refs.chuck && refs.chuck[0]), jaw: hex(jawGroup.children[0]), head: hex(refs.head && refs.head[0]), tail: hex(refs.tail && refs.tail[0]), centre: hex(refs.centre && refs.centre[0]), spindle: hex(part('spindle')), nut: hex(part('nut')) };
    },
    stockSpan() { const st = refs.stock && refs.stock[0]; if (!st) return null; const b = new THREE.Box3().setFromObject(st); return { x0: b.min.x, x1: b.max.x }; },
    // how light the headstock comes out on screen (0..1), from the rendered pixels
    headShade() {
      const h = refs.head && refs.head[0];
      if (!h) return null;
      renderer.render(scene, camera);
      const b = new THREE.Box3().setFromObject(h), c = b.getCenter(new THREE.Vector3()), p = c.clone().project(camera);
      const gl = renderer.getContext(), w = gl.drawingBufferWidth, hh = gl.drawingBufferHeight;
      const px = Math.round((p.x + 1) / 2 * w), py = Math.round((p.y + 1) / 2 * hh), out = new Uint8Array(4);
      gl.readPixels(px, py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
      return (0.299 * out[0] + 0.587 * out[1] + 0.114 * out[2]) / 255;
    },
    holderOpacity() { requestRender(); fadeHolders(); return { tool: tool ? tool.userData.opacity : null, sim: simTool ? simTool.userData.opacity : null }; },
    // how see-through the chuck end and the tailstock end are drawn now (1: solid)
    // which way the A+ arrow points at its head (its Y: -Y toward you, +Y away)
    aArrow() { const h = refs.aHead; return h ? { y: h.position.y, dir: new THREE.Vector3(0, 1, 0).applyQuaternion(h.quaternion).y } : null; },
    endsOpacity() { fadeHolders(); return sides ? Object.assign({}, sides.opacity) : null; },
    // look along a direction (as if orbited there), at the part or the whole setup
    lookFrom(d, whole) { fitBox(frame(!!whole), new THREE.Vector3(...d).normalize()); },
    toolHolder() { return tool ? { stickout: setup && setup.stickout && setup.stickout[op], parts: tool.children.length } : null; },
    indexAngleCount() { return idx.ghosts.length; },
    indexReach() { return reach.intensity > 0; },
    leftoverCount() { return lvMesh && lvMesh.visible ? lvMesh.count : 0; },
    // where an angle's tool shows on screen (tests drive the drag with it)
    indexScreen(i, along = 0.5, radius = null) {
      const gh = idx.ghosts[i];
      if (!gh) return null;
      const v = new THREE.Vector3(0, 0, radius !== null ? radius : (idx.opts.rTip || 25) + ((idx.opts.tool && idx.opts.tool.len) || 20) * along);
      gh.pivot.localToWorld(v); v.project(camera);
      const r = renderer.domElement.getBoundingClientRect();
      return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
    },
    overlayCount() { return ovMesh && ovMesh.visible ? ovMesh.count : 0; },
    hasPart() { return !!partMesh; },
    snapshot() { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); },
    dispose() {
      if (!alive) return;
      alive = false; cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      controls.dispose();
      disposeTree(scene);
      Object.values(mats).forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
  };
}
