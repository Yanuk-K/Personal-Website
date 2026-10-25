// The recipes live in ../../../coffeerecipe.txt at the repo root - that file is
// the source of truth, hand-edited, one blank line between recipes:
//
//   Name: OXO Lungo
//   22g bean 220ml 93c water very coarse(9-9.5 on k ultra) grind slow push
//
//   Name: Namja Coffee v60
//   15g 260ml 86c
//   0:00 70ml stir 3 times
//
// The parser below is deliberately forgiving: the notes are written in a hurry,
// so "15h" is read as 15 g, "v60"/"b75"/"oxo" are re-cased, and missing header
// values fall back to the step volumes.
import raw from "../../../coffeerecipe.txt?raw";

export type StepKind = "pour" | "stir" | "shake" | "press" | "finish" | "note";

export type StirInfo = {
  /** How many stirs the recipe asks for (defaults to 1) */
  turns: number;
  /** "both" for "clockwise 1 counterclockwise 1" */
  direction: "cw" | "ccw" | "both";
};

export type RecipeStep = {
  /** Seconds from the start of the brew */
  at: number;
  action: string;
  /** Cumulative water at this step, when the step names a volume */
  volume: number | null;
  kind: StepKind;
  /** Present on pour steps that also say "stir" (pour, then stir) */
  stir: StirInfo | null;
  finish: boolean;
};

export type Recipe = {
  id: string;
  name: string;
  method: string;
  dose: number | null;
  water: number | null;
  temp: number | null;
  /** "15.3" for 1:15.3, null when dose or water is unknown */
  ratio: string | null;
  notes: string;
  steps: RecipeStep[];
  /** Last step time in seconds; 0 means "stopwatch only" */
  duration: number;
};

const TIME_LINE = /^(\d{1,3}):([0-5]\d)\s+(.+?)\s*$/;
const UNIT_TOKEN = /(\d+(?:\.\d+)?)\s*(ml|g|h|c)(?![a-z0-9])/gi;

