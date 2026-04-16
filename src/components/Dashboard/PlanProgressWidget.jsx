import React from "react";
import { useTranslation } from 'react-i18next';
import { BookOpen } from "lucide-react";

const PlanProgressWidget = ({
  lessonsConfirmed,
  monthlyGoal,
  planStatus,
}) => {
  const { t } = useTranslation();

  const {
    isPlanBlocked = false,
    isManuallyActivated = false,
    confirmedLessonsThisMonth = 0,
    requiredLessonsByNow = 0,
    deficit = 0,
  } = planStatus || {};

  // Days until end of current calendar month
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysUntilMonthEnd = Math.max(
    Math.ceil((lastDay - now) / (1000 * 60 * 60 * 24)),
    0
  );

  const goal = monthlyGoal || 0;
  const confirmed = lessonsConfirmed ?? confirmedLessonsThisMonth;
  const progressPercent = goal > 0 ? Math.min(Math.round((confirmed / goal) * 100), 100) : 0;

  const progressColor =
    isPlanBlocked
      ? "progress-error"
      : progressPercent >= 80
      ? "progress-success"
      : progressPercent >= 50
      ? "progress-warning"
      : "progress-error";

  return (
    <div className="card bg-base-100/60 shadow-xl backdrop-blur border border-base-200 p-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold text-base-content">
            {t('dashboard.monthlyPlan')}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isPlanBlocked && (
            <span className="badge badge-error badge-sm gap-1 font-semibold">
              {t('dashboard.planBlocked')}
            </span>
          )}
          {isManuallyActivated && (
            <span className="badge badge-success badge-sm gap-1 font-semibold">
              {t('dashboard.activationEnabled')}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <progress
        className={`progress ${progressColor} w-full h-3 mb-3`}
        value={confirmed}
        max={goal}
      />

      {/* Stats row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-base-content/70">
          <span className="font-bold text-base-content text-lg">
            {confirmed}
          </span>{" "}
          {t('common.from')}{" "}
          <span className="font-semibold text-base-content">{goal}</span>{" "}
          {t('dashboard.lessonsConfirmed')}
          <span className="ml-2 text-xs text-base-content/40">
            ({progressPercent}%)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-base-content/50">
          {deficit > 0 && (
            <span className="text-error font-semibold">
              {t('dashboard.deficit', { count: deficit })}
            </span>
          )}
          <span>
            {t('dashboard.untilMonthEnd', { count: daysUntilMonthEnd })}
          </span>
        </div>
      </div>

      {/* Required-by-now sub-line (only when behind) */}
      {requiredLessonsByNow > 0 && confirmed < requiredLessonsByNow && (
        <p className="mt-3 text-xs text-base-content/50 border-t border-base-200 pt-3">
          {t('dashboard.behindSchedule', { required: requiredLessonsByNow, deficit })}
        </p>
      )}
    </div>
  );
};

export default PlanProgressWidget;
