import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  DOC_TITLES,
  PORTFOLIO_DOCUMENTS,
  RESUME_EDIT_URL,
  RESUME_EMBED_URL,
  type DocId,
} from "../../content/portfolio";
import type { WinState } from "../../state/windows";
import { useWindows } from "../../state/windows";

const SESSION_KEY = "kate-notebook-v2";
const LEGACY_SCRATCH_KEY = "kate-scratchpad-v1";

type Mode = "preview" | "source" | "split";
type StoredSession = {
  openDocs: DocId[];
  active: DocId;
  notes: Record<string, string>;
  sidebarOpen: boolean;
  mode: Mode;
};

const defaultScratch = PORTFOLIO_DOCUMENTS.find((doc) => doc.id === "scratch")?.content ?? "# Scratchpad\n";

function loadSession(): StoredSession {
  const mobile = typeof window !== "undefined" && window.innerWidth <= 767;
  const fallback: StoredSession = { openDocs: ["start"], active: "start", notes: { scratch: defaultScratch }, sidebarOpen: !mobile, mode: "preview" };
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Partial<StoredSession> | null;
    if (parsed?.openDocs?.length && parsed.active && parsed.notes) {
      return { ...fallback, ...parsed, openDocs: parsed.openDocs, notes: parsed.notes, sidebarOpen: mobile ? false : parsed.sidebarOpen ?? fallback.sidebarOpen };
    }
    const legacyScratch = localStorage.getItem(LEGACY_SCRATCH_KEY);
    if (legacyScratch) return { ...fallback, notes: { scratch: legacyScratch } };
  } catch {
    // Storage is optional; Kate still works for the current session.
  }
  return fallback;
}

function isUserNote(id: DocId) {
  return id.startsWith("note:");
}

function fileTitle(id: DocId) {
  if (isUserNote(id)) return `${id.slice(5)}.md`;
  return DOC_TITLES[id as keyof typeof DOC_TITLES];
}

