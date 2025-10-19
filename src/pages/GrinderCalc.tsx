import * as React from "react";
import { useMemo, useRef, useState } from "react";
import GrindSlider from "../components/GrindSlider";
import { List, arrayMove } from "react-movable";

export const HandleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#555"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-move"
  >
    <polyline points="5 9 2 12 5 15" />
    <polyline points="9 5 12 2 15 5" />
    <polyline points="15 19 12 22 9 19" />
    <polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

export const buttonStyles = {
  border: "none",
  margin: 0,
  padding: 0,
  width: "auto",
  overflow: "visible",
  cursor: "pointer",
  background: "transparent",
};

type Grinder = {
  id: string;
  name: string;
  micronPerClick: number;
  clicksPerRotation: number;
};

const defaultGrinders: Grinder[] = [
  {
    id: "grinder-0",
    name: "1Zpresso K-Ultra",
    micronPerClick: 14,
    clicksPerRotation: 10,
  },
  {
    id: "grinder-1",
    name: "1Zpresso J-Ultra",
    micronPerClick: 3.18,
    clicksPerRotation: 100,
  },
  {
    id: "grinder-2",
    name: "Comandante C40",
    micronPerClick: 27.25,
    clicksPerRotation: 10,
  },
];

const MAX_MICRONS = 1400;

function GrinderCalc() {
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
    if (!activeGrinder) {
      return;
    }

    const maxClicks = getMaxClicks(activeGrinder);
    const nextClicks = Math.max(
      0,
      Math.min(maxClicks, Math.round(newClickValue)),
    );
    const nextMicrons = Math.min(
      MAX_MICRONS,
      Math.round(nextClicks * activeGrinder.micronPerClick),
    );
    setMicronValue(nextMicrons);
    setLastTouchedId(id);
  };

  const getSliderValue = (grinder: Grinder) => {
    const maxClicks = getMaxClicks(grinder);
    const rawClicks = grinder.micronPerClick
      ? micronValue / grinder.micronPerClick
      : 0;
    const projected = Math.round(rawClicks);
    return Math.max(0, Math.min(maxClicks, projected));
  };

  const handleInputChange =
    (field: "name" | "micronPerClick" | "clicksPerRotation") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setNewGrinder((prev) => ({
        ...prev,
        [field]: value,
      }));
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
    const grinder: Grinder = {
      id,
      name: trimmedName,
      micronPerClick,
      clicksPerRotation,
    };

    setGrinders((prev) => [...prev, grinder]);
    setOrder((prev) => [...prev, id]);
    setNewGrinder({
      name: "",
      micronPerClick: "",
      clicksPerRotation: "",
    });
    setLastTouchedId(id);
    setMicronValue((current) => Math.min(MAX_MICRONS, Math.max(0, current)));
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
    <>
      <div className="min-h-[87dvh] flex flex-col items-center gap-6 bg-[#fef7e6] pb-14 px-3">
        <div className="font-PixelMplusBold text-3xl p-6 text-center tracking-[0.25em] text-[#111] drop-shadow-[2px_2px_0_#fff]">
          <p>Grinder Calculator</p>
        </div>
        <div className="flex w-full max-w-[640px] flex-col gap-8">
          <div className="font-PixelMplusBold text-[0.65rem] uppercase tracking-[0.25em] text-[#111] text-center border-4 border-black bg-[#fff] px-4 py-3 shadow-[5px_5px_0_#000]">
            <p>
              {activeGrinder
                ? `Active: ${activeGrinder.name} - ${activeMicrons} um | ${activeRotations} ROT | ${activeClicks} CLK`
                : "Add a grinder to get started"}
            </p>
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
                  gap: "1.25rem",
                }}
              >
                {children}
              </ul>
            )}
            renderItem={({ value, props, isDragged, isSelected }) => {
              const grinder = grinderMap.get(value);
              if (!grinder) {
                return null;
              }
              return (
                <li
                  {...props}
                  key={props.key}
                  style={{
                    ...props.style,
                    padding: "1.5rem 1.75rem",
                    cursor: isDragged ? "grabbing" : "grab",
                    border: "4px solid #000",
                    boxShadow: "8px 8px 0 #000",
                    color: "#111",
                    borderRadius: 0,
                    fontFamily: '"PixelMplus10", "Courier New", monospace',
                    backgroundColor:
                      isDragged || isSelected ? "#fff9c4" : "#ffffff",
                    transition: "background-color 150ms ease",
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        data-movable-handle
                        style={{
                          ...buttonStyles,
                          cursor: isDragged ? "grabbing" : "grab",
                          padding: "0.35rem",
                          border: "3px solid #000",
                          backgroundColor: "#5bf0ff",
                          boxShadow: "3px 3px 0 #000",
                          borderRadius: 0,
                        }}
                        tabIndex={-1}
                        aria-label={`Drag ${grinder.name}`}
                      >
                        <HandleIcon />
                      </button>
                      <div className="flex flex-col gap-1">
                        <p className="text-xl uppercase tracking-[0.3em]">
                          {grinder.name}
                        </p>
                        <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[#444]">
                          {grinder.micronPerClick} um / click |{" "}
                          {grinder.clicksPerRotation} clicks / rotation | max{" "}
                          {getMaxClicks(grinder)} clicks
                        </p>
                      </div>
                    </div>
                    <GrindSlider
                      max={getMaxClicks(grinder)}
                      clicksPerRotation={grinder.clicksPerRotation}
                      value={getSliderValue(grinder)}
                      micronPerClick={grinder.micronPerClick}
                      onChange={(clickValue) =>
                        handleSliderChange(grinder.id, clickValue)
                      }
                    />
                  </div>
                </li>
              );
            }}
          />
          <form
            className="mt-4 grid gap-3 rounded-none border-4 border-black bg-white p-4 font-PixelMplusBold text-[0.65rem] uppercase tracking-[0.18em] shadow-[6px_6px_0_#000]"
            onSubmit={handleAddGrinder}
          >
            <p className="text-sm tracking-[0.28em] text-[#111]">
              Add Custom Grinder
            </p>
            <label className="flex flex-col gap-2 text-xs text-[#444]">
              Name
              <input
                type="text"
                value={newGrinder.name}
                onChange={handleInputChange("name")}
                className="rounded-none border-3 border-black bg-[#fef2f2] p-2 tracking-[0.1em] text-sm text-[#111] focus:border-[#ff8a7a] focus:outline-none"
                placeholder="Pixel Grinder"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-[#444]">
              Micron / Click
              <input
                type="text"
                inputMode="decimal"
                value={newGrinder.micronPerClick}
                onChange={handleInputChange("micronPerClick")}
                className="rounded-none border-3 border-black bg-[#fef2f2] p-2 tracking-[0.1em] text-sm text-[#111] focus:border-[#ff8a7a] focus:outline-none"
                placeholder="14"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-[#444]">
              Clicks Per Rotation
              <input
                type="text"
                inputMode="numeric"
                value={newGrinder.clicksPerRotation}
                onChange={handleInputChange("clicksPerRotation")}
                className="rounded-none border-3 border-black bg-[#fef2f2] p-2 tracking-[0.1em] text-sm text-[#111] focus:border-[#ff8a7a] focus:outline-none"
                placeholder="10"
              />
            </label>
            <button
              type="submit"
              className="mt-1 w-full rounded-none border-4 border-black bg-[#92f2ff] p-2 text-sm tracking-[0.26em] text-[#111] transition-colors hover:bg-[#ff8a7a]"
            >
              Add Grinder
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default GrinderCalc;