function round(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function capitalize(text: string) {
  return text.length === 0 ? text : text[0].toUpperCase() + text.slice(1);
}

function prettifyName(name: string) {
  return name
    .replace(/\bv60\b/gi, "V60")
    .replace(/\bb75\b/gi, "B75")
    .replace(/\boxo\b/gi, "OXO")
    .replace(/\baeropress\b/gi, "AeroPress")
    .replace(/\bsoup\b/gi, "Soup")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Tricolate(needs drip assist)" -> name "Tricolate" + note "Needs drip assist". */
function splitParenthetical(name: string) {
  const notes = [...name.matchAll(/\(([^)]*)\)/g)].map((match) =>
    capitalize(match[1].replace(/\s+/g, " ").trim()),
  );
  const clean = name.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  return { name: clean, notes: notes.join(" · ") };
}

function methodOf(name: string) {
  if (/\bv ?60\b/i.test(name)) return "V60";
  if (/aeropress|tricolate/i.test(name)) return "AeroPress";
  if (/\boxo\b/i.test(name)) return "OXO";
  if (/\bb ?75\b/i.test(name)) return "B75";
  return "Manual";
}

type Token = { value: number; unit: string; start: number; end: number };

function tokenize(line: string): Token[] {
  return [...line.matchAll(UNIT_TOKEN)].map((match) => ({
    value: Number(match[1]),
    unit: match[2].toLowerCase(),
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
}

type Header = {
  dose: number | null;
  water: number | null;
  temp: number | null;
  notes: string;
};

/** Pull dose / water / temperature out of the parameter line, keep the rest as notes. */
function parseHeader(line: string): Header {
  const tokens = tokenize(line);
  const doseTok = tokens.find((token) => token.unit === "g" || token.unit === "h") ?? null;
  const waterTok =
    tokens.find(
      (token) =>
        token !== doseTok &&
        (token.unit === "ml" || token.unit === "g") &&
        (!doseTok || token.start >= doseTok.end),
    ) ?? null;
  const tempTok = tokens.find((token) => token.unit === "c") ?? null;

  const used = [doseTok, waterTok, tempTok]
    .filter((token): token is Token => token !== null)
    .sort((a, b) => b.start - a.start);

  let rest = line;
  for (const token of used) rest = rest.slice(0, token.start) + " " + rest.slice(token.end);

  const cleaned = rest
    .replace(/\bbean\b/gi, " ")
    .replace(/([a-z])\(/gi, "$1 (")
    .replace(/\s+/g, " ")
    // The header's "water ..." prefix is grammar from the recipe line, not a
    // note: "water very coarse..." -> "Very coarse...".
    .replace(/^\s*water\s+/i, "")
    .replace(/^[\s,·.\-–—]+|[\s,·.\-–—]+$/g, "");
  // "water or 14g 250ml" is an alternative, not a sentence: keep "or" lower.
  const notes = /^or\b/.test(cleaned) ? cleaned : capitalize(cleaned);

  return {
    // "15h bean" is a typo for 15 g; the unit is read as grams either way.
    dose: doseTok?.value ?? null,
    water: waterTok?.value ?? null,
    temp: tempTok?.value ?? null,
    notes,
  };
}

function parseStir(label: string): StirInfo | null {
  if (!/\bstir|\bswirl\b/i.test(label)) return null;
  // "counterclockwise" contains "clockwise", so count the standalone word.
  const cw = (label.match(/clockwise/gi) ?? []).length - (label.match(/counter-?\s?clockwise/gi) ?? []).length;
  const ccw = (label.match(/counter-?\s?clockwise/gi) ?? []).length;
  const turns = /stir\s+(\d+)\s+times?/i.exec(label);
  return {
    turns: turns ? Number(turns[1]) : 1,
    direction: cw > 0 && ccw > 0 ? "both" : ccw > 0 ? "ccw" : "cw",
  };
}

function parseStep(line: string): RecipeStep | null {
  const match = TIME_LINE.exec(line);
  if (!match) return null;

  const at = Number(match[1]) * 60 + Number(match[2]);
  const label = match[3].trim();
  const volumeMatch = /^(\d+(?:\.\d+)?)\s*ml(?![a-z])\s*(.*)$/i.exec(label);
  const stir = parseStir(label);
  const lower = label.toLowerCase();

  const finish = /finish/.test(lower);
  const kind: StepKind = finish
    ? "finish"
    : /\bshake\b/.test(lower)
      ? "shake"
      : /\bpress\b|\bpush\b|\bextract/.test(lower)
        ? "press"
        : volumeMatch
          ? "pour"
          : stir
            ? "stir"
            : "note";

  if (volumeMatch) {
    const rest = volumeMatch[2]
      .trim()
      .replace(/^\((.*)\)$/, "$1")
      .replace(/^[·,.\-–—\s]+/, "");
    return {
      at,
      action: `Pour ${round(Number(volumeMatch[1]))} ml${rest ? ` · ${rest}` : ""}`,
      volume: Number(volumeMatch[1]),
      kind,
      stir,
      finish,
    };
  }

  return {
    at,
    action: capitalize(label),
    volume: null,
    kind,
    stir,
    finish,
  };
}

function parseBlock(block: string): Recipe | null {
  const nameLine = /^\s*Name:\s*(.+?)\s*$/m.exec(block);
  if (!nameLine) return null;

  const name = prettifyName(nameLine[1]);
  const nameParts = splitParenthetical(name);
  const lines = block
    .slice(nameLine.index + nameLine[0].length)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const stepLines: RecipeStep[] = [];
  const otherLines: string[] = [];
  for (const line of lines) {
    const step = parseStep(line);
    if (step) stepLines.push(step);
    else otherLines.push(line);
  }

  const headerLine = otherLines[0] ?? "";
  const header = parseHeader(headerLine);
  // Any extra prose lines are notes too (the current file has none, but a
  // hand-written note shouldn't silently disappear).
  const extraNotes = otherLines
    .slice(1)
    .map((line) => capitalize(line.replace(/\s+/g, " ").trim()))
    .join(" ");

  const steps = stepLines.sort((a, b) => a.at - b.at);
  const maxVolume = steps.reduce(
    (max, step) => (step.volume !== null ? Math.max(max, step.volume) : max),
    0,
  );
  const nameDose = /(\d+(?:\.\d+)?)\s*g\b/i.exec(name);

  const dose = header.dose ?? (nameDose ? Number(nameDose[1]) : null);
  const water = header.water ?? (maxVolume > 0 ? maxVolume : null);
  const duration = steps.length > 0 ? steps[steps.length - 1].at : 0;

  return {
    id: nameParts.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    name: nameParts.name,
    method: methodOf(nameParts.name),
    dose,
    water,
    temp: header.temp,
    ratio: dose && water ? (water / dose).toFixed(1).replace(/\.0$/, "") : null,
    notes: [nameParts.notes, header.notes, extraNotes].filter(Boolean).join(" · ").trim(),
    steps,
    duration,
  };
}

export const RECIPES: Recipe[] = raw
  .split(/\n\s*\n/)
  .map(parseBlock)
  .filter((recipe): recipe is Recipe => recipe !== null);

export const RECIPE_METHODS: string[] = [
  "All",
  ...Array.from(new Set(RECIPES.map((recipe) => recipe.method))),
];

/** CSS class suffix for the brewer illustration */
export function methodSlug(method: string) {
  if (method === "AeroPress") return "aeropress";
  if (method === "OXO") return "oxo";
  if (method === "B75") return "b75";
  return "v60";
}

export function isPressMethod(method: string) {
  return method === "AeroPress" || method === "OXO";
}

/** "2:30" for 150 seconds */
export function formatClock(seconds: number, forceMinutes = false) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (!forceMinutes && minutes === 0) return `0:${String(rest).padStart(2, "0")}`;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function formatParam(value: number | null, unit: string) {
  return value === null ? "—" : `${round(value)} ${unit}`;
}
