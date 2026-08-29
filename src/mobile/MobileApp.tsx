import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { AppId } from "../state/fs";
import type { WinState } from "../state/windows";
import { APP_REGISTRY } from "../apps/registry";
import { AppContent } from "../apps/AppContent";
import { ChevronLeftIcon } from "../desktop/icons";
import { isAppId } from "../state/fs";
import { PORTFOLIO_DOCUMENTS, type DocId } from "../content/portfolio";

/** A synthetic window record so apps can render without desktop window geometry. */
function syntheticWin(appId: AppId, docId?: DocId): WinState {
  return {
    id: "mobile",
    appId,
    title: APP_REGISTRY[appId].name,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    z: 0,
    minimized: false,
    maximized: false,
    payload: docId ? { docId } : undefined,
  };
}

export function MobileApp({
  appId,
  defaultDoc,
}: {
  appId: AppId;
  defaultDoc?: DocId;
}) {
  const meta = APP_REGISTRY[appId];
  const [searchParams] = useSearchParams();
  const requestedDoc = searchParams.get("doc") as DocId | null;
  const docId =
    requestedDoc && PORTFOLIO_DOCUMENTS.some((doc) => doc.id === requestedDoc)
      ? requestedDoc
      : defaultDoc;
  const win = syntheticWin(appId, docId);
  const navigate = useNavigate();

  useEffect(() => {
    const onOpenApp = (e: Event) => {
      const target = (e as CustomEvent<string>).detail;
      if (isAppId(target)) {
        navigate(`/app/${target}`);
      }
    };
    window.addEventListener("plasma-open-app", onOpenApp);
    return () => window.removeEventListener("plasma-open-app", onOpenApp);
  }, [navigate]);

  return (
    <div className="flex h-[100dvh] flex-col bg-view">
      <header className="flex shrink-0 items-center gap-2 border-b border-line bg-chrome px-2 py-2">
        <Link
          to="/home"
          aria-label="Back to home screen"
          className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-accent hover:bg-hover"
        >
          <ChevronLeftIcon size={18} />
          <span className="text-[13px] font-semibold">Home</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <meta.icon size={20} />
          <p className="truncate text-[13.5px] font-semibold">{meta.name}</p>
        </div>
        <span className="w-[64px]" aria-hidden />
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <AppContent win={win} />
      </div>
    </div>
  );
}
