import React from "react";
import { useTranslation } from 'react-i18next';
import { BookOpen } from "lucide-react";
import InfoTooltip from "../UI/InfoTooltip";

const PlanProgressWidget = ({
  lessonsConfirmed,
  monthlyGoal,
  daysRemaining,
  planStatus,
}) => {
  const { t } = useTranslation();

  // Phase 2: больше не читаем isPlanBlocked / isManuallyActivated из
  // planStatus — это поля от старого daily-правила, оно dead post-Phase 2.
  // Виджет теперь чисто прогресс-визуализация по месячному плану. Сам факт
  // блокировки рендерится Layout-баннером (WeeklyPlanBanner) от
  // state.weeklyPlan.data.
  const {
    confirmedLessonsThisMonth = 0,
    requiredLessonsByNow = 0,
    deficit = 0,
  } = planStatus || {};

  const goal = monthlyGoal || 0;
  const confirmed = lessonsConfirmed ?? confirmedLessonsThisMonth;
  const progressPercent = goal > 0 ? Math.min(Math.round((confirmed / goal) * 100), 100) : 0;

  // Цвет прогресса теперь от процента, а не от блок-флага.
  const progressColor =
    progressPercent >= 80
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
          <h3 className="text-base font-semibold text-base-content flex items-center">
            {t('dashboard.trialPlan')}
            <InfoTooltip text={t('tooltips.trialPlan')} />
          </h3>
        </div>

        {/* Бейджи "План заблокирован" / "Активация включена" убраны —
            старые daily-флаги мисляли (например 26.05.26 интерны видели
            красный бейдж даже когда weeklyPlan.status === 'ok' и
            createLesson реально проходил). Источник правды — Layout
            WeeklyPlanBanner. */}
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
          {daysRemaining != null && (
            <span>
              {t('dashboard.untilTrialEnd', { count: daysRemaining })}
            </span>
          )}
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