export function Kate({ win }: { win: WinState }) {
  const initial = useRef(loadSession()).current;
  const { setTitle } = useWindows();
  const [openDocs, setOpenDocs] = useState<DocId[]>(initial.openDocs);
  const [active, setActive] = useState<DocId>(initial.active);
  const [notes, setNotes] = useState<Record<string, string>>(initial.notes);
  const [sidebarOpen, setSidebarOpen] = useState(initial.sidebarOpen);
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [filter, setFilter] = useState("");
  const [find, setFind] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [newNoteName, setNewNoteName] = useState("");
  const [showNewNote, setShowNewNote] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [savedState, setSavedState] = useState("Saved");
  const sourceRef = useRef<HTMLTextAreaElement>(null);

  const allDocs = [...PORTFOLIO_DOCUMENTS, ...Object.keys(notes).filter((id) => id.startsWith("note:")).map((id) => ({ id: id as DocId, title: fileTitle(id as DocId), group: "Personal Notes" as const, kind: "editable" as const }))];
  const current = allDocs.find((doc) => doc.id === active) ?? PORTFOLIO_DOCUMENTS[0];
  const editable = current.kind === "editable";
  const content = editable ? notes[active] ?? "" : current.content ?? "";
  const matchCount = find.trim() ? content.toLowerCase().split(find.trim().toLowerCase()).length - 1 : 0;

  const openDocument = useCallback((id: DocId) => {
    setOpenDocs((docs) => (docs.includes(id) ? docs : [...docs, id]));
    setActive(id);
    setShowQuickOpen(false);
    setMenu(null);
  }, []);

  useEffect(() => {
    if (win.payload?.docId) openDocument(win.payload.docId);
  }, [openDocument, win.payload?.docId]);

  useEffect(() => {
    setTitle(win.id, `${fileTitle(active)} - Kate`);
  }, [active, setTitle, win.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ openDocs, active, notes, sidebarOpen, mode }));
        if (editable) setSavedState("Autosaved");
      } catch {
        setSavedState("Storage unavailable");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [active, editable, mode, notes, openDocs, sidebarOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;
      const key = event.key.toLowerCase();
      if (key === "p") { event.preventDefault(); setShowQuickOpen(true); }
      if (key === "f") { event.preventDefault(); setShowFind(true); }
      if (key === "b") { event.preventDefault(); setSidebarOpen((value) => !value); }
      if (key === "s" && editable) { event.preventDefault(); setSavedState("Saved"); }
      if (key === "n") { event.preventDefault(); setShowNewNote(true); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editable]);

  const updateNote = (value: string) => {
    setNotes((currentNotes) => ({ ...currentNotes, [active]: value }));
    setSavedState("Modified");
  };

  const closeDocument = (id: DocId) => {
    setOpenDocs((docs) => {
      if (docs.length === 1) return docs;
      const next = docs.filter((doc) => doc !== id);
      if (active === id) setActive(next[Math.max(0, docs.indexOf(id) - 1)]);
      return next;
    });
  };

  const createNote = () => {
    const name = newNoteName.trim().replace(/\.md$/i, "");
    if (!name) return;
    const id = `note:${name.replace(/[^a-z0-9-_ ]/gi, "").trim() || "Untitled"}` as DocId;
    setNotes((currentNotes) => ({ ...currentNotes, [id]: currentNotes[id] ?? `# ${name}\n\n` }));
    setNewNoteName("");
    setShowNewNote(false);
    openDocument(id);
  };

  const filteredDocs = allDocs.filter((doc) => doc.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="relative flex h-full min-h-0 flex-col select-text bg-view text-text" onPointerDown={() => setMenu(null)}>
      <KateMenuBar menu={menu} setMenu={setMenu} onNewNote={() => setShowNewNote(true)} onSave={() => setSavedState("Saved")} onFind={() => setShowFind(true)} onQuickOpen={() => setShowQuickOpen(true)} onSidebar={() => setSidebarOpen((value) => !value)} editable={editable} />
      <div className="flex shrink-0 items-center gap-1 border-y border-line bg-chrome px-2 py-1">
        <ToolButton label={sidebarOpen ? "Close sidebar" : "Open sidebar"} onClick={() => setSidebarOpen((value) => !value)}>{sidebarOpen ? "Close sidebar" : "Open sidebar"}</ToolButton>
        <ToolButton label="New personal note" onClick={() => setShowNewNote(true)}>New</ToolButton>
        <ToolButton label="Save" disabled={!editable} onClick={() => setSavedState("Saved")}>Save</ToolButton>
        <span className="mx-1 h-5 w-px bg-line" />
        <ToolButton label="Find" onClick={() => setShowFind(true)}>Find</ToolButton>
        <ToolButton label="Quick open" onClick={() => setShowQuickOpen(true)}>Open</ToolButton>
        <span className="ml-auto flex overflow-hidden rounded border border-line text-[11px]">
          {(["preview", "source", "split"] as Mode[]).map((item) => <button key={item} type="button" onClick={() => setMode(item)} disabled={current.kind === "resume"} className={`px-2 py-1 capitalize ${mode === item ? "bg-accent text-accent-fg" : "hover:bg-hover disabled:opacity-40"}`}>{item === "source" ? "Edit" : item}</button>)}
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        {sidebarOpen && <KateSidebar filter={filter} setFilter={setFilter} docs={filteredDocs} active={active} openDocument={openDocument} showNewNote={() => setShowNewNote(true)} onClose={() => setSidebarOpen(false)} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-end gap-1 overflow-x-auto border-b border-line bg-chrome px-2 pt-1">
            {openDocs.map((doc) => <div key={doc} className={`flex shrink-0 items-center gap-1 rounded-t border border-b-0 px-2 py-1 text-[11.5px] ${active === doc ? "-mb-px border-line bg-view font-medium" : "border-transparent text-subtle hover:bg-hover"}`}><button type="button" onClick={() => openDocument(doc)}>{fileTitle(doc)}</button>{openDocs.length > 1 && <button type="button" onClick={() => closeDocument(doc)} aria-label={`Close ${fileTitle(doc)}`} className="rounded px-1 hover:bg-hover">x</button>}</div>)}
          </div>
          <div className="breeze-scroll min-h-0 flex-1 overflow-auto">
            {current.kind === "resume" ? <ResumeDocument /> : <DocumentWorkspace mode={mode} editable={editable} content={content} onChange={updateNote} sourceRef={sourceRef} />}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 border-t border-line bg-chrome px-3 py-1 text-[10.5px] text-subtle"><span>{fileTitle(active)}</span><span>{editable ? savedState : "Read Only"}</span><span>{current.kind === "resume" ? "Embedded document" : "Markdown"}</span><span className="ml-auto">UTF-8 | LF {editable ? `| Ln ${(content.slice(0, sourceRef.current?.selectionStart ?? 0).match(/\n/g)?.length ?? 0) + 1}` : ""}</span></div>
      {showFind && <FindBar value={find} onChange={setFind} count={matchCount} onClose={() => setShowFind(false)} />}
      {showQuickOpen && <QuickOpen docs={allDocs} onOpen={openDocument} onClose={() => setShowQuickOpen(false)} />}
      {showNewNote && <NewNote name={newNoteName} setName={setNewNoteName} onCreate={createNote} onClose={() => setShowNewNote(false)} />}
    </div>
  );
}

function KateMenuBar({ menu, setMenu, onNewNote, onSave, onFind, onQuickOpen, onSidebar, editable }: { menu: string | null; setMenu: (value: string | null) => void; onNewNote: () => void; onSave: () => void; onFind: () => void; onQuickOpen: () => void; onSidebar: () => void; editable: boolean }) {
  const menus = [{ label: "File", actions: [["New Note", onNewNote], ["Save", onSave]] }, { label: "Edit", actions: [["Find", onFind]] }, { label: "View", actions: [["Open or close sidebar", onSidebar], ["Quick Open", onQuickOpen]] }];
  return <div className="flex shrink-0 items-center gap-0.5 bg-chrome px-1 text-[11.5px]">{menus.map((item) => <div key={item.label} className="relative"><button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => setMenu(menu === item.label ? null : item.label)} className="rounded px-2 py-1 hover:bg-hover">{item.label}</button>{menu === item.label && <div className="solid-popup-surface absolute left-0 top-full z-30 min-w-[140px] border border-line p-1 shadow-popup">{item.actions.map(([label, action]) => <button key={label as string} type="button" disabled={label === "Save" && !editable} onClick={() => { (action as () => void)(); setMenu(null); }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-hover disabled:opacity-40">{label as string}</button>)}</div>}</div>)}</div>;
}

function KateSidebar({ filter, setFilter, docs, active, openDocument, showNewNote, onClose }: { filter: string; setFilter: (value: string) => void; docs: { id: DocId; title: string; group: "Portfolio" | "Personal Notes"; kind: string }[]; active: DocId; openDocument: (id: DocId) => void; showNewNote: () => void; onClose: () => void }) {
  return <aside className="breeze-scroll absolute inset-y-0 left-0 z-20 w-[260px] overflow-y-auto border-r border-line bg-chrome p-2 shadow-popup md:relative md:z-auto md:w-[220px] md:shrink-0 md:shadow-none"><div className="mb-2 flex items-center justify-between px-1"><span className="text-[11px] font-semibold">Document sidebar</span><button type="button" onClick={onClose} className="rounded border border-line px-2 py-1 text-[11px] text-text hover:bg-hover">Close sidebar</button></div><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter documents..." className="mb-2 w-full rounded border border-line bg-view px-2 py-1.5 text-[12px] outline-none focus:border-accent" />{(["Portfolio", "Personal Notes"] as const).map((group) => <section key={group} className="mb-3"><div className="mb-1 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wide text-subtle"><span>{group}</span>{group === "Personal Notes" && <button type="button" onClick={showNewNote} className="text-accent">+</button>}</div>{docs.filter((doc) => doc.group === group).map((doc) => <button key={doc.id} type="button" onClick={() => openDocument(doc.id)} className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] ${active === doc.id ? "bg-accent text-accent-fg" : "hover:bg-hover"}`}><span className="truncate">{doc.title}</span>{doc.kind === "editable" && <span className="ml-1 text-[10px]">edit</span>}</button>)}</section>)}</aside>;
}

function DocumentWorkspace({ mode, editable, content, onChange, sourceRef }: { mode: Mode; editable: boolean; content: string; onChange: (value: string) => void; sourceRef: React.RefObject<HTMLTextAreaElement> }) {
  const source = <textarea ref={sourceRef} value={content} onChange={(event) => onChange(event.target.value)} readOnly={!editable} spellCheck={editable} className="breeze-scroll h-full min-h-[360px] w-full resize-none bg-transparent p-5 font-mono text-[12.5px] leading-relaxed outline-none read-only:text-subtle" aria-label="Document source" />;
  const preview = <article className="md-body mx-auto max-w-[780px] p-6"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></article>;
  if (mode === "source") return source;
  if (mode === "split") return <div className="grid h-full min-h-[360px] grid-cols-2 divide-x divide-line">{source}<div className="breeze-scroll overflow-auto">{preview}</div></div>;
  return preview;
}

function ResumeDocument() {
  return <div className="flex h-full min-h-[420px] flex-col"><p className="border-b border-line bg-chrome px-4 py-1.5 text-center text-[11.5px] text-subtle">Original resume, embedded from Google Docs. <a href={RESUME_EDIT_URL} target="_blank" rel="noreferrer" className="text-accent hover:underline">Open full document</a></p><iframe src={RESUME_EMBED_URL} title="Resume" className="min-h-0 flex-1 border-none bg-white" /></div>;
}

function ToolButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" title={label} onClick={onClick} disabled={disabled} className="rounded border border-transparent px-2 py-1 text-[11px] hover:border-line hover:bg-hover disabled:opacity-40">{children}</button>;
}

function FindBar({ value, onChange, count, onClose }: { value: string; onChange: (value: string) => void; count: number; onClose: () => void }) {
  return <div className="solid-popup-surface absolute right-3 top-[62px] z-20 flex items-center gap-2 border border-line p-2 shadow-popup"><input autoFocus value={value} onChange={(event) => onChange(event.target.value)} placeholder="Find in document" className="w-[190px] bg-transparent text-[12px] outline-none" /><span className="text-[11px] text-subtle">{count} matches</span><button type="button" onClick={onClose} className="text-subtle hover:text-text">x</button></div>;
}

function QuickOpen({ docs, onOpen, onClose }: { docs: { id: DocId; title: string }[]; onOpen: (id: DocId) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const matches = docs.filter((doc) => doc.title.toLowerCase().includes(query.toLowerCase()));
  return <div className="absolute inset-0 z-30 flex items-start justify-center bg-black/20 pt-12" onPointerDown={onClose}><div className="solid-popup-surface w-[440px] max-w-[calc(100%-32px)] border border-line p-2 shadow-popup" onPointerDown={(event) => event.stopPropagation()}><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && matches[0]) onOpen(matches[0].id); if (event.key === "Escape") onClose(); }} placeholder="Quick Open" className="w-full border-b border-line bg-transparent px-2 py-2 text-[13px] outline-none" />{matches.map((doc) => <button key={doc.id} type="button" onClick={() => onOpen(doc.id)} className="block w-full rounded px-2 py-2 text-left text-[12px] hover:bg-hover">{doc.title}</button>)}</div></div>;
}

function NewNote({ name, setName, onCreate, onClose }: { name: string; setName: (value: string) => void; onCreate: () => void; onClose: () => void }) {
  return <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20" onPointerDown={onClose}><form className="solid-popup-surface w-[340px] border border-line p-4 shadow-popup" onPointerDown={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); onCreate(); }}><p className="mb-2 text-[13px] font-semibold">New personal note</p><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Note name" className="w-full border border-line bg-view px-2 py-1.5 text-[12px] outline-none focus:border-accent" /><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded px-2 py-1 text-[12px] hover:bg-hover">Cancel</button><button type="submit" className="rounded bg-accent px-2 py-1 text-[12px] font-semibold text-accent-fg">Create</button></div></form></div>;
}
