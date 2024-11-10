import React, { useEffect, useState } from "react";
import { Slider, styled } from "@mui/material";

interface GrindSliderProps {
  max: number;
  clicksPerRotation: number;
  currentValue: number;
}

const StyledSlider = styled(Slider)(() => ({
  width: "100%",
  height: "100%", // Full height of the container (controlled by 16:9 aspect ratio)
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
    backgroundColor: "grey",
  },
  ".MuiSlider-markLabel": {
    transform: "translateY()", // Adjust label position
  },
}));

const GrindSlider: React.FC<GrindSliderProps> = ({
  max,
  clicksPerRotation,
  currentValue,
}) => {
  const [value, setValue] = useState<number>(currentValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  const handleChange = (_: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  // Generate major and minor marks based on the clicks per rotation
  const generateMarks = () => {
    const marks: { value: number; label?: string }[] = [];
    for (let i = 0; i <= max; i += clicksPerRotation) {
      if (i % clicksPerRotation === 0) {
        // Major mark for each rotation
        marks.push({ value: i, label: `${i / clicksPerRotation}` });
      } else if (i % clicksPerRotation === 0) {
        // Minor marks for each click
        marks.push({ value: i });
      }
    }
    return marks;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: "16 / 9",
        position: "relative",
      }}
    >
      {/* Slider Component */}
      <StyledSlider
        value={value}
        max={max}
        marks={generateMarks()}
        onChange={handleChange}
        valueLabelDisplay="auto"
      />
    </div>
  );
};

export default GrindSlider;
