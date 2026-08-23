import type { WinState } from "../state/windows";
import { Dolphin } from "./dolphin/Dolphin";
import { Konsole } from "./konsole/Konsole";
import { Kate } from "./kate/Kate";
import { Settings } from "./settings/Settings";
import { GrinderCalcApp } from "./grindercalc/GrinderCalcApp";
import { Contacts } from "./contacts/Contacts";

export function AppContent({ win }: { win: WinState }) {
  switch (win.appId) {
    case "dolphin":
      return <Dolphin payload={win.payload} />;
    case "konsole":
      return <Konsole win={win} />;
    case "kate":
      return <Kate win={win} />;
    case "settings":
      return <Settings />;
    case "grindercalc":
      return <GrinderCalcApp />;
    case "contacts":
      return <Contacts />;
  }
}
