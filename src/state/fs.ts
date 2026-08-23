import { DOC_TITLES, PORTFOLIO_DOCUMENTS, PROJECTS, type DocId, type Project } from "../content/portfolio";

export { DOC_TITLES, PROJECTS, type DocId, type Project };

export type AppId =
  | "dolphin"
  | "konsole"
  | "kate"
  | "settings"
  | "grindercalc"
  | "contacts";

export const APP_IDS: AppId[] = [
  "dolphin",
  "konsole",
  "kate",
  "settings",
  "grindercalc",
  "contacts",
];

export function isAppId(value: string | undefined): value is AppId {
  return !!value && (APP_IDS as string[]).includes(value);
}

/* ------------------------------------------------------------------ */
/* Virtual filesystem                                                  */
/* ------------------------------------------------------------------ */

export type FsNode =
  | { kind: "folder"; name: string; children: FsNode[] }
  | { kind: "doc"; name: string; docId: DocId }
  | { kind: "app"; name: string; appId: AppId }
  | { kind: "project"; name: string; projectId: string };

const appNode = (appId: AppId, name?: string): FsNode => ({
  kind: "app",
  name: name ?? appId,
  appId,
});

export const HOME_FS: FsNode = {
  kind: "folder",
  name: "home",
  children: [
    {
      kind: "folder",
      name: "Desktop",
      children: [
        { kind: "doc", name: "About Me.md", docId: "about" },
        { kind: "doc", name: "Resume", docId: "resume" },
      ],
    },
    {
      kind: "folder",
      name: "Documents",
      children: PORTFOLIO_DOCUMENTS.map((doc): FsNode => ({ kind: "doc", name: doc.title, docId: doc.id })),
    },
    {
      kind: "folder",
      name: "Applications",
      children: [
        appNode("dolphin", "Dolphin"),
        appNode("konsole", "Konsole"),
        appNode("kate", "Kate"),
        appNode("contacts", "Contacts"),
        appNode("grindercalc", "Grinder Calculator"),
        appNode("settings", "System Settings"),
      ],
    },
  ],
};

export function findFolder(path: string[]): FsNode | null {
  let node: FsNode = HOME_FS;
  for (const segment of path) {
    if (node.kind !== "folder") return null;
    const next = node.children.find(
      (child) => child.kind === "folder" && child.name === segment,
    );
    if (!next) return null;
    node = next;
  }
  return node;
}
