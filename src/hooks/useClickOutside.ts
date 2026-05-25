import { useEffect, useRef, type RefObject } from "react";

type AnyEvent = MouseEvent | TouchEvent;

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: (event: AnyEvent) => void,
  listenWhen: boolean = true,
  ignoreRefs: RefObject<HTMLElement | null>[] = [],
) => {
  const ref = useRef<T>(null);

  // Keep track of the latest handler to avoid unnecessary re-renders in useEffect
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Optimization: Don't attach listeners if the menu is closed
    if (!listenWhen) return;

    const listener = (event: AnyEvent) => {
      const target = event.target as Node;

      // 1. Check if the click was inside the main ref (e.g., the Menu Body)
      if (ref.current?.contains(target)) {
        return;
      }

      // 2. Check if the click was inside any of the ignored dependency refs (e.g., the Trigger)
      const isInsideIgnoredRef = ignoreRefs.some((ignoreRef) =>
        ignoreRef.current?.contains(target),
      );

      if (isInsideIgnoredRef) {
        return;
      }

      // 3. Click was strictly outside of everything. Call the handler!
      savedHandler.current(event);
    };

    // Attach both mousedown and touchstart for mobile compatibility
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [listenWhen, ignoreRefs]); // Re-bind only if listen state or ignored refs change

  return { ref };
};
