// Chronology data for the Adam → Moses timeline.
//
// Years are counted Anno Mundi (AM): years from creation, Adam's birth = 0.
// Before Abram every date is derived from the begetting ages in Genesis 5 and
// 11, which differ between the three ancient text traditions. From Abram on,
// all three agree, and dates are offsets from Abram's birth.
//
// The 430 years of Exodus 12:40 are counted from Abram's call (Gal 3:17; the
// Septuagint and Samaritan texts of Ex 12:40 read "in Egypt and in Canaan"),
// as Ussher did, which leaves about 215 years in Egypt.

export type ChronologyId = "mt" | "lxx" | "sp";

export const CHRONOLOGIES: {
  id: ChronologyId;
  label: string;
  short: string;
  blurb: string;
}[] = [
  {
    id: "mt",
    label: "Hebrew · Ussher",
    short: "Hebrew",
    blurb:
      "The Masoretic Hebrew text, as dated by Archbishop James Ussher (Creation 4004 BC). Terah is taken to be 130 at Abram's birth (Acts 7:4 with Gen 11:32, 12:4).",
  },
  {
    id: "lxx",
    label: "Septuagint",
    short: "Greek",
    blurb:
      "The Greek Old Testament, the Bible of the early church and of the Orthodox Church. Fathers are about 100 years older at their heirs' births, and Cainan appears between Arphaxad and Shelah (as in Luke 3:36). Methuselah follows Codex Alexandrinus (187).",
  },
  {
    id: "sp",
    label: "Samaritan",
    short: "Samaritan",
    blurb:
      "The Samaritan Pentateuch. Its shorter pre-Flood ages make Jared, Methuselah and Lamech all die in the very year of the Flood.",
  },
];

type Numbers = {
  /** Age when the next person in the line was born. */
  beget?: number;
  /** Total lifespan in years. */
  life: number;
};

type PreAbramPerson = {
  id: string;
  name: string;
  refs: string[];
  note: string;
  /** Missing entry = this person is absent from that text. */
  n: Partial<Record<ChronologyId, Numbers>>;
  taken?: boolean;
};

type PostAbramPerson = {
  id: string;
  name: string;
  refs: string[];
  note: string;
  /** Birth, in years after Abram's birth. */
  offset: number;
  life: number;
  /** True when the birth year is an estimate the text does not fix. */
  approx?: boolean;
  /** Not on the line of descent to Moses. */
  branch?: boolean;
};

