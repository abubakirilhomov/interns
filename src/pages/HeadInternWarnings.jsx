import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const HeadInternWarnings = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [tab, setTab] = useState("comment"); // "comment" | "warning"
  const [interns, setInterns] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState("");
  const [selectedRule, setSelectedRule] = useState("");
  const [notes, setNotes] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [selectedCommentIds, setSelectedCommentIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [internsRes, rulesRes] = await Promise.all([
          axios.get(`${API_URL}/interns`),
          axios.get(`${API_URL}/rules`),
        ]);

        const allInterns = internsRes.data || [];
        const branchInterns = allInterns.filter(
          (i) => String(i._id) !== String(user?._id)
        );
        setInterns(branchInterns);

        const allRules = Array.isArray(rulesRes.data)
          ? rulesRes.data
          : rulesRes.data?.data || [];
        setRules(allRules);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        toast.error(t('headIntern.loadError'));
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Tanlangan intern izohlarini yuklash
  const fetchComments = useCallback(async (internId) => {
    if (!internId) {
      setComments([]);
      setSelectedCommentIds([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/interns/${internId}/comments`);
      setComments(res.data?.comments || []);
      setSelectedCommentIds([]);
    } catch (err) {
      console.error("Izohlarni yuklashda xato:", err);
      setComments([]);
    }
  }, []);

  const handleInternChange = (internId) => {
    setSelectedIntern(internId);
    fetchComments(internId);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "black":
        return "badge-neutral";
      case "red":
        return "badge-error";
      case "yellow":
        return "badge-warning";
      case "green":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIntern || !selectedRule) {
      toast.error(t('headIntern.selectBoth'));
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/interns/${selectedIntern}/warnings`, {
        ruleId: selectedRule,
        notes,
        commentIds: selectedCommentIds,
      });

      const internName = interns.find((i) => i._id === selectedIntern);
      toast.success(
        t('headIntern.success', { name: internName?.name || "", lastName: internName?.lastName || "" })
      );
      setSelectedIntern("");
      setSelectedRule("");
      setNotes("");
      setSelectedCommentIds([]);
      setComments([]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t('headIntern.submitError');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIntern || !commentText.trim()) {
      toast.error("Intern va izoh matnini kiriting");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/interns/${selectedIntern}/comments`, {
        text: commentText,
      });
      toast.success("Izoh muvaffaqiyatli qoldirildi ✅");
      setCommentText("");
      fetchComments(selectedIntern);
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Izohni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await axios.delete(`${API_URL}/interns/${selectedIntern}/comments/${commentId}`);
      toast.success("Izoh o'chirildi");
      fetchComments(selectedIntern);
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const toggleCommentSelection = (commentId) => {
    setSelectedCommentIds((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  if (!user?.isHeadIntern) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <div className="alert alert-error">
          <span>{t('headIntern.accessDenied')}</span>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 sm:mt-10 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👑</span>
        <h2 className="text-xl font-bold">{t('headIntern.title')}</h2>
      </div>

      {/* Tab tizimi */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab tab-lg flex-1 ${tab === "comment" ? "tab-active" : ""}`}
          onClick={() => setTab("comment")}
        >
          💬 Izoh
        </button>
        <button
          className={`tab tab-lg flex-1 ${tab === "warning" ? "tab-active" : ""}`}
          onClick={() => setTab("warning")}
        >
          ⚠️ Shtraf
        </button>
      </div>

      {tab === "comment" ? (
        /* ─── IZOH TABI ─── */
        <>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <p className="text-sm text-base-content/70">
              Internlarga oddiy izoh qoldiring (shtraf emas).
            </p>

            <div>
              <label className="block font-medium mb-1">{t('headIntern.selectIntern')}</label>
              <select
                className="select select-bordered w-full"
                value={selectedIntern}
                onChange={(e) => handleInternChange(e.target.value)}
                required
              >
                <option value="">{t('headIntern.selectInternPlaceholder')}</option>
                {interns.map((intern) => (
                  <option key={intern._id} value={intern._id}>
                    {intern.name} {intern.lastName} — {intern.grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Izoh</label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Izoh matnini kiriting..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "💬 Izoh qoldirish"
              )}
            </button>
          </form>

          {/* ─── Izohlar jadvali ─── */}
          {selectedIntern && (
            <div className="mt-8">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                📋 Izohlar tarixi
                <span className="badge badge-ghost badge-sm">{comments.length}</span>
              </h3>

              {comments.length === 0 ? (
                <p className="text-sm text-base-content/60 bg-base-100 rounded-xl p-4 text-center">
                  Bu intern uchun hali izohlar yo'q
                </p>
              ) : (
                <div className="bg-base-100 shadow rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Izoh</th>
                          <th>Kimdan</th>
                          <th>Sana</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {comments.map((c, idx) => (
                          <tr key={c._id} className="hover">
                            <td>{idx + 1}</td>
                            <td className="max-w-xs">
                              <span className="text-sm">{c.text}</span>
                            </td>
                            <td>
                              <span className="text-sm text-base-content/70">
                                {c.createdByName || "—"}
                              </span>
                            </td>
                            <td>
                              <span className="text-xs text-base-content/50">
                                {new Date(c.createdAt).toLocaleDateString("uz-UZ")}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-xs btn-ghost text-error"
                                onClick={() => handleDeleteComment(c._id)}
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* ─── SHTRAF TABI ─── */
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-base-content/70">
            {t('headIntern.subtitle')}
          </p>

          <div>
            <label className="block font-medium mb-1">{t('headIntern.selectIntern')}</label>
            <select
              className="select select-bordered w-full"
              value={selectedIntern}
              onChange={(e) => handleInternChange(e.target.value)}
              required
            >
              <option value="">{t('headIntern.selectInternPlaceholder')}</option>
              {interns.map((intern) => (
                <option key={intern._id} value={intern._id}>
                  {intern.name} {intern.lastName} — {intern.grade}
                </option>
              ))}
            </select>
            {interns.length === 0 && (
              <p className="text-xs text-warning mt-1">
                {t('headIntern.noInterns')}
              </p>
            )}
          </div>

          {/* Tanlangan intern izohlari — shtrafga biriktirish */}
          {selectedIntern && comments.length > 0 && (
            <div className="bg-base-200 rounded-xl p-3">
              <p className="font-medium text-sm mb-2">
                📋 Shtrafga biriktiriladigan izohlar:
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {comments.map((c) => (
                  <label
                    key={c._id}
                    className="flex items-start gap-2 cursor-pointer bg-base-100 rounded-lg p-2 text-sm hover:bg-base-300/50"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm mt-0.5"
                      checked={selectedCommentIds.includes(c._id)}
                      onChange={() => toggleCommentSelection(c._id)}
                    />
                    <span className="flex-1">
                      <span className="block">{c.text}</span>
                      <span className="text-xs text-base-content/50">
                        {new Date(c.createdAt).toLocaleDateString("uz-UZ")} — {c.createdByName || "—"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">{t('headIntern.selectRule')}</label>
            <select
              className="select select-bordered w-full"
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value)}
              required
            >
              <option value="">{t('headIntern.selectRulePlaceholder')}</option>
              {rules.map((rule) => (
                <option key={rule._id} value={rule._id}>
                  [{rule.category?.toUpperCase()}] {rule.title}
                </option>
              ))}
            </select>

            {selectedRule && (
              <div className="mt-2">
                {(() => {
                  const rule = rules.find((r) => r._id === selectedRule);
                  if (!rule) return null;
                  return (
                    <div className="bg-base-200 rounded p-2 text-sm">
                      <span className={`badge badge-sm ${getCategoryColor(rule.category)} mr-2`}>
                        {rule.category}
                      </span>
                      <span className="font-medium">{rule.title}</span>
                      {rule.example && (
                        <p className="text-xs opacity-70 mt-1">{t('rules.exampleLabel')} {rule.example}</p>
                      )}
                      {rule.consequence && (
                        <p className="text-xs text-error mt-1">
                          {t('rules.consequenceLabel')} {rule.consequence}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">{t('headIntern.comment')}</label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder={t('headIntern.commentPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="alert alert-warning py-2">
            <span className="text-sm">
              {t('headIntern.notice')}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-warning w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              t('headIntern.submitWarning')
            )}
          </button>
        </form>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default HeadInternWarnings;