import React from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap, Sparkles, Users, BookOpen } from "lucide-react";
import InfoTooltip from "../UI/InfoTooltip";

/**
 * Senior reja widgeti — oddiy dars rejasidan farqli ko'rinish.
 *
 * Senior internlar darslarga kirmaydi, ular tutorlar bilan ishlaydi.
 * Bu widget ular uchun "muddat (deadline) rejasi"ni ko'rsatadi:
 *   - Progress bar muddatga qolgan vaqt bo'yicha 0% → 100% to'ldiradi.
 *   - Muddat tugamaguncha to'liq yashil bo'lmaydi (rang foizga bog'liq).
 *   - Tagida aniq ko'rsatmalar ko'rsatiladi.
 *
 * Props:
 *   - probation       — { trialMonths, probationEndAt, daysLeft, isExpired }
 *   - daysWorking     — muddat boshlanganidan beri o'tgan kunlar
 *   - trialPeriodDays — jami muddat kunlari
 *   - daysRemaining   — muddatga qolgan kunlar
 *   - isSenior        — senior ekanligi (xavfsizlik uchun)
 */
const SeniorPlanWidget = ({
  probation,
  daysWorking,
  trialPeriodDays,
  daysRemaining,
  isSenior,
}) => {
  const { t } = useTranslation();

  // Zaxirada: senior bo'lmasa yoki ma'lumot yetishmasa widget ko'rsatilmaydi.
  if (!isSenior) return null;

  // Jami muddat kunlari (default: agar berilmasa trialPeriodDays).
  const totalDays = trialPeriodDays || probation?.trialMonths * 30 || 30;
  // O'tgan kunlar.
  const elapsedDays = daysWorking ?? 0;
  // Muddatga qolgan kunlar (agar berilmasa probation.daysLeft dan).
  const remainingDays =
    daysRemaining ?? probation?.daysLeft ?? Math.max(totalDays - elapsedDays, 0);

  const isExpired = probation?.isExpired ?? remainingDays <= 0;

  // Progress: o'tgan kun / jami kun → 0% dan 100% gacha.
  // Muddat tugamaguncha 100% bo'lmaydi — shuning uchun to'liq yashil bo'lmaydi.
  const progressPercent = Math.min(
    Math.round((elapsedDays / totalDays) * 100),
    100
  );

  // Rang foizga bog'liq: faqat 100% (muddat tugaganda) to'liq yashil (gold).
  const progressColor =
    isExpired
      ? "progress-gold"
      : progressPercent >= 80
      ? "progress-success"
      : progressPercent >= 50
      ? "progress-warning"
      : "progress-error";

  const percentColor = isExpired ? "text-gold" : "text-base-content";

  return (
    <div className="card bg-gradient-to-br from-base-100 via-base-100 to-primary/5 shadow-xl backdrop-blur border border-primary/20 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-base-content flex items-center">
            {t("dashboard.seniorPlan")}
            <InfoTooltip text={t("tooltips.seniorPlan")} />
          </h3>
        </div>
        {/* Badge: Senior rejimi */}
        <span className="badge badge-primary badge-outline text-xs">
          👨‍🏫 {t("dashboard.seniorMode")}
        </span>
      </div>

      {/* Progress bar — muddat bo'yicha */}
      <progress
        className={`progress ${progressColor} w-full h-3 mb-3`}
        value={elapsedDays}
        max={totalDays}
      />

      {/* Stats row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-base-content/70">
          <span className="font-bold text-base-content text-lg">
            {elapsedDays}
          </span>{" "}
          {t("common.from")}{" "}
          <span className="font-semibold text-base-content">
            {totalDays}
          </span>{" "}
          {t("dashboard.daysInPlan")}
          <span className={`ml-2 text-xs ${percentColor} font-bold`}>
            ({progressPercent}%)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-base-content/50">
          {isExpired ? (
            <span className="text-success font-semibold">
              {t("dashboard.deadlineReached")} ✅
            </span>
          ) : (
            <span>
              {t("dashboard.untilDeadlineEnd", { count: remainingDays })}
            </span>
          )}
        </div>
      </div>

      {/* 📌 Aniq ko'rsatmalar (tagida) */}
      <div className="mt-4 border-t border-base-200 pt-4 space-y-3">
        <p className="text-sm text-base-content/80 leading-relaxed">
          🎓 {t("dashboard.seniorInstruction")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 bg-base-200/40 rounded-xl px-3 py-2">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs text-base-content/80">
              {t("dashboard.seniorTaskTutor")}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-base-200/40 rounded-xl px-3 py-2">
            <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs text-base-content/80">
              {t("dashboard.seniorTaskCoworking")}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-base-200/40 rounded-xl px-3 py-2">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs text-base-content/80">
              {t("dashboard.seniorTaskLearn")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorPlanWidget;