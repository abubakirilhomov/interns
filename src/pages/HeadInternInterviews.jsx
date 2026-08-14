import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const statusBadge = (status) => {
  switch (status) {
    case "passed":
      return <span className="badge badge-success gap-1">🟢 O'tgan</span>;
    case "failed":
      return <span className="badge badge-error gap-1">🔴 O'tmagan</span>;
    default:
      return <span className="badge badge-warning gap-1">🟡 Topshirmagan</span>;
  }
};

// Har bir savol uchun natija tablitsasi
const RESULT_OPTIONS = [
  { value: "correct", label: "✓ To'g'ri", color: "badge-success" },
  { value: "partial", label: "◐ Chala", color: "badge-warning" },
  { value: "wrong", label: "✗ Noto'g'ri", color: "badge-error" },
];

const RESULT_SCORE = { correct: 10, partial: 5, wrong: 0 };

const HeadInternInterviews = () => {
  const { user } = useSelector((state) => state.auth);
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalIntern, setModalIntern] = useState(null);
  const [questions, setQuestions] = useState([
    { text: "", result: "correct", note: "" },
    { text: "", result: "correct", note: "" },
    { text: "", result: "correct", note: "" },
  ]);
  const [resultNote, setResultNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null); // { percentage, status, wrongQuestions }

  useEffect(() => {
    fetchStatus();
  }, [month]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/monthly-interviews/status?month=${month}`);
      setData(res.data);
    } catch (err) {
      console.error("Oylik imtihon statusini yuklashda xato:", err);
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (intern, status) => {
    setModalIntern(intern);
    setQuestions([
      { text: "", result: "correct", note: "" },
      { text: "", result: "correct", note: "" },
      { text: "", result: "correct", note: "" },
    ]);
    setResultNote("");
    setSubmittedResult(null);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: "", result: "correct", note: "" }]);
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Avtomatik foiz hisoblash (jonli): to'g'ri=10%, chala=5%, noto'g'ri=0%
  const calculatePercentage = () => {
    const validQuestions = questions.filter((q) => q.text.trim().length > 0);
    if (validQuestions.length === 0) return 0;
    const total = validQuestions.reduce(
      (sum, q) => sum + (RESULT_SCORE[q.result] ?? 0),
      0
    );
    return Math.min(100, Math.round(total));
  };

  const livePercentage = calculatePercentage();
  const liveTotalQuestions = questions.filter((q) => q.text.trim().length > 0).length;
  const liveStatus = livePercentage >= 50 ? "passed" : "failed";

  const handleSubmit = async () => {
    const validQuestions = questions.filter((q) => q.text.trim().length > 0);
    if (validQuestions.length < 3) {
      toast.error("Kamida 3 ta savol kiritilishi shart");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/monthly-interviews/conduct`, {
        internId: modalIntern._id,
        month,
        questions: validQuestions,
        resultNote,
      });

      // Noto'g'ri javoblarni chiqarish
      const wrongQuestions = validQuestions.filter((q) => q.result === "wrong");
      const partialQuestions = validQuestions.filter((q) => q.result === "partial");

      setSubmittedResult({
        percentage: res.data.percentage,
        status: res.data.status,
        wrongQuestions,
        partialQuestions,
      });

      toast.success(
        res.data.status === "passed"
          ? `Imtihon muvaffaqiyatli — ${res.data.percentage}%! 🎉`
          : `Imtihon saqlandi — ${res.data.percentage}%`
      );
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
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

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 sm:mt-10 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-3xl">🗓️</span>
        <h2 className="text-2xl font-bold">Oylik Imtihon (Suhbat) Paneli</h2>
      </div>

      {/* Oy tanlash */}
      <div className="mb-6 flex items-center gap-3">
        <label className="font-medium">Oy:</label>
        <input
          type="month"
          className="input input-bordered input-sm"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button className="btn btn-sm btn-ghost" onClick={fetchStatus}>
          🔄 Yangilash
        </button>
      </div>

      {/* Indikator banner */}
      {data && (
        <div
          className={`alert mb-6 ${
            data.alertNeeded
              ? data.pending > 0
                ? "alert-error"
                : "alert-warning"
              : "alert-success"
          }`}
        >
          {data.alertNeeded ? (
            data.pending > 0 ? (
              <span>
                ⚠️ Bu oy hali <b>{data.pending} ta</b> intern imtihon topshirmagan!
                ({data.failed} ta o'tmagan, {data.passed} ta o'tgan)
              </span>
            ) : (
              <span>⚠️ Bu oy imtihon o'tkazilmagan!</span>
            )
          ) : (
            <span>✅ Bu oy barcha internlar imtihon topshirgan!</span>
          )}
        </div>
      )}

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
              <div className="stat-value text-lg">{data.totalInterns}</div>
            </div>
            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-title">🟡 Topshirmagan</div>
              <div className="stat-value text-lg text-warning">{data.pending}</div>
            </div>
            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-title">🟢 O'tgan</div>
              <div className="stat-value text-lg text-success">{data.passed}</div>
            </div>
            <div className="stat bg-base-100 shadow rounded-xl">
              <div className="stat-title">🔴 O'tmagan</div>
              <div className="stat-value text-lg text-error">{data.failed}</div>
            </div>
          </div>

          {/* Ro'yxat */}
          <div className="bg-base-100 shadow rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Intern</th>
                    <th>Grade</th>
                    <th>Holat</th>
                    <th>Natija</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, idx) => (
                    <tr key={item.intern._id} className="hover">
                      <td>{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10 h-10">
                              <span>
                                {(item.intern.name?.[0] || "?").toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">
                              {item.intern.name} {item.intern.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {item.intern.grade}
                        </span>
                      </td>
                      <td>{statusBadge(item.status)}</td>
                      <td>
                        {item.percentage != null ? (
                          <span
                            className={
                              item.status === "passed"
                                ? "text-success font-bold"
                                : "text-error font-bold"
                            }
                          >
                            {item.percentage}%
                          </span>
                        ) : (
                          <span className="text-base-content/40">—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal(item.intern, item.status)}
                        >
                          {item.status === "pending"
                            ? "Imtihon o'tkazish"
                            : "Qayta o'tkazish"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-base-content/50">
                        Bu oyda internlar yo'q
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Imtihon o'tkazish modali */}
      {modalIntern && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setModalIntern(null)}
            >
              ✕
            </button>

            <h3 className="font-bold text-lg mb-4">
              Imtihon: {modalIntern.name} {modalIntern.lastName}{" "}
              <span className="badge badge-ghost badge-sm ml-2">
                {modalIntern.grade}
              </span>
            </h3>

            {/* Jonli foiz hisoblagich */}
            {liveTotalQuestions >= 3 && (
              <div
                className={`alert ${
                  liveStatus === "passed" ? "alert-success" : "alert-error"
                } py-2 mb-4`}
              >
                <span className="font-semibold">
                  {livePercentage}% —{" "}
                  {liveStatus === "passed" ? "O'tadi ✅" : "O'tmaydi ❌"}
                </span>
              </div>
            )}

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {questions.map((q, idx) => (
                <div key={idx} className="card bg-base-200 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-neutral badge-sm">{idx + 1}</span>
                    <input
                      type="text"
                      className="input input-bordered input-sm flex-1"
                      placeholder="Savol matnini kiriting..."
                      value={q.text}
                      onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                    />
                    <button
                      className="btn btn-xs btn-ghost text-error"
                      onClick={() => removeQuestion(idx)}
                      disabled={questions.length <= 3}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <select
                        className="select select-bordered select-sm"
                        value={q.result}
                        onChange={(e) =>
                          updateQuestion(idx, "result", e.target.value)
                        }
                      >
                        {RESULT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span
                      className={`badge badge-sm ${
                        RESULT_OPTIONS.find((o) => o.value === q.result)?.color ||
                        "badge-ghost"
                      }`}
                    >
                      {RESULT_SCORE[q.result] ?? 0}%
                    </span>
                    <input
                      type="text"
                      className="input input-bordered input-sm flex-1"
                      placeholder="Izoh (ixtiyoriy)..."
                      value={q.note}
                      onChange={(e) => updateQuestion(idx, "note", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-sm btn-outline mt-3 w-full" onClick={addQuestion}>
              ➕ Savol qo'shish
            </button>

            <div className="mt-4">
              <label className="block font-medium mb-1">Umumiy izoh / natija</label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={2}
                placeholder="Masalan: Yaxshi tayyorgarlik, lekin hooks bo'limini takrorlash kerak..."
                value={resultNote}
                onChange={(e) => setResultNote(e.target.value)}
              />
            </div>

            {/* Natija ko'rsatish (submitdan keyin) */}
            {submittedResult && (
              <div
                className={`mt-4 rounded-xl p-4 border ${
                  submittedResult.status === "passed"
                    ? "bg-success/10 border-success/30"
                    : "bg-error/10 border-error/30"
                }`}
              >
                <p className="font-bold text-lg">
                  Natija: {submittedResult.percentage}% —{" "}
                  {submittedResult.status === "passed" ? "O'tdi ✅" : "O'tmadi ❌"}
                </p>

                {submittedResult.wrongQuestions.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-error mb-2">
                      ✗ Noto'g'ri javoblar ({submittedResult.wrongQuestions.length}):
                    </p>
                    <ul className="space-y-1">
                      {submittedResult.wrongQuestions.map((q, i) => (
                        <li key={i} className="text-sm bg-base-100 rounded-lg p-2">
                          <span className="font-medium">{q.text}</span>
                          {q.note && (
                            <span className="block text-xs text-base-content/60 mt-1">
                              Izoh: {q.note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {submittedResult.partialQuestions.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-warning mb-2">
                      ◐ Chala javoblar ({submittedResult.partialQuestions.length}):
                    </p>
                    <ul className="space-y-1">
                      {submittedResult.partialQuestions.map((q, i) => (
                        <li key={i} className="text-sm bg-base-100 rounded-lg p-2">
                          <span className="font-medium">{q.text}</span>
                          {q.note && (
                            <span className="block text-xs text-base-content/60 mt-1">
                              Izoh: {q.note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {submittedResult.wrongQuestions.length === 0 &&
                  submittedResult.partialQuestions.length === 0 && (
                    <p className="text-sm mt-2 text-success">
                      Barcha savollar to'g'ri! 🔥
                    </p>
                  )}
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setModalIntern(null)}>
                Bekor qilish
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Tekshirish va saqlash"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default HeadInternInterviews;