const PRE_ABRAM: PreAbramPerson[] = [
  {
    id: "adam",
    name: "Adam",
    refs: ["Genesis 5:3-5"],
    note: "The first man, formed from the dust of the ground.",
    n: {
      mt: { beget: 130, life: 930 },
      lxx: { beget: 230, life: 930 },
      sp: { beget: 130, life: 930 },
    },
  },
  {
    id: "seth",
    name: "Seth",
    refs: ["Genesis 5:6-8", "Genesis 4:25-26"],
    note: "“Appointed”: given in place of Abel. In his son's days people began to call on the name of the Lord.",
    n: {
      mt: { beget: 105, life: 912 },
      lxx: { beget: 205, life: 912 },
      sp: { beget: 105, life: 912 },
    },
  },
  {
    id: "enosh",
    name: "Enosh",
    refs: ["Genesis 5:9-11"],
    note: "His name means “mortal man”.",
    n: {
      mt: { beget: 90, life: 905 },
      lxx: { beget: 190, life: 905 },
      sp: { beget: 90, life: 905 },
    },
  },
  {
    id: "kenan",
    name: "Kenan",
    refs: ["Genesis 5:12-14"],
    note: "Fourth from Adam.",
    n: {
      mt: { beget: 70, life: 910 },
      lxx: { beget: 170, life: 910 },
      sp: { beget: 70, life: 910 },
    },
  },
  {
    id: "mahalalel",
    name: "Mahalalel",
    refs: ["Genesis 5:15-17"],
    note: "“Praise of God”.",
    n: {
      mt: { beget: 65, life: 895 },
      lxx: { beget: 165, life: 895 },
      sp: { beget: 65, life: 895 },
    },
  },
  {
    id: "jared",
    name: "Jared",
    refs: ["Genesis 5:18-20"],
    note: "The second-longest life in the Hebrew text: 962 years.",
    n: {
      mt: { beget: 162, life: 962 },
      lxx: { beget: 162, life: 962 },
      sp: { beget: 62, life: 847 },
    },
  },
  {
    id: "enoch",
    name: "Enoch",
    refs: ["Genesis 5:21-24", "Hebrews 11:5"],
    note: "Walked with God, “and he was not, for God took him”. He did not die.",
    taken: true,
    n: {
      mt: { beget: 65, life: 365 },
      lxx: { beget: 165, life: 365 },
      sp: { beget: 65, life: 365 },
    },
  },
  {
    id: "methuselah",
    name: "Methuselah",
    refs: ["Genesis 5:25-27"],
    note: "The longest life recorded: 969 years.",
    n: {
      mt: { beget: 187, life: 969 },
      lxx: { beget: 187, life: 969 },
      sp: { beget: 67, life: 720 },
    },
  },
  {
    id: "lamech",
    name: "Lamech",
    refs: ["Genesis 5:28-31"],
    note: "Named his son Noah: “this one shall bring us relief from our work”.",
    n: {
      mt: { beget: 182, life: 777 },
      lxx: { beget: 188, life: 753 },
      sp: { beget: 53, life: 653 },
    },
  },
  {
    id: "noah",
    name: "Noah",
    refs: ["Genesis 5:32", "Genesis 7:6", "Genesis 9:28-29"],
    note: "600 years old when the Flood came. Shem was born two years before he turned 600 (Gen 11:10).",
    n: {
      mt: { beget: 502, life: 950 },
      lxx: { beget: 502, life: 950 },
      sp: { beget: 502, life: 950 },
    },
  },
  {
    id: "shem",
    name: "Shem",
    refs: ["Genesis 11:10-11"],
    note: "Noah's son, on the ark. Became a father “two years after the flood”.",
    n: {
      mt: { beget: 100, life: 600 },
      lxx: { beget: 100, life: 600 },
      sp: { beget: 100, life: 600 },
    },
  },
  {
    id: "arphaxad",
    name: "Arphaxad",
    refs: ["Genesis 11:12-13"],
    note: "The first of the line born after the Flood.",
    n: {
      mt: { beget: 35, life: 438 },
      lxx: { beget: 135, life: 565 },
      sp: { beget: 135, life: 438 },
    },
  },
  {
    id: "cainan",
    name: "Cainan",
    refs: ["Luke 3:36"],
    note: "Found in the Septuagint's Genesis 11 and in Luke's genealogy of Jesus, but not in the Hebrew or Samaritan text.",
    n: {
      lxx: { beget: 130, life: 460 },
    },
  },
  {
    id: "shelah",
    name: "Shelah",
    refs: ["Genesis 11:14-15"],
    note: "His name means “sprout”.",
    n: {
      mt: { beget: 30, life: 433 },
      lxx: { beget: 130, life: 460 },
      sp: { beget: 130, life: 433 },
    },
  },
  {
    id: "eber",
    name: "Eber",
    refs: ["Genesis 11:16-17", "Genesis 10:21"],
    note: "The ancestor from whom the Hebrews are often thought to take their name.",
    n: {
      mt: { beget: 34, life: 464 },
      lxx: { beget: 134, life: 504 },
      sp: { beget: 134, life: 404 },
    },
  },
  {
    id: "peleg",
    name: "Peleg",
    refs: ["Genesis 11:18-19", "Genesis 10:25"],
    note: "“Division”: “in his days the earth was divided”. Often linked with Babel.",
    n: {
      mt: { beget: 30, life: 239 },
      lxx: { beget: 130, life: 339 },
      sp: { beget: 130, life: 239 },
    },
  },
  {
    id: "reu",
    name: "Reu",
    refs: ["Genesis 11:20-21"],
    note: "Seventh from Noah.",
    n: {
      mt: { beget: 32, life: 239 },
      lxx: { beget: 132, life: 339 },
      sp: { beget: 132, life: 239 },
    },
  },
  {
    id: "serug",
    name: "Serug",
    refs: ["Genesis 11:22-23"],
    note: "Great-grandfather of Abram.",
    n: {
      mt: { beget: 30, life: 230 },
      lxx: { beget: 130, life: 330 },
      sp: { beget: 130, life: 230 },
    },
  },
  {
    id: "nahor",
    name: "Nahor",
    refs: ["Genesis 11:24-25"],
    note: "Abram's grandfather. The shortest life in Genesis 11.",
    n: {
      mt: { beget: 29, life: 148 },
      lxx: { beget: 79, life: 208 },
      sp: { beget: 79, life: 148 },
    },
  },
  {
    id: "terah",
    name: "Terah",
    refs: ["Genesis 11:26", "Genesis 11:32", "Acts 7:4"],
    note: "Led his family from Ur toward Canaan and died in Haran.",
    n: {
      // Gen 11:26 names Abram first among sons born from Terah's 70th year;
      // Ussher takes Abram as born when Terah was 130 so that Abram (75)
      // leaves Haran after Terah's death at 205 (Acts 7:4).
      mt: { beget: 130, life: 205 },
      lxx: { beget: 70, life: 205 },
      sp: { beget: 70, life: 145 },
    },
  },
];

