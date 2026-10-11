// The Three.js side of the Adam → Moses timeline. Plain Three.js, no React:
// the React shell owns the UI and talks to this class through a few methods
// and callbacks. Everything is generated in code; there are no models or
// textures.
//
// Layout: time runs along -Z (year 0 nearest, Moses farthest), each person has
// a fixed lateral slot on X, so the line of descent climbs as a diagonal
// staircase. A glowing "now" plane sits at the current year; whoever crosses
// it is alive.

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SLOT_COUNT, type Person, type Timeline } from "@/lib/timeline/data";

export type CameraMode = "river" | "overview";

export type SceneCallbacks = {
  onYear: (year: number) => void;
  onSelect: (id: string | null) => void;
  onPlaying: (playing: boolean) => void;
  onChainStep: (index: number) => void;
};

const K = 0.06; // world units per year
const S = 1.25; // lateral spacing between people
const LANE_W = 0.2;
const LANE_H = 0.1;
const LANE_Y = 0.12;
const WIDTH = SLOT_COUNT * S;
const MAX_YEAR = 4000;
const BG = 0x05070d;

const xOf = (slot: number) => (slot - (SLOT_COUNT - 1) / 2) * S;
const zOf = (year: number) => -year * K;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Long lives glow gold; short lives cool to sky blue. */
function lifeColor(life: number): THREE.Color {
  const t = Math.min(1, Math.max(0, (life - 110) / (969 - 110)));
  return new THREE.Color().setHSL((205 - 165 * Math.pow(t, 0.8)) / 360, 0.85, 0.6);
}

type Lane = {
  slot: number;
  person: Person | null;
  from: { b: number; d: number; o: number };
  to: { b: number; d: number; o: number };
  cur: { b: number; d: number; o: number };
  parentSlot: number | null;
  color: THREE.Color;
  bar: THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>;
  hit: THREE.Mesh;
  birthNode: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  link: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  marker: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  stem: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  beam: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  label: HTMLDivElement;
};

type Gate = {
  id: string;
  name: string;
  from: number;
  to: number;
  year: number;
  line: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  label: HTMLDivElement;
};

export class TimelineScene {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  private lanes: Lane[] = [];
  private gates: Gate[] = [];
  private nowPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private nowLine: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  private water: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private spark: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  private trail: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private trailPts: THREE.Vector3[] = [];
  private raycaster = new THREE.Raycaster();
  private disposables: { dispose: () => void }[] = [];

