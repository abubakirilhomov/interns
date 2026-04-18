import { useState } from "react";
import { Info } from "lucide-react";

const InfoTooltip = ({ text, className = "" }) => {
  const [open, setOpen] = useState(false);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
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
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-base-content bg-base-200 border border-base-300 rounded-lg shadow-lg max-w-[220px] w-max whitespace-normal leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-base-200" />
        </div>
      )}
    </span>
  );
};

export default InfoTooltip;
