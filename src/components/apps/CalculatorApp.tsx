import { useState } from "react";

const buttons = [
  "7",
  "8",
  "9",
  "/",
  "4",
  "5",
  "6",
  "*",
  "1",
  "2",
  "3",
  "-",
  "0",
  ".",
  "=",
  "+",
];

export function CalculatorApp() {
  const [display, setDisplay] = useState("0");

  return (
    <div className="app-pane calculator-app">
      <div className="calculator-display">{display}</div>
      <div className="calculator-grid">
        <button onClick={() => setDisplay("0")} type="button">
          C
        </button>
        {buttons.map((button) => (
          <button
            key={button}
            onClick={() => {
              if (button === "=") {
                try {
                  const result = Function(`"use strict"; return (${display});`)();
                  setDisplay(String(result));
                } catch {
                  setDisplay("Error");
                }
                return;
              }
              setDisplay((current) => (current === "0" ? button : `${current}${button}`));
            }}
            type="button"
          >
            {button}
          </button>
        ))}
      </div>
    </div>
  );
}
