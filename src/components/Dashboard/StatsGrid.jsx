import { useTranslation } from 'react-i18next';
import StatsCard from "../UI/StatsCard";

const StatsGrid = ({ averageScore, grade, totalLessonsVisited, monthlyLessons, isMobile }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatsCard
        title={t('dashboard.avgScoreLabel')}
        value={typeof averageScore === 'number' ? averageScore.toFixed(1) : "0.0"}
        icon="⭐"
        trend="up"
        trendValue="+0.2"
        colorClass="text-warning"
      />

      <StatsCard
        title={isMobile ? t('dashboard.lessonsCompletedMobile') : t('dashboard.lessonsCompleted')}
        value={totalLessonsVisited}
        icon="📚"
        trend="up"
        trendValue={`+${monthlyLessons}`}
        colorClass="text-info"
      />

      <StatsCard
        title={isMobile ? t('dashboard.feedbackReceivedMobile') : t('dashboard.feedbackReceived')}
        value={0}
        icon="💬"
        colorClass="text-success"
      />

      <StatsCard
        title={t('dashboard.level')}
        value={grade || "Junior"}
        icon="🎯"
        colorClass="text-secondary"
      />
    </div>
  );
};

export default StatsGrid;
