import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { submitContactInfo } from "../store/slices/authSlice";

// Mandatory, non-dismissible: shown to any intern with neither phoneNumber nor
// telegram on file, until they enter at least one. No onClose/backdrop-click
// dismiss on purpose — unlike InternshipSurveyModal, this one guards data the
// program genuinely can't reach the intern without.
const ContactInfoModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegram, setTelegram] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const phone = phoneNumber.trim();
    const tg = telegram.trim();
    if (!phone && !tg) {
      setError(t("contactInfoModal.errorRequired"));
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await dispatch(submitContactInfo({ phoneNumber: phone, telegram: tg }));
    setSubmitting(false);
    if (submitContactInfo.fulfilled.match(result)) {
      toast.success(t("contactInfoModal.saved"));
    } else {
      setError(result.payload || t("contactInfoModal.errorGeneric"));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="contact-info-backdrop"
        className="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key="contact-info-modal"
          className="bg-base-100 rounded-t-3xl sm:rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
        >
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-base-content">{t("contactInfoModal.title")}</h2>
              <p className="text-sm text-base-content/60 mt-1">{t("contactInfoModal.subtitle")}</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">{t("contactInfoModal.phoneLabel")}</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input input-bordered w-full"
                placeholder="+998 90 123 45 67"
                autoFocus
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">{t("contactInfoModal.telegramLabel")}</span>
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="input input-bordered w-full"
                placeholder="@username"
              />
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? t("contactInfoModal.submitting") : t("contactInfoModal.submit")}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContactInfoModal;
