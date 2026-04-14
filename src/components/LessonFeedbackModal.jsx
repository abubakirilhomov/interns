import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const CATEGORY_ICONS = {
  communication: "💬",
  tempo:         "⚡",
  discipline:    "📋",
  content:       "📚",
  other:         "📝",
};

const CATEGORY_LABELS = {
  communication: "Коммуникация",
  tempo:         "Темп",
  discipline:    "Дисциплина",
  content:       "Мавзу",
  other:         "Бошқа",
};

const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const k = item[key] || "other";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});

export const PENDING_FEEDBACK_KEY = "pendingFeedbackLessonId";

const LessonFeedbackModal = ({ lessonId, onSuccess }) => {
  const [criteria, setCriteria]               = useState([]);
  const [selectedIds, setSelectedIds]         = useState([]);
  const [comment, setComment]                 = useState("");
  const [loadingCriteria, setLoadingCriteria] = useState(true);
  const [criteriaError, setCriteriaError]     = useState(false);
  const [submitting, setSubmitting]           = useState(false);
  const [submitError, setSubmitError]         = useState(null);
  const [isMobile, setIsMobile]               = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchCriteria = useCallback(async () => {
    setLoadingCriteria(true);
    setCriteriaError(false);
    try {
      const res = await axios.get(`${API_URL}/lesson-criteria`);
      setCriteria(res.data || []);
    } catch {
      setCriteriaError(true);
    } finally {
      setLoadingCriteria(false);
    }
  }, []);

  useEffect(() => {
    fetchCriteria();
  }, [fetchCriteria]);

  const toggleCriteria = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0 && comment.trim().length === 0) {
      setSubmitError("Камида биtta критерий танланг ёки фикрингизни ёзинг");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await axios.patch(`${API_URL}/lessons/${lessonId}/intern-feedback`, {
        criteria: selectedIds,
        comment,
      });
      localStorage.removeItem(PENDING_FEEDBACK_KEY);
      onSuccess();
    } catch (err) {
      if (err?.response?.status === 409) {
        // Already submitted — just close the modal
        localStorage.removeItem(PENDING_FEEDBACK_KEY);
        onSuccess();
        return;
      }
      setSubmitError("Юборишда хатолик юз берди. Қайта уриниб кўринг.");
    } finally {
      setSubmitting(false);
    }
  };

  const negativeCriteria = criteria.filter((c) => c.type === "negative");
  const positiveCriteria = criteria.filter((c) => c.type === "positive");
  const negativeGroups   = groupBy(negativeCriteria, "category");
  const positiveGroups   = groupBy(positiveCriteria, "category");
  const selectedCount    = selectedIds.length;

  const backdropVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
  };

  const mobileVariants = {
    hidden:  { y: "100%" },
    visible: { y: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
    exit:    { y: "100%", transition: { duration: 0.2 } },
  };

  const desktopVariants = {
    hidden:  { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  const renderGroup = (groups, type) =>
    Object.entries(groups).map(([category, items]) => (
      <div key={category} className="mb-3">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-1.5 flex items-center gap-1">
          <span>{CATEGORY_ICONS[category] || "📝"}</span>
          {CATEGORY_LABELS[category] || category}
        </p>
        <div className="space-y-1">
          {items.map((c) => {
            const checked = selectedIds.includes(c._id);
            return (
              <label
                key={c._id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors border ${
                  checked
                    ? type === "negative"
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                    : "bg-base-200/40 border-transparent hover:bg-base-200"
                }`}
              >
                <input
                  type="checkbox"
                  className={`checkbox checkbox-sm flex-shrink-0 ${
                    type === "negative" ? "checkbox-error" : "checkbox-success"
                  }`}
                  checked={checked}
                  onChange={() => toggleCriteria(c._id)}
                />
                <span className="text-sm leading-snug flex-1">{c.label}</span>
                {type === "negative" && c.weight >= 3 && (
                  <span className="text-xs text-red-400 font-medium flex-shrink-0">жиддий</span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    ));

  const content = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg leading-tight">Дарсни баҳоланг</h3>
          <p className="text-xs text-base-content/40 mt-0.5">
            Бу маълумот менторларга кўрсатилмайди
          </p>
        </div>
        {selectedCount > 0 && (
          <span className="badge badge-primary badge-sm mt-1 flex-shrink-0">
            {selectedCount} танланди
          </span>
        )}
      </div>

      {/* Body */}
      {loadingCriteria ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : criteriaError ? (
        <div className="text-center py-8">
          <p className="text-error text-sm mb-3">Критерийларни юклаб бўлмади</p>
          <button className="btn btn-outline btn-sm" onClick={fetchCriteria}>
            Қайта уриниб кўринг
          </button>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 space-y-1 pb-1">
          {/* Negative */}
          {Object.keys(negativeGroups).length > 0 && (
            <div className="mb-4">
              <p className="font-semibold text-sm text-error mb-2">
                ❌ Камчиликлар
              </p>
              {renderGroup(negativeGroups, "negative")}
            </div>
          )}

          {/* Positive */}
          {Object.keys(positiveGroups).length > 0 && (
            <div className="mb-4">
              <p className="font-semibold text-sm text-success mb-2">
                ✅ Яхши томонлар
              </p>
              {renderGroup(positiveGroups, "positive")}
            </div>
          )}

          {/* Custom comment */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-1.5">
              ✍️ Ўз фикрингиз (ихтиёрий)
            </p>
            <textarea
              className="textarea textarea-bordered w-full text-sm resize-none"
              rows={3}
              maxLength={500}
              placeholder="Дарс ҳақида қўшимча фикрингиз бор бўлса ёзинг..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className="text-right text-xs text-base-content/30 mt-0.5">
              {comment.length}/500
            </p>
          </div>
        </div>
      )}

      {submitError && (
        <p className="text-error text-sm mt-2 text-center">{submitError}</p>
      )}

      <div className="mt-4 pt-3 border-t border-base-200">
        <button
          className="btn btn-primary w-full"
          onClick={handleSubmit}
          disabled={submitting || loadingCriteria || criteriaError}
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Юборилмоқда...
            </>
          ) : (
            "Юбориш"
          )}
        </button>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {isMobile ? (
          <motion.div
            key="sheet"
            className="w-full bg-base-100 rounded-t-3xl px-4 pt-3 pb-8 flex flex-col max-h-[90dvh]"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="w-10 h-1 bg-base-300 rounded-full mx-auto mb-4 flex-shrink-0" />
            {content}
          </motion.div>
        ) : (
          <motion.div
            key="modal"
            className="bg-base-100 rounded-2xl p-6 w-full max-w-md mx-4 flex flex-col max-h-[85dvh] shadow-2xl"
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {content}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LessonFeedbackModal;
