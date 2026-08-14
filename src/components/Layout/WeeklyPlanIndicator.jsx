import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Flame, AlertTriangle, Ban } from "lucide-react";

/**
 * Streak chip for the Navbar. Phase 1b — read-only indicator.
 * Shows:
 *   - status === 'ok' & streakWeeks >= 1 → bright flame + streakWeeks
 *   - status === 'ok' & streakWeeks === 0 → faded flame (no count)
 *   - status === 'restricted' → small yellow chip with warning icon
 *   - status === 'admin_block' → small red chip with ban icon
 *
 * Color of the flame scales with streak length:
 *   1-4  → orange
 *   5-9  → red
 *   10+  → blue ("hot enough to burn cold")
 *
 * Hidden until data loads to avoid layout jumps.
 */
const WeeklyPlanIndicator = () => {
  const { t } = useTranslation();
  const wp = useSelector((s) => s.weeklyPlan.data);

  if (!wp) return null;

  const { status, streakWeeks = 0, longestStreakWeeks = 0 } = wp;

  if (status === "restricted") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        title={t("weeklyPlan.indicator.restrictedTooltip")}
        className="flex items-center gap-1 px-2 py-1 bg-warning/20 text-warning-content rounded-full text-xs font-semibold"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("weeklyPlan.indicator.restricted")}</span>
      </motion.div>
    );
  }

  if (status === "admin_block") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        title={t("weeklyPlan.indicator.adminBlockTooltip")}
        className="flex items-center gap-1 px-2 py-1 bg-error/20 text-error rounded-full text-xs font-semibold"
      >
        <Ban className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("weeklyPlan.indicator.adminBlock")}</span>
      </motion.div>
    );
  }

  // ok status
  if (streakWeeks <= 0) {
    return (
      <div
        title={t("weeklyPlan.indicator.noStreakTooltip")}
        className="flex items-center gap-1 px-2 py-1 bg-base-200 text-base-content/40 rounded-full text-xs"
      >
        <Flame className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("weeklyPlan.indicator.startStreak")}</span>
      </div>
    );
  }

  // streakWeeks >= 1
  const gradient =
    streakWeeks >= 10
      ? "from-blue-500 to-cyan-500"
      : streakWeeks >= 5
        ? "from-red-500 to-pink-600"
        : "from-orange-500 to-red-500";

  const isPersonalBest = streakWeeks > 1 && streakWeeks === longestStreakWeeks;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      title={
        isPersonalBest
          ? t("weeklyPlan.indicator.streakBestTooltip", { count: streakWeeks })
          : t("weeklyPlan.indicator.streakTooltip", { count: streakWeeks })
      }
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${gradient} text-white rounded-full shadow-md`}
    >
      <Flame className="w-4 h-4" />
      <span className="text-sm font-bold">{streakWeeks}</span>
      <span className="text-xs hidden sm:inline">
        {t("weeklyPlan.indicator.weeks", { count: streakWeeks })}
      </span>
      {isPersonalBest && <span className="text-xs">★</span>}
    </motion.div>
  );
};

export default WeeklyPlanIndicator;
