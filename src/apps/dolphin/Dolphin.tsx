import { useEffect, useMemo, useState } from "react";
import {
  findFolder,
  PROJECTS,
  type FsNode,
  type Project,
} from "../../state/fs";
import type { WindowPayload } from "../../state/windows";
import { APP_REGISTRY } from "../registry";
import { useOpenApp } from "../../lib/useOpenApp";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  FileDocIcon,
  FolderIcon,
  GridIcon,
  HomeIcon,
  ListIcon,
  TrashIcon,
} from "../../desktop/icons";

type Place = { label: string; path: string[]; icon: React.ReactNode };

const PLACES: Place[] = [
  { label: "Home", path: [], icon: <HomeIcon size={15} /> },
  { label: "Desktop", path: ["Desktop"], icon: <FolderIcon size={15} /> },
  { label: "Documents", path: ["Documents"], icon: <FolderIcon size={15} /> },
  { label: "Projects", path: ["Projects"], icon: <FolderIcon size={15} /> },
  { label: "Applications", path: ["Applications"], icon: <GridIcon size={15} /> },
];

export function Dolphin({ payload }: { payload?: WindowPayload }) {
  const openApp = useOpenApp();
  const initialPath = payload?.projectId
    ? ["Projects"]
    : (payload?.path ?? []);

  const [path, setPath] = useState<string[]>(initialPath);
  const [backStack, setBackStack] = useState<string[][]>([]);
  const [fwdStack, setFwdStack] = useState<string[][]>([]);
  const [selected, setSelected] = useState<string | null>(
    payload?.projectId ?? null,
  );
  const [view, setView] = useState<"grid" | "list">("grid");
  const [openProject, setOpenProject] = useState<Project | null>(null);

  useEffect(() => {
    if (payload?.projectId) {
      const project = PROJECTS.find((p) => p.id === payload.projectId);
      if (project) setOpenProject(project);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const folder = useMemo(() => {
    const node = findFolder(path);
    return node && node.kind === "folder" ? node : null;
  }, [path]);

  const navigate = (nextPath: string[]) => {
    setBackStack((b) => [...b, path]);
    setFwdStack([]);
    setPath(nextPath);
    setSelected(null);
  };

  const goBack = () => {
    setBackStack((b) => {
      if (b.length === 0) return b;
      const prev = b[b.length - 1];
      setFwdStack((f) => [...f, path]);
      setPath(prev);
      setSelected(null);
      return b.slice(0, -1);
    });
  };

  const goForward = () => {
    setFwdStack((f) => {
      if (f.length === 0) return f;
      const next = f[f.length - 1];
      setBackStack((b) => [...b, path]);
      setPath(next);
      setSelected(null);
      return f.slice(0, -1);
    });
  };

  const activateNode = (node: FsNode) => {
    switch (node.kind) {
      case "folder":
        navigate([...path, node.name]);
        break;
      case "app":
        openApp(node.appId);
        break;
      case "doc":
        openApp("kate", {
          payload: { docId: node.docId },
          title: `${node.name} — Kate`,
        });
        break;
      case "project": {
        const project = PROJECTS.find((p) => p.id === node.projectId);
        if (project) setOpenProject(project);
        break;
      }
    }
  };

  const iconFor = (node: FsNode): React.ReactNode => {
    switch (node.kind) {
      case "folder":
        return <FolderIcon size={30} className="text-accent" />;
      case "app": {
        const IconComponent = APP_REGISTRY[node.appId].icon;
        return <IconComponent size={32} />;
      }
      default:
        return <FileDocIcon size={30} className="text-subtle" />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-line bg-chrome px-2 py-1.5">
        <ToolButton label="Back" disabled={backStack.length === 0} onClick={goBack}>
          <ChevronLeftIcon size={16} />
        </ToolButton>
        <ToolButton label="Forward" disabled={fwdStack.length === 0} onClick={goForward}>
          <ChevronRightIcon size={16} />
        </ToolButton>
        <ToolButton
          label="Up"
          disabled={path.length === 0}
          onClick={() => navigate(path.slice(0, -1))}
        >
          <ChevronUpIcon size={16} />
        </ToolButton>

        <nav aria-label="Breadcrumb" className="mx-1.5 flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden rounded-md bg-view px-2 py-1 text-[12.5px]">
          <button type="button" onClick={() => navigate([])} className="shrink-0 rounded px-1 hover:bg-hover">
            home
          </button>
          {path.map((segment, i) => (
            <span key={i} className="flex min-w-0 items-center">
              <span className="px-0.5 text-subtle">/</span>
              <button
                type="button"
                onClick={() => navigate(path.slice(0, i + 1))}
                className="truncate rounded px-1 font-semibold hover:bg-hover"
              >
                {segment}
              </button>
            </span>
          ))}
        </nav>

        <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="View mode">
          <button
            type="button"
            aria-label="Icon view"
            onClick={() => setView("grid")}
            className={`flex h-7 w-7 items-center justify-center ${view === "grid" ? "bg-accent text-accent-fg" : "hover:bg-hover"}`}
          >
            <GridIcon size={14} />
          </button>
          <button
            type="button"
            aria-label="Compact list view"
            onClick={() => setView("list")}
            className={`flex h-7 w-7 items-center justify-center ${view === "list" ? "bg-accent text-accent-fg" : "hover:bg-hover"}`}
          >
            <ListIcon size={14} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Places sidebar */}
        <aside className="breeze-scroll w-[150px] shrink-0 overflow-y-auto border-r border-line bg-chrome/50 p-1.5">
          <p className="px-2 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-subtle">
            Places
          </p>
          {PLACES.map((place) => (
            <button
              key={place.label}
              type="button"
              onClick={() => navigate(place.path)}
              className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] ${
                path.join("/") === place.path.join("/")
                  ? "bg-accent/15 font-semibold text-text"
                  : "text-text hover:bg-hover"
              }`}
            >
              <span className="text-accent">{place.icon}</span>
              <span className="truncate">{place.label}</span>
            </button>
          ))}
          <div className="my-1 h-px bg-line" />
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-subtle">
            <TrashIcon size={15} />
            Trash (empty)
          </div>
        </aside>

        {/* Content */}
        <div
          className="breeze-scroll min-w-0 flex-1 overflow-y-auto p-3"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          {!folder ? (
            <p className="p-6 text-center text-[13px] text-subtle">Folder not found.</p>
          ) : folder.children.length === 0 ? (
            <p className="p-6 text-center text-[13px] text-subtle">This folder is empty.</p>
          ) : view === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1">
              {folder.children.map((node) => (
                <ItemTile
                  key={node.name}
                  node={node}
                  selected={selected === node.name}
                  onSelect={() => setSelected(node.name)}
                  onActivate={() => activateNode(node)}
                >
                  {iconFor(node)}
                </ItemTile>
              ))}
            </div>
          ) : (
            <ul className="overflow-hidden rounded-md border border-line">
              {folder.children.map((node, i) => (
                <li key={node.name}>
                  <button
                    type="button"
                    onClick={() => setSelected(node.name)}
                    onDoubleClick={() => activateNode(node)}
                    className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[12.5px] ${
                      selected === node.name
                        ? "bg-accent text-accent-fg"
                        : i % 2 === 0
                          ? "bg-view hover:bg-hover"
                          : "bg-chrome/40 hover:bg-hover"
                    }`}
                  >
                    <span className={selected === node.name ? "" : "text-accent"}>
                      {iconFor(node)}
                    </span>
                    <span className="truncate">{node.name}</span>
                    <span className={`ml-auto shrink-0 text-[11px] ${selected === node.name ? "text-accent-fg/80" : "text-subtle"}`}>
                      {itemMeta(node, path)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-line bg-chrome px-3 py-1 text-[11.5px] text-subtle">
        <span>{folder ? `${folder.children.length} items` : "—"}</span>
        <span>Personal portfolio workspace</span>
      </div>

      {/* Project properties dialog */}
      {openProject && (
        <ProjectDialog project={openProject} onClose={() => setOpenProject(null)} />
      )}
    </div>
  );
}

function itemMeta(node: FsNode, path: string[]): string {
  if (node.kind === "folder") {
    const child = findFolder([...path, node.name]);
    return child && child.kind === "folder"
      ? `${child.children.length} items`
      : "0 items";
  }
  if (node.kind === "project") return "project";
  if (node.kind === "app") return "application";
  return "document";
}

function ItemTile({
  node,
  selected,
  onSelect,
  onActivate,
  children,
}: {
  node: FsNode;
  selected: boolean;
  onSelect: () => void;
  onActivate: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter") onActivate();
      }}
      className={`flex flex-col items-center gap-1.5 rounded-lg p-2 ${
        selected ? "bg-accent/20 outline outline-1 outline-accent" : "hover:bg-hover"
      }`}
    >
      <span className="flex h-9 items-center justify-center">{children}</span>
      <span className="w-full truncate text-center text-[11.5px] leading-tight">
        {node.kind === "app" ? `${node.name}.desktop` : node.name}
      </span>
    </button>
  );
}

function ProjectDialog({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 p-6"
      role="dialog"
      aria-label={`${project.name} details`}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="anim-popup-in w-full max-w-[420px] rounded-window border border-line bg-window shadow-popup">
        <header className="flex h-9 items-center justify-between border-b border-line bg-chrome px-3">
          <p className="truncate text-[12.5px] font-semibold">{project.name}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded px-1.5 py-0.5 text-[13px] text-subtle hover:bg-negative hover:text-white"
          >
            ✕
          </button>
        </header>
        <div className="p-4">
          <p className="text-[13px] leading-relaxed text-text">{project.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {project.liveLink && (
              <a
                href={project.liveLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-[12.5px] font-semibold text-accent-fg hover:bg-accent-strong"
              >
                Visit <ExternalLinkIcon size={13} />
              </a>
            )}
            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-center gap-1.5 rounded-md border border-line px-3 py-2 text-[12.5px] font-semibold hover:bg-hover ${project.liveLink ? "" : "col-span-2"}`}
            >
              GitHub <ExternalLinkIcon size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-text disabled:opacity-35 enabled:hover:bg-hover"
    >
      {children}
    </button>
  );
}
