import React, { useState, useRef, useEffect } from "react";

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
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div onClick={toggleMenu} className="cursor-pointer">
        {triggerElement}
      </div>

      {isOpen && enableOverlay && (
        <div
          className="fixed inset-0 cursor-default bg-black/40"
          style={{ zIndex: 9998 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div
          className="absolute right-0 mt-2 rounded-md border border-gray-200 bg-white shadow-xl"
          style={{
            maxWidth: maxWidth,
            zIndex: 9999,
            minWidth: "190px",
          }}
        >
          <div className="py-1">{body}</div>
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
