import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { findFolder, PROJECTS, type AppId, type FsNode } from "../../state/fs";
import { useWindows, type WinState } from "../../state/windows";
import { APP_REGISTRY } from "../registry";

type Line =
  | { kind: "input"; text: string }
  | { kind: "output"; text: string }
  | { kind: "error"; text: string }
  | { kind: "fastfetch" };

const USER = "yeunwookk";
const HOST = "kubuntu";

const FASTFETCH_INFO: [string, string][] = [
  ["OS", "Kubuntu 26.04 LTS (Resolute Raccoon) x86_64"],
  ["Shell", "bash 5.3.9"],
  ["DE", "KDE Plasma 6.6.6"],
  ["WM", "KWin (Wayland)"],
  ["WM Theme", "Breeze"],
  ["Theme", "Breeze (LeafDark) [Qt], Breeze-Dark [GTK2], Breeze [GTK3]"],
  ["Icons", "Papirus-Dark"],
  ["Font", "Noto Sans (10pt)"],
  ["Cursor", "breeze (30px)"],
  ["Terminal", "Konsole"],
  ["Portfolio", "yeunwook.kim"],
];

const HELP_LINES = [
  "Available commands:",
  "  help              show this help",
  "  fastfetch         system information",
  "  about             who is yeunwook?",
  "  projects          list my projects",
  "  socials           contact links",
  "  ls / cd / cat     explore the filesystem",
  "  pwd               print working directory",
  "  open <app>        launch an app (dolphin, kate, settings, contacts, grindercalc)",
  "  coffee            brew report",
  "  clear             clear the terminal",
  "  exit              close konsole",
];

