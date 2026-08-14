import { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { submitInternshipSurvey } from "../store/slices/authSlice";

// Neutral framing: a one-time "participant questionnaire" that helps the
// program improve. Intentionally does not surface that the data feeds a
// marketing analysis around Pro-course vs intern overlap.
const InternshipSurveyModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [marsStart, setMarsStart] = useState("");
  const [internStart, setInternStart] = useState("");
  const [status, setStatus] = useState(""); // currently_studying | graduated
  const [proCourse, setProCourse] = useState(""); // "yes" | "no"
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isGraduated = status === "graduated";

  const validate = () => {
    const e = {};
    if (!marsStart) e.marsStart = t("internshipSurvey.errors.dateRequired");
    if (!internStart) e.internStart = t("internshipSurvey.errors.dateRequired");
    if (marsStart && internStart && marsStart > internStart) {
      e.internStart = t("internshipSurvey.errors.internAfterStudy");
    }
    if (marsStart && marsStart > today) e.marsStart = t("internshipSurvey.errors.futureDate");
    if (internStart && internStart > today) e.internStart = t("internshipSurvey.errors.futureDate");
    if (!status) e.status = t("internshipSurvey.errors.statusRequired");
    if (status === "graduated" && !proCourse) {
      e.proCourse = t("internshipSurvey.errors.proCourseRequired");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      marsStudyStartedAt: new Date(marsStart).toISOString(),
      becameInternAt: new Date(internStart).toISOString(),
      studyStatus: status,
    };
    if (status === "graduated") {
      payload.proCourseCompleted = proCourse === "yes";
    }

    const result = await dispatch(submitInternshipSurvey(payload));
    if (submitInternshipSurvey.fulfilled.match(result)) {
      toast.success(t("internshipSurvey.thankYou"));
      onClose?.();
    } else {
      toast.error(result.payload || t("internshipSurvey.errors.generic"));
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="survey-backdrop"
        className="fixed inset-0 bg-black/50 z-[9998] flex items-end sm:items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key="survey-modal"
          className="bg-base-100 rounded-t-3xl sm:rounded-2xl w-full max-w-md flex flex-col max-h-[90dvh] shadow-2xl overflow-hidden"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-bold">{t("internshipSurvey.title")}</h2>
              <p className="text-sm text-base-content/70 mt-1">
                {t("internshipSurvey.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm -mr-1"
              aria-label="Закрыть"
              disabled={submitting}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto px-5 pb-5 flex flex-col gap-4">
            {/* Mars study start */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">
                  {t("internshipSurvey.marsStudyStartLabel")}
                </span>
              </label>
              <input
                type="date"
                value={marsStart}
                max={today}
                onChange={(e) => {
                  setMarsStart(e.target.value);
                  setErrors((p) => ({ ...p, marsStart: null }));
                }}
                className={`input input-bordered w-full ${errors.marsStart ? "input-error" : ""}`}
                required
              />
              {errors.marsStart && (
                <span className="text-error text-xs mt-1">{errors.marsStart}</span>
              )}
            </div>

            {/* Intern start */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">
                  {t("internshipSurvey.internStartLabel")}
                </span>
              </label>
              <input
                type="date"
                value={internStart}
                max={today}
                min={marsStart || undefined}
                onChange={(e) => {
                  setInternStart(e.target.value);
                  setErrors((p) => ({ ...p, internStart: null }));
                }}
                className={`input input-bordered w-full ${errors.internStart ? "input-error" : ""}`}
                required
              />
              {errors.internStart && (
                <span className="text-error text-xs mt-1">{errors.internStart}</span>
              )}
            </div>

            {/* Status */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">
                  {t("internshipSurvey.statusLabel")}
                </span>
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="study-status"
                    value="currently_studying"
                    checked={status === "currently_studying"}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setProCourse("");
                      setErrors((p) => ({ ...p, status: null }));
                    }}
                    className="radio radio-sm radio-primary"
                  />
                  <span className="text-sm">
                    {t("internshipSurvey.statusStudying")}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="study-status"
                    value="graduated"
                    checked={status === "graduated"}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setErrors((p) => ({ ...p, status: null }));
                    }}
                    className="radio radio-sm radio-primary"
                  />
                  <span className="text-sm">
                    {t("internshipSurvey.statusGraduated")}
                  </span>
                </label>
              </div>
              {errors.status && (
                <span className="text-error text-xs mt-1">{errors.status}</span>
              )}
            </div>

            {/* Pro course — only when graduated */}
            {isGraduated && (
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium">
                    {t("internshipSurvey.proCourseLabel")}
                  </span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pro-course"
                      value="yes"
                      checked={proCourse === "yes"}
                      onChange={(e) => {
                        setProCourse(e.target.value);
                        setErrors((p) => ({ ...p, proCourse: null }));
                      }}
                      className="radio radio-sm radio-primary"
                    />
                    <span className="text-sm">{t("internshipSurvey.proCourseYes")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pro-course"
                      value="no"
                      checked={proCourse === "no"}
                      onChange={(e) => {
                        setProCourse(e.target.value);
                        setErrors((p) => ({ ...p, proCourse: null }));
                      }}
                      className="radio radio-sm radio-primary"
                    />
                    <span className="text-sm">{t("internshipSurvey.proCourseNo")}</span>
                  </label>
                </div>
                {errors.proCourse && (
                  <span className="text-error text-xs mt-1">{errors.proCourse}</span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn btn-ghost flex-1"
              >
                {t("internshipSurvey.later")}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex-1"
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    {t("internshipSurvey.submitting")}
                  </>
                ) : (
                  t("internshipSurvey.submit")
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InternshipSurveyModal;
