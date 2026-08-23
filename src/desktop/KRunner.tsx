import { useEffect, useMemo, useRef, useState } from "react";
import { PROJECTS } from "../state/fs";
import { APP_REGISTRY } from "../apps/registry";
import { CONTACTS, RESUME_EDIT_URL } from "../content/portfolio";
import type { AppId } from "../state/fs";
import { useOpenApp } from "../lib/useOpenApp";
import { SearchIcon } from "./icons";
import { useWindows, type WindowPayload } from "../state/windows";

type Result =
  | { kind: "app"; appId: AppId; title: string; subtitle: string }
  | { kind: "project"; projectId: string; title: string; subtitle: string }
  | {
      kind: "link";
      title: string;
      subtitle: string;
      url: string;
    };

export function KRunner({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const openApp = useOpenApp();
  const { findByApp } = useWindows();

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const list: Result[] = [];

    for (const id of Object.keys(APP_REGISTRY) as AppId[]) {
      const meta = APP_REGISTRY[id];
      if (`${meta.name} ${meta.genericName}`.toLowerCase().includes(q)) {
        list.push({
          kind: "app",
          appId: id,
          title: meta.name,
          subtitle: `Application · ${meta.genericName}`,
        });
      }
    }

    for (const project of PROJECTS) {
      if (`${project.name} ${project.description}`.toLowerCase().includes(q)) {
        list.push({
          kind: "project",
          projectId: project.id,
          title: project.name,
          subtitle: "Project",
        });
      }
    }

    if ("github".includes(q) || "git hub yeunwook yanuk".includes(q)) {
      list.push({
        kind: "link",
        title: "GitHub — Yanuk-K",
        subtitle: "Open in browser",
        url: CONTACTS.find((contact) => contact.id === "github")?.href ?? "https://github.com/Yanuk-K",
      });
    }
    if ("x twitter 0xstoj @0xstoj".includes(q)) {
      list.push({
        kind: "link",
        title: "X — @0xstoj",
        subtitle: "Open in browser",
        url: CONTACTS.find((contact) => contact.id === "x")?.href ?? "https://x.com/0xstoj",
      });
    }
    if ("resume cv".includes(q)) {
      list.push({
        kind: "link",
        title: "Resume",
        subtitle: "Open document",
        url: RESUME_EDIT_URL,
      });
    }
    if ("email mail contact".includes(q)) {
      list.push({
        kind: "link",
        title: "Email Yeunwook",
        subtitle: "Compose mail",
        url: CONTACTS.find((contact) => contact.id === "email")?.href ?? "mailto:yeunwookk@gmail.com",
      });
    }
    return list.slice(0, 8);
  }, [query]);

  useEffect(() => setSelected(0), [results.length, query]);

  if (!open) return null;

  const run = (result: Result | undefined) => {
    if (!result) return;
    onClose();
    if (result.kind === "app") {
      openApp(result.appId);
    } else if (result.kind === "project") {
      openApp("dolphin", {
        payload: { projectId: result.projectId },
        title: PROJECTS.find((p) => p.id === result.projectId)?.name,
      });
    } else {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      run(results[selected]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const existingHint = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const match = (Object.keys(APP_REGISTRY) as AppId[]).find(
      (id) =>
        APP_REGISTRY[id].name.toLowerCase().includes(q) &&
        findByApp(id),
    );
    return match ? APP_REGISTRY[match].name : null;
  })();

  return (
    <div
      className="fixed inset-x-0 top-[16%] z-[8500] flex justify-center px-4"
      role="dialog"
      aria-label="Run command"
    >
      <div className="anim-runner-in w-full max-w-[560px] overflow-hidden rounded-window border border-line bg-window text-text shadow-popup backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <span className="text-subtle">
            <SearchIcon size={18} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search applications, projects and links…"
            aria-label="Search"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
          />
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-[10.5px] text-subtle sm:block">
            Esc
          </kbd>
        </div>

        <ul
          className="breeze-scroll max-h-[320px] overflow-y-auto p-1.5"
          role="listbox"
          aria-label="Search results"
        >
          {query.trim() === "" && (
            <>
              <li className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
                Try searching for…
              </li>
              {["Konsole", "Projects", "Grinder Calculator", "GitHub"].map(
                (hint) => (
                  <li key={hint} className="rounded-md px-3 py-2 text-[13px] text-subtle">
                    {hint}
                  </li>
                ),
              )}
            </>
          )}
          {results.map((result, i) => (
            <li key={`${result.kind}-${result.title}-${i}`} role="option" aria-selected={i === selected}>
              <button
                type="button"
                onMouseEnter={() => setSelected(i)}
                onClick={() => run(result)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${
                  i === selected ? "bg-accent text-accent-fg" : ""
                }`}
              >
                <span className={`text-[13.5px] font-semibold ${i === selected ? "" : "text-text"}`}>
                  {result.title}
                </span>
                <span
                  className={`ml-auto truncate text-[12px] ${
                    i === selected ? "text-accent-fg/80" : "text-subtle"
                  }`}
                >
                  {result.subtitle}
                </span>
              </button>
            </li>
          ))}
          {query.trim() !== "" && results.length === 0 && (
            <li className="px-3 py-5 text-center text-[13px] text-subtle">
              No matches{existingHint ? ` — but ${existingHint} is already running` : ""}.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/** Payload helper re-exported so callers stay typed without deep imports. */
export type RunnerPayload = WindowPayload;