export function Konsole({ win }: { win?: WinState }) {
  const { closeWindow } = useWindows();
  const [lines, setLines] = useState<Line[]>([
    { kind: "fastfetch" },
    { kind: "output", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [cwd, setCwd] = useState<string[]>(win?.payload?.path ?? []);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const promptPath = useMemo(
    () => (cwd.length ? "~/" + cwd.join("/") : "~"),
    [cwd],
  );

  const push = (...newLines: Line[]) => setLines((prev) => [...prev, ...newLines]);

  const run = (raw: string): void => {
    const command = raw.trim();
    push({ kind: "input", text: command });
    if (!command) return;
    setHistory((h) => [...h, command]);
    setHistoryIndex(null);

    const [cmd, ...args] = command.split(/\s+/);
    switch (cmd) {
      case "help":
        push(...HELP_LINES.map((text): Line => ({ kind: "output", text })));
        break;
      case "clear":
        setLines([]);
        break;
      case "fastfetch":
      case "neofetch":
        push({ kind: "fastfetch" });
        break;
      case "pwd":
        push({ kind: "output", text: `/home/${USER}/${cwd.join("/")}` });
        break;
      case "whoami":
        push({ kind: "output", text: USER });
        break;
      case "date":
        push({ kind: "output", text: new Date().toString() });
        break;
      case "echo":
        push({ kind: "output", text: args.join(" ") });
        break;
      case "uname":
        push({
          kind: "output",
            text: "Linux kubuntu 7.0.0-30-generic x86_64 GNU/Linux",
        });
        break;
      case "about":
        push(
          { kind: "output", text: "Yeunwook Kim — Mathematics-Computer Science senior at UC San Diego." },
          { kind: "output", text: "Building web3 experiences for everyone. Coffee-driven development." },
        );
        break;
      case "projects":
        push(
          ...PROJECTS.map(
            (p): Line => ({
              kind: "output",
              text: `• ${p.name}${p.liveLink ? "  →  " + p.liveLink : ""}`,
            }),
          ),
          { kind: "output", text: "Tip: open Dolphin → Projects for details." },
        );
        break;
      case "socials":
      case "contact":
        push(
          { kind: "output", text: "email    yeunwookk@gmail.com" },
          { kind: "output", text: "github   https://github.com/Yanuk-K" },
          { kind: "output", text: "linkedin https://www.linkedin.com/in/yeun-wook-kim/" },
        );
        break;
      case "coffee":
        push(
          { kind: "output", text: "Brew report: light roast · 30g · 16.6:1 · 93°C" },
          { kind: "output", text: "Origami + V60 filters. Status: dialing in…" },
          { kind: "output", text: "Run `open grindercalc` to convert grinder clicks." },
        );
        break;
      case "ls": {
        const node = findFolder(cwd);
        if (!node || node.kind !== "folder") {
          push({ kind: "error", text: `ls: cannot access '${promptPath}'` });
          break;
        }
        const names = node.children
          .map((child) =>
            child.kind === "folder"
              ? `${child.name}/`
              : child.kind === "app"
                ? child.name + ".desktop"
                : child.name,
          )
          .sort();
        push({ kind: "output", text: names.length ? names.join("   ") : "(empty)" });
        break;
      }
      case "cd": {
        const target = args[0];
        if (!target || target === "~" || target === "/") {
          setCwd([]);
          break;
        }
        if (target === "..") {
          setCwd((c) => c.slice(0, -1));
          break;
        }
        const nextPath = [...cwd, target.replace(/\/$/, "")];
        const node = findFolder(nextPath);
        if (node && node.kind === "folder") setCwd(nextPath);
        else push({ kind: "error", text: `cd: no such directory: ${target}` });
        break;
      }
      case "cat": {
        const name = args[0];
        const node = findFolder(cwd);
        const file =
          node && node.kind === "folder"
            ? node.children.find((child) => child.name === name)
            : undefined;
        if (!file) {
          push({ kind: "error", text: `cat: ${name ?? ""}: No such file` });
          break;
        }
        catNode(file, push);
        break;
      }
      case "open": {
        const appId = args[0]?.toLowerCase() as AppId | undefined;
        const known = appId && Object.keys(APP_REGISTRY).includes(appId);
        if (!known) {
          push({
            kind: "error",
            text: `open: unknown app '${args[0] ?? ""}'. Try: ${Object.keys(APP_REGISTRY).join(", ")}`,
          });
          break;
        }
        window.dispatchEvent(
          new CustomEvent("plasma-open-app", { detail: appId }),
        );
        push({ kind: "output", text: `Launching ${APP_REGISTRY[appId].name}…` });
        break;
      }
      case "sudo":
        push({ kind: "error", text: `${USER} is not in the sudoers file. This incident has been reported. ☕` });
        break;
      case "mahjong":
        push(
          { kind: "output", text: " Riichi!  ♠ 1000 points standing." },
          { kind: "output", text: "Ippatsu… ura-dora 3. Dealer is not amused." },
        );
        break;
      case "exit":
        if (win) closeWindow(win.id);
        else push({ kind: "output", text: "exit: no parent window?" });
        break;
      default:
        push({ kind: "error", text: `command not found: ${cmd}. Type 'help'.` });
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      push({ kind: "input", text: input + "^C" });
      setInput("");
    }
  };

  return (
    <div
      className="h-full overflow-hidden bg-[#101214]/70 p-3 font-mono text-[12.5px] leading-[1.55] backdrop-blur-xl"
      onClick={() => inputRef.current?.focus()}
      role="log"
      aria-label="Konsole terminal"
    >
      <div ref={scrollRef} className="breeze-scroll h-full overflow-y-auto pr-1">
        {lines.map((line, i) => (
          <div key={i}>
            {line.kind === "input" ? (
              <p className="whitespace-pre-wrap">
                <Prompt cwd={promptPath} />
                <span className="text-[#e6e6e6]">{line.text}</span>
              </p>
            ) : line.kind === "output" ? (
              <p className="whitespace-pre-wrap text-[#c8cbce]">{line.text}</p>
            ) : line.kind === "error" ? (
              <p className="whitespace-pre-wrap text-[#f07178]">{line.text}</p>
            ) : (
              <Fastfetch />
            )}
          </div>
        ))}
        <p className="flex items-center whitespace-pre-wrap">
          <Prompt cwd={promptPath} />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
            className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-[#e6e6e6] caret-[#1cdc9a] outline-none"
          />
        </p>
      </div>
    </div>
  );
}

function Prompt({ cwd }: { cwd: string }) {
  return (
    <>
      <span className="text-[#27ae60] font-semibold">
        {USER}@{HOST}
      </span>
      <span className="text-[#c8cbce]">:</span>
      <span className="font-semibold text-[#3daee9]">{cwd}</span>
      <span className="mr-1.5 text-[#c8cbce]">$&nbsp;</span>
    </>
  );
}

function Fastfetch() {
  const art = [
    ["           `.:/ossyyyysso/:.", "1"],
    ["        .:oyyyyyyyyyyyyyyyyyyo:`", "1"],
    ["      -oyyyyyyyo", "1", "dMMy", "2", "yyyyyyysyyyyo-", "1"],
    ["    -syyyyyyyyyy", "1", "dMMy", "2", "oyyyy", "1", "dmMMy", "2", "yyyys-", "1"],
    ["   oyyys", "1", "dMy", "2", "syyyy", "1", "dMMMMMMMMMMMMMy", "2", "yyyyyyo", "1"],
    [" `oyyyy", "1", "dMMMMy", "2", "syysoooooo", "1", "dMMMMy", "2", "yyyyyyyyo`", "1"],
    [" oyyyyyy", "1", "dMMMMy", "2", "yyyyyyyyyyys", "1", "dMMy", "2", "sssssyyyo", "1"],
    ["-yyyyyyyy", "1", "dMy", "2", "syyyyyyyyyyyyyys", "1", "dMMMMMy", "2", "syyy-", "1"],
    ["oyyyysoo", "1", "dMy", "2", "yyyyyyyyyyyyyyyyyy", "1", "dMMMMy", "2", "syyyo", "1"],
    ["yyys", "1", "dMMMMMy", "2", "yyyyyyyyyyyyyyyyyysosyyyyyyyy", "1"],
    ["yyys", "1", "dMMMMMy", "2", "yyyyyyyyyyyyyyyyyyyyyyyyyyyyy", "1"],
    ["oyyyyysos", "1", "dy", "2", "yyyyyyyyyyyyyyyyyy", "1", "dMMMMy", "2", "syyyo", "1"],
    ["-yyyyyyyy", "1", "dMy", "2", "yyyyyyyyyyyyyyyyys", "1", "dMMMMMy", "2", "syyy-", "1"],
    [" oyyyyyy", "1", "dMMMy", "2", "syyyyyyyyyys", "1", "dMMy", "2", "oyyyoyyyo", "1"],
    [" `oyyyy", "1", "dMMMy", "2", "syyyoooooo", "1", "dMMMMy", "2", "oyyyyyyyyo", "1"],
    ["   oyyysyyoyyyys", "1", "dMMMMMMMMMMMy", "2", "yyyyyyyo", "1"],
    ["    -syyyyyyyyy", "1", "dMMMy", "2", "syyy", "1", "dMMMy", "2", "syyyys-", "1"],
    ["      -oyyyyyyy", "1", "dMMy", "2", "yyyyyysosyyyyo-", "1"],
    ["        ./oyyyyyyyyyyyyyyyyyyo/.", "1"],
    ["           `.:/oosyyyysso/:.`", "1"],
  ] as const;
  const colors: Record<string, string> = { "1": "#4da3dd", "2": "#e6edf3" };
  return (
    <div className="flex flex-col gap-2 py-1 sm:flex-row sm:gap-4">
      <pre aria-label="Kubuntu logo" className="max-w-full overflow-hidden text-[11px] leading-[1.15] sm:text-[12.5px]">
        {art.map((line, lineIndex) => (
          <div key={lineIndex}>
            {Array.from({ length: line.length / 2 }, (_, i) => (
              <span key={i} style={{ color: colors[line[i * 2 + 1]] }}>
                {line[i * 2]}
              </span>
            ))}
          </div>
        ))}
      </pre>
      <div className="min-w-0 leading-[1.35]">
        <p>
          <span className="font-bold text-[#f67400]">{USER}</span>
          <span className="text-[#c8cbce]">@</span>
          <span className="font-bold text-[#f67400]">{HOST}</span>
        </p>
        <p className="mb-1 text-[#c8cbce]">─────────────────────────</p>
        {FASTFETCH_INFO.map(([label, value]) => (
          <p key={label} className="break-words sm:whitespace-nowrap">
            <span className="font-bold text-[#4da3dd]">{label}</span>
            <span className="text-[#c8cbce]">: </span>
            <span className="text-[#e6e6e6]">{value}</span>
          </p>
        ))}
        <p className="mt-1 flex gap-1">
          {[ "#5db4e8", "#1cdc9a", "#fdbc4b", "#f67400", "#ed1515", "#9b59b6"].map((c) => (
            <span key={c} className="inline-block h-3 w-6 rounded-sm" style={{ background: c }} />
          ))}
        </p>
      </div>
    </div>
  );
}

function catNode(
  file: FsNode,
  push: (...lines: Line[]) => void,
): void {
  if (file.kind === "folder") {
    push({ kind: "error", text: `cat: ${file.name}: Is a directory` });
    return;
  }
  if (file.kind === "doc") {
    if (file.docId === "about") {
      push(
        { kind: "output", text: "# About Me" },
        { kind: "output", text: "Math-CS senior at UC San Diego building web3 experiences for everyone." },
        { kind: "output", text: "Open in Kate for the full document." },
      );
    } else {
      push({ kind: "output", text: "Resume — open with `open kate` or double-click in Dolphin." });
    }
    return;
  }
  if (file.kind === "project") {
    const project = PROJECTS.find((p) => p.id === file.projectId);
    if (!project) return;
    push(
      { kind: "output", text: project.name },
      { kind: "output", text: project.description },
      { kind: "output", text: `github: ${project.githubLink}` },
    );
    return;
  }
  push({ kind: "output", text: `[Desktop Entry]\nName=${APP_REGISTRY[file.appId].name}\nType=Application` });
}
