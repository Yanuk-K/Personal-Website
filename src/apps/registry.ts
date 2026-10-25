import type { ComponentType } from "react";
import type { AppId } from "../state/fs";
import {
  CoffeeIcon,
  ContactsAppIcon,
  DolphinIcon,
  KateIcon,
  KonsoleIcon,
  SettingsAppIcon,
} from "../desktop/icons";

export type AppMeta = {
  id: AppId;
  name: string;
  genericName: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  /** Preferred initial window size */
  w: number;
  h: number;
  minW: number;
  minH: number;
  singleInstance?: boolean;
};

export const APP_REGISTRY: Record<AppId, AppMeta> = {
  dolphin: {
    id: "dolphin",
    name: "Dolphin",
    genericName: "File Manager",
    icon: DolphinIcon,
    w: 820,
    h: 540,
    minW: 560,
    minH: 340,
  },
  konsole: {
    id: "konsole",
    name: "Konsole",
    genericName: "Terminal",
    icon: KonsoleIcon,
    w: 960,
    h: 560,
    minW: 640,
    minH: 360,
  },
  kate: {
    id: "kate",
    name: "Kate",
    genericName: "Text Editor",
    icon: KateIcon,
    w: 980,
    h: 660,
    minW: 680,
    minH: 420,
    singleInstance: true,
  },
  settings: {
    id: "settings",
    name: "System Settings",
    genericName: "System Settings",
    icon: SettingsAppIcon,
    w: 860,
    h: 580,
    minW: 620,
    minH: 420,
  },
  contacts: {
    id: "contacts",
    name: "Contacts",
    genericName: "Personal Information Manager",
    icon: ContactsAppIcon,
    w: 760,
    h: 600,
    minW: 520,
    minH: 400,
  },
  coffee: {
    id: "coffee",
    name: "Coffee",
    genericName: "Brewing & Grinding",
    icon: CoffeeIcon,
    w: 920,
    h: 660,
    minW: 660,
    minH: 500,
    singleInstance: true,
  },
};

export const PINNED_APPS: AppId[] = [
  "dolphin",
  "konsole",
  "kate",
  "contacts",
  "coffee",
  "settings",
];
