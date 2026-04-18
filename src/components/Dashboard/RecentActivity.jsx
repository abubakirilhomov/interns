import React from "react";
import { useTranslation } from 'react-i18next';

const RecentActivity = ({ user = {}, lessons = [], isMobile = false }) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uz' ? 'uz-Latn' : 'ru-RU';
  const feedbacks = Array.isArray(user.feedbacks) ? user.feedbacks : [];
  const lessonsVisited = Array.isArray(user.lessonsVisited)
    ? user.lessonsVisited
    : [];

  // Group visited lessons by month
  const monthlyProgress = lessonsVisited.reduce((acc, entry) => {
    const lesson = lessons.find((l) => l._id === entry?.lessonId);
    if (!lesson || !lesson.createdAt) return acc;

    const month = lesson.createdAt.slice(0, 7); // "YYYY-MM"
    acc[month] = (acc[month] || 0) + (entry.count || 0);
    return acc;
  }, {});

  const sortedMonths = Object.entries(monthlyProgress)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, isMobile ? 4 : 6);

  return (
    <div
      className={`grid ${
        isMobile ? "grid-cols-1 gap-4" : "grid-cols-1 lg:grid-cols-2 gap-6"
      }`}
    >
      {/* Reviews */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title text-base md:text-lg mb-4">
            {isMobile ? t('dashboard.reviews') : t('dashboard.recentReviews')}
          </h3>

          {feedbacks.length > 0 ? (
            <div className="space-y-3 max-h-[20vh] overflow-y-auto">
              {feedbacks.map((feedback, index) => (
                <div
                  key={index}
                  className="relative flex items-start space-x-3 p-3 bg-base-200 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="badge badge-warning">
                      {feedback?.stars || 0}⭐
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-base-content/50 select-none">
                      {feedback?.feedback
                        ? feedback.feedback
                        : isMobile
                        ? "-"
                        : t('dashboard.noCommentAdded')}
                    </p>
                    <p className="text-xs text-base-content/40 mt-1 select-none">
                      {t('dashboard.dateHidden')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-base-content/60">
              <p>{t('dashboard.noReviewsYet')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress by months */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title text-base md:text-lg mb-4">
            {isMobile ? t('dashboard.byMonths') : t('dashboard.progressByMonths')}
          </h3>

          {sortedMonths.length > 0 ? (
            <div className="space-y-3">
              {sortedMonths.map(([month, count]) => {
                let monthLabel = t('dashboard.unknownMonth');

                try {
                  monthLabel = new Date(`${month}-01`).toLocaleDateString(
                    dateLocale,
                    {
                      year: isMobile ? "2-digit" : "numeric",
                      month: isMobile ? "short" : "long",
                    }
                  );
                } catch {
                  monthLabel = t('dashboard.unknownMonth');
                }

                return (
                  <div
                    key={month}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <span
                      className={`font-medium ${
                        isMobile ? "text-sm" : "text-base"
                      }`}
                    >
                      {monthLabel}
                    </span>
                    <div
                      className={`badge badge-primary ${
                        isMobile ? "badge-sm" : ""
                      }`}
                    >
                      {count} {isMobile ? "" : t('common.lessons')}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-base-content/60">
              <p className={isMobile ? "text-sm" : ""}>
                {t('dashboard.noLessonsData')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
