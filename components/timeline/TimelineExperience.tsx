"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
  SparklesIcon,
  XMarkIcon,
  GlobeAltIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/solid";
import {
  CHRONOLOGIES,
  TIMELINES,
  alive,
  facts,
  overlap,
  remapYear,
  toBC,
  witnessChain,
  type ChronologyId,
  type Person,
} from "@/lib/timeline/data";
import { initAnonymousSession } from "@/lib/supabaseClient";
import type { CameraMode, TimelineScene } from "./scene";

type VerseState = { status: "loading" | "ok" | "error"; text?: string };

export default function TimelineExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<TimelineScene | null>(null);

  const [chron, setChron] = useState<ChronologyId>("mt");
  const [year, setYear] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<CameraMode>("river");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chainStep, setChainStep] = useState<number | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [verses, setVerses] = useState<Record<string, VerseState>>({});

  const timeline = TIMELINES[chron];
  const chain = useMemo(() => witnessChain(timeline), [timeline]);
  const factList = useMemo(() => facts(timeline), [timeline]);
  const living = useMemo(() => alive(timeline, year), [timeline, year]);
  const oldest = living.reduce<Person | null>((a, p) => (!a || p.birth < a.birth ? p : a), null);
  const youngest = living.reduce<Person | null>((a, p) => (!a || p.birth > a.birth ? p : a), null);
  const era = [...timeline.events].reverse().find((e) => e.year <= year);
  const selected = timeline.people.find((p) => p.id === selectedId) ?? null;

  // Boot the scene; Three.js loads only in the browser, on this page.
  useEffect(() => {
    let disposed = false;
    let scene: TimelineScene | null = null;
    import("./scene")
      .then(({ TimelineScene }) => {
        if (disposed || !canvasRef.current || !labelsRef.current) return;
        scene = new TimelineScene(
          canvasRef.current,
          labelsRef.current,
          {
            onYear: setYear,
            onSelect: setSelectedId,
            onPlaying: setPlaying,
            onChainStep: setChainStep,
          },
          TIMELINES.mt
        );
        sceneRef.current = scene;
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Timeline scene failed to start:", err);
        if (!disposed) setStatus("error");
      });
    return () => {
      disposed = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (year > 0 || playing) setEngaged(true);
  }, [year, playing]);

  const changeChronology = useCallback(
    (id: ChronologyId) => {
      if (id === chron) return;
      const next = TIMELINES[id];
      const y = remapYear(TIMELINES[chron], next, year);
      setChron(id);
      setChainStep(null);
      if (selectedId && !next.people.some((p) => p.id === selectedId)) {
        setSelectedId(null);
        sceneRef.current?.select(null);
      }
      sceneRef.current?.clearChain();
      sceneRef.current?.setTimeline(next, y);
    },
    [chron, year, selectedId]
  );

  const flyTo = useCallback((y: number) => {
    setChainStep(null);
    sceneRef.current?.clearChain();
    sceneRef.current?.flyTo(y);
  }, []);

  const selectPerson = useCallback((id: string | null) => {
    setSelectedId(id);
    sceneRef.current?.select(id);
  }, []);

  const passItDown = useCallback(() => {
    setChainStep(0);
    sceneRef.current?.passItDown(chain);
  }, [chain]);

  const clearChain = useCallback(() => {
    setChainStep(null);
    sceneRef.current?.clearChain();
  }, []);

  const toggleMode = useCallback(() => {
    setMode((m) => {
      const next = m === "river" ? "overview" : "river";
      sceneRef.current?.setCameraMode(next);
      return next;
    });
  }, []);

  const scrollToHero = () => heroRef.current?.scrollIntoView({ behavior: "smooth" });

  // Keyboard, for desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select")) return;
      // Let a focused button keep Space/Enter for itself.
      if (el.closest("button") && (e.key === " " || e.key === "Enter")) return;
      const s = sceneRef.current;
      if (!s) return;
      if (e.key === " ") {
        e.preventDefault();
        s.togglePlay();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        clearChain();
        s.nudge((e.shiftKey ? 100 : 10) * (e.key === "ArrowRight" ? 1 : -1));
      } else if (e.key === "1" || e.key === "2" || e.key === "3") {
        changeChronology(CHRONOLOGIES[Number(e.key) - 1].id);
      } else if (e.key.toLowerCase() === "p") {
        passItDown();
      } else if (e.key.toLowerCase() === "v") {
        toggleMode();
      } else if (e.key === "Escape") {
        selectPerson(null);
        clearChain();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeChronology, passItDown, toggleMode, selectPerson, clearChain]);

  const loadVerse = useCallback(
    async (ref: string) => {
      if (verses[ref]?.status === "ok" || verses[ref]?.status === "loading") return;
      setVerses((v) => ({ ...v, [ref]: { status: "loading" } }));
      try {
        await initAnonymousSession();
        const res = await fetch("/api/verse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verse: ref }),
        });
        const data = await res.json();
        if (!res.ok || !data.passages?.[0]) throw new Error(data.error ?? "No text");
        setVerses((v) => ({ ...v, [ref]: { status: "ok", text: data.passages[0] } }));
      } catch (err) {
        console.error("Verse fetch failed:", err);
        setVerses((v) => ({ ...v, [ref]: { status: "error" } }));
      }
    },
    [verses]
  );

  const isMT = chron === "mt";
  const chronMeta = CHRONOLOGIES.find((c) => c.id === chron)!;

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100">
      <section
        ref={heroRef}
        className="relative h-[100svh] w-full overflow-hidden select-none"
        aria-label="Interactive timeline from Adam to Moses"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-pan-y outline-none"
          aria-label="3D timeline. Drag sideways to move through time; tap a lifeline to learn about that person."
        />
        <div ref={labelsRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />

        {/* Top: title and live numbers */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#05070d] via-[#05070d]/70 to-transparent px-4 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-8">
          <div className="pointer-events-auto flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Bible Study
            </Link>
            <button
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full px-3 py-1.5 text-xs text-slate-400 transition hover:text-slate-200"
            >
              How to read this ↓
            </button>
          </div>

          <div className="mt-3 max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
              Genesis 5 – Deuteronomy 34
            </p>
            <h1
              className={`font-semibold leading-[1.05] tracking-tight text-white transition-all duration-500 ${
                engaged ? "text-2xl md:text-3xl" : "text-4xl md:text-6xl"
              }`}
            >
              Adam to Moses
            </h1>
            <p
              className={`text-sm leading-snug text-slate-300 transition-all duration-500 md:text-base ${
                engaged ? "mt-0 max-h-0 opacity-0" : "mt-2 max-h-24 opacity-100"
              }`}
            >
              {chain.length > 0 ? `${chain.length} overlapping lives` : "Overlapping lives"} carry the
              story from Eden to Sinai. Drag sideways to move through time.
            </p>
          </div>

          <dl className="mt-3 grid max-w-xl grid-cols-3 gap-2 text-left">
            <Stat label="Year">
              <span className="tabular-nums">AM {year}</span>
              {isMT && <span className="block text-[10px] font-normal text-slate-400 tabular-nums">{toBC(year)} BC</span>}
            </Stat>
            <Stat label="Alive">
              <span className="tabular-nums">{living.length}</span>
              <span className="block truncate text-[10px] font-normal text-slate-400">
                {youngest ? `youngest ${youngest.name}` : "—"}
              </span>
            </Stat>
            <Stat label="Oldest living">
              {oldest ? (
                <>
                  <span className="block truncate">{oldest.name}</span>
                  <span className="block text-[10px] font-normal text-slate-400 tabular-nums">age {year - oldest.birth}</span>
                </>
              ) : (
                "—"
              )}
            </Stat>
          </dl>

          {chainStep !== null && chain.length > 0 && (
            <div className="pointer-events-auto mt-3 flex max-w-xl items-center gap-2">
              <ol className="flex flex-1 gap-1 overflow-x-auto pb-1 text-xs [scrollbar-width:none]">
                {chain.map((p, i) => (
                  <li key={p.id} className="flex shrink-0 items-center gap-1">
                    {i > 0 && <span className="text-slate-500">→</span>}
                    <span
                      className={`rounded-full px-2 py-0.5 transition ${
                        i === chainStep
                          ? "bg-amber-200 text-slate-900"
                          : i < chainStep
                            ? "bg-amber-200/20 text-amber-100"
                            : "bg-white/5 text-slate-400"
                      }`}
                    >
                      {p.name}
                    </span>
                  </li>
                ))}
              </ol>
              <button onClick={clearChain} aria-label="Clear the chain" className="rounded-full p-1 text-slate-400 hover:text-white">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-400">
            {status === "loading"
              ? "Counting the generations…"
              : "This browser couldn't start the 3D view. The full table of dates is below."}
          </div>
        )}

        {/* Bottom sheet (mobile) / floating panel (desktop) */}
        <div className="absolute inset-x-0 bottom-0 md:inset-x-auto md:bottom-5 md:left-5 md:w-[420px]">
          <div className="max-h-[62svh] overflow-y-auto rounded-t-3xl bg-[#0b1020]/80 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:rounded-3xl md:pb-4">
            {selected && (
              <PersonCard
                person={selected}
                allPeople={timeline.people}
                isMT={isMT}
                verses={verses}
                onVerse={loadVerse}
                onFly={flyTo}
                onClose={() => selectPerson(null)}
                onSelect={selectPerson}
              />
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => sceneRef.current?.togglePlay()}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-200 text-slate-900 shadow-lg shadow-amber-200/20 transition active:scale-95"
              >
                {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="ml-0.5 h-5 w-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={timeline.end}
                value={Math.min(year, timeline.end)}
                onChange={(e) => {
                  clearChain();
                  sceneRef.current?.setYear(Number(e.target.value));
                }}
                aria-label="Year since creation"
                className="h-11 w-full cursor-pointer accent-amber-200"
              />
            </div>

            <div className="-mx-4 mt-1 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              <Chip onClick={passItDown} accent>
                <SparklesIcon className="h-3.5 w-3.5" /> Pass it down
              </Chip>
              <Chip onClick={toggleMode}>
                {mode === "river" ? <GlobeAltIcon className="h-3.5 w-3.5" /> : <ViewColumnsIcon className="h-3.5 w-3.5" />}
                {mode === "river" ? "See it all" : "Follow time"}
              </Chip>
              {timeline.events.map((e) => (
                <Chip key={e.id} onClick={() => flyTo(e.year + (e.id === "flood" ? -35 : 0))} active={era?.id === e.id}>
                  {e.name}
                </Chip>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1 rounded-full bg-white/5 p-1 text-xs ring-1 ring-white/10" role="radiogroup" aria-label="Text tradition">
              {CHRONOLOGIES.map((c) => (
                <button
                  key={c.id}
                  role="radio"
                  aria-checked={chron === c.id}
                  onClick={() => changeChronology(c.id)}
                  className={`rounded-full px-2 py-2 transition ${
                    chron === c.id ? "bg-white/90 font-semibold text-slate-900" : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="mt-2 hidden text-[11px] text-slate-500 md:block">
              Space play · ← → scrub (⇧ ×10) · 1 2 3 text · P pass it down · V view · Esc clear
            </p>
          </div>
        </div>
      </section>

      <About
        chronBlurb={chronMeta.blurb}
        chronLabel={chronMeta.label}
        factList={factList}
        people={timeline.people}
        isMT={isMT}
        onFact={(y) => {
          scrollToHero();
          flyTo(y);
        }}
        onPerson={(id) => {
          scrollToHero();
          selectPerson(id);
          const p = timeline.people.find((q) => q.id === id);
          if (p) flyTo(p.birth + Math.min(60, p.life / 3));
        }}
      />

      <style jsx global>{`
        .tl-label {
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 3px;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.15;
          color: #fff;
          text-shadow: 0 1px 6px #000, 0 0 2px #000;
          white-space: nowrap;
          will-change: transform;
        }
        .tl-label .tl-age {
          font-size: 10px;
          font-weight: 400;
          opacity: 0.7;
          font-variant-numeric: tabular-nums;
        }
        .tl-label.is-dim {
          opacity: 0.6;
        }
        .tl-label.is-selected .tl-name {
          color: #ffe2a8;
        }
        .tl-event {
          position: absolute;
          left: 0;
          top: 0;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #f3e6c8;
          background: rgba(5, 7, 13, 0.6);
          border: 1px solid rgba(243, 230, 200, 0.22);
          white-space: nowrap;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-white/[0.04] px-2.5 py-1.5 ring-1 ring-white/10 backdrop-blur">
      <dt className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-white">{children}</dd>
    </div>
  );
}

function Chip({
  children,
  onClick,
  accent,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs transition active:scale-95 ${
        accent
          ? "bg-amber-200/15 font-semibold text-amber-100 ring-1 ring-amber-200/40"
          : active
            ? "bg-white/15 text-white ring-1 ring-white/30"
            : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function PersonCard({
  person,
  allPeople,
  isMT,
  verses,
  onVerse,
  onFly,
  onClose,
  onSelect,
}: {
  person: Person;
  allPeople: Person[];
  isMT: boolean;
  verses: Record<string, VerseState>;
  onVerse: (ref: string) => void;
  onFly: (year: number) => void;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const knew = allPeople
    .filter((p) => p.id !== person.id && overlap(p, person) > 0)
    .sort((a, b) => a.birth - b.birth);
  const heir = allPeople.find((p) => p.parentId === person.id && !p.branch);
  return (
    <div className="mb-3 border-b border-white/10 pb-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {person.name}
            {person.approx && (
              <span className="ml-2 align-middle text-[10px] font-normal uppercase tracking-wider text-amber-200/80">
                ≈ dates estimated
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 tabular-nums">
            AM {person.birth}–{person.death}
            {isMT && ` · ${toBC(person.birth)}–${toBC(person.death)} BC`} · {person.life} years
            {person.taken ? " · taken by God" : ""}
          </p>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-200">{person.note}</p>
      {heir && person.beget !== undefined && (
        <p className="mt-1 text-xs text-slate-400">
          {person.beget} years old when {heir.name} was born.
        </p>
      )}

      <div className="mt-2 flex gap-2">
        <button onClick={() => onFly(person.birth)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-200 ring-1 ring-white/10">
          Go to birth
        </button>
        <button onClick={() => onFly(person.death - 1)} className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-200 ring-1 ring-white/10">
          {person.taken ? "Go to when taken" : "Go to death"}
        </button>
      </div>

      {knew.length > 0 && (
        <div className="mt-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Lived alongside</h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {knew.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
              >
                {p.name} <span className="text-slate-500 tabular-nums">{overlap(p, person)}y</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Scripture</h3>
        {person.refs.map((ref) => {
          const v = verses[ref];
          return (
            <div key={ref}>
              <button
                onClick={() => onVerse(ref)}
                className="text-left text-sm font-medium text-sky-300 underline-offset-2 hover:underline"
              >
                {ref}
              </button>
              {v?.status === "loading" && <p className="text-xs text-slate-500">Loading…</p>}
              {v?.status === "error" && <p className="text-xs text-rose-300">Couldn&apos;t load this passage.</p>}
              {v?.status === "ok" && (
                <p className="mt-0.5 text-sm leading-relaxed text-slate-300">
                  {v.text} <span className="text-[10px] text-slate-500">(ESV)</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function About({
  chronBlurb,
  chronLabel,
  factList,
  people,
  isMT,
  onFact,
  onPerson,
}: {
  chronBlurb: string;
  chronLabel: string;
  factList: { text: string; year: number }[];
  people: Person[];
  isMT: boolean;
  onFact: (year: number) => void;
  onPerson: (id: string) => void;
}) {
  return (
    <article id="about" className="mx-auto max-w-2xl px-5 pb-24 pt-14 text-[15px] leading-relaxed text-slate-300 md:pt-20">
      <h2 className="text-2xl font-semibold text-white">How to read this</h2>
      <p className="mt-3">
        Each glowing line is one life, from birth to death, laid along a river of time that starts at Adam. Each new line
        branches off its father&apos;s at the moment he was born, so the line of descent climbs like a staircase. The
        bright <strong className="text-white">plane of light</strong> is the present moment: everyone who crosses it is
        alive. <strong className="text-white">Drag sideways</strong> to move through time, tap a line to meet that person,
        and press <strong className="text-white">play</strong> to watch the generations go by.
      </p>
      <p className="mt-3">
        Color follows lifespan: <span className="text-amber-200">gold</span> for the near-thousand-year lives before the
        Flood, cooling to <span className="text-sky-300">blue</span> as lives shorten toward Moses&apos; 120.
      </p>

      <h2 className="mt-12 text-2xl font-semibold text-white">Who knew whom</h2>
      <p className="mt-3">
        Because the early lives were so long, they overlap far more than we expect. <strong className="text-white">Pass it down</strong>{" "}
        follows the fewest hand-offs, each between two people alive together for at least ten years, that could carry
        the story from Adam to Moses. Under the {chronLabel} numbers:
      </p>
      <ul className="mt-3 space-y-2">
        {factList.map((f) => (
          <li key={f.text}>
            <button onClick={() => onFact(f.year)} className="text-left hover:text-white">
              <span className="mr-2 text-amber-200">✦</span>
              {f.text}
            </button>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-2xl font-semibold text-white">Three ways of counting</h2>
      <p className="mt-3">
        The ages in Genesis 5 and 11 come down to us in three ancient text traditions, and they disagree before Abraham.
        Switch between them and watch every line slide into its new place.
      </p>
      <p className="mt-3 rounded-xl bg-white/5 p-4 text-sm ring-1 ring-white/10">
        <strong className="text-white">{chronLabel}.</strong> {chronBlurb}
      </p>

      <h2 className="mt-12 text-2xl font-semibold text-white">The 430 years</h2>
      <p className="mt-3">
        Exodus 12:40 says Israel&apos;s sojourn lasted 430 years. Paul counts the 430 years from God&apos;s promise to
        Abraham to the giving of the law (Galatians 3:17), and the Greek and Samaritan texts of Exodus 12:40 read
        &ldquo;in Egypt <em>and in Canaan</em>&rdquo;. Ussher followed that reading, and so does this timeline: 430
        years from Abram&apos;s call to the Exodus, about 215 of them in Egypt. That leaves room for only four
        generations from Levi to Moses (Exodus 6:16–20), just as the text names them.
      </p>

      <h2 className="mt-12 text-2xl font-semibold text-white">The numbers</h2>
      <p className="mt-3 text-sm text-slate-400">
        {chronLabel}. Years are counted from creation (Anno Mundi)
        {isMT ? "; Ussher placed year 0 at 4004 BC." : "."} Tap a name to find them.
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-white/10">
        <table className="w-full text-left text-sm tabular-nums">
          <thead className="bg-white/5 text-[10px] uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Born</th>
              <th className="px-3 py-2 font-semibold">Heir at</th>
              <th className="px-3 py-2 font-semibold">Lived</th>
              <th className="px-3 py-2 font-semibold">Died</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="px-3 py-1.5">
                  <button onClick={() => onPerson(p.id)} className="font-medium text-slate-100 hover:text-amber-200">
                    {p.name}
                  </button>
                </td>
                <td className="px-3 py-1.5">
                  {p.approx ? "≈" : ""}
                  {p.birth}
                </td>
                <td className="px-3 py-1.5 text-slate-400">{p.beget ?? "—"}</td>
                <td className="px-3 py-1.5">{p.life}</td>
                <td className="px-3 py-1.5">{p.taken ? `${p.death}*` : p.death}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        * Enoch did not die; God took him. ≈ The text gives Levi&apos;s, Kohath&apos;s and Amram&apos;s lifespans but not
        their birth years, so those are estimates that fit the surrounding narrative.
      </p>

      <h2 className="mt-12 text-2xl font-semibold text-white">Heads up</h2>
      <p className="mt-3 text-sm text-slate-400">
        This is a simplified model. It follows one line of descent (plus Joseph) and one way of reading each tradition;
        scholars and traditions differ on several of these numbers, and Genesis may not intend its genealogies as a
        complete chronology. Treat it as a way into the text, and check the passages themselves.
      </p>
    </article>
  );
}
