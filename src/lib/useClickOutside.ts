import { useEffect, type RefObject } from "react";

/** Invoke `handler` when a pointer press lands outside the referenced element. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  handler: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || e.target instanceof Node && el.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [ref, active, handler]);
}
