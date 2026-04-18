import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "pwa-install-dismissed";

const InstallPrompt = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:w-80 bg-base-100 p-4 rounded-2xl shadow-2xl border border-base-300 z-50"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-base-content text-sm">
                  {t("common.installApp", { defaultValue: "Ilovani o'rnating" })}
                </h4>
                <p className="text-xs text-base-content/50">
                  {t("common.installDesc", {
                    defaultValue: "Tezkor kirish uchun bosh ekranga qo'shing",
                  })}
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-base-content/30 hover:text-base-content/60">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleInstall}
            className="btn btn-primary btn-sm w-full"
          >
            {t("common.install", { defaultValue: "O'rnatish" })}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
