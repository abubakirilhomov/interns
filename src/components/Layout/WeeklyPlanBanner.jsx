import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { AlertTriangle, Ban, Clock, Zap, Loader2 } from "lucide-react";
import { selfActivateWeeklyPlan } from "../../store/slices/weeklyPlanSlice";

/**
 * Layout-wide banner для weekly plan state. Phase 2 — с реактивацией.
 *
 * Render rules:
 *   - status === 'admin_block' → red banner (только текст, нужен админ).
 *   - status === 'restricted' + activationsLeft > 0 → yellow banner + кнопка "Реактивировать".
 *   - status === 'restricted' + activationsLeft === 0 → yellow banner, кнопки нет (нужен админ).
 *   - status === 'ok' + isAtRisk → blue warning.
 *   - else → nothing.
 */
const WeeklyPlanBanner = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const wp = useSelector((s) => s.weeklyPlan.data);
  const isActivating = useSelector((s) => s.weeklyPlan.isActivating);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleConfirm = async () => {
    const result = await dispatch(selfActivateWeeklyPlan());
    setConfirmOpen(false);
    if (selfActivateWeeklyPlan.fulfilled.match(result)) {
      toast.success(t("weeklyPlan.banner.activate.success"));
    } else {
      toast.error(result.payload || t("weeklyPlan.banner.activate.error"));
    }
  };

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
        </div>
      </div>
    );
  } else if (status === "restricted") {
    const dots = "●●○○".slice(0, 2 - activationsLeft) + "●●".slice(0, activationsLeft);
    const canActivate = activationsLeft > 0;
    content = (
      <div className="alert alert-warning shadow-lg flex-col sm:flex-row items-start sm:items-center gap-3">
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
          {!canActivate && (
            <div className="text-xs opacity-90 mt-1">
              {t("weeklyPlan.banner.restricted.noActivationsLeft")}
            </div>
          )}
        </div>
        {canActivate && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="btn btn-sm btn-neutral shrink-0"
          >
            <Zap className="w-4 h-4" />
            {t("weeklyPlan.banner.activate.button")}
          </button>
        )}
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
    <>
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

      {/* Confirmation modal — кастомный overlay, как в internship-admin
          (DaisyUI modal неудобно скоупить, проще inline). */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !isActivating && setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-bold">{t("weeklyPlan.banner.activate.modalTitle")}</h3>
              </div>
              <p className="text-sm text-base-content/80 mb-2">
                {t("weeklyPlan.banner.activate.modalBody", {
                  done: currentWeekConfirmed ?? 0,
                  target: currentWeekTarget ?? 0,
                  left: activationsLeft,
                })}
              </p>
              <p className="text-xs text-base-content/60 mb-5">
                {t("weeklyPlan.banner.activate.modalWarning")}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={isActivating}
                  onClick={() => setConfirmOpen(false)}
                >
                  {t("weeklyPlan.banner.activate.cancel")}
                </button>
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  disabled={isActivating}
                  onClick={handleConfirm}
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("weeklyPlan.banner.activate.confirming")}
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      {t("weeklyPlan.banner.activate.confirm")}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WeeklyPlanBanner;
