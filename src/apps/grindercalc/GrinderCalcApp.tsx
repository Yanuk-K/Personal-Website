import { useMemo, useRef, useState, type ReactNode } from "react";
import { List, arrayMove } from "react-movable";
import { BreezeSlider } from "./BreezeSlider";
import { useNotifications } from "../../state/notifications";

type Grinder = {
  id: string;
  name: string;
  micronPerClick: number;
  clicksPerRotation: number;
};

const defaultGrinders: Grinder[] = [
  { id: "grinder-0", name: "1Zpresso K-Ultra", micronPerClick: 14, clicksPerRotation: 10 },
  { id: "grinder-1", name: "1Zpresso J-Ultra", micronPerClick: 3.18, clicksPerRotation: 100 },
  { id: "grinder-2", name: "Comandante C40", micronPerClick: 27.25, clicksPerRotation: 10 },
];

const MAX_MICRONS = 1400;

const inputCls =
  "w-full rounded-md border border-line bg-view px-3 py-2 text-[13px] outline-none placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/25";

export function GrinderCalcApp() {
  const { notify } = useNotifications();
  const [grinders, setGrinders] = useState<Grinder[]>(defaultGrinders);
  const [order, setOrder] = useState<string[]>(
    defaultGrinders.map((grinder) => grinder.id),
  );
  const [micronValue, setMicronValue] = useState(0);
  const [lastTouchedId, setLastTouchedId] = useState<string | null>(
    defaultGrinders[0]?.id ?? null,
  );
  const idCounter = useRef(defaultGrinders.length);
  const [newGrinder, setNewGrinder] = useState({
    name: "",
    micronPerClick: "",
    clicksPerRotation: "",
  });

  const grinderMap = useMemo(() => {
    const map = new Map<string, Grinder>();
    grinders.forEach((grinder) => {
      map.set(grinder.id, grinder);
    });
    return map;
  }, [grinders]);

  const getMaxClicks = (grinder: Grinder) =>
    Math.max(1, Math.round(MAX_MICRONS / grinder.micronPerClick));

  const handleSliderChange = (id: string, newClickValue: number) => {
    const activeGrinder = grinderMap.get(id);
    if (!activeGrinder) return;

    const maxClicks = getMaxClicks(activeGrinder);
    const nextClicks = Math.max(0, Math.min(maxClicks, Math.round(newClickValue)));
    const nextMicrons = Math.min(
      MAX_MICRONS,
      Math.round(nextClicks * activeGrinder.micronPerClick),
    );
    setMicronValue(nextMicrons);
    setLastTouchedId(id);
  };

  const getSliderValue = (grinder: Grinder) => {
    const maxClicks = getMaxClicks(grinder);
    const rawClicks = grinder.micronPerClick ? micronValue / grinder.micronPerClick : 0;
    const projected = Math.round(rawClicks);
    return Math.max(0, Math.min(maxClicks, projected));
  };

  const handleInputChange =
    (field: "name" | "micronPerClick" | "clicksPerRotation") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setNewGrinder((prev) => ({ ...prev, [field]: value }));
    };

  const handleAddGrinder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = newGrinder.name.trim();
    const micronPerClick = parseFloat(newGrinder.micronPerClick);
    const clicksPerRotation = parseInt(newGrinder.clicksPerRotation, 10);

    if (
      !trimmedName ||
      Number.isNaN(micronPerClick) ||
      Number.isNaN(clicksPerRotation) ||
      micronPerClick <= 0 ||
      clicksPerRotation <= 0
    ) {
      return;
    }

    const id = `grinder-${idCounter.current++}`;
    const grinder: Grinder = { id, name: trimmedName, micronPerClick, clicksPerRotation };

    setGrinders((prev) => [...prev, grinder]);
    setOrder((prev) => [...prev, id]);
    setNewGrinder({ name: "", micronPerClick: "", clicksPerRotation: "" });
    setLastTouchedId(id);
    setMicronValue((current) => Math.min(MAX_MICRONS, Math.max(0, current)));
    notify({ title: "Grinder added", body: trimmedName });
  };

  const activeGrinder =
    (lastTouchedId && grinderMap.get(lastTouchedId)) || grinders[0] || null;
  const activeValue = activeGrinder ? getSliderValue(activeGrinder) : 0;
  const activeRotations =
    activeGrinder && activeGrinder.clicksPerRotation > 0
      ? Math.floor(activeValue / activeGrinder.clicksPerRotation)
      : 0;
  const activeClicks =
    activeGrinder && activeGrinder.clicksPerRotation > 0
      ? activeValue % activeGrinder.clicksPerRotation
      : 0;
  const activeMicrons = Math.max(0, Math.min(MAX_MICRONS, micronValue));

  return (
    <div className="breeze-scroll h-full overflow-y-auto px-5 py-5">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-line bg-chrome/50 px-4 py-2.5">
          <p className="text-[13px]">
            {activeGrinder ? (
              <>
                <span className="font-bold">{activeGrinder.name}</span>
                <span className="text-subtle"> · </span>
                <span className="font-mono text-[12.5px]" style={{ color: "var(--breeze-accent)" }}>
                  {activeMicrons} µm
                </span>
                <span className="text-subtle"> · {activeRotations} rot · {activeClicks} clk</span>
              </>
            ) : (
              "Add a grinder to get started"
            )}
          </p>
          <span className="hidden text-[11px] text-subtle sm:block">drag to reorder</span>
        </div>

        <List
          lockVertically
          values={order}
          onChange={({ oldIndex, newIndex }) =>
            setOrder((prev) => arrayMove(prev, oldIndex, newIndex))
          }
          renderList={({ children, props, isDragged }) => (
            <ul
              {...props}
              style={{
                padding: 0,
                cursor: isDragged ? "grabbing" : undefined,
                listStyle: "none",
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {children}
            </ul>
          )}
          renderItem={({ value, props, isDragged }) => {
            const grinder = grinderMap.get(value);
            if (!grinder) return null;
            return (
              <li
                {...props}
                key={props.key}
                style={{
                  ...props.style,
                  cursor: isDragged ? "grabbing" : "grab",
                  borderRadius: 10,
                  border: "1px solid var(--breeze-line)",
                  background: "var(--breeze-window)",
                  boxShadow: isDragged
                    ? "0 14px 34px -8px rgba(0,0,0,0.45)"
                    : "0 2px 6px -2px rgba(0,0,0,0.18)",
                  padding: "0.9rem 1rem",
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      data-movable-handle
                      tabIndex={-1}
                      aria-label={`Reorder ${grinder.name}`}
                      className="flex h-8 w-6 shrink-0 items-center justify-center rounded-md text-subtle hover:bg-hover"
                    >
                      <GripGlyph />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold">{grinder.name}</p>
                      <p className="truncate text-[11.5px] text-subtle">
                        {grinder.micronPerClick} µm/click · {grinder.clicksPerRotation} clicks/rotation · max{" "}
                        {getMaxClicks(grinder)} clicks
                      </p>
                    </div>
                  </div>
                  <BreezeSlider
                    max={getMaxClicks(grinder)}
                    clicksPerRotation={grinder.clicksPerRotation}
                    value={getSliderValue(grinder)}
                    micronPerClick={grinder.micronPerClick}
                    onChange={(clickValue) => handleSliderChange(grinder.id, clickValue)}
                    ariaLabel={`${grinder.name} grind setting`}
                  />
                </div>
              </li>
            );
          }}
        />

        <form
          className="grid gap-3 rounded-lg border border-line bg-window p-4"
          onSubmit={handleAddGrinder}
        >
          <p className="text-[12px] font-bold uppercase tracking-wide text-subtle">
            Add Custom Grinder
          </p>
          <label className="flex flex-col gap-1.5 text-[12px] font-medium">
            Name
            <input
              type="text"
              value={newGrinder.name}
              onChange={handleInputChange("name")}
              className={inputCls}
              placeholder="Pixel Grinder"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-[12px] font-medium">
              Micron / click
              <input
                type="text"
                inputMode="decimal"
                value={newGrinder.micronPerClick}
                onChange={handleInputChange("micronPerClick")}
                className={inputCls}
                placeholder="14"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium">
              Clicks / rotation
              <input
                type="text"
                inputMode="numeric"
                value={newGrinder.clicksPerRotation}
                onChange={handleInputChange("clicksPerRotation")}
                className={inputCls}
                placeholder="10"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-1 w-full rounded-md bg-accent py-2 text-[13px] font-bold text-accent-fg transition-colors hover:bg-accent-strong"
          >
            Add Grinder
          </button>
        </form>
      </div>
    </div>
  );
}

function GripGlyph(): ReactNode {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden>
      {[3, 8, 13].map((y) => (
        <g key={y}>
          <circle cx="3" cy={y} r="1.35" />
          <circle cx="9" cy={y} r="1.35" />
        </g>
      ))}
    </svg>
  );
}
