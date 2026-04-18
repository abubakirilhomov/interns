import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

const InfoTooltip = ({ text, className = "" }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY - 8,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }, [open]);

  return (
    <span className={`inline-flex ${className}`}>
      <button
        ref={btnRef}
        type="button"
        className="ml-1 text-base-content/30 hover:text-base-content/60 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Info"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 text-xs rounded-lg shadow-lg max-w-[240px] w-max whitespace-normal leading-relaxed pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
              backgroundColor: "var(--fallback-b2, oklch(var(--b2)))",
              color: "var(--fallback-bc, oklch(var(--bc)))",
              border: "1px solid var(--fallback-b3, oklch(var(--b3)))",
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </span>
  );
};

export default InfoTooltip;
