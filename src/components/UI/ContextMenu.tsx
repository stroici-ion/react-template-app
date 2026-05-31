import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ContextMenuProps {
  triggerElement: React.ReactNode;
  body: React.ReactNode;
  maxWidth?: string;
  enableOverlay?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  triggerElement,
  body,
  maxWidth = "250px",
  enableOverlay = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ensure createPortal only runs on the client to prevent SSR hydration errors
  useEffect(() => {
      setHasMounted(true);
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Calculate where the trigger is on the screen and position the portal
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width, // Used to align the right-edge of the dropdown perfectly
      });
    }
  };

  // Keep position attached even if the user scrolls or resizes the window
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      // 'true' uses the capture phase to catch scroll events on any scrollable parent div
      window.addEventListener("scroll", updatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  // Handle clicking outside of both the trigger AND the portal body
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideTrigger =
        triggerRef.current && !triggerRef.current.contains(target);
      const isOutsideMenu =
        menuRef.current && !menuRef.current.contains(target);

      if (isOutsideTrigger && isOutsideMenu) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const portalContent = (
    <>
      {enableOverlay && (
        <div
          className="z-9998 fixed inset-0 cursor-default bg-black/40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className="z-9999 absolute"
        style={{
          top: coords.top,
          left: coords.left,
          width: coords.width,
        }}
      >
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 rounded-md border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          style={{
            maxWidth: maxWidth,
            minWidth: "190px",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div>{body}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        className="relative inline-block"
        ref={triggerRef}
        onClick={toggleMenu}
      >
        <div className="cursor-pointer">{triggerElement}</div>
      </div>

      {hasMounted && isOpen && createPortal(portalContent, document.body)}
    </>
  );
};

export default ContextMenu;
