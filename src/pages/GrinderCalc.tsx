import * as React from "react";
import { useEffect, useState } from "react";
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

function GrinderCalc() {
  var GRINDERS: {
    name: string;
    micronPerClick: number;
    clicksPerRotation: number;
  }[] = [
    {
      name: "1zpresso K-Ultra",
      micronPerClick: 20,
      clicksPerRotation: 10,
    },
    {
      name: "1zpresso J-Ultra",
      micronPerClick: 8,
      clicksPerRotation: 100,
    },
    {
      name: "C40",
      micronPerClick: 30,
      clicksPerRotation: 12,
    },
  ];

  // State to store the current micron level
  const [micronValue, setMicronValue] = useState(0);

  // Handler for when a slider changes, updates the micron value
  const onSliderChange = (index: number, newClickValue: number) => {
    const selectedGrinder = GRINDERS[index];
    const newMicronValue = newClickValue * selectedGrinder.micronPerClick;
    setMicronValue(newMicronValue);
  };

  // Handler for text input change
  const onMicronValueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMicronValue = parseInt(e.target.value, 10) || 0; // Parse input to integer, default to 0 if NaN
    setMicronValue(newMicronValue);
  };

  const elements = GRINDERS.map((grinder, id) => (
    <div>
      <p className="text-xl font-bold">{grinder.name}</p>
      <GrindSlider
        max={1300 / grinder.micronPerClick}
        clicksPerRotation={grinder.clicksPerRotation}
        currentValue={Math.round(micronValue / grinder.micronPerClick)} // Use exact micron value / micronPerClick for each slider
        onChange={(clickValue) => onSliderChange(id, clickValue)} // Pass handler
        key={id}
      />
      <div>
        <input
          id="micronValue"
          type="number"
          value={micronValue}
          onChange={onMicronValueInputChange}
          className="border p-2 rounded w-20 text-center"
        />
        {" microns"}
      </div>
    </div>
  ));

  const [items, setItems] = React.useState([0, 1, 2]);

  return (
    <>
      <div className="min-h-[87dvh] flex flex-col justify-between">
        <div className="w-[75dvw] w800:w-[95dvw] m-auto p-8">
          <List
            lockVertically
            values={items}
            onChange={({ oldIndex, newIndex }) =>
              setItems(arrayMove(items, oldIndex, newIndex))
            }
            renderList={({ children, props, isDragged }) => (
              <ul
                {...props}
                style={{
                  padding: 0,
                  cursor: isDragged ? "grabbing" : undefined,
                }}
              >
                {children}
              </ul>
            )}
            renderItem={({ value, props, isDragged, isSelected }) => (
              <li
                {...props}
                key={props.key}
                style={{
                  ...props.style,
                  padding: "0 0 0 1.5em",
                  margin: "0.5em 0em",
                  listStyleType: "none",
                  cursor: isDragged ? "grabbing" : "grab",
                  border: "2px solid #CCC",
                  boxShadow: "3px 3px #AAA",
                  color: "#333",
                  borderRadius: "5px",
                  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                  backgroundColor: isDragged || isSelected ? "#EEE" : "#FFF",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <button
                    data-movable-handle
                    style={{
                      ...buttonStyles,
                      cursor: isDragged ? "grabbing" : "grab",
                      marginRight: "3em",
                    }}
                    tabIndex={-1}
                  >
                    <HandleIcon />
                  </button>
                  <div className="w-[70%]">{elements[value]}</div>
                </div>
              </li>
            )}
          />
        </div>
      </div>
    </>
  );
}

export default GrinderCalc;
