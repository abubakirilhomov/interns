import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

const InfoTooltip = ({ text, className = "" }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const timeoutRef = useRef(null);

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const getPos = () => {
    if (!btnRef.current) return { top: 0, left: 0 };
    const rect = btnRef.current.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY - 10,
      left: Math.min(
        Math.max(rect.left + window.scrollX + rect.width / 2, 130),
        window.innerWidth - 130
      ),
    };
  };

  const pos = open ? getPos() : { top: 0, left: 0 };

  return (
    <span className={`inline-flex items-center ${className}`}>
      <button
        ref={btnRef}
        type="button"
        className="ml-1.5 p-1 rounded-full text-base-content/40 hover:text-primary hover:bg-primary/10 transition-all relative z-10"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-label="Info"
      >
        <Info className="w-4 h-4" />
      </button>
      {open &&
        createPortal(
          <div
            onMouseEnter={show}
            onMouseLeave={hide}
            className="fixed z-[9999] px-3 py-2.5 text-xs rounded-xl shadow-xl max-w-[260px] w-max whitespace-normal leading-relaxed border"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="absolute inset-0 rounded-xl bg-base-100 border border-base-300" />
            <span className="relative z-10 text-base-content">{text}</span>
          </div>,
          document.body
        )}
    </span>
  );
};

export default InfoTooltip;
