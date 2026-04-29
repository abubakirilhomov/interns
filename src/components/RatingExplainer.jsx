import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaInfoCircle, FaTimes, FaStar, FaCheckCircle, FaBook, FaChartLine } from "react-icons/fa";

const WEIGHTS = [
  { key: "weightStars",    weight: "50%", icon: FaStar,        color: "text-yellow-500" },
  { key: "weightActivity", weight: "20%", icon: FaCheckCircle, color: "text-green-500" },
  { key: "weightPlan",     weight: "20%", icon: FaBook,        color: "text-blue-500" },
  { key: "weightVolume",   weight: "10%", icon: FaChartLine,   color: "text-purple-500" },
];

const RatingExplainer = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
      >
        <FaInfoCircle />
        {t("rating.explainerLink")}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-base-100 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-base-100 border-b border-base-200 px-5 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FaInfoCircle className="text-primary" />
                  {t("rating.explainer.title")}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label={t("rating.explainer.close")}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <p className="text-sm text-base-content/80">
                  {t("rating.explainer.intro")}
                </p>

                <div className="bg-base-200 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-base-content/60 mb-2 font-semibold">
                    {t("rating.explainer.formulaHeading")}
                  </p>
                  <code className="block text-xs sm:text-sm font-mono break-words">
                    {t("rating.explainer.formula")}
                  </code>
                </div>

                <div className="space-y-3">
                  {WEIGHTS.map(({ key, weight, icon: Icon, color }) => (
                    <div key={key} className="flex gap-3 items-start">
                      <div className={`shrink-0 w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center ${color}`}>
                        <Icon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm">
                            {t(`rating.explainer.${key}`)}
                          </h3>
                          <span className="text-xs font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                            {weight}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/70 leading-relaxed">
                          {t(`rating.explainer.${key}Desc`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-base-200 pt-4">
                  <p className="text-xs uppercase tracking-wide text-base-content/60 mb-2 font-semibold">
                    {t("rating.explainer.specialsHeading")}
                  </p>
                  <ul className="space-y-2 text-sm text-base-content/80">
                    <li className="flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>{t("rating.explainer.specialBonus")}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>{t("rating.explainer.specialMentor")}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span>
                      <span>{t("rating.explainer.specialDiminishing")}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-success/10 border border-success/30 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-success mb-2 font-semibold">
                    {t("rating.explainer.tipsHeading")}
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex gap-2">
                      <span className="text-success shrink-0">✓</span>
                      <span>{t("rating.explainer.tip1")}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-success shrink-0">✓</span>
                      <span>{t("rating.explainer.tip2")}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-success shrink-0">✓</span>
                      <span>{t("rating.explainer.tip3")}</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="btn btn-primary w-full"
                >
                  {t("rating.explainer.close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RatingExplainer;
