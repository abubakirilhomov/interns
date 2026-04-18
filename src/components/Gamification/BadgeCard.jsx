import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

const BadgeCard = ({ badge }) => {
  const { t, i18n } = useTranslation();
  const earned = badge.earned;
  const name = typeof badge.name === "object"
    ? badge.name[i18n.language] || badge.name.ru
    : badge.name;

  return (
    <motion.div
      whileHover={earned ? { scale: 1.05 } : undefined}
      whileTap={earned ? { scale: 0.95 } : undefined}
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
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
      {!earned && (
        <div className="absolute top-1.5 right-1.5">
          <Lock className="w-3 h-3 text-base-content/20" />
        </div>
      )}
    </motion.div>
  );
};

export default BadgeCard;
