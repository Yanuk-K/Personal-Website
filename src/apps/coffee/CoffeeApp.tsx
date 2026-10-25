import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { CoffeeIcon } from "../../desktop/icons";
import { useNotifications } from "../../state/notifications";
import { useWindows, type WinState } from "../../state/windows";
import {
  RECIPES,
  RECIPE_METHODS,
  formatClock,
  formatParam,
  isPressMethod,
  methodSlug,
  type Recipe,
  type RecipeStep,
  type StepKind,
  type StirInfo,
} from "./recipes";
import { GrinderCalc } from "./GrinderCalc";
import "./coffee.css";

const METHOD_COLORS: Record<string, string> = {
  V60: "#8fb573",
  AeroPress: "#4aa3df",
  OXO: "#e0a34a",
  B75: "#c97b4a",
  Manual: "#a5aaaf",
};

const RING = 2 * Math.PI * 72;

type EffectKind = "pour" | "stir" | "shake" | "press";
type Effect = { kind: EffectKind; key: number; stir?: StirInfo };
type CoffeeView = "recipes" | "grinder";

type EffectJob = { kind: EffectKind; delay: number; duration: number; stir?: StirInfo };

function metaLine(recipe: Recipe) {
  return [
    recipe.dose !== null ? formatParam(recipe.dose, "g") : null,
    recipe.water !== null ? formatParam(recipe.water, "ml") : null,
    recipe.temp !== null ? `${recipe.temp} °C` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function CoffeeApp({ win }: { win?: WinState }) {
  const { notify } = useNotifications();
  const { setTitle } = useWindows();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<CoffeeView>(() =>
    window.location.pathname.startsWith("/app/coffee") &&
    searchParams.get("view") === "grinder"
      ? "grinder"
      : "recipes",
  );
  const [method, setMethod] = useState("All");
  const [activeId, setActiveId] = useState(RECIPES[0]?.id ?? "");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [effect, setEffect] = useState<Effect | null>(null);
  const [epoch, setEpoch] = useState(0);

  const elapsedRef = useRef(0);
  const lastEffectStep = useRef(-1);
  const lastRecipeId = useRef(activeId);
  const effectKey = useRef(0);
  const effectTimers = useRef<number[]>([]);

  const recipes = useMemo(
    () => (method === "All" ? RECIPES : RECIPES.filter((recipe) => recipe.method === method)),
    [method],
  );
  const active = useMemo(
    () => RECIPES.find((recipe) => recipe.id === activeId) ?? RECIPES[0],
    [activeId],
  );

  const selectView = (next: CoffeeView) => setView(next);

  // The window title follows the open view, like Kate's open document.
  useEffect(() => {
    if (!win?.id) return;
    if (view === "grinder") setTitle(win.id, "Grinder Calculator — Coffee");
    else if (active) setTitle(win.id, `${active.name} — Coffee`);
  }, [active, setTitle, view, win?.id]);

  const commitElapsed = useCallback((ms: number) => {
    elapsedRef.current = ms;
    setElapsed(ms);
  }, []);

  const clearEffectTimers = useCallback(() => {
    effectTimers.current.forEach((timer) => window.clearTimeout(timer));
    effectTimers.current = [];
  }, []);

  /** Fire an effect now-ish and clear the overlay when its animation is done. */
  const schedule = useCallback((job: EffectJob) => {
    const start = window.setTimeout(() => {
      effectKey.current += 1;
      const key = effectKey.current;
      setEffect({ kind: job.kind, key, stir: job.stir });
      const end = window.setTimeout(() => {
        setEffect((current) => (current?.key === key ? null : current));
      }, job.duration);
      effectTimers.current.push(end);
    }, job.delay);
    effectTimers.current.push(start);
  }, []);

  /** Steps can combine actions: "Pour 70 ml · stir 3 times" pours, then stirs. */
  const scheduleStepEffects = useCallback(
    (step: RecipeStep | undefined) => {
      if (!step) return;
      if (step.volume != null && (step.kind === "pour" || step.stir)) {
        schedule({ kind: "pour", delay: 0, duration: 1250 });
      }
      if (step.stir) {
        schedule({
          kind: "stir",
          delay: step.volume != null ? 900 : 0,
          duration: 1700,
          stir: step.stir,
        });
      }
      if (step.kind === "shake") schedule({ kind: "shake", delay: 0, duration: 1000 });
      if (step.kind === "press") schedule({ kind: "press", delay: 0, duration: 1600 });
    },
    [schedule],
  );

  const resetTimer = useCallback(() => {
    commitElapsed(0);
    setRunning(false);
    setCompleted(false);
    setEffect(null);
    lastEffectStep.current = -1;
    clearEffectTimers();
    setEpoch((value) => value + 1);
  }, [commitElapsed, clearEffectTimers]);

  // Switching recipes abandons the current brew; a half-run timer against a
  // different recipe would be a lie.
  useEffect(() => {
    resetTimer();
  }, [activeId, resetTimer]);

  useEffect(() => clearEffectTimers, [clearEffectTimers]);

  // 10 Hz is enough for the digits; the ring and liquid interpolate with CSS.
  useEffect(() => {
    if (!running || !active) return;
    const durationMs = active.duration * 1000;
    const startAt = performance.now() - elapsedRef.current;
    const timer = window.setInterval(() => {
      const next = performance.now() - startAt;
      commitElapsed(next);
      if (durationMs > 0 && next >= durationMs) {
        window.clearInterval(timer);
        commitElapsed(durationMs);
        setRunning(false);
        setCompleted(true);
        notify({
          title: "Brew complete",
          body: `${active.name} · ${formatClock(active.duration)}`,
          icon: <CoffeeIcon size={28} />,
        });
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, active, notify, commitElapsed, epoch]);

  const seconds = elapsed / 1000;
  const started = running || elapsed > 0 || completed;
  const duration = active?.duration ?? 0;
  const stopwatch = duration === 0;
  const pressMethod = active ? isPressMethod(active.method) : false;

  const currentIndex = useMemo(() => {
    if (!active || !started) return 0;
    let index = 0;
    active.steps.forEach((step, i) => {
      if (seconds + 0.001 >= step.at) index = i;
    });
    return index;
  }, [active, seconds, started]);

  const poured = useMemo(() => {
    if (!active || !started) return 0;
    for (let i = currentIndex; i >= 0; i -= 1) {
      const volume = active.steps[i]?.volume;
      if (volume != null) return volume;
    }
    return 0;
  }, [active, currentIndex, started]);

  const volumeFill = active?.water ? Math.min(1, poured / active.water) : 0;
  // A press keeps the water in the chamber until the plunge; a pour-over drains
  // straight into the cup. The Rapid Brewer is a free brew with no volumes, so
  // it gets a decorative fill once its press has run.
  const oxoPressed = active?.method === "OXO" && started && seconds >= 1.5;
  const pressed =
    oxoPressed ||
    (pressMethod &&
      started &&
      (completed ||
        (active?.steps.some((step, index) => index <= currentIndex && step.kind === "press") ??
          false)));
  const cupFill = pressMethod
    ? pressed
      ? active?.method === "OXO"
        ? 0.55
        : volumeFill
      : 0
    : volumeFill;
  const brewerFill = pressMethod
    ? pressed
      ? 0
      : active?.steps.length === 0
        ? started
          ? 0.55
          : 0
        : volumeFill
    : volumeFill;
  const progress = duration > 0 ? Math.min(1, seconds / duration) : 0;

  // A new step is also a new animation cue (pour / stir / shake / press).
  useEffect(() => {
    // resetTimer() and this effect run in the same commit when the recipe
    // changes, so `running` is still the old value here. Never start an
    // animation for the first render of a newly selected recipe.
    if (lastRecipeId.current !== activeId) {
      lastRecipeId.current = activeId;
      return;
    }
    if (!active || !running || completed) return;
    if (currentIndex === lastEffectStep.current) return;
    lastEffectStep.current = currentIndex;
    scheduleStepEffects(active.steps[currentIndex]);
  }, [active, activeId, completed, currentIndex, running, scheduleStepEffects]);

  const start = () => {
    if (!active) return;
    const restarting = completed;
    if (restarting) {
      commitElapsed(0);
      setCompleted(false);
      setEffect(null);
      lastEffectStep.current = -1;
      clearEffectTimers();
    }
    setRunning(true);
    // A free-brew press has no timeline, so show the plunge on Start.
    if (isPressMethod(active.method) && active.steps.length === 0) {
      schedule({ kind: "press", delay: 0, duration: 1600 });
    }
  };

  const toggle = () => {
    if (running) setRunning(false);
    else start();
  };

  const jumpTo = (stepIndex: number) => {
    if (!active) return;
    const step = active.steps[stepIndex];
    if (!step) return;
    commitElapsed(step.at * 1000);
    setCompleted(false);
    setEpoch((value) => value + 1);
    clearEffectTimers();
    setEffect(null);
    lastEffectStep.current = stepIndex;
    scheduleStepEffects(step);
  };

  const tabs = <CoffeeTabs view={view} onSelect={selectView} />;

  if (!active) {
    return (
      <div className="cf-app flex h-full min-h-0 flex-col">
        {tabs}
        {view === "grinder" ? (
          <main className="breeze-scroll min-h-0 flex-1 overflow-y-auto">
            <GrinderCalc />
          </main>
        ) : (
          <div className="grid h-full place-items-center text-[13px] text-subtle">
            coffeerecipe.txt has no recipes.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cf-app flex h-full min-h-0 flex-col">
      {tabs}
      {view === "grinder" ? (
        <main className="breeze-scroll min-h-0 flex-1 overflow-y-auto">
          <GrinderCalc />
        </main>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Recipe rail */}
          <aside className="flex shrink-0 flex-col border-b border-line md:w-[244px] md:border-b-0 md:border-r">
            <div className="flex items-center gap-1 overflow-x-auto px-3 pb-2 pt-3 md:flex-wrap md:overflow-visible">
              {RECIPE_METHODS.map((item) => {
                const selected = item === method;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMethod(item)}
                    aria-pressed={selected}
                    className={`cf-chip ${selected ? "is-active" : ""}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <div
              className="cf-rail-cards breeze-scroll flex gap-2 overflow-x-auto px-3 pb-3 md:min-h-0 md:flex-1 md:flex-col md:gap-1 md:overflow-y-auto md:overflow-x-hidden md:pb-3 md:pr-2"
              role="group"
              aria-label="Coffee recipes"
            >
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  selected={recipe.id === active.id}
                  index={index}
                  onSelect={() => setActiveId(recipe.id)}
                />
              ))}
              {recipes.length === 0 && (
                <p className="px-1 py-4 text-[12px] text-subtle">No recipes in this method.</p>
              )}
            </div>
          </aside>

          {/* Brew pane */}
          <main className="breeze-scroll min-h-0 flex-1 overflow-y-auto">
            <div key={active.id} className="cf-detail-in mx-auto w-full max-w-[720px] px-4 py-4 md:px-6 md:py-5">
              <header>
                <p className="cf-method">
                  <span
                    className="cf-method__dot"
                    style={{ background: METHOD_COLORS[active.method] ?? METHOD_COLORS.Manual }}
                    aria-hidden
                  />
                  {active.method}
                </p>
                <h1 className="cf-title">{active.name}</h1>
                <p className="cf-meta">{metaLine(active)}</p>
              </header>

              <section className="cf-console mt-4" aria-label="Brew timer">
                <div className="cf-stage">
                  <TimerRing
                    seconds={seconds}
                    running={running}
                    completed={completed}
                    stopwatch={stopwatch}
                    progress={progress}
                  />
                  <BrewStage
                    method={active.method}
                    cupFill={cupFill}
                    brewerFill={brewerFill}
                    effect={effect}
                    started={started}
                    completed={completed}
                    pressed={pressed}
                  />
                </div>

                <div className="cf-controls">
                  <button type="button" className="cf-btn cf-btn--primary" onClick={toggle}>
                    {running ? <PauseIcon /> : <PlayIcon />}
                    {running ? "Pause" : completed ? "Brew again" : started ? "Resume" : "Start"}
                  </button>
                  <button type="button" className="cf-btn" onClick={resetTimer} disabled={!started}>
                    <ResetIcon />
                    Reset
                  </button>
                </div>
              </section>

              {active.steps.length > 0 ? (
                <ol className="cf-timeline mt-4">
                  {active.steps.map((step, index) => {
                    const done = completed || (started && index < currentIndex);
                    const current = started && !completed && index === currentIndex;
                    const next = started && !completed && index === currentIndex + 1;
                    return (
                      <li key={`${step.at}-${index}`}>
                        <button
                          type="button"
                          className={`cf-step ${done ? "is-done" : ""} ${current ? "is-current" : ""} ${next ? "is-next" : ""}`}
                          onClick={() => jumpTo(index)}
                          aria-label={`Jump to ${formatClock(step.at)} — ${step.action}`}
                        >
                          <span className="cf-step__time">{formatClock(step.at)}</span>
                          <span className="cf-step__rail">
                            <span className="cf-step__dot">{done ? <CheckIcon size={8} /> : null}</span>
                          </span>
                          <span className="cf-step__body">
                            <span className="cf-step__glyph">
                              <StepGlyph kind={step.kind} />
                            </span>
                            <span className="cf-step__action">{step.action}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="cf-empty">No timed steps — use it as a stopwatch.</p>
              )}

              {active.notes && <p className="cf-notes">{active.notes}</p>}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

function CoffeeTabs({
  view,
  onSelect,
}: {
  view: CoffeeView;
  onSelect: (view: CoffeeView) => void;
}) {
  return (
    <div className="cf-tabs" role="tablist" aria-label="Coffee views">
      <button
        type="button"
        role="tab"
        aria-selected={view === "recipes"}
        className={`cf-tab ${view === "recipes" ? "is-active" : ""}`}
        onClick={() => onSelect("recipes")}
      >
        Recipes
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "grinder"}
        className={`cf-tab ${view === "grinder" ? "is-active" : ""}`}
        onClick={() => onSelect("grinder")}
      >
        Grinder
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Recipe rail                                                        */
/* ------------------------------------------------------------------ */

function RecipeCard({
  recipe,
  selected,
  index,
  onSelect,
}: {
  recipe: Recipe;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`cf-card ${selected ? "is-active" : ""}`}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="cf-card__dot"
          style={{ background: METHOD_COLORS[recipe.method] ?? METHOD_COLORS.Manual }}
          aria-hidden
        />
        <span className="truncate text-[12.5px] font-semibold">{recipe.name}</span>
      </span>
      <span className="mt-0.5 block truncate text-[10.5px] text-subtle">{metaLine(recipe)}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Timer ring                                                         */
/* ------------------------------------------------------------------ */

function TimerRing({
  seconds,
  running,
  completed,
  stopwatch,
  progress,
}: {
  seconds: number;
  running: boolean;
  completed: boolean;
  stopwatch: boolean;
  progress: number;
}) {
  const dash = stopwatch ? `${RING * 0.16} ${RING * 0.84}` : RING;
  const offset = stopwatch ? 0 : RING * (1 - (completed ? 1 : progress));

  return (
    <div className={`cf-ring ${completed ? "is-done" : ""} ${running ? "is-running" : ""}`}>
      <svg viewBox="0 0 168 168" className="cf-ring__svg" aria-hidden="true">
        <defs>
          <linearGradient id="cf-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--breeze-accent)" />
            <stop offset="100%" stopColor="var(--breeze-accent-strong)" />
          </linearGradient>
        </defs>
        <g transform="rotate(-90 84 84)">
          <circle className="cf-ring__track" cx="84" cy="84" r="72" fill="none" strokeWidth="5" />
          <circle
            className={`cf-ring__prog ${stopwatch && !seconds ? "is-idle" : ""} ${stopwatch && running ? "is-spin" : ""}`}
            cx="84"
            cy="84"
            r="72"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            style={{ strokeDasharray: dash, strokeDashoffset: offset }}
          />
        </g>
      </svg>
      <p className="cf-ring__time" aria-live="off">
        {formatClock(seconds)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Brew stage - one silhouette per brewer, one animation per action    */
/* ------------------------------------------------------------------ */

function BrewStage({
  method,
  cupFill,
  brewerFill,
  effect,
  started,
  completed,
  pressed,
}: {
  method: string;
  cupFill: number;
  brewerFill: number;
  effect: Effect | null;
  started: boolean;
  completed: boolean;
  pressed: boolean;
}) {
  const slug = methodSlug(method);

  return (
    <div
      className={`cf-brew cf-brew--${slug} ${completed ? "is-complete" : ""} ${pressed ? "is-pressed" : ""}`}
    >
      <div className={`cf-brew__rig ${effect ? `is-${effect.kind}` : ""}`}>
        <div className="cf-brew__steam" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        {slug === "v60" && <V60Brewer fill={brewerFill} />}
        {slug === "b75" && <B75Brewer fill={brewerFill} />}
        {slug === "aeropress" && <AeroPressBrewer fill={brewerFill} />}
        {slug === "oxo" && <OxoBrewer chamberFill={brewerFill} cupFill={cupFill} />}

        {effect?.kind === "pour" && <PourStream key={effect.key} slug={slug} />}
        {effect?.kind === "stir" && <Stir key={effect.key} slug={slug} info={effect.stir} />}
        {effect?.kind === "shake" && <ShakeMarks key={effect.key} />}
      </div>

      {slug !== "oxo" && <Cup fill={cupFill} started={started} completed={completed} />}
    </div>
  );
}

function V60Brewer({ fill }: { fill: number }) {
  return (
    <div className="cf-vessel cf-vessel--v60">
      <span className="cf-v60__cone" />
      <span className="cf-v60__rim" />
      <span className="cf-v60__spout" />
      <span className="cf-v60__bed" style={{ opacity: 0.35 + Math.min(1, fill) * 0.6 }} />
      <span className="cf-v60__bloom" />
    </div>
  );
}

function B75Brewer({ fill }: { fill: number }) {
  return (
    <div className="cf-vessel cf-vessel--b75">
      <span className="cf-b75__basket" />
      <span className="cf-b75__bed" style={{ opacity: 0.3 + Math.min(1, fill) * 0.65 }} />
      <span className="cf-b75__rim" />
      <span className="cf-b75__disc" />
      <span className="cf-b75__ripple" />
    </div>
  );
}

function AeroPressBrewer({ fill }: { fill: number }) {
  return (
    <div className="cf-vessel cf-aeropress">
      <div className="cf-aeropress__plunger">
        <span className="cf-aeropress__pad" />
        <span className="cf-aeropress__rod" />
      </div>
      <div className="cf-aeropress__chamber">
        <span
          className={`cf-aeropress__liquid ${fill > 0.01 ? "is-visible" : ""}`}
          style={{ height: `${Math.max(0, Math.min(1, fill)) * 100}%` }}
        >
          <span className="cf-aeropress__surface" />
        </span>
        <span className="cf-aeropress__shine" />
      </div>
      <span className="cf-aeropress__flange" />
      <span className="cf-aeropress__nozzle" />
    </div>
  );
}

function OxoBrewer({ chamberFill, cupFill }: { chamberFill: number; cupFill: number }) {
  const pct = (value: number) => `${Math.max(0, Math.min(1, value)) * 100}%`;
  return (
    <div className="cf-vessel cf-oxo">
      <span className="cf-oxo__shadow" />
      <div className="cf-oxo__base">
        <span
          className={`cf-oxo__coffee ${cupFill > 0.01 ? "is-visible" : ""}`}
          style={{ height: pct(cupFill) }}
        >
          <span className="cf-oxo__coffee-surface" />
        </span>
        <span className="cf-oxo__glass" />
      </div>
      <span className="cf-oxo__collar" />
      <div className="cf-oxo__chamber">
        <span
          className={`cf-oxo__liquid ${chamberFill > 0.01 ? "is-visible" : ""}`}
          style={{ height: pct(chamberFill) }}
        >
          <span className="cf-oxo__surface" />
        </span>
        <span className="cf-oxo__shine" />
      </div>
      <div className="cf-oxo__pump">
        <span className="cf-oxo__logo" aria-hidden>
          OXO
        </span>
      </div>
      <span className="cf-oxo__rod" />
      <span className="cf-oxo__knob" />
    </div>
  );
}

function Cup({
  fill,
  started,
  completed,
}: {
  fill: number;
  started: boolean;
  completed: boolean;
}) {
  return (
    <div className={`cf-cup ${completed ? "is-complete" : ""}`} aria-hidden="true">
      <div className="cf-cup__handle" />
      <div className="cf-cup__body">
        <div
          className={`cf-cup__liquid ${started && fill > 0.01 ? "is-visible" : ""}`}
          style={{ height: `${Math.max(0, Math.min(1, fill)) * 100}%` }}
        >
          <span className="cf-cup__wave" />
        </div>
        <span className="cf-cup__gloss" />
      </div>
      <div className="cf-cup__rim" />
      <div className="cf-cup__saucer" />
      {completed && <BeansBurst />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Effects                                                            */
/* ------------------------------------------------------------------ */

const DROPS = [
  { x: 46, delay: 0 },
  { x: 51, delay: 90 },
  { x: 56, delay: 40 },
  { x: 48, delay: 210 },
  { x: 53, delay: 160 },
  { x: 50, delay: 300 },
];

const BURST_BEANS = [
  { dx: -38, dy: -58, rot: -140, delay: 0 },
  { dx: -18, dy: -76, rot: 120, delay: 50 },
  { dx: 4, dy: -64, rot: -80, delay: 20 },
  { dx: 24, dy: -78, rot: 160, delay: 90 },
  { dx: 42, dy: -52, rot: -120, delay: 40 },
  { dx: -30, dy: -36, rot: 200, delay: 120 },
  { dx: 32, dy: -34, rot: -180, delay: 110 },
];

function PourStream({ slug }: { slug: string }) {
  return (
    <div className={`cf-brew__pour cf-brew__pour--${slug}`}>
      <div className="cf-pour__sway">
        <span className="cf-pour__stream" />
        {DROPS.map((drop, index) => (
          <span
            key={index}
            className="cf-pour__drop"
            style={{ left: `${drop.x}%`, animationDelay: `${drop.delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function Stir({ slug, info }: { slug: string; info?: StirInfo }) {
  const direction = info?.direction ?? "cw";
  return (
    <div className={`cf-stir cf-stir--${slug} cf-stir--${direction}`} aria-hidden>
      <span className="cf-stir__swirl" />
      <span className="cf-stir__spoon" />
      <span className="cf-stir__splash cf-stir__splash--a" />
      <span className="cf-stir__splash cf-stir__splash--b" />
    </div>
  );
}

function ShakeMarks() {
  return (
    <div className="cf-shake" aria-hidden>
      <span className="cf-shake__line cf-shake__line--l1" />
      <span className="cf-shake__line cf-shake__line--l2" />
      <span className="cf-shake__line cf-shake__line--r1" />
      <span className="cf-shake__line cf-shake__line--r2" />
    </div>
  );
}

function BeansBurst() {
  return (
    <div className="cf-cup__burst">
      {BURST_BEANS.map((bean, index) => (
        <span
          key={index}
          className="cf-bean cf-burst"
          style={
            {
              "--dx": `${bean.dx}px`,
              "--dy": `${bean.dy}px`,
              "--rot": `${bean.rot}deg`,
              animationDelay: `${bean.delay}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Glyphs                                                             */
/* ------------------------------------------------------------------ */

function StepGlyph({ kind }: { kind: StepKind }) {
  switch (kind) {
    case "pour":
      return (
        <svg {...glyph}>
          <path d="M12 4.5c3.2 3.6 5 6 5 8a5 5 0 0 1-10 0c0-2 1.8-4.4 5-8Z" />
        </svg>
      );
    case "stir":
      return (
        <svg {...glyph}>
          <path d="M12 11V4.5" />
          <path d="M7.5 14.5a4.5 4.5 0 0 0 9 0" strokeDasharray="2.6 2.2" />
          <path d="M8.6 13.6a3.6 3.6 0 0 1 6.8 0" />
        </svg>
      );
    case "shake":
      return (
        <svg {...glyph}>
          <path d="M3.5 9.5c1.6-1.4 3.2-1.4 4.8 0s3.2 1.4 4.8 0 3.2-1.4 4.8 0 3.2 1.4 4.8 0" />
          <path d="M3.5 15c1.6-1.4 3.2-1.4 4.8 0s3.2 1.4 4.8 0 3.2-1.4 4.8 0 3.2 1.4 4.8 0" />
        </svg>
      );
    case "press":
      return (
        <svg {...glyph}>
          <path d="M12 4.5v10" />
          <path d="m8.5 11 3.5 3.7 3.5-3.7" />
          <path d="M5.5 19.5h13" />
        </svg>
      );
    case "finish":
      return <CheckIcon size={11} />;
    default:
      return (
        <svg {...glyph}>
          <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

const glyph = {
  width: 11,
  height: 11,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function PlayIcon(): ReactNode {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5.5v13l10-6.5Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon(): ReactNode {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
      <path d="M9 5.5v13M15 5.5v13" />
    </svg>
  );
}

function ResetIcon(): ReactNode {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4.5v4.2h4.2" />
    </svg>
  );
}

function CheckIcon({ size = 10 }: { size?: number }): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}
