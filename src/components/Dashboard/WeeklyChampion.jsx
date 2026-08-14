import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";

const WeeklyChampion = ({ champion, currentUserId }) => {
  const { t } = useTranslation();

  if (!champion) return null;

  const isMe = champion.internId === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card shadow-lg overflow-hidden ${
        isMe
          ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-amber-950"
          : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-200"
      }`}
    >
      <div className="card-body p-4 flex-row items-center gap-3">
        <div className="flex-shrink-0">
          {champion.profilePhoto ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow">
              <img src={champion.profilePhoto} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">
            {t("gamification.weeklyChampion")}
          </p>
          <p className="text-base font-bold truncate">
            {isMe ? `🎉 ${champion.name} (${t("common.confirmed")}!)` : champion.name}
          </p>
          <p className="text-xs opacity-70">
            {champion.lessons} {t("common.lessons")} · {champion.grade}
          </p>
        </div>

        <div className="text-4xl flex-shrink-0">🏆</div>
      </div>
    </motion.div>
  );
};

export default WeeklyChampion;
