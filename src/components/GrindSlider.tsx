import React, { useMemo } from "react";
import { Slider, styled } from "@mui/material";

interface GrindSliderProps {
  max: number;
  clicksPerRotation: number;
  value: number;
  micronPerClick?: number;
  onChange?: (value: number) => void;
}

const StyledSlider = styled(Slider)(() => ({
  width: "100%",
  padding: "16px 0 8px",
  color: "#111",
  "& .MuiSlider-rail": {
    height: 12,
    borderRadius: 0,
    opacity: 1,
    backgroundColor: "#ffe6b3",
    border: "4px solid #000",
    boxShadow: "4px 4px 0 #000",
  },
  "& .MuiSlider-track": {
    height: 12,
    borderRadius: 0,
    background:
      "repeating-linear-gradient(135deg, #111 0 5px, #ffce67 5px 10px)",
    border: "4px solid #000",
    boxShadow: "4px 4px 0 #000",
  },
  "& .MuiSlider-thumb": {
    width: 28,
    height: 28,
    borderRadius: 0,
    backgroundColor: "#5bf0ff",
    border: "4px solid #000",
    boxShadow: "4px 4px 0 #000",
    marginTop: -10,
    marginLeft: -14,
    "&:before": {
      display: "none",
    },
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow: "4px 4px 0 #000",
      backgroundColor: "#ff8a7a",
    },
  },
  "& .MuiSlider-thumb.Mui-disabled": {
    backgroundColor: "#d7d7d7",
  },
  "& .MuiSlider-mark": {
    width: 6,
    height: 16,
    borderRadius: 0,
    backgroundColor: "#000",
    transform: "translateX(-3px)",
  },
  "& .MuiSlider-markLabel": {
    fontFamily: '"PixelMplus10", "Courier New", monospace',
    fontSize: "0.65rem",
    textTransform: "uppercase",
    color: "#111",
    padding: "2px 6px",
    border: "2px solid #000",
    backgroundColor: "#fff",
    boxShadow: "3px 3px 0 #000",
    borderRadius: 0,
    transform: "translateX(-50%) translateY(8px)",
    letterSpacing: "0.05em",
  },
}));

const GrindSlider: React.FC<GrindSliderProps> = ({
  max,
  clicksPerRotation,
  value,
  micronPerClick,
  onChange,
}) => {
  const handleChange = (_: Event, newValue: number | number[]) => {
    if (onChange) {
      onChange(newValue as number); // Notify parent of the change
    }
  };

  // Generate major marks based on full rotations for clarity
  const marks = useMemo(() => {
    const formatRotation = (clicks: number) => {
      const rotations = clicksPerRotation
        ? clicks / clicksPerRotation
        : clicks;
      return Number.isInteger(rotations)
        ? `${rotations}R`
        : `${rotations.toFixed(1)}R`;
    };

    const generated: { value: number; label: string }[] = [];
    const step = Math.max(1, clicksPerRotation);

    for (let i = 0; i <= max; i += step) {
      generated.push({
        value: i,
        label: formatRotation(i),
      });
    }

    if (generated.length === 0 || generated[generated.length - 1]?.value !== max) {
      generated.push({
        value: max,
        label: formatRotation(max),
      });
    }

    return generated;
  }, [clicksPerRotation, max]);

  const micronValue =
    micronPerClick && micronPerClick > 0
      ? Math.round(value * micronPerClick)
      : null;

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        fontFamily: '"PixelMplus10", "Courier New", monospace',
        color: "#111",
        textShadow: "none",
        padding: "0.75rem 0.6rem 1.4rem",
        border: "3px solid #000",
        backgroundColor: "#fff8dc",
        boxShadow: "4px 4px 0 #000",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 text-[0.72rem] uppercase tracking-[0.04em]">
        <span>Rot {Math.floor(value / clicksPerRotation)}</span>
        <span>Clk {value % clicksPerRotation}</span>
        {micronValue !== null ? <span>{micronValue} um</span> : null}
        <span>Max {max}</span>
      </div>
      <StyledSlider
        value={value}
        max={max}
        step={1}
        marks={marks}
        onChange={handleChange}
        valueLabelDisplay="off"
      />
    </div>
  );
};

export default GrindSlider;