const POST_ABRAM: PostAbramPerson[] = [
  {
    id: "abraham",
    name: "Abraham",
    refs: ["Genesis 12:4", "Genesis 21:5", "Genesis 25:7"],
    note: "Called at 75 to leave Haran for Canaan. Father of Isaac at 100.",
    offset: 0,
    life: 175,
  },
  {
    id: "isaac",
    name: "Isaac",
    refs: ["Genesis 21:5", "Genesis 25:26", "Genesis 35:28"],
    note: "The son of promise. Father of Esau and Jacob at 60.",
    offset: 100,
    life: 180,
  },
  {
    id: "jacob",
    name: "Jacob",
    refs: ["Genesis 47:9", "Genesis 47:28"],
    note: "Israel. 130 years old when he stood before Pharaoh.",
    offset: 160,
    life: 147,
  },
  {
    id: "levi",
    name: "Levi",
    refs: ["Exodus 6:16", "Genesis 29:34"],
    note: "Jacob's third son by Leah. His birth year is estimated: about four years before Joseph.",
    offset: 247,
    life: 137,
    approx: true,
  },
  {
    id: "joseph",
    name: "Joseph",
    refs: ["Genesis 41:46", "Genesis 45:6", "Genesis 50:26"],
    note: "30 before Pharaoh; 39 when Jacob, then 130, came to Egypt, so born when Jacob was 91.",
    offset: 251,
    life: 110,
    branch: true,
  },
  {
    id: "kohath",
    name: "Kohath",
    refs: ["Genesis 46:11", "Exodus 6:18"],
    note: "Born before Jacob's family went down to Egypt. Exact year estimated.",
    offset: 282,
    life: 133,
    approx: true,
  },
  {
    id: "amram",
    name: "Amram",
    refs: ["Exodus 6:20"],
    note: "Father of Aaron, Miriam and Moses. Birth year estimated.",
    offset: 352,
    life: 137,
    approx: true,
  },
  {
    id: "moses",
    name: "Moses",
    refs: ["Exodus 7:7", "Deuteronomy 34:7"],
    note: "80 when he spoke to Pharaoh, 120 when he died on Mount Nebo.",
    offset: 425,
    life: 120,
  },
];

export type Person = {
  id: string;
  name: string;
  refs: string[];
  note: string;
  birth: number;
  death: number;
  life: number;
  /** Age at the birth of the next person on the line, when the text gives it. */
  beget?: number;
  parentId?: string;
  approx: boolean;
  taken: boolean;
  branch: boolean;
  /** Fixed lateral slot, the same in every chronology. */
  slot: number;
};

export type TimelineEvent = {
  id: string;
  name: string;
  year: number;
  refs: string[];
  detail: string;
};

export type Timeline = {
  id: ChronologyId;
  people: Person[];
  events: TimelineEvent[];
  flood: number;
  abram: number;
  end: number;
};

/** Slots: one per name across all chronologies, so lanes keep their place. */
const ALL_IDS = [...PRE_ABRAM.map((p) => p.id), ...POST_ABRAM.map((p) => p.id)];

