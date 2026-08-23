import auroraWallpaper from "../assets/aurora-over-earth.webp";
import tunkaWallpaper from "../assets/tunka-valley.webp";
import utahWallpaper from "../assets/utah-range.webp";
import kubuntuWallpaper from "../assets/kubuntu-wallpaper.webp";

export type Wallpaper = {
  id: string;
  name: string;
  /** Full CSS `background` shorthand */
  css: string;
};

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "aurora",
    name: "Aurora Over Earth",
    css: [
      "linear-gradient(rgba(3, 8, 16, 0.12), rgba(3, 8, 16, 0.28))",
      `url(${auroraWallpaper}) center / cover no-repeat`,
    ].join(", "),
  },
  {
    id: "tunka",
    name: "Tunka Valley",
    css: [
      "linear-gradient(rgba(8, 16, 24, 0.14), rgba(8, 16, 24, 0.26))",
      `url(${tunkaWallpaper}) center / cover no-repeat`,
    ].join(", "),
  },
  {
    id: "utah",
    name: "Crater Island, Utah",
    css: [
      "linear-gradient(rgba(8, 16, 24, 0.14), rgba(8, 16, 24, 0.28))",
      `url(${utahWallpaper}) center / cover no-repeat`,
    ].join(", "),
  },
  {
    id: "breeze",
    name: "Snow Ridge",
    css: [
      "linear-gradient(rgba(8, 16, 24, 0.2), rgba(8, 16, 24, 0.34))",
      `url(${kubuntuWallpaper}) center 42% / cover no-repeat`,
    ].join(", "),
  },
  {
    id: "twilight",
    name: "Twilight Ridge",
    css: [
      "radial-gradient(1000px 540px at 82% 12%, rgba(61,174,233,0.35), transparent 62%)",
      "radial-gradient(760px 520px at 12% 96%, rgba(155,89,182,0.4), transparent 58%)",
      "linear-gradient(165deg, #17122b 0%, #2c2350 42%, #45307a 74%, #6a3fa0 100%)",
    ].join(", "),
  },
  {
    id: "ember",
    name: "Ember Coast",
    css: [
      "radial-gradient(900px 500px at 80% 8%, rgba(253,188,75,0.42), transparent 60%)",
      "radial-gradient(820px 560px at 8% 100%, rgba(218,68,83,0.35), transparent 55%)",
      "linear-gradient(160deg, #2a1533 0%, #59223d 40%, #a34431 72%, #e2711d 100%)",
    ].join(", "),
  },
  {
    id: "verdant",
    name: "Verdant",
    css: [
      "radial-gradient(950px 540px at 84% 6%, rgba(28,220,154,0.30), transparent 60%)",
      "radial-gradient(760px 500px at 6% 98%, rgba(39,174,96,0.34), transparent 56%)",
      "linear-gradient(162deg, #0c2621 0%, #14453a 44%, #1f6f52 76%, #2aa198 100%)",
    ].join(", "),
  },
  {
    id: "graphite",
    name: "Graphite",
    css: [
      "radial-gradient(1100px 600px at 50% -18%, rgba(97,111,122,0.55), transparent 64%)",
      "radial-gradient(800px 480px at 90% 110%, rgba(49,54,59,0.9), transparent 60%)",
      "linear-gradient(170deg, #23282d 0%, #2d333a 52%, #3a424b 100%)",
    ].join(", "),
  },
  {
    id: "daylight",
    name: "Daylight",
    css: [
      "radial-gradient(1000px 560px at 76% 4%, rgba(255,255,255,0.85), transparent 58%)",
      "radial-gradient(720px 460px at 4% 102%, rgba(61,174,233,0.35), transparent 55%)",
      "linear-gradient(160deg, #bcd9ec 0%, #93c4e4 46%, #6fb0dc 100%)",
    ].join(", "),
  },
];

export const DEFAULT_WALLPAPER_ID = "utah";
