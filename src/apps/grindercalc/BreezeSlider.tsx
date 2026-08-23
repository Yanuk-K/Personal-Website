import { useMemo } from "react";

export function BreezeSlider({
  max,
  clicksPerRotation,
  value,
  micronPerClick,
  onChange,
  ariaLabel,
}: {
  max: number;
  clicksPerRotation: number;
  value: number;
  micronPerClick?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
}) {
  const fill = max > 0 ? `${(value / max) * 100}%` : "0%";

  const marks = useMemo(() => {
    const formatRotation = (clicks: number) => {
      const rotations = clicksPerRotation ? clicks / clicksPerRotation : clicks;
      return Number.isInteger(rotations) ? `${rotations}R` : `${rotations.toFixed(1)}R`;
    };
    const generated: { value: number; label: string }[] = [];
    const step = Math.max(1, clicksPerRotation);
    for (let i = 0; i <= max; i += step) {
      generated.push({ value: i, label: formatRotation(i) });
    }
    if (
      generated.length === 0 ||
      generated[generated.length - 1]?.value !== max
    ) {
      generated.push({ value: max, label: formatRotation(max) });
    }
    return generated;
  }, [clicksPerRotation, max]);

  const micronValue =
    micronPerClick && micronPerClick > 0
      ? Math.round(value * micronPerClick)
      : null;

  return (
    <div className="rounded-md border border-line bg-chrome/40 px-3 pb-5 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 text-[11px] font-medium uppercase tracking-wide text-subtle">
        <span>
          Rot <span className="text-text">{Math.floor(value / clicksPerRotation)}</span>
        </span>
        <span>
          Clk <span className="text-text">{value % clicksPerRotation}</span>
        </span>
        {micronValue !== null ? (
          <span>
            <span className="text-text">{micronValue}</span> µm
          </span>
        ) : null}
        <span>
          Max <span className="text-text">{max}</span>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className="breeze-range mt-1"
        style={{ ["--range-fill" as string]: fill }}
      />
      <div className="relative h-4" aria-hidden>
        {marks.map((mark) => (
          <span
            key={mark.value}
            className="absolute -translate-x-1/2 whitespace-nowrap text-[9.5px] font-medium text-subtle"
            style={{ left: `${max > 0 ? (mark.value / max) * 100 : 0}%` }}
          >
            {mark.label}
          </span>
        ))}
      </div>
    </div>
  );
}
