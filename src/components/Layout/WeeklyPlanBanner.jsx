import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Ban, Clock, Info } from "lucide-react";

/**
 * Layout-wide banner showing weekly plan state.
 * Phase 1b — read-only preview. No "Реактивировать" button yet (Phase 2).
 *
 * Render rules:
 *   - status === 'admin_block' → red banner (preview framing).
 *   - status === 'restricted'  → yellow banner with activations counter.
 *   - status === 'ok' + isAtRisk → blue warning ("осталось X уроков и Y дней").
 *   - else → nothing.
 */
const WeeklyPlanBanner = () => {
  const { t } = useTranslation();
  const wp = useSelector((s) => s.weeklyPlan.data);

  if (!wp) return null;

  const {
    status,
    isAtRisk,
    currentWeekTarget,
    currentWeekConfirmed,
    currentWeekDeficit,
    daysLeftInWeek,
    activationsLeft,
  } = wp;

  let content = null;

  if (status === "admin_block") {
    content = (
      <div className="alert alert-error shadow-lg">
        <Ban className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">{t("weeklyPlan.banner.adminBlock.title")}</div>
          <div className="text-xs opacity-90 mt-0.5">
            {t("weeklyPlan.banner.adminBlock.body")}
          </div>
          <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {t("weeklyPlan.banner.previewNote")}
          </div>
        </div>
      </div>
    );
  } else if (status === "restricted") {
    // dots: filled = available, empty = used
    const dots = "●●○○".slice(0, 2 - activationsLeft) + "●●".slice(0, activationsLeft);
    content = (
      <div className="alert alert-warning shadow-lg">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm">
            {t("weeklyPlan.banner.restricted.title", {
              done: currentWeekConfirmed ?? 0,
              target: currentWeekTarget ?? 0,
            })}
          </div>
          <div className="text-xs opacity-90 mt-0.5">
            {t("weeklyPlan.banner.restricted.activations", {
              left: activationsLeft,
              dots,
            })}
          </div>
          <div className="text-[10px] opacity-70 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {t("weeklyPlan.banner.previewNote")}
          </div>
        </div>
      </div>
    );
  } else if (status === "ok" && isAtRisk) {
    content = (
      <div className="alert alert-info shadow-md">
        <Clock className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            {t("weeklyPlan.banner.atRisk.title", {
              deficit: currentWeekDeficit,
              days: daysLeftInWeek,
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key={status + (isAtRisk ? "-risk" : "")}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-4 md:px-6 pt-3"
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeeklyPlanBanner;
