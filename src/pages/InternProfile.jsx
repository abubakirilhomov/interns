import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { ArrowLeft, GraduationCap, Star, BookOpen, Trophy } from "lucide-react";
import {
  GRADE_LABELS,
  GRADE_BADGE,
  PREMIUM_COLORS,
} from "../constants/gradeColors";

// Boshqa internning public profili (reyting sahifasidan ochiladi).
// PII yo'q — faqat ism, profil rasmi, daraja, yutuqlar va darslar soni.
const InternProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/interns/${id}/public`)
      .then((res) => setProfile(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <div className="alert alert-warning max-w-sm">
          <span>{t("internProfile.notFound")}</span>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
          {t("internProfile.back")}
        </button>
      </div>
    );
  }

  const premiumClass = profile.isHeadIntern
    ? PREMIUM_COLORS.vip
    : profile.isSenior
    ? PREMIUM_COLORS.premium
    : "";
  const premiumLabel = profile.isHeadIntern
    ? t("rating.headIntern")
    : profile.isSenior
    ? t("rating.senior")
    : "";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> {t("internProfile.back")}
      </button>

      {/* Hero */}
      <div
        className={`card shadow-xl overflow-hidden ${
          premiumClass ? premiumClass : "bg-base-100"
        }`}
      >
        <div className="card-body items-center text-center p-6">
          <div className="avatar">
            <div className="w-28 h-28 rounded-2xl ring ring-base-200 ring-offset-2 overflow-hidden">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-base-300 flex items-center justify-center text-4xl font-bold">
                  {profile.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold mt-4">
            {profile.name} {profile.lastName}
          </h1>
          <p className="opacity-70 text-sm">@{profile.username}</p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className={`badge ${GRADE_BADGE[profile.grade] || "badge-ghost"} badge-lg font-semibold`}>
              {GRADE_LABELS[profile.grade] || profile.grade}
            </span>
            {premiumLabel && (
              <span className="badge badge-lg bg-base-100 text-base-content border-0 shadow">
                {profile.isHeadIntern ? "👑" : "🏅"} {premiumLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 items-center text-center">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold">{profile.totalLessons}</span>
            <span className="text-xs text-base-content/50">
              {t("internProfile.lessons")}
            </span>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 items-center text-center">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold">{profile.badgeCount}</span>
            <span className="text-xs text-base-content/50">
              {t("internProfile.achievements")}
            </span>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 items-center text-center">
            <GraduationCap className="w-5 h-5 text-success" />
            <span className="text-2xl font-bold">{profile.helpedStudents || 0}</span>
            <span className="text-xs text-base-content/50">
              {t("internProfile.helpedStudents")}
            </span>
          </div>
        </div>
      </div>

      {/* Achievements / Collections */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-5">
          <h3 className="font-bold text-sm text-base-content/60 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" /> {t("internProfile.collections")}
          </h3>
          {profile.badges?.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {profile.badges.map((b, idx) => (
                <div
                  key={b.key || idx}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-primary/20 bg-base-100"
                >
                  <span className="text-3xl">{b.icon}</span>
                  <span className="text-[10px] font-semibold text-center text-base-content/70 leading-tight mt-1">
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-content/40">
              {t("internProfile.noBadges")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternProfile;
