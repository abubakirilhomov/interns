import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, CheckCircle2, Clock, Plus, User, Users } from "lucide-react";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Узбекистан — стабильный UTC+5 без DST; бэкенд режет месяцы так же.
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;
const toTashkent = (d) => new Date(new Date(d).getTime() + TASHKENT_OFFSET_MS);
const currentMonthKey = () => toTashkent(Date.now()).toISOString().slice(0, 7);

// `time` у новых уроков — "YYYY-MM-DDTHH:mm" (стенное время Ташкента),
// у старых бывает просто "HH:mm" или что-то произвольное — тогда берём из date.
const lessonClock = (lesson) => {
  const full = /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})$/.exec(lesson.time || "");
  if (full) return full[1];
  if (/^\d{1,2}:\d{2}$/.test(lesson.time || "")) return lesson.time;
  return toTashkent(lesson.date).toISOString().slice(11, 16);
};

const LessonHistory = () => {
  const { t } = useTranslation();
  const monthNames = t("history.months", { returnObjects: true });
  const weekdayNames = t("history.weekdays", { returnObjects: true });

  const [month, setMonth] = useState(currentMonthKey);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (m) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/lessons/my-history`, {
        params: { month: m },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(month);
  }, [month, load]);

  const monthLabel = (key) => {
    const [y, m] = key.split("-").map(Number);
    const name = Array.isArray(monthNames) ? monthNames[m - 1] : key;
    return `${name} ${y}`;
  };

  // Чипы месяцев: всё, где есть уроки, + текущий месяц (даже если пустой).
  const monthOptions = useMemo(() => {
    const list = [...(data?.months || [])];
    const cur = currentMonthKey();
    if (!list.some((m) => m.month === cur)) list.unshift({ month: cur, total: 0 });
    if (!list.some((m) => m.month === month)) list.push({ month, total: 0 });
    return list.sort((a, b) => b.month.localeCompare(a.month));
  }, [data, month]);

  // Группировка по дням (уроки уже отсортированы с бэка: новые сверху).
  const days = useMemo(() => {
    const groups = [];
    for (const lesson of data?.lessons || []) {
      const local = toTashkent(lesson.date);
      const key = local.toISOString().slice(0, 10);
      let g = groups[groups.length - 1];
      if (!g || g.key !== key) {
        const wd = Array.isArray(weekdayNames) ? weekdayNames[local.getUTCDay()] : "";
        const mn = Array.isArray(monthNames) ? monthNames[local.getUTCMonth()] : "";
        g = { key, label: `${local.getUTCDate()}-${mn}, ${wd}`, lessons: [] };
        groups.push(g);
      }
      g.lessons.push(lesson);
    }
    return groups;
  }, [data, monthNames, weekdayNames]);

  const summary = data?.summary || { total: 0, confirmed: 0, pending: 0 };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-base-content">{t("history.title")}</h1>
          <p className="text-sm text-base-content/60">{t("history.subtitle")}</p>
        </div>
        <Link to="/lessons" className="btn btn-primary btn-sm shrink-0">
          <Plus className="w-4 h-4" />
          {t("history.addLesson")}
        </Link>
      </div>

      {/* Выбор месяца — горизонтальная прокрутка на телефоне */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {monthOptions.map((m) => (
          <button
            key={m.month}
            type="button"
            onClick={() => setMonth(m.month)}
            className={`btn btn-sm shrink-0 rounded-full ${
              m.month === month ? "btn-primary" : "btn-ghost bg-base-100"
            }`}
          >
            <span className="capitalize">{monthLabel(m.month)}</span>
            <span className="badge badge-sm">{m.total}</span>
          </button>
        ))}
      </div>

      {/* Итоги месяца */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-base-100 p-3 text-center shadow-sm">
          <div className="text-2xl font-bold">{summary.total}</div>
          <div className="text-xs text-base-content/60">{t("history.total")}</div>
        </div>
        <div className="rounded-xl bg-base-100 p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-success">{summary.confirmed}</div>
          <div className="text-xs text-base-content/60">{t("history.confirmed")}</div>
        </div>
        <div className="rounded-xl bg-base-100 p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-warning">{summary.pending}</div>
          <div className="text-xs text-base-content/60">{t("history.pending")}</div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : error ? (
        <div className="rounded-xl bg-base-100 p-6 text-center space-y-3">
          <p className="text-error">{t("history.error")}</p>
          <button type="button" className="btn btn-sm" onClick={() => load(month)}>
            {t("history.retry")}
          </button>
        </div>
      ) : days.length === 0 ? (
        <div className="rounded-xl bg-base-100 p-8 text-center text-base-content/60">
          <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
          {t("history.empty")}
        </div>
      ) : (
        <div className="space-y-5">
          {days.map((day) => (
            <section key={day.key} className="space-y-2">
              <h2 className="text-sm font-semibold text-base-content/70 px-1">
                {day.label}
              </h2>
              {day.lessons.map((lesson) => {
                const confirmed = lesson.status === "confirmed";
                const mentorName = lesson.mentor
                  ? `${lesson.mentor.name || ""} ${lesson.mentor.lastName || ""}`.trim()
                  : "—";
                return (
                  <article
                    key={lesson._id}
                    className={`rounded-xl bg-base-100 p-4 shadow-sm border-l-4 ${
                      confirmed ? "border-success" : "border-warning"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-base-content/60 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {lessonClock(lesson)}
                        </div>
                        <div className="font-semibold text-base-content break-words">
                          {lesson.topic}
                        </div>
                      </div>
                      {lesson.feedback && (
                        <span
                          className="text-xl leading-none shrink-0"
                          title={t("history.yourRating")}
                        >
                          {lesson.feedback}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/80">
                      <span className="flex items-center gap-1 min-w-0">
                        <Users className="w-4 h-4 shrink-0 opacity-60" />
                        <span className="opacity-60">{t("history.group")}:</span>
                        <span className="truncate">{lesson.group || "—"}</span>
                      </span>
                      <span className="flex items-center gap-1 min-w-0">
                        <User className="w-4 h-4 shrink-0 opacity-60" />
                        <span className="opacity-60">{t("history.mentor")}:</span>
                        <span className="truncate">{mentorName}</span>
                      </span>
                    </div>

                    <div className="mt-3">
                      {confirmed ? (
                        <span className="badge badge-success badge-sm gap-1 text-white">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("history.statusConfirmed")}
                        </span>
                      ) : (
                        <span className="badge badge-warning badge-sm gap-1">
                          <Clock className="w-3 h-3" />
                          {t("history.statusPending")}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonHistory;
