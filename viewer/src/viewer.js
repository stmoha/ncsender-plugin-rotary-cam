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

  scene.add(new THREE.HemisphereLight(0xf2f6ff, 0x3a4250, 1.6));
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
  let tenonList = [];
  let partMesh = null, pathLines = {}, aSign = 1, aDeg = 0, op = 'finish', tool = null;
  let simMesh = null, simOn = false, simTool = null, simToolKey = '', ghost = false, ovMesh = null, ovData = null;
  let theme = { ink: '#1e2a32', muted: '#5e6b75', accent: '#1abc9c', dark: false };
  let setup = null, bounds = null;

  const mats = {};
  function makeMats() {
    Object.values(mats).forEach((m) => m.dispose());
    const metal = theme.dark ? 0x7d8794 : 0x9aa3ad;
    mats.metal = new THREE.MeshStandardMaterial({ color: metal, metalness: 0.55, roughness: 0.42 });
    mats.metalDark = new THREE.MeshStandardMaterial({ color: theme.dark ? 0x4a525d : 0x5f6872, metalness: 0.6, roughness: 0.4 });
    mats.stock = new THREE.MeshStandardMaterial({ color: 0xd9b98c, transparent: true, opacity: theme.dark ? 0.12 : 0.16, roughness: 0.9, depthWrite: false, side: THREE.FrontSide });
    mats.stockEdge = new THREE.LineBasicMaterial({ color: 0xc49a5c, transparent: true, opacity: 0.7 });
    mats.keep = new THREE.MeshBasicMaterial({ color: 0xd64545, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide });
    mats.part = new THREE.MeshStandardMaterial({ color: theme.dark ? 0x9db4d6 : 0x7f9bc4, metalness: 0.08, roughness: 0.55, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    mats.partBad = new THREE.MeshStandardMaterial({ color: 0xd66a5a, metalness: 0.05, roughness: 0.6, side: THREE.DoubleSide });
    mats.shank = new THREE.MeshStandardMaterial({ color: 0xc7ccd2, metalness: 0.8, roughness: 0.25 });
    mats.sim = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.75, side: THREE.DoubleSide });
    mats.simGhost = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.75, side: THREE.DoubleSide, transparent: true, opacity: 0.16, depthWrite: false });
    mats.overlay = new THREE.MeshStandardMaterial({ color: new THREE.Color(OP_COLORS.index), roughness: 0.6, metalness: 0.05 });
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
  controls.addEventListener('start', () => { if (opts.onUserCamera) opts.onUserCamera(); });
  let raf = 0, alive = true;
  const loop = () => {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    const moved = controls.update();
    if (needsRender || moved) { needsRender = false; renderer.render(scene, camera); }
  };
  loop();

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
  function buildMachine(s) {
    disposeTree(machine); machine.clear();
    disposeTree(stockGroup); stockGroup.clear();
    setup = s;
    const R = s.stockR, chuckR = Math.max(R * 1.5 + 6, 30), x0 = s.chuckX;
    const jawLen = 14, bodyLen = 34;
    machine.add(xCylinder(chuckR, chuckR, x0 - jawLen - bodyLen, x0 - jawLen, mats.metal, 64));
    machine.add(xCylinder(chuckR * 0.8, chuckR * 0.8, x0 - jawLen - bodyLen - 22, x0 - jawLen - bodyLen, mats.metalDark, 48));
    // three jaws on the stock's largest radius
    const jawR = s.stockShape === 'round' ? R : Math.min(R, Math.max(s.stockHalf[0], s.stockHalf[1]));
    for (let k = 0; k < 3; k++) {
      const a = k * 120 * DEG + 90 * DEG;
      const h = Math.max(10, chuckR - jawR - 2);
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(jawLen, Math.max(8, R * 0.55), h), mats.metalDark);
      jaw.position.set(x0 - jawLen / 2, Math.cos(a) * (jawR + h / 2), Math.sin(a) * (jawR + h / 2));
      jaw.rotation.x = a - 90 * DEG;
      machine.add(jaw);
    }
    const xt = s.tailX, coneL = Math.max(14, R * 0.8), coneR = Math.max(6, R * 0.45);
    machine.add(xCylinder(0.01, coneR, xt, xt + coneL, mats.metal, 32));
    machine.add(xCylinder(coneR * 1.25, coneR * 1.25, xt + coneL, xt + coneL + 30, mats.metalDark, 32));
    machine.add(xCylinder(chuckR * 0.75, chuckR * 0.75, xt + coneL + 30, xt + coneL + 75, mats.metal, 48));
    // stock: turns with the part
    const sx0 = x0 - jawLen, sx1 = xt;
    if (s.stockShape === 'round') {
      const stock = xCylinder(R, R, sx0, sx1, mats.stock, 72, true);
      stock.renderOrder = 2;
      stockGroup.add(stock);
      for (const x of [x0, xt]) {
        stockGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 73 }, (_, i) => new THREE.Vector3(x, R * Math.cos(i * 5 * DEG), R * Math.sin(i * 5 * DEG)))), mats.stockEdge));
      }
    } else {
      const geo = new THREE.BoxGeometry(sx1 - sx0, s.stockHalf[0] * 2, s.stockHalf[1] * 2);
      geo.translate((sx0 + sx1) / 2, 0, 0);
      const box = new THREE.Mesh(geo, mats.stock);
      box.renderOrder = 2;
      stockGroup.add(box);
      stockGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), mats.stockEdge));
    }
    const kR = R + 1.5;
    if (s.chuckClear > 0) machine.add(xCylinder(kR, kR, x0, x0 + s.chuckClear, mats.keep, 48, true));
    if (s.tailClear > 0) machine.add(xCylinder(kR, kR, xt - s.tailClear, xt, mats.keep, 48, true));
    const axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x0 - jawLen - bodyLen - 30, 0, 0), new THREE.Vector3(xt + coneL + 90, 0, 0)]), mats.axis);
    axis.computeLineDistances();
    machine.add(axis);
    // A+ arrow
    const arcR = R + 7, ax = xt - Math.max(12, s.tailClear + 6);
    const arcPts = [];
    for (let i = 0; i <= 40; i++) {
      const t = (-50 + i * 2.5) * DEG * aSign;
      arcPts.push(new THREE.Vector3(ax, -Math.sin(t) * arcR, Math.cos(t) * arcR));
    }
    machine.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(aSign > 0 ? arcPts : arcPts.slice().reverse()), new THREE.LineBasicMaterial({ color: new THREE.Color(theme.accent) })));
    const end = aSign > 0 ? arcPts[arcPts.length - 1] : arcPts[0];
    const prev = aSign > 0 ? arcPts[arcPts.length - 3] : arcPts[2];
    const head = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.accent) }));
    head.position.copy(end);
    head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(prev).normalize());
    machine.add(head);
    const aLabel = textSprite('A+', theme.accent);
    aLabel.position.set(ax, -arcR * 0.9 * aSign, arcR * 0.75);
    aLabel.scale.set(8 * aLabel.userData.aspect, 8, 1);
    machine.add(aLabel);
    // axis triad below the chuck
    const tri = new THREE.Group();
    const L = Math.max(14, R * 0.8);
    [[1, 0, 0, '#d64545', 'X'], [0, 1, 0, '#2fa36b', 'Y'], [0, 0, 1, '#2a78d6', 'Z']].forEach(([x, y, z, col, name]) => {
      const d = new THREE.Vector3(x, y, z);
      tri.add(new THREE.ArrowHelper(d, new THREE.Vector3(), L, new THREE.Color(col).getHex(), 4, 2.4));
      const lab = textSprite(name, col);
      lab.position.copy(d.clone().multiplyScalar(L + 5));
      lab.scale.set(6 * lab.userData.aspect, 6, 1);
      tri.add(lab);
    });
    tri.position.set(x0 - jawLen - bodyLen - 26, -chuckR - 8, -chuckR);
    machine.add(tri);
    const lc = textSprite('chuck · X0 at the jaw face', theme.muted, 28);
    lc.position.set(x0 - jawLen - bodyLen / 2, 0, chuckR + 9);
    lc.scale.set(6 * lc.userData.aspect, 6, 1);
    machine.add(lc);
    const lt = textSprite('tailstock', theme.muted, 28);
    lt.position.set(xt + coneL + 50, 0, chuckR * 0.75 + 9);
    lt.scale.set(6 * lt.userData.aspect, 6, 1);
    machine.add(lt);
    buildTool();
    requestRender();
  }

  // the selected operation's tool, tip one retract above the stock
  function buildTool() {
    if (tool) { machine.remove(tool); disposeTree(tool); tool = null; }
    const t = setup && setup.tools && setup.tools[op];
    if (!t || !(t.dia > 0)) return;
    tool = makeTool(t, op);
    tool.position.set(setup.toolX != null ? setup.toolX : (setup.chuckX + setup.tailX) / 2, 0, setup.stockR + setup.clear);
    tool.visible = !simOn;
    machine.add(tool);
  }
  function makeTool(t, which) {
    const tr = t.dia / 2, len = t.len || 20, ball = !!t.ball;
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
      lathe.rotation.x = Math.PI / 2;
      tool.add(lathe);
      const shank = new THREE.Mesh(new THREE.CylinderGeometry(rs, rs, 30, 32), mats.shank);
      shank.rotation.x = Math.PI / 2; shank.position.z = top + 15;
      tool.add(shank);
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(rs * 2.6 + 6, rs * 2.6 + 6, 16, 6), mats.metal);
      nut.rotation.x = Math.PI / 2; nut.position.z = top + 38;
      tool.add(nut);
      return tool;
    }
    if (ball) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(tr, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), flutes);
      b.rotation.x = Math.PI / 2; b.position.z = tr;
      tool.add(b);
    }
    const base = ball ? tr : 0;
    const flute = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, len - base, 32, 1, false), flutes);
    flute.rotation.x = Math.PI / 2; flute.position.z = base + (len - base) / 2;
    tool.add(flute);
    const shank = new THREE.Mesh(new THREE.CylinderGeometry(tr, tr, 30, 32), mats.shank);
    shank.rotation.x = Math.PI / 2; shank.position.z = len + 15;
    tool.add(shank);
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(tr * 2.6 + 6, tr * 2.6 + 6, 16, 6), mats.metal);
    nut.rotation.x = Math.PI / 2; nut.position.z = len + 38;
    tool.add(nut);
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
    partMesh = new THREE.Mesh(geo, opt.bad ? mats.partBad : mats.part);
    partGroup.add(partMesh);
    requestRender();
  }
  function setPartBad(bad) { if (partMesh) { partMesh.material = bad ? mats.partBad : mats.part; requestRender(); } }

  // tenons: [{ x0, x1, r, in0, in1 }]. The cylinder shows wherever it sticks out of the
  // part; a ring (seen through the part) marks how far it reaches into the part.
  function setTenons(list) {
    tenonList = list || [];
    disposeTree(tenonGroup); tenonGroup.clear();
    for (const t of tenonList) {
      if (!(t.r > 0) || !(t.x1 > t.x0)) continue;
      const c = xCylinder(t.r, t.r, t.x0, t.x1, mats.tenon, 64);
      c.renderOrder = 4;
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
    if (tool) tool.visible = !simOn;
    if (simTool) simTool.visible = simOn;
    Object.keys(pathLines).forEach((k) => { pathLines[k].visible = k === op && !simOn; });
    requestRender();
  }
  // the tool doing the cutting at this moment, in machine coordinates
  function simToolAt(t, which, x, y, z) {
    const key = t ? which + ':' + t.dia + ':' + t.ball + ':' + (t.taper || 0) + ':' + (t.shank || 0) : '';
    if (key !== simToolKey) {
      if (simTool) { scene.remove(simTool); disposeTree(simTool); simTool = null; }
      simToolKey = key;
      if (t) { simTool = makeTool(t, which); scene.add(simTool); }
    }
    if (simTool) { simTool.visible = simOn; simTool.position.set(x, y, z); }
    requestRender();
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
      const R = Math.max(setup.stockR * 1.5 + 6, 30);
      b.expandByPoint(new THREE.Vector3(setup.chuckX - 75, -R, -R));
      b.expandByPoint(new THREE.Vector3(setup.tailX + Math.max(14, setup.stockR * 0.8) + 75, R, R));
    }
    if (bounds) b.union(bounds);
    if (b.isEmpty()) b.set(new THREE.Vector3(-50, -50, -50), new THREE.Vector3(250, 50, 50));
    return b;
  }
  function view(name) {
    const whole = name === 'whole';
    const b = frame(whole), c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3());
    // the part view looks from the tailstock side so the chuck doesn't loom in front
    const dirs = { front: [0, -1, 0.001], top: [0, -0.001, 1], end: [1, -0.25, 0.25], iso: [0.42, -1, 0.6], whole: [-0.3, -1, 0.55] };
    const d = new THREE.Vector3(...(dirs[name] || dirs.iso)).normalize();
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
  renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
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
    setTheme(t) { theme = Object.assign(theme, t); makeMats(); if (setup) buildMachine(setup); setTenons(tenonList); if (partMesh) partMesh.material = mats.part; Object.keys(pathLines).forEach((k) => { pathLines[k].material = mats[k] || mats.finish; }); requestRender(); },
    setSetup(s) { aSign = s.aSign || 1; buildMachine(s); setA(aDeg); },
    setPart, setPartBad, setToolpath, setOp, setA, view, getCamera, setCamera, setTenons,
    tenonCount() { return tenonGroup.children.filter((o) => o.isMesh).length; },
    simSet, simUpdate, simMode, simToolAt, simOverlay, simGhost,
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
