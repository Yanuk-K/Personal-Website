import { useCallback } from "react";
import { APP_REGISTRY } from "../apps/registry";
import type { AppId } from "../state/fs";
import { useWindows, type WindowPayload } from "../state/windows";

export function useOpenApp() {
  const { openApp } = useWindows();
  return useCallback(
    (appId: AppId, options?: { payload?: WindowPayload; title?: string }) => {
      const meta = APP_REGISTRY[appId];
      openApp({
        appId,
        title: options?.title ?? meta.name,
        w: meta.w,
        h: meta.h,
        payload: options?.payload,
      });
    },
    [openApp],
  );
}
