import React, { useEffect, useState } from "react";
import { Slider, styled } from "@mui/material";

interface GrindSliderProps {
  max: number;
  clicksPerRotation: number;
  currentValue: number;
  onChange?: (value: number) => void;
}

const StyledSlider = styled(Slider)(() => ({
  width: "100%",
  height: "10dvh",
  padding: "0 16px",
  ".MuiSlider-rail": {
    display: "none", // Hide the rail
  },
  ".MuiSlider-track": {
    display: "none", // Hide the track
  },
  ".MuiSlider-thumb": {
    width: 2,
    height: "80%",
    backgroundColor: "black",
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow: "none",
    },
  },
  ".MuiSlider-mark": {
    width: 1,
    height: 8,
    backgroundColor: "black",
  },
  ".MuiSlider-markLabel": {
    position: "absolute", // Position the label absolutely
    whiteSpace: "nowrap",
    visibility: "hidden",
  },
}));

const GrindSlider: React.FC<GrindSliderProps> = ({
  max,
  clicksPerRotation,
  currentValue,
  onChange,
}) => {
  const [value, setValue] = useState<number>(currentValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  const handleChange = (_: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    if (onChange) {
      onChange(newValue as number); // Notify parent of the change
    }
  };

  // Generate major and minor marks based on the clicks per rotation
  const generateMarks = () => {
    const marks: { value: number; label: number; type: "major" | "minor" }[] =
      [];
    for (let i = 0; i <= max; i++) {
      const isMajorMark = i % clicksPerRotation === 0;
      const isMinorMark =
        i % Math.round(clicksPerRotation / 5) === 0 && !isMajorMark;

      if (isMajorMark) {
        marks.push({
          value: i,
          label: i / clicksPerRotation,
          type: "major",
        });
      } else if (isMinorMark) {
        marks.push({
          value: i,
          label: i % clicksPerRotation,
          type: "minor",
        });
      }
    }

    return marks;
  };

  const renderMarkLabel = (mark: {
    value: number;
    label: number;
    type: "major" | "minor";
  }) => {
    const positionPercentage = (mark.value / max) * 100;

    return (
      <span
        style={{
          position: "absolute",
          left: `${positionPercentage}%`,
          transform:
            "translateX(-50%) " +
            (mark.type === "major" ? "translateY(-250%)" : "translateY(-200%)"),
          whiteSpace: "nowrap",
          fontSize: mark.type === "major" ? "1em" : "0.8em",
        }}
      >
        {mark.label}
      </span>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "auto",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "0%",
          transform: "translateY(350%)",
        }}
      >
        {Math.floor(value / clicksPerRotation) +
          " rotations " +
          (value % clicksPerRotation) +
          " clicks "}
      </div>
      <StyledSlider
        value={value}
        max={max}
        marks={generateMarks()}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) =>
          `${
            Math.floor(value / clicksPerRotation) +
            "." +
            (value % clicksPerRotation)
          }`
        }
      />
      <div className="absolute w-[106.3%] w1200:w-[100%] top-[50%] translate-y-[-50%]">
        {generateMarks().map((mark) => renderMarkLabel(mark))}
      </div>
    </div>
  );
};

export default GrindSlider;
