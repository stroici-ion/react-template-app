import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "../../hooks/useClickOutside";

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
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ensure createPortal only runs on the client to prevent SSR hydration errors
  useEffect(() => {
    setMounted(true);
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
          className="fixed inset-0 cursor-default bg-black/40"
          style={{ zIndex: 9998 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 
        This invisible wrapper anchors to the exact coordinates of the trigger.
        By setting its width to the trigger's width, the "absolute right-0" on the 
        child acts exactly like it did in your original code.
      */}
      <div
        style={{
          position: "absolute",
          top: coords.top,
          left: coords.left,
          width: coords.width,
          zIndex: 9999,
        }}
      >
        <div
          ref={menuRef}
          onClick={() => setIsOpen(false)}
          className="absolute right-0 mt-2 rounded-md border border-gray-200 bg-white shadow-xl"
          style={{
            maxWidth: maxWidth,
            minWidth: "190px",
          }}
        >
          <div className="py-1">{body}</div>
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

      {mounted && isOpen && createPortal(portalContent, document.body)}
    </>
  );
};

export default ContextMenu;
