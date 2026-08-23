export type AccentColor = {
  id: string;
  name: string;
  /** Primary accent */
  color: string;
  /** Darker shade used on hover / pressed */
  strong: string;
};

export const ACCENTS: AccentColor[] = [
  { id: "breeze-blue", name: "Breeze Blue", color: "#3daee9", strong: "#2e9ad4" },
  { id: "crimson", name: "Crimson", color: "#da4453", strong: "#c0392b" },
  { id: "orange", name: "Orange", color: "#f67400", strong: "#d96400" },
  { id: "goldenrod", name: "Goldenrod", color: "#fdbc4b", strong: "#e8a72e" },
  { id: "green", name: "Green", color: "#27ae60", strong: "#1f9152" },
  { id: "violet", name: "Violet", color: "#9b59b6", strong: "#83499c" },
  { id: "turquoise", name: "Turquoise", color: "#1abc9c", strong: "#16a085" },
  { id: "grey", name: "Grey", color: "#7f8c8d", strong: "#687374" },
];

export const DEFAULT_ACCENT_ID = "breeze-blue";
