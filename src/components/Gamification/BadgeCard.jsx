import { motion } from "framer-motion";
import { Lock, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

const BadgeCard = ({ badge }) => {
  const { t, i18n } = useTranslation();
  const earned = badge.earned;
  const name = typeof badge.name === "object"
    ? badge.name[i18n.language] || badge.name.ru
    : badge.name;
  const description = typeof badge.description === "object"
    ? badge.description[i18n.language] || badge.description.ru
    : badge.description || "";

  return (
    <motion.div
      whileHover={earned ? { scale: 1.05 } : undefined}
      whileTap={earned ? { scale: 0.95 } : undefined}
      className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
        earned
          ? "bg-base-100 border-primary/20 shadow-md cursor-default"
          : "bg-base-200/50 border-base-300 opacity-50 grayscale"
      }`}
    >
      <span className="text-3xl mb-1.5">{badge.icon}</span>
      <span className={`text-xs font-semibold text-center leading-tight ${earned ? "text-base-content" : "text-base-content/40"}`}>
        {name}
      </span>
      {earned && badge.earnedAt && (
        <span className="text-[10px] text-base-content/30 mt-1">
          {new Date(badge.earnedAt).toLocaleDateString()}
        </span>
      )}

      {/* About tugmasi — ustiga hover qilganda tavsif chiqadi */}
      {description && (
        <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center">
          <Info className="w-3.5 h-3.5 text-base-content/40" />
        </span>
      )}

      {/* Tooltip */}
      {description && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 px-3 py-2 rounded-lg bg-neutral text-neutral-content text-[11px] leading-snug text-center opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-xl">
          {description}
        </div>
      )}

      {!earned && (
        <div className="absolute top-1 left-1">
          <Lock className="w-3 h-3 text-base-content/20" />
        </div>
      )}
    </motion.div>
  );
};

export default BadgeCard;
