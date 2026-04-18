import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";

const AchievementToast = ({ badges = [], onDone }) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (badges.length === 0) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#3b82f6"],
    });

    const timer = setTimeout(() => {
      onDone?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [badges, onDone]);

  if (badges.length === 0) return null;

  const badge = badges[0];
  const name = typeof badge.name === "object"
    ? badge.name[i18n.language] || badge.name.ru
    : badge.nameUz && i18n.language === "uz" ? badge.nameUz : badge.name;

  return (
    <AnimatePresence>
      <motion.div
        key="achievement"
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -30 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, times: [0, 0.7, 1] }}
          className="bg-base-100 border-2 border-primary/30 rounded-3xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 max-w-xs pointer-events-auto"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-6xl"
          >
            {badge.icon}
          </motion.span>
          <p className="text-xs font-bold text-primary uppercase tracking-wider">
            {t("gamification.badgeEarned")}
          </p>
          <p className="text-lg font-bold text-base-content text-center">{name}</p>
          <p className="text-xs text-base-content/40">+20 XP</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;
