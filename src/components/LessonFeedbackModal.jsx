import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const LessonFeedbackModal = ({ lessonId, onSuccess }) => {
  const [submitError, setSubmitError] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingCriteria, setLoadingCriteria] = useState(true);
  const [criteriaError, setCriteriaError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCriteria = async () => {
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
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const toggleCriteria = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await axios.patch(`${API_URL}/lessons/${lessonId}/intern-feedback`, {
        criteria: selectedIds,
      });
      onSuccess();
    } catch {
      setSubmitError("Юборишда хатолик юз берди. Қайта уриниб кўринг.");
    } finally {
      setSubmitting(false);
    }
  };

  const negativeCriteria = criteria.filter((c) => c.type === "negative");
  const positiveCriteria = criteria.filter((c) => c.type === "positive");

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md w-full">
        <h3 className="font-bold text-lg">Дарсни баҳоланг</h3>
        <p className="text-sm text-base-content/60 mt-1 mb-4">
          Бу маълумот менторларга кўрсатилмайди
        </p>

        {loadingCriteria && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md" />
          </div>
        )}

        {!loadingCriteria && criteriaError && (
          <div className="text-center py-6">
            <p className="text-error mb-3">Критерийларни юклаб бўлмади</p>
            <button
              className="btn btn-outline btn-sm"
              onClick={fetchCriteria}
            >
              Қайта уриниб кўринг
            </button>
          </div>
        )}

        {!loadingCriteria && !criteriaError && (
          <>
            {negativeCriteria.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <span>Минуслар</span>
                </p>
                <div className="space-y-2">
                  {negativeCriteria.map((c) => (
                    <label
                      key={c._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-error"
                        checked={selectedIds.includes(c._id)}
                        onChange={() => toggleCriteria(c._id)}
                      />
                      <span className="text-sm">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {positiveCriteria.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <span>Плюслар</span>
                </p>
                <div className="space-y-2">
                  {positiveCriteria.map((c) => (
                    <label
                      key={c._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-success"
                        checked={selectedIds.includes(c._id)}
                        onChange={() => toggleCriteria(c._id)}
                      />
                      <span className="text-sm">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {criteria.length === 0 && (
              <p className="text-sm text-base-content/50 text-center py-4">
                Критерийлар топилмади
              </p>
            )}
          </>
        )}

        {submitError && (
          <p className="text-error text-sm mt-3">{submitError}</p>
        )}

        <div className="modal-action mt-4">
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
      </div>
    </div>
  );
};

export default LessonFeedbackModal;
