import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const fireConfetti = () =>
  import("canvas-confetti").then((m) =>
    (m.default || m)({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ["#d4af37", "#f59e0b", "#8b5cf6", "#10b981", "#3b82f6"],
    })
  ).catch(() => {});

// Yangi yutuq ochilganda tepada chiroqli notification. Foydalanuvchi
// OK tugmasini bosmaguncha yo'qolmaydi (auto-dismiss yo'q).
const AchievementToast = ({ badges = [], onDone }) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (badges.length === 0) return;
    fireConfetti();
  }, [badges]);

  if (badges.length === 0) return null;

  const badgeName = (b) =>
    typeof b.name === "object"
      ? b.name[i18n.language] || b.name.ru
      : b.nameUz && i18n.language === "uz"
      ? b.nameUz
      : b.name;

  return (
    <AnimatePresence>
      <motion.div
        key="achievement"
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -80 }}
        className="fixed top-3 left-0 right-0 z-[10000] flex justify-center px-3 pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="glow-gold pointer-events-auto bg-base-100 border-2 border-amber-400/70 rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 max-w-md w-full"
        >
          <motion.span
            animate={{ rotate: [0, -12, 12, -12, 0] }}
            transition={{ duration: 0.6, delay: 0.2, repeat: Infinity, repeatDelay: 2 }}
            className="text-4xl"
          >
            {badges[0].icon}
          </motion.span>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">
              {t("gamification.badgeEarned")}
            </p>
            <p className="text-base font-bold text-base-content leading-tight">
              {badges.length === 1
                ? badgeName(badges[0])
                : t("gamification.badges", { count: badges.length })}
            </p>
            {badges.length > 1 && (
              <p className="text-xs text-base-content/60 truncate">
                {badges.map((b) => badgeName(b)).join(", ")}
              </p>
            )}
            <p className="text-xs text-base-content/40 mt-0.5">
              {t("gamification.xpGained", { count: badges.length * 20 })}
            </p>
          </div>

          <button
            onClick={() => onDone?.()}
            className="btn btn-primary btn-sm shrink-0"
          >
            {t("gamification.ok")}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;