export function buildTimeline(id: ChronologyId): Timeline {
  const people: Person[] = [];
  let year = 0;
  let parentId: string | undefined;
  for (const p of PRE_ABRAM) {
    const n = p.n[id];
    if (!n) continue;
    people.push({
      id: p.id,
      name: p.name,
      refs: p.refs,
      note: p.note,
      birth: year,
      death: year + n.life,
      life: n.life,
      beget: n.beget,
      parentId,
      approx: false,
      taken: !!p.taken,
      branch: false,
      slot: ALL_IDS.indexOf(p.id),
    });
    parentId = p.id;
    year += n.beget ?? 0;
  }

  const abram = year;
  const lineParent: Record<string, string> = {
    abraham: "terah",
    isaac: "abraham",
    jacob: "isaac",
    levi: "jacob",
    joseph: "jacob",
    kohath: "levi",
    amram: "kohath",
    moses: "amram",
  };
  for (const p of POST_ABRAM) {
    people.push({
      id: p.id,
      name: p.name,
      refs: p.refs,
      note: p.note,
      birth: abram + p.offset,
      death: abram + p.offset + p.life,
      life: p.life,
      parentId: lineParent[p.id],
      approx: !!p.approx,
      taken: false,
      branch: !!p.branch,
      slot: ALL_IDS.indexOf(p.id),
    });
  }
  // Begetting ages after Abram follow from the offsets.
  for (const p of people) {
    if (!p.parentId || p.birth < abram) continue;
    const parent = people.find((q) => q.id === p.parentId);
    if (parent && !p.branch && parent.beget === undefined) {
      parent.beget = p.birth - parent.birth;
    }
  }

  const byId = (pid: string) => people.find((p) => p.id === pid)!;
  const noah = byId("noah");
  const flood = noah.birth + 600;
  const peleg = byId("peleg");
  const jacob = byId("jacob");
  const moses = byId("moses");
  const call = abram + 75;
  const exodus = call + 430;

  const events: TimelineEvent[] = [
    {
      id: "creation",
      name: "Creation",
      year: 0,
      refs: ["Genesis 1:1"],
      detail: "Year 1 of the world. Every date here counts from Adam.",
    },
    {
      id: "enoch",
      name: "Enoch taken",
      year: byId("enoch").death,
      refs: ["Genesis 5:24"],
      detail: "Enoch walked with God, and God took him.",
    },
    {
      id: "flood",
      name: "The Flood",
      year: flood,
      refs: ["Genesis 7:6", "Genesis 7:11"],
      detail: "In Noah's 600th year the fountains of the great deep burst open. Eight people came through on the ark.",
    },
    {
      id: "babel",
      name: "Earth divided",
      year: peleg.birth,
      refs: ["Genesis 10:25", "Genesis 11:9"],
      detail: "“In his days the earth was divided.” Ussher placed Babel at Peleg's birth.",
    },
    {
      id: "call",
      name: "Abram called",
      year: call,
      refs: ["Genesis 12:1-4"],
      detail: "Abram leaves Haran at 75. The 430 years to the Exodus begin.",
    },
    {
      id: "egypt",
      name: "Into Egypt",
      year: jacob.birth + 130,
      refs: ["Genesis 47:9", "Genesis 46:26-27"],
      detail: "Jacob, 130, goes down to Egypt with seventy souls.",
    },
    {
      id: "exodus",
      name: "The Exodus",
      year: exodus,
      refs: ["Exodus 12:40-41", "Galatians 3:17"],
      detail: "430 years after the promise to Abram, Israel leaves Egypt. Moses is 80.",
    },
    {
      id: "nebo",
      name: "Mount Nebo",
      year: moses.death,
      refs: ["Deuteronomy 34:5-7"],
      detail: "Moses dies at 120, his eye undimmed, looking over the promised land.",
    },
  ];

  return { id, people, events, flood, abram, end: moses.death };
}

export const TIMELINES: Record<ChronologyId, Timeline> = {
  mt: buildTimeline("mt"),
  lxx: buildTimeline("lxx"),
  sp: buildTimeline("sp"),
};

export const SLOT_COUNT = ALL_IDS.length;

/** Ussher: AM 1 began in 4004 BC. Only meaningful for the Hebrew chronology. */
export function toBC(am: number): number {
  return 4004 - am;
}

export function alive(t: Timeline, year: number): Person[] {
  return t.people.filter((p) => p.birth <= year && year < p.death);
}

export function overlap(a: Person, b: Person): number {
  return Math.max(0, Math.min(a.death, b.death) - Math.max(a.birth, b.birth));
}

/**
 * Fewest hand-offs from Adam to Moses through people whose lives overlapped
 * (breadth-first search; ties keep the longest overlaps). Branch figures are
 * allowed: anyone on the chart could have passed the story on.
 */