  private timeline!: Timeline;
  private year = 0;
  private yearTween: { from: number; to: number; t: number; dur: number } | null = null;
  private morphT = 1;
  private playing = false;
  private mode: CameraMode = "river";
  private zoom = 1;
  private selected: string | null = null;
  private chain: {
    slots: number[];
    points: { x: number; year: number; step: number; dur: number }[];
    t: number;
    step: number;
  } | null = null;
  private chainSlots = new Set<number>();
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private bandX = 0;
  private lastZNow = 0;
  /** 0 in the river, 1 in the overview; eased between. */
  private flat = 0;
  private lastEmitted = -1;
  private clock = new THREE.Clock();
  private raf = 0;
  private width = 1;
  private height = 1;
  private pointer: { id: number; x: number; y: number; t: number; moved: number; year: number } | null = null;
  private reduceMotion: boolean;
  private resizeObserver: ResizeObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    private labelLayer: HTMLElement,
    private cb: SceneCallbacks,
    timeline: Timeline
  ) {
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setClearColor(BG, 1);

    this.scene.fog = new THREE.FogExp2(BG, 0.014);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.4, 0.42);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.buildStars();
    this.buildCenturyLines();
    this.nowPlane = this.buildNowPlane();
    this.nowLine = this.basicBox(0xffe7b0, 1);
    this.nowLine.scale.set(WIDTH + 4, 0.03, 0.05);
    this.scene.add(this.nowLine);
    this.water = this.buildWater();
    this.spark = new THREE.Mesh(
      this.track(new THREE.SphereGeometry(0.28, 20, 14)),
      this.track(new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }))
    );
    this.spark.visible = false;
    this.scene.add(this.spark);
    const trailGeo = this.track(new THREE.BufferGeometry());
    trailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(600 * 3), 3));
    trailGeo.setDrawRange(0, 0);
    this.trail = new THREE.Line(
      trailGeo,
      this.track(new THREE.LineBasicMaterial({ color: 0xfff3d1, transparent: true, opacity: 0.9, toneMapped: false }))
    );
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);

    for (let slot = 0; slot < SLOT_COUNT; slot++) this.lanes.push(this.buildLane(slot));
    this.applyTimeline(timeline, false);
    this.bandX = xOf(timeline.people[0].slot);

    // Start high above the whole staircase, then glide down to the river.
    this.resize();
    const ov = this.overviewTarget();
    this.camPos.copy(ov.pos);
    this.camLook.copy(ov.look);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    this.loop();
  }

  // ---------------------------------------------------------------- public

  setTimeline(t: Timeline, year: number) {
    this.stopChain();
    this.applyTimeline(t, !this.reduceMotion);
    this.tweenYear(year, this.reduceMotion ? 0 : 1.4);
  }

  setYear(year: number) {
    this.stopChain();
    this.yearTween = null;
    this.year = this.clampYear(year);
  }

  /** Step by a number of years from wherever the scene is now. */
  nudge(years: number) {
    this.stopChain();
    this.setPlaying(false);
    this.yearTween = null;
    this.year = this.clampYear(Math.round(this.year) + years);
  }

  flyTo(year: number) {
    this.stopChain();
    this.setPlaying(false);
    this.tweenYear(year, this.reduceMotion ? 0 : 1.2);
  }

  togglePlay() {
    this.setPlaying(!this.playing);
  }

  setPlaying(p: boolean) {
    if (p) {
      this.stopChain();
      this.yearTween = null;
      if (this.year >= this.timeline.end - 1) this.year = 0;
    }
    if (p === this.playing) return;
    this.playing = p;
    this.cb.onPlaying(p);
  }

  setCameraMode(mode: CameraMode) {
    this.mode = mode;
  }

  select(id: string | null) {
    this.selected = id;
  }

  /** Send a spark down the chain of overlapping lives. */
  passItDown(chain: Person[]) {
    this.setPlaying(false);
    this.yearTween = null;
    if (chain.length < 2) return;
    const points: { x: number; year: number; step: number; dur: number }[] = [];
    const lane = (p: Person) => this.lanes.find((l) => l.person?.id === p.id)!;
    let year = chain[0].birth;
    points.push({ x: xOf(lane(chain[0]).slot), year, step: 0, dur: 0 });
    for (let i = 0; i < chain.length - 1; i++) {
      const a = chain[i];
      const b = chain[i + 1];
      const start = Math.max(a.birth, b.birth);
      const end = Math.min(a.death, b.death);
      const handoff = Math.round(start + (end - start) / 2);
      points.push({ x: xOf(lane(a).slot), year: handoff, step: i, dur: Math.max(0.5, (handoff - year) / 260) });
      points.push({ x: xOf(lane(b).slot), year: handoff, step: i + 1, dur: 0.45 });
      year = handoff;
    }
    const last = chain[chain.length - 1];
    const finish = Math.min(last.death, this.timeline.events.find((e) => e.id === "exodus")?.year ?? last.death);
    points.push({ x: xOf(lane(last).slot), year: finish, step: chain.length - 1, dur: Math.max(0.5, (finish - year) / 260) });
    this.chain = { slots: chain.map((p) => lane(p).slot), points, t: 0, step: -1 };
    this.chainSlots = new Set(this.chain.slots);
    this.trailPts = [];
    this.spark.visible = true;
    this.year = points[0].year;
  }

  clearChain() {
    this.stopChain();
    this.chainSlots.clear();
    this.trailPts = [];
    this.trail.geometry.setDrawRange(0, 0);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerCancel);
    this.canvas.removeEventListener("wheel", this.onWheel);
    for (const d of this.disposables) d.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.labelLayer.replaceChildren();
  }

  // ---------------------------------------------------------------- build

  private track<T extends { dispose: () => void }>(o: T): T {
    this.disposables.push(o);
    return o;
  }

  private unitBox = new THREE.BoxGeometry(1, 1, 1);

  private basicBox(color: THREE.ColorRepresentation, opacity: number) {
    return new THREE.Mesh(
      this.unitBox,
      this.track(
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity, toneMapped: false, depthWrite: false })
      )
    );
  }

  /**
   * Lifelines glow brightest where they cross the present and fade with
   * distance from it, the past a little faster than the future.
   */
  private laneMaterial() {
    return this.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uColor: { value: new THREE.Color(0xffffff) },
          uOpacity: { value: 1 },
          uBoost: { value: 1 },
          uNowZ: { value: 0 },
          uFlat: { value: 0 },
        },
        vertexShader: `varying float vZ; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vZ = w.z; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uBoost; uniform float uNowZ; uniform float uFlat; varying float vZ;
          void main(){
            float d = vZ - uNowZ;            // > 0: the past (nearer the camera)
            float fall = d > 0.0 ? 0.32 : 0.07;
            float glow = mix(0.16 + 0.84 * exp(-abs(d) * fall), 0.9, uFlat);
            gl_FragColor = vec4(uColor * uBoost * (0.55 + 0.6 * glow), uOpacity * glow);
          }`,
      })
    );
  }

  private buildStars() {
    const n = 1400;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 420;
      pos[i * 3 + 1] = 6 + Math.random() * 160;
      pos[i * 3 + 2] = 80 - Math.random() * (MAX_YEAR * K + 200);
    }
    const geo = this.track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = this.track(
      new THREE.PointsMaterial({ color: 0xaac4ff, size: 0.55, transparent: true, opacity: 0.75, fog: false })
    );
    this.scene.add(new THREE.Points(geo, mat));
  }

  private buildCenturyLines() {
    const pts: number[] = [];
    for (let y = 0; y <= MAX_YEAR; y += 100) {
      const z = zOf(y);
      pts.push(-WIDTH / 2 - 2, 0, z, WIDTH / 2 + 2, 0, z);
    }
    // Two rails along the edges of the river.
    pts.push(-WIDTH / 2 - 2, 0, 0, -WIDTH / 2 - 2, 0, zOf(MAX_YEAR));
    pts.push(WIDTH / 2 + 2, 0, 0, WIDTH / 2 + 2, 0, zOf(MAX_YEAR));
    const geo = this.track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const mat = this.track(new THREE.LineBasicMaterial({ color: 0x2a3a5c, transparent: true, opacity: 0.55 }));
    this.scene.add(new THREE.LineSegments(geo, mat));
  }

  private buildNowPlane() {
    const mat = this.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(0xffd59a) }, uOpacity: { value: 0.16 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
          void main(){
            float up = pow(1.0 - vUv.y, 2.2);
            float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
            gl_FragColor = vec4(uColor, up * edge * uOpacity);
          }`,
      })
    );
    const plane = new THREE.Mesh(this.track(new THREE.PlaneGeometry(WIDTH + 4, 4.5)), mat);
    plane.position.y = 2.25;
    this.scene.add(plane);
    return plane;
  }

  private buildWater() {
    const mat = this.track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uDeep: { value: new THREE.Color(0x0b3a6e) },
          uCrest: { value: new THREE.Color(0x3f8fd0) },
        },
        vertexShader: `uniform float uTime; varying float vH; varying vec2 vUv;
          void main(){
            vec3 p = position;
            float h = sin(p.x * 0.35 + uTime * 1.3) * 0.18 + sin(p.y * 0.22 - uTime * 0.9) * 0.22
                    + sin((p.x + p.y) * 0.6 + uTime * 2.1) * 0.06;
            p.z += h; vH = h; vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`,
        fragmentShader: `uniform vec3 uDeep; uniform vec3 uCrest; uniform float uOpacity; varying float vH; varying vec2 vUv;
          void main(){
            float crest = smoothstep(0.12, 0.42, vH);
            float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x) * smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
            gl_FragColor = vec4(mix(uDeep, uCrest, crest), uOpacity * (0.55 + 0.35 * crest) * edge);
          }`,
      })
    );
    const water = new THREE.Mesh(this.track(new THREE.PlaneGeometry(WIDTH + 30, 90, 90, 90)), mat);
    water.rotation.x = -Math.PI / 2;
    water.visible = false;
    this.scene.add(water);
    return water;
  }

  private buildLane(slot: number): Lane {
    const color = new THREE.Color(0xffffff);
    const bar = new THREE.Mesh(this.unitBox, this.laneMaterial());
    const hit = new THREE.Mesh(this.unitBox, this.track(new THREE.MeshBasicMaterial({ visible: false })));
    hit.userData.slot = slot;
    const sphere = this.track(new THREE.SphereGeometry(1, 16, 12));
    const birthNode = new THREE.Mesh(
      sphere,
      this.track(new THREE.MeshBasicMaterial({ color, transparent: true, toneMapped: false }))
    );
    birthNode.scale.setScalar(0.13);
    const marker = new THREE.Mesh(
      sphere,
      this.track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, toneMapped: false }))
    );
    marker.scale.setScalar(0.19);
    const link = this.basicBox(color, 0.5);
    const stem = this.basicBox(0xffffff, 0.35);
    const beam = this.basicBox(0xfff1c4, 0.5);
    beam.visible = false;
    this.scene.add(bar, hit, birthNode, marker, link, stem, beam);

    const label = document.createElement("div");
    label.className = "tl-label";
    label.innerHTML = `<span class="tl-name"></span><span class="tl-age"></span>`;
    this.labelLayer.appendChild(label);

    const zero = { b: 0, d: 0, o: 0 };
    return {
      slot,
      person: null,
      from: { ...zero },
      to: { ...zero },
      cur: { ...zero },
      parentSlot: null,
      color,
      bar,
      hit,
      birthNode,
      link,
      marker,
      stem,
      beam,
      label,
    };
  }

  private applyTimeline(t: Timeline, animate: boolean) {
    const prev = this.timeline;
    this.timeline = t;
    const slotOf = new Map(t.people.map((p) => [p.id, p.slot]));
    for (const lane of this.lanes) {
      const p = t.people.find((q) => q.slot === lane.slot) ?? null;
      lane.from = { ...lane.cur };
      if (p) {
        lane.person = p;
        lane.parentSlot = p.parentId ? (slotOf.get(p.parentId) ?? null) : null;
        lane.to = { b: p.birth, d: p.death, o: 1 };
        lane.color.copy(lifeColor(p.life));
        (lane.label.firstChild as HTMLElement).textContent = p.name;
      } else {
        // Absent from this text: shrink to a point at the parent's handoff.
        const parent = lane.parentSlot !== null ? t.people.find((q) => q.slot === lane.parentSlot) : null;
        const at = parent ? parent.birth + (parent.beget ?? 0) : lane.cur.b;
        lane.to = { b: at, d: at, o: 0 };
      }
      if (!prev || !animate) lane.from = { ...lane.to };
    }
    this.morphT = animate && prev ? 0 : 1;

    // Event gates are rebuilt; they are few.
    for (const g of this.gates) {
      this.scene.remove(g.line);
      g.label.remove();
    }
    const oldGates = new Map(this.gates.map((g) => [g.id, g.year]));
    this.gates = t.events.map((e) => {
      const color = e.id === "flood" ? 0x58b4ff : e.id === "exodus" ? 0xff9b6a : 0xf3e6c8;
      const line = this.basicBox(color, e.id === "flood" || e.id === "exodus" ? 0.95 : 0.6);
      line.scale.set(WIDTH + 4, 0.025, e.id === "flood" ? 0.16 : 0.07);
      this.scene.add(line);
      const label = document.createElement("div");
      label.className = "tl-event";
      label.textContent = e.name;
      this.labelLayer.appendChild(label);
      const from = animate ? (oldGates.get(e.id) ?? e.year) : e.year;
      return { id: e.id, name: e.name, from, to: e.year, year: from, line, label };
    });
  }

  // ---------------------------------------------------------------- input

  private onPointerDown = (e: PointerEvent) => {
    if (this.pointer) return;
    this.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, year: this.year };
  };

  private onPointerMove = (e: PointerEvent) => {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.moved = Math.max(p.moved, Math.hypot(dx, dy));
    // Horizontal drag scrubs time (vertical stays free for page scrolling).
    if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      if (!this.canvas.hasPointerCapture(e.pointerId)) this.canvas.setPointerCapture(e.pointerId);
      const yearsPerPx = (this.mode === "overview" ? 900 : 350) / Math.max(320, this.width);
      this.stopChain();
      this.setPlaying(false);
      this.yearTween = null;
      this.year = this.clampYear(p.year - dx * yearsPerPx);
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) return;
    this.pointer = null;
    if (p.moved < 8 && performance.now() - p.t < 500) this.tap(e.clientX, e.clientY);
  };

  private onPointerCancel = () => {
    this.pointer = null;
  };

  private onWheel = (e: WheelEvent) => {
    // Sideways trackpad swipes (or shift+wheel) scrub; plain wheel scrolls the page.
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (!d) return;
    e.preventDefault();
    this.stopChain();
    this.setPlaying(false);
    this.yearTween = null;
    this.year = this.clampYear(this.year + d * 0.6);
  };

  private tap(cx: number, cy: number) {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(
      this.lanes.filter((l) => l.cur.o > 0.5).map((l) => l.hit),
      false
    );
    const slot = hits[0]?.object.userData.slot as number | undefined;
    const lane = slot !== undefined ? this.lanes[slot] : null;
    const id = lane?.person && lane.cur.o > 0.5 ? lane.person.id : null;
    this.selected = id;
    this.cb.onSelect(id);
  }

  // ---------------------------------------------------------------- frame

  private resize() {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private clampYear(y: number) {
    return Math.min(this.timeline.end, Math.max(0, y));
  }

  private tweenYear(to: number, dur: number) {
    if (dur <= 0) {
      this.year = this.clampYear(to);
      this.yearTween = null;
      return;
    }
    this.yearTween = { from: this.year, to: this.clampYear(to), t: 0, dur };
  }

  private stopChain() {
    if (!this.chain) return;
    this.chain = null;
    this.spark.visible = false;
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    const time = this.clock.elapsedTime;
    this.step(dt, time);
    this.composer.render(dt);
  };

  private step(dt: number, time: number) {
    const t = this.timeline;

    // Year: tween, playback, or the pass-it-down spark.
    if (this.yearTween) {
      const yt = this.yearTween;
      yt.t = Math.min(1, yt.t + dt / yt.dur);
      this.year = yt.from + (yt.to - yt.from) * ease(yt.t);
      if (yt.t >= 1) this.yearTween = null;
    } else if (this.playing) {
      // Slow down as an event approaches, so the moments land.
      const near = Math.min(...this.gates.map((g) => Math.abs(g.year - this.year)));
      const speed = 95 * (0.18 + 0.82 * smooth(0, 45, near));
      this.year = Math.min(t.end, this.year + speed * dt);
      if (this.year >= t.end) this.setPlaying(false);
    }
    if (this.chain) this.stepChain(dt);

    // Morph between chronologies.
    if (this.morphT < 1) this.morphT = Math.min(1, this.morphT + dt / 1.4);
    const m = ease(this.morphT);
    for (const g of this.gates) g.year = g.from + (g.to - g.from) * m;

    this.flat += ((this.mode === "overview" ? 1 : 0) - this.flat) * (1 - Math.exp(-dt * 3));
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const year = this.year;
    const zNow = zOf(year);
    let minX = Infinity;
    let maxX = -Infinity;

    const order = [...this.lanes].sort((a, b) => this.labelRank(b) - this.labelRank(a));
    for (const lane of order) {
      const c = lane.cur;
      c.b = lane.from.b + (lane.to.b - lane.from.b) * m;
      c.d = lane.from.d + (lane.to.d - lane.from.d) * m;
      c.o = lane.from.o + (lane.to.o - lane.from.o) * m;
      const x = xOf(lane.slot);
      const len = Math.max(0.001, (c.d - c.b) * K);
      const zMid = zOf((c.b + c.d) / 2);
      const isAlive = c.o > 0.5 && c.b <= year && year < c.d;
      const isSel = lane.person?.id === this.selected;
      const inChain = this.chainSlots.has(lane.slot);
      if (isAlive) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }

      const thick = (isSel ? 1.6 : inChain ? 1.3 : 1) * (1 + 2.2 * this.flat);
      lane.bar.position.set(x, LANE_Y, zMid);
      lane.bar.scale.set(LANE_W * thick, LANE_H * thick, len);
      const u = lane.bar.material.uniforms;
      u.uColor.value.copy(lane.color);
      u.uBoost.value = isSel ? 1.5 : inChain ? 1.3 : isAlive ? 1 : 0.7;
      u.uOpacity.value = c.o * (isSel || inChain ? 1 : isAlive ? 0.95 : 0.55);
      u.uNowZ.value = zNow;
      u.uFlat.value = this.flat;
      lane.bar.visible = c.o > 0.01;
      lane.hit.position.set(x, 0.5, zMid);
      lane.hit.scale.set(S * 0.95, 1.4, len + 0.6);

      lane.birthNode.position.set(x, LANE_Y, zOf(c.b));
      lane.birthNode.material.color.copy(lane.color);
      lane.birthNode.material.opacity = c.o;
      lane.birthNode.visible = c.o > 0.01;

      // Hand-off from the parent's lane at the moment of birth.
      if (lane.parentSlot !== null && lane.person && c.o > 0.01) {
        const px = xOf(lane.parentSlot);
        lane.link.visible = true;
        lane.link.position.set((x + px) / 2, LANE_Y, zOf(c.b));
        lane.link.scale.set(Math.abs(x - px), 0.03, 0.05);
        lane.link.material.color.copy(lane.color);
        lane.link.material.opacity = 0.45 * c.o;
      } else {
        lane.link.visible = false;
      }

      // Taken up: Enoch's lane ends in a beam of light, not a death.
      lane.beam.visible = !!lane.person?.taken && c.o > 0.5;
      if (lane.beam.visible) {
        lane.beam.position.set(x, 3, zOf(c.d));
        lane.beam.scale.set(0.08, 6, 0.08);
        lane.beam.material.opacity = 0.35 + 0.25 * Math.sin(time * 2);
      }

      // Living people cross the "now" plane: marker, stem and label.
      const stemH = 0.75 + (lane.slot % 3) * 0.75;
      lane.marker.visible = isAlive;
      lane.stem.visible = isAlive;
      if (isAlive) {
        lane.marker.position.set(x, LANE_Y, zNow);
        lane.marker.material.color.copy(lane.color).lerp(new THREE.Color(0xffffff), 0.55);
        lane.stem.position.set(x, LANE_Y + stemH / 2, zNow);
        lane.stem.scale.set(0.025, stemH, 0.025);
      }
      this.placeLabel(lane, isAlive, isSel, x, stemH, year, placed);
    }

    // Now plane and line.
    this.nowPlane.position.z = zNow;
    this.nowLine.position.set(0, 0.02, zNow);

    // Gates and their labels.
    for (const g of this.gates) {
      const z = zOf(g.year);
      g.line.position.set(0, 0.03, z);
      const ahead = g.year - year;
      const overview = this.mode === "overview";
      const show = overview || (ahead > -25 && ahead < 420);
      const v = overview ? this.project(-WIDTH / 2 - 1.5, 0.05, z) : this.project(this.bandX, 0.05, z);
      let clear = true;
      if (show && v && overview) {
        const w = g.name.length * 7.5 + 22;
        const r = this.landscape()
          ? { x: v.x - w / 2, y: v.y - 20, w, h: 20 }
          : { x: v.x - w, y: v.y - 10, w, h: 20 };
        clear = !placed.some((q) => r.x < q.x + q.w && q.x < r.x + r.w && r.y < q.y + q.h && q.y < r.y + r.h);
        if (clear) placed.push(r);
      }
      if (show && v && clear) {
        const fade = overview ? 1 : 1 - smooth(250, 420, ahead);
        g.label.style.opacity = String(Math.max(0, fade) * (ahead < 0 && !overview ? 1 - smooth(-25, 0, -ahead) * 0.6 : 1));
        g.label.style.transform = !overview
          ? `translate3d(12px, ${v.y}px, 0) translate(0, -50%)`
          : this.landscape()
            ? `translate3d(${v.x}px, ${v.y}px, 0) translate(-50%, -100%)`
            : `translate3d(${v.x}px, ${v.y}px, 0) translate(-100%, -50%)`;
        g.label.style.display = "";
      } else {
        g.label.style.display = "none";
      }
    }

    // The Flood: water rises over the lanes and recedes.
    const fl = t.flood;
    const rise = smooth(fl - 30, fl, year) * (1 - smooth(fl + 1, fl + 40, year));
    this.water.visible = rise > 0.01;
    if (this.water.visible) {
      this.water.position.set(this.bandX, -0.6 + rise * 1.6, zNow - 10);
      this.water.material.uniforms.uTime.value = time;
      this.water.material.uniforms.uOpacity.value = Math.min(1, rise * 1.4);
    }

    this.updateCamera(dt, minX, maxX, zNow);

    const rounded = Math.floor(year);
    if (rounded !== this.lastEmitted) {
      this.lastEmitted = rounded;
      this.cb.onYear(rounded);
    }
  }

  private labelRank(lane: Lane) {
    if (lane.person?.id === this.selected) return 2;
    return this.chainSlots.has(lane.slot) ? 1 : 0;
  }

  private stepChain(dt: number) {
    const c = this.chain!;
    const pts = c.points;
    // Walk the polyline by segment durations.
    c.t += dt;
    let acc = 0;
    let i = 1;
    for (; i < pts.length; i++) {
      if (acc + pts[i].dur >= c.t) break;
      acc += pts[i].dur;
    }
    if (i >= pts.length) {
      const last = pts[pts.length - 1];
      this.spark.position.set(last.x, LANE_Y + 0.15, zOf(last.year));
      this.year = last.year;
      this.pushTrail(this.spark.position);
      this.stopChain();
      return;
    }
    const a = pts[i - 1];
    const b = pts[i];
    const f = ease(Math.min(1, (c.t - acc) / b.dur));
    const x = a.x + (b.x - a.x) * f;
    const y = a.year + (b.year - a.year) * f;
    this.year = y;
    this.spark.position.set(x, LANE_Y + 0.15 + Math.sin(f * Math.PI) * (a.x !== b.x ? 0.8 : 0), zOf(y));
    this.spark.scale.setScalar(1 + 0.25 * Math.sin(this.clock.elapsedTime * 10));
    this.pushTrail(this.spark.position);
    const step = b.x !== a.x && f > 0.5 ? b.step : a.step;
    if (step !== c.step) {
      c.step = step;
      this.cb.onChainStep(step);
    }
  }

  private pushTrail(p: THREE.Vector3) {
    const last = this.trailPts[this.trailPts.length - 1];
    if (last && last.distanceToSquared(p) < 0.01) return;
    this.trailPts.push(p.clone());
    if (this.trailPts.length > 600) this.trailPts.shift();
    const attr = this.trail.geometry.getAttribute("position") as THREE.BufferAttribute;
    this.trailPts.forEach((v, i) => attr.setXYZ(i, v.x, v.y, v.z));
    attr.needsUpdate = true;
    this.trail.geometry.setDrawRange(0, this.trailPts.length);
  }

  private placeLabel(
    lane: Lane,
    isAlive: boolean,
    isSel: boolean,
    x: number,
    stemH: number,
    year: number,
    placed: { x: number; y: number; w: number; h: number }[]
  ) {
    const p = lane.person;
    const overview = this.mode === "overview";
    const show =
      p && lane.cur.o > 0.5 && (isSel || overview || isAlive || this.chainSlots.has(lane.slot));
    if (!show) {
      lane.label.style.display = "none";
      return;
    }
    // In the overview every name sits at its birth; elsewhere on the now plane.
    const at = overview ? lane.cur.b : Math.min(lane.cur.d, Math.max(lane.cur.b, year));
    const v = this.project(x, overview ? LANE_Y : isAlive ? LANE_Y + stemH : LANE_Y + 0.6, zOf(at));
    if (!v) {
      lane.label.style.display = "none";
      return;
    }
    // Skip names that would collide with ones already placed.
    const w = p.name.length * 6.4 + 6;
    const h = overview ? 15 : 27;
    const r = { x: v.x - w / 2, y: v.y - h, w, h };
    const hit = placed.some((q) => r.x < q.x + q.w && q.x < r.x + r.w && r.y < q.y + q.h && q.y < r.y + r.h);
    if (hit && !isSel && !this.chainSlots.has(lane.slot)) {
      lane.label.style.display = "none";
      return;
    }
    placed.push(r);
    const age = Math.floor(year - lane.cur.b);
    (lane.label.lastChild as HTMLElement).textContent = overview
      ? ""
      : isAlive
        ? String(age)
        : year < lane.cur.b
          ? `born ${Math.round(lane.cur.b)}`
          : p.taken
            ? "taken"
            : `d. ${Math.round(lane.cur.d)}`;
    lane.label.style.display = "";
    lane.label.classList.toggle("is-selected", isSel);
    lane.label.classList.toggle("is-dim", !isAlive && !overview);
    lane.label.style.transform = `translate3d(${v.x}px, ${v.y}px, 0) translate(-50%, -100%)`;
  }

  private tmp = new THREE.Vector3();
  private project(x: number, y: number, z: number): { x: number; y: number } | null {
    const v = this.tmp.set(x, y, z).project(this.camera);
    if (v.z > 1 || v.z < -1) return null;
    return { x: ((v.x + 1) / 2) * this.width, y: ((1 - v.y) / 2) * this.height };
  }

  private fit(halfW: number, halfH: number) {
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    return Math.max(halfW / Math.tan(hfov / 2), halfH / Math.tan(vfov / 2));
  }

  private landscape() {
    return this.width / this.height > 1.1;
  }

  private overviewTarget() {
    const zEnd = zOf(this.timeline.end);
    const look = new THREE.Vector3(0, 0, zEnd / 2);
    if (this.landscape()) {
      // Looking down, time running left to right, Adam top-left.
      const d = this.fit((-zEnd / 2) * 1.06, WIDTH / 2 + 3);
      return { pos: new THREE.Vector3(d * 0.32, d, look.z), look, up: new THREE.Vector3(-1, 0, 0) };
    }
    const d = this.fit(WIDTH / 2 + 2, (-zEnd / 2) * 0.62) * 1.22;
    const pitch = THREE.MathUtils.degToRad(58);
    const pos = new THREE.Vector3(0, Math.sin(pitch) * d, look.z + Math.cos(pitch) * d);
    return { pos, look, up: new THREE.Vector3(0, 1, 0) };
  }

  private updateCamera(dt: number, minX: number, maxX: number, zNow: number) {
    if (minX === Infinity) {
      minX = maxX = this.bandX;
    }
    const k = 1 - Math.exp(-dt * (this.reduceMotion ? 20 : 2.6));
    this.bandX += ((minX + maxX) / 2 - this.bandX) * (1 - Math.exp(-dt * 2));

    let pos: THREE.Vector3;
    let look: THREE.Vector3;
    let up = new THREE.Vector3(0, 1, 0);
    if (this.mode === "overview") {
      ({ pos, look, up } = this.overviewTarget());
    } else {
      const half = Math.max(3.5, (maxX - minX) / 2 + 3);
      const d = THREE.MathUtils.clamp(this.fit(half, 3), 9, 60) * this.zoom;
      look = new THREE.Vector3(this.bandX, 0.6, zNow - d * 0.08);
      pos = new THREE.Vector3(this.bandX + d * 0.1, d * 0.62, zNow + d * 0.72);
    }
    if (this.mode === "river") {
      // Ride along with time so the present stays framed; smooth the rest.
      const dz = zNow - this.lastZNow;
      this.camPos.z += dz;
      this.camLook.z += dz;
    }
    this.lastZNow = zNow;
    this.camPos.lerp(pos, k);
    this.camLook.lerp(look, k);
    this.camera.up.lerp(up, k).normalize();
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    const fog = this.scene.fog as THREE.FogExp2;
    const target = this.mode === "overview" ? 0.0028 : 0.014;
    fog.density += (target - fog.density) * k;
  }
}
