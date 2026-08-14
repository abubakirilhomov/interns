import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import BadgeCard from "./BadgeCard";

const CATEGORY_ORDER = ["lessons", "streak", "quality", "grade", "special"];
const CATEGORY_ICONS = {
  lessons: "📚",
  streak: "🔥",
  quality: "⭐",
  grade: "📈",
  special: "🏆",
};
const CATEGORY_LABELS = {
  ru: { lessons: "Уроки", streak: "Серия", quality: "Качество", grade: "Грейд", special: "Особые" },
  uz: { lessons: "Darslar", streak: "Seriya", quality: "Sifat", grade: "Daraja", special: "Maxsus" },
};

const BadgeShowcase = () => {
  const { t, i18n } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/interns/me/badges")
      .then((res) => setBadges(res.data?.badges || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card bg-base-100 shadow p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-base-300 rounded w-32" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-base-300 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const earnedCount = badges.filter((b) => b.earned).length;
  const grouped = {};
  for (const cat of CATEGORY_ORDER) {
    const items = badges.filter((b) => b.category === cat);
    if (items.length > 0) grouped[cat] = items;
  }

  const labels = CATEGORY_LABELS[i18n.language] || CATEGORY_LABELS.ru;

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-base-content/60 uppercase tracking-wide">
            {t("gamification.badges")}
          </h3>
          <span className="text-xs text-base-content/40">
            {earnedCount}/{badges.length}
          </span>
        </div>

        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-4">
            <p className="text-xs font-semibold text-base-content/40 mb-2 flex items-center gap-1">
              <span>{CATEGORY_ICONS[cat]}</span> {labels[cat] || cat}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {items.map((badge) => (
                <BadgeCard key={badge.key} badge={badge} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeShowcase;