export function witnessChain(t: Timeline): Person[] {
  const start = t.people.find((p) => p.id === "adam")!;
  const goal = t.people.find((p) => p.id === "moses")!;
  const prev = new Map<string, Person>();
  const depth = new Map<string, number>([[start.id, 0]]);
  let frontier = [start];
  while (frontier.length && !depth.has(goal.id)) {
    const next: Person[] = [];
    for (const p of frontier) {
      for (const q of t.people) {
        if (depth.has(q.id) && depth.get(q.id)! <= depth.get(p.id)!) continue;
        // Require at least a decade together, so the hand-off is plausible.
        const o = overlap(p, q);
        if (o < 10 || q.death <= p.death) continue;
        const known = prev.get(q.id);
        if (!known || overlap(known, q) < o) prev.set(q.id, p);
        if (!depth.has(q.id)) {
          depth.set(q.id, depth.get(p.id)! + 1);
          next.push(q);
        }
      }
    }
    frontier = next;
  }
  const chain: Person[] = [];
  let cur: Person | undefined = goal;
  while (cur) {
    chain.unshift(cur);
    cur = prev.get(cur.id);
  }
  return chain[0]?.id === "adam" ? chain : [];
}

export type Fact = { text: string; year: number };

/** Striking overlaps, computed from whichever chronology is active. */
export function facts(t: Timeline): Fact[] {
  const by = (id: string) => t.people.find((p) => p.id === id)!;
  const out: Fact[] = [];
  const adam = by("adam");
  const lamech = by("lamech");
  const o = overlap(adam, lamech);
  out.push({
    text:
      o > 0
        ? `Lamech, Noah's father, was ${o} when Adam died. Noah's father could have heard Eden from Adam himself.`
        : `Lamech, Noah's father, was born ${lamech.birth - adam.death} years after Adam died.`,
    year: Math.min(adam.death, lamech.birth),
  });

  const meth = by("methuselah");
  const gap = t.flood - meth.death;
  out.push({
    text:
      gap === 0
        ? `Methuselah died in the year of the Flood, year ${t.flood} of the world.`
        : `Methuselah died ${gap} year${gap === 1 ? "" : "s"} before the Flood.`,
    year: meth.death,
  });

  const diedInFlood = t.people.filter((p) => p.death === t.flood && !p.taken);
  if (diedInFlood.length > 1) {
    out.push({
      text: `${listNames(diedInFlood)} all die in the year of the Flood.`,
      year: t.flood,
    });
  }

  const noah = by("noah");
  const abraham = by("abraham");
  const na = abraham.birth - noah.death;
  out.push({
    text:
      na > 0
        ? `Noah died ${na <= 10 ? "just " : ""}${na} years before Abram was born.`
        : `Noah was still alive for the first ${-na} years of Abram's life.`,
    year: Math.min(noah.death, abraham.birth),
  });

  const shem = by("shem");
  const isaac = by("isaac");
  if (shem.death > abraham.death) {
    out.push({
      text: `Shem, who rode out the Flood on the ark, outlived Abraham by ${shem.death - abraham.death} years.`,
      year: abraham.death,
    });
  } else if (shem.death > abraham.birth) {
    out.push({
      text: `Shem, who rode out the Flood on the ark, lived until Abraham was ${shem.death - abraham.birth}${shem.death > isaac.birth ? `, and knew Isaac for ${overlap(shem, isaac)} years` : ""}.`,
      year: shem.death,
    });
  }

  const eber = by("eber");
  if (eber.death > abraham.death) {
    out.push({
      text: `Eber, Abram's ancestor six generations back, outlived him by ${eber.death - abraham.death} years${eber.death > by("jacob").birth ? ` and saw Jacob born` : ""}.`,
      year: abraham.death,
    });
  }

  const longest = t.people.filter((p) => p.birth >= t.flood).reduce((a, b) => (a.life > b.life ? a : b));
  out.push({
    text: `After the Flood, lifespans fall: from Noah's 950 to ${longest.name}'s ${longest.life}, to Moses' 120.`,
    year: t.flood,
  });
  return out;
}

function listNames(ps: Person[]): string {
  const names = ps.map((p) => p.name);
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Year in the old chronology → equivalent moment in the new one. */
export function remapYear(from: Timeline, to: Timeline, year: number): number {
  const a = [0, from.flood, from.abram, from.end];
  const b = [0, to.flood, to.abram, to.end];
  for (let i = 0; i < a.length - 1; i++) {
    if (year <= a[i + 1] || i === a.length - 2) {
      const f = (year - a[i]) / Math.max(1, a[i + 1] - a[i]);
      return Math.round(b[i] + f * (b[i + 1] - b[i]));
    }
  }
  return year;
}
