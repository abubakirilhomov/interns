import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const MS = 1000;
const MIN = 60 * MS;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const ProbationTimer = ({ probation, isMobile, daysWorking, trialPeriodDays, daysRemaining }) => {
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  useEffect(() => {
    if (!probation?.probationEndAt || probation.isExpired) return;

    const endMs = new Date(probation.probationEndAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(endMs - now, 0);
      setTimeLeftMs(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [probation]);

  if (!probation) return null;

  if (probation.isExpired || timeLeftMs <= 0) {
    return (
      <div className="card bg-success/10 border border-success/20 p-4 flex items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
          <span className="text-lg">🎉</span>
        </div>
        <div className="text-sm font-bold text-success">
          Испытательный срок завершён
        </div>
      </div>
    );
  }

  const days = Math.floor(timeLeftMs / DAY);
  const hours = Math.floor((timeLeftMs % DAY) / HOUR);
  const minutes = Math.floor((timeLeftMs % HOUR) / MIN);
  const seconds = Math.floor((timeLeftMs % MIN) / MS);

  // Вычисляем процент для прогресс бара
  const progressPercent = Math.min((daysWorking / trialPeriodDays) * 100, 100);
  const isNearDeadline = daysRemaining <= 7;

  return (
    <div className="card bg-base-100/60 shadow-xl backdrop-blur border border-base-200 p-5 w-full">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
            {isMobile ? "Испыт. срок" : "Испытательный срок"}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-base-content">{daysWorking}</span>
            <span className="text-xs text-base-content/40">/ {trialPeriodDays} дней</span>
          </div>
        </div>
      </div>

      {/* Кастомный прогресс бар */}
      {daysWorking !== undefined && (
        <div className="mb-6 relative">
          <div className="h-3 w-full bg-base-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isNearDeadline
                ? 'bg-gradient-to-r from-warning to-error'
                : 'bg-gradient-to-r from-info to-primary'
                }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-center font-medium text-base-content/60">
            {daysRemaining > 0 ? (
              <span>Осталось <span className={isNearDeadline ? "text-error font-bold" : "text-base-content"}>{daysRemaining} дней</span></span>
            ) : (
              <span className="text-success">Срок подошел к концу</span>
            )}
          </div>
        </div>
      )}

      {/* Таймер */}
      {!probation.isExpired && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <TimeBlock value={days} label="дн" />
          <TimeBlock value={hours} label="ч" />
          <TimeBlock value={minutes} label="м" />
          <TimeBlock value={seconds} label="с" />
        </div>
      )}
    </div>
  );
};

const TimeBlock = ({ value, label }) => (
  <div className="card bg-base-200/50 border border-base-300 p-2 flex flex-col items-center justify-center min-w-[50px]">
    <span className="font-mono font-bold text-xl md:text-2xl text-primary">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[10px] uppercase tracking-wider text-base-content/60 font-medium">
      {label}
    </span>
  </div>
);

export default ProbationTimer;
