import StatsCard from "../UI/StatsCard";

const StatsGrid = ({ averageScore, grade, totalLessonsVisited, monthlyLessons, isMobile }) => (
  <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
    <StatsCard
      title="Средний балл"
      value={typeof averageScore === 'number' ? averageScore.toFixed(1) : "0.0"}
      icon="⭐"
      trend="up"
      trendValue="+0.2"
      colorClass="text-warning"
    />

    <StatsCard
      title={isMobile ? "Уроков" : "Уроков пройдено"}
      value={totalLessonsVisited}
      icon="📚"
      trend="up"
      trendValue={`+${monthlyLessons}`}
      colorClass="text-info"
    />

    <StatsCard
      title={isMobile ? "Отзывов" : "Отзывов получено"}
      value={0}
      icon="💬"
      colorClass="text-success"
    />

    <StatsCard
      title="Уровень"
      value={grade || "Junior"}
      icon="🎯"
      colorClass="text-secondary"
    />
  </div>
);

export default StatsGrid;