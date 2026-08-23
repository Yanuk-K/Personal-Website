import type { CSSProperties } from "react";
import dolphinAsset from "../assets/papirus/dolphin.svg";
import konsoleAsset from "../assets/papirus/konsole.svg";
import kateAsset from "../assets/papirus/kate.svg";
import settingsAsset from "../assets/papirus/settings.svg";
import contactsAsset from "../assets/papirus/contacts.svg";
import kubuntuLauncherAsset from "../assets/papirus/kubuntu-launcher.svg";
import folderAsset from "../assets/papirus/folder.svg";
import textDocumentAsset from "../assets/papirus/text-document.svg";

type IconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
};

/* ------------------------------------------------------------------ */
/* App tile icons (colorful, Breeze-flavoured)                         */
/* ------------------------------------------------------------------ */

export function KickoffIcon({ size = 32, className }: IconProps) {
  return <AppIcon asset={kubuntuLauncherAsset} size={size} className={className} />;
}

export function DolphinIcon({ size = 32, className }: IconProps) {
  return <AppIcon asset={dolphinAsset} size={size} className={className} />;
}

export function KonsoleIcon({ size = 32, className }: IconProps) {
  return <AppIcon asset={konsoleAsset} size={size} className={className} />;
}

export function KateIcon({ size = 32, className }: IconProps) {
  return <AppIcon asset={kateAsset} size={size} className={className} />;
}

export function SettingsAppIcon({ size = 32, className }: IconProps) {
  return <AppIcon asset={settingsAsset} size={size} className={className} />;
}

export function GrinderCalcIcon({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="grinder-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8d6748" />
          <stop offset="1" stopColor="#5d4130" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="11" fill="#efe3d3" />
      <path d="M17 9h14l-2.4 7H19.4Z" fill="#3b2b20" />
      <rect x="15" y="16" width="18" height="18" rx="3" fill="url(#grinder-body)" />
      <rect x="18.5" y="20" width="11" height="6.5" rx="1.6" fill="#d8c7ae" />
      <path d="M33 12.5a7.5 7.5 0 0 1 6 7.3" fill="none" stroke="#3b2b20" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="39.5" cy="20.5" r="2.6" fill="#3b2b20" />
      <path d="M19 37h10" stroke="#3b2b20" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function ContactsAppIcon({ size = 32, className }: IconProps) {
  return <AppIcon asset={contactsAsset} size={size} className={className} />;
}

function AppIcon({ asset, size, className }: { asset: string; size: number; className?: string }) {
  return <img src={asset} width={size} height={size} className={className} draggable={false} alt="" aria-hidden />;
}

/* ------------------------------------------------------------------ */
/* Monochrome UI glyphs (currentColor)                                 */
/* ------------------------------------------------------------------ */

function base(size: number | undefined, className: string | undefined) {
  return {
    width: size ?? 16,
    height: size ?? 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export const WifiIcon = ({ size, className, style }: IconProps) => (
  <svg {...base(size, className)} style={style}>
    <path d="M2.5 9.5a15 15 0 0 1 19 0" />
    <path d="M5.5 12.8a10.5 10.5 0 0 1 13 0" />
    <path d="M8.6 16a6 6 0 0 1 6.8 0" />
    <circle cx="12" cy="19" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);

export const VolumeIcon = ({ size, className, style }: IconProps) => (
  <svg {...base(size, className)} style={style}>
    <path d="M4 9.5v5h3.2L12 18.6V5.4L7.2 9.5Z" fill="currentColor" strokeLinejoin="round" />
    <path d="M15.5 9.2a4.2 4.2 0 0 1 0 5.6" />
    <path d="M18 6.8a7.6 7.6 0 0 1 0 10.4" />
  </svg>
);

export const BatteryIcon = ({
  size,
  className,
  level = 0.82,
}: IconProps & { level?: number }) => (
  <svg {...base(size, className)}>
    <rect x="2.5" y="8" width="16" height="8.5" rx="2" />
    <path d="M21 11v2.6" />
    <rect
      x="4.3"
      y="9.8"
      width={Math.max(1.4, 12.4 * Math.min(1, Math.max(0, level)))}
      height="4.9"
      rx="1"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const SearchIcon = ({ size, className, style }: IconProps) => (
  <svg {...base(size, className)} style={style}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <path d="m15.6 15.6 4.4 4.4" />
  </svg>
);

export const CloseXIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={1.7}>
    <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
  </svg>
);

export const MinimizeDashIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={1.7}>
    <path d="M6.5 12h11" />
  </svg>
);

export const MaximizeSquareIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={1.7}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="1.6" />
  </svg>
);

export const RestoreSquaresIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={1.7}>
    <rect x="5" y="8.5" width="10.5" height="10.5" rx="1.6" />
    <path d="M8.8 5.6h8.1a1.6 1.6 0 0 1 1.6 1.6v8.1" />
  </svg>
);

export const ChevronLeftIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
  </svg>
);

export const ChevronRightIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
  </svg>
);

export const ChevronUpIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="m5.5 14.5 6.5-6.5 6.5 6.5" />
  </svg>
);

export const HomeIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="m3.5 11 8.5-7 8.5 7" />
    <path d="M5.5 9.6V19a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V9.6" />
  </svg>
);

export const FolderIcon = ({ size, className }: IconProps) => (
  <AppIcon asset={folderAsset} size={size ?? 16} className={className} />
);

export const FileDocIcon = ({ size, className }: IconProps) => (
  <AppIcon asset={textDocumentAsset} size={size ?? 16} className={className} />
);

export const GridIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="4.5" y="4.5" width="6" height="6" rx="1.2" />
    <rect x="13.5" y="4.5" width="6" height="6" rx="1.2" />
    <rect x="4.5" y="13.5" width="6" height="6" rx="1.2" />
    <rect x="13.5" y="13.5" width="6" height="6" rx="1.2" />
  </svg>
);

export const ListIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="5" cy="6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="5" cy="18" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const PlusIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const TrashIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M4.5 6.5h15" />
    <path d="M8 6.5V5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 5v1.5" />
    <path d="M6.5 6.5 7.4 19a1.8 1.8 0 0 0 1.8 1.7h5.6A1.8 1.8 0 0 0 16.6 19l.9-12.5" />
    <path d="M10 10.5v6M14 10.5v6" />
  </svg>
);

export const PowerIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 3.5v7" />
    <path d="M7 6.2a8 8 0 1 0 10 0" />
  </svg>
);

export const ExternalLinkIcon = ({ size, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M13.5 5.5H19V11" />
    <path d="M19 5.5 11 13.5" />
    <path d="M17 13.5v4a1.8 1.8 0 0 1-1.8 1.8H6.5A1.8 1.8 0 0 1 4.7 17.5V8.8A1.8 1.8 0 0 1 6.5 7h4" />
  </svg>
);

export const BrightnessIcon = ({ size, className, style }: IconProps) => (
  <svg {...base(size, className)} style={style}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
  </svg>
);

export const MoonIcon = ({ size, className, style }: IconProps) => (
  <svg {...base(size, className)} style={style}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
  </svg>
);
