import { useEffect, useState } from "react";

const MS = 1000;
const MIN = 60 * MS;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const ProbationTimer = ({ probation, isMobile }) => {
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

  if (!probation) {
    return (
      <div className="bg-base-200 p-3 rounded-lg text-center text-sm opacity-60">
        Испытательный срок не задан
      </div>
    );
  }

  if (probation.isExpired || timeLeftMs <= 0) {
    return (
      <div className="bg-success/10 p-3 rounded-lg text-center">
        <div className="text-sm font-semibold text-success">
          Испытательный срок завершён ✅
        </div>
      </div>
    );
  }

  const days = Math.floor(timeLeftMs / DAY);
  const hours = Math.floor((timeLeftMs % DAY) / HOUR);
  const minutes = Math.floor((timeLeftMs % HOUR) / MIN);
  const seconds = Math.floor((timeLeftMs % MIN) / MS);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="bg-base-200 p-3 rounded-lg">
      <div className="text-xs text-base-content/60 mb-3 text-center">
        {isMobile ? "Испыт. срок" : "Испытательный срок"}
      </div>

      <div className="grid grid-flow-col justify-center gap-3 text-center auto-cols-max">
        <TimeBlock value={days} label={isMobile ? "дн" : "дни"} />
        <TimeBlock value={hours} label={isMobile ? "ч" : "часы"} />
        <TimeBlock value={minutes} label={isMobile ? "м" : "мин"} />
        <TimeBlock value={seconds} label={isMobile ? "с" : "сек"} />
      </div>
    </div>
  );
};

const TimeBlock = ({ value, label }) => (
  <div className="flex flex-col">
    <span className="font-mono font-bold text-2xl md:text-3xl">
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-xs opacity-60">{label}</span>
  </div>
);

export default ProbationTimer;
