import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { getWorstLevel, getPenaltyBadgeClass, getPenaltyLabel } from "../utils/penaltyUtils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const tgLink = (handle) => {
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;
  return `https://t.me/${handle.startsWith("@") ? handle.slice(1) : handle}`;
};

const activityBadge = (level) => {
  switch (level) {
    case "high":
      return <span className="badge badge-success gap-1">🟢 Yuqori</span>;
    case "medium":
      return <span className="badge badge-warning gap-1">🟡 O'rtacha</span>;
    case "low":
      return <span className="badge badge-error gap-1">🔴 Past</span>;
    default:
      return <span className="badge badge-ghost gap-1">—</span>;
  }
};

// 🔴 Shtraf belgisi: eng yomon darajaga qarab rang
const penaltyBadge = (level) => {
  if (!level) return <span className="text-base-content/40 text-xs">—</span>;
  const badgeClass = getPenaltyBadgeClass(level);
  const label = getPenaltyLabel(level);
  const icon =
    level === "black" ? "⚫" :
    level === "red" ? "🔴" :
    level === "yellow" ? "🟡" :
    "🟢";
  return (
    <span className={`badge badge-sm ${badgeClass} gap-1`}>
      {icon} {label}
    </span>
  );
};

const HeadInternDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | high | medium | low
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/head-intern/interns/activity`);
      setData(res.data);
    } catch (err) {
      console.error("Aktivlik ma'lumotini yuklashda xato:", err);
      toast.error(err.response?.data?.message || "Xatolik yuzberdi");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isHeadIntern) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <div className="alert alert-error">
          <span>Bu sahifaga faqat Head Intern kira oladi</span>
        </div>
      </div>
    );
  }

  const filteredInterns = (data?.interns || []).filter((intern) => {
    // Filter
    if (filter === "high" && intern.activityLevel !== "high") return false;
    if (filter === "medium" && intern.activityLevel !== "medium") return false;
    if (filter === "low" && intern.activityLevel !== "low") return false;

    // Search
    if (search) {
      const q = search.toLowerCase();
      const fullName = `${intern.name} ${intern.lastName}`.toLowerCase();
      if (!fullName.includes(q)) return false;
    }
    return true;
  });

  const progressColor = (percent) => {
    if (percent >= 80) return "bg-success";
    if (percent >= 50) return "bg-warning";
    return "bg-error";
  };

  const formatLastLesson = (lastLessonDate, daysSince) => {
    if (!lastLessonDate) return <span className="text-base-content/40">Yo'q</span>;
    const date = new Date(lastLessonDate).toLocaleDateString("uz-UZ");
    if (daysSince == null) return date;
    if (daysSince === 0) return <span className="text-success font-medium">{date} (bugun)</span>;
    if (daysSince === 1) return <span className="text-warning font-medium">{date} (1 kun oldin)</span>;
    if (daysSince > 14) return <span className="text-error font-medium">{date} ({daysSince} kun oldin)</span>;
    return <span>{date} ({daysSince} kun oldin)</span>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 sm:mt-10 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-3xl">📊</span>
        <h2 className="text-2xl font-bold">Internlar Aktivligi</h2>
        <button className="btn btn-sm btn-ghost ml-auto" onClick={fetchActivity}>
          🔄 Yangilash
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : !data ? (
        <p className="text-center text-base-content/60">Ma'lumot topilmadi</p>
      ) : (
        <>
          {/* Statistika kartalari */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-title">Jami internlar</div>
              <div className="stat-value text-lg">{data.summary.totalInterns}</div>
            </div>
            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-title">🟢 Yuqori</div>
              <div className="stat-value text-lg text-success">
                {data.summary.highActivity}
              </div>
            </div>
            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-title">🟡 O'rtacha</div>
              <div className="stat-value text-lg text-warning">
                {data.summary.mediumActivity}
              </div>
            </div>
            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-title">🔴 Past / Nofaol</div>
              <div className="stat-value text-lg text-error">
                {data.summary.lowActivity}
              </div>
            </div>
          </div>

          {/* Filterlar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter("all")}
            >
              Hammasi
            </button>
            <button
              className={`btn btn-sm ${filter === "high" ? "btn-success" : "btn-ghost"}`}
              onClick={() => setFilter("high")}
            >
              🟢 Yuqori
            </button>
            <button
              className={`btn btn-sm ${filter === "medium" ? "btn-warning" : "btn-ghost"}`}
              onClick={() => setFilter("medium")}
            >
              🟡 O'rtacha
            </button>
            <button
              className={`btn btn-sm ${filter === "low" ? "btn-error" : "btn-ghost"}`}
              onClick={() => setFilter("low")}
            >
              🔴 Past / Nofaol
            </button>

            <input
              type="text"
              className="input input-bordered input-sm ml-auto"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Jadval */}
          <div className="bg-base-100 shadow rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Intern</th>
                    <th>Grade</th>
                    <th>Bu oy darslar</th>
                    <th>Kunlik o'rtacha</th>
                    <th>Aktivlik</th>
                    <th>Oxirgi dars</th>
                    <th>Streak</th>
                    <th>Shtraf</th>
                    <th>Eslatma</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterns.map((intern, idx) => (
                    <tr key={intern._id} className="hover">
                      <td>{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="font-bold">
                            {intern.name} {intern.lastName}
                          </div>
                          {intern.isSenior && (
                            <span className="badge badge-info badge-xs">Senior</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {intern.grade}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold">{intern.lessonsThisMonth}</span>
                        <span className="text-base-content/50 text-xs"> ta</span>
                      </td>
                      <td>
                        <span className="font-medium">{intern.dailyAverage}</span>
                        <span className="text-base-content/50 text-xs"> /kun</span>
                      </td>
                      <td>
                        <div className="flex items-center">
                          {activityBadge(intern.activityLevel)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <progress
                            className={`progress progress-xs ${progressColor(
                              intern.activityPercent
                            )} w-16`}
                            value={intern.activityPercent}
                            max="100"
                          />
                          {formatLastLesson(intern.lastLessonDate, intern.daysSinceLastLesson)}
                        </div>
                      </td>
                      <td>
                        {intern.currentStreak > 0 ? (
                          <span className="badge badge-ghost">🔥 {intern.currentStreak}</span>
                        ) : (
                          <span className="text-base-content/40">—</span>
                        )}
                      </td>
                      {/* 🔴 Shtraf ustun: eng yomon daraja + jami son */}
                      <td>
                        <div className="flex flex-col items-start gap-1">
                          {penaltyBadge(intern.penaltyInfo?.worstLevel)}
                          {intern.penaltyInfo?.total > 0 && (
                            <span className="text-xs text-base-content/50">
                              {intern.penaltyInfo.total} ta
                            </span>
                          )}
                        </div>
                      </td>
                      {/* ⚠️ Darsi 1tadan kam bo'lgan internlar bilan suhbat kerakligini eslatish */}
                      <td>
                        {intern.lessonsThisMonth < 1 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-error font-semibold text-xs whitespace-nowrap">
                              ⚠️ Suhbat kerak
                            </span>
                            {tgLink(intern.telegram) && (
                              <a
                                href={tgLink(intern.telegram)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-xs btn-error btn-outline"
                              >
                                📩 Telegram
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-base-content/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredInterns.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-8 text-base-content/50">
                        Hech narsa topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default HeadInternDashboard;
