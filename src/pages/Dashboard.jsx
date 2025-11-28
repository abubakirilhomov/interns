import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../store/slices/authSlice";
import { fetchLessons } from "../store/slices/lessonSlice";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import GradeBadge from "../components/UI/GradesBadge";

// Импорт новых компонентов
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import ProbationTimer from "../components/Dashboard/ProbationTimer";
import MobileProgressSection from "../components/Dashboard/MobileProgressSection";
import DesktopProgressSection from "../components/Dashboard/DesktopProgressSection";
import ProgressTimeline from "../components/Dashboard/ProgressTimeline";
import StatsGrid from "../components/Dashboard/StatsGrid";
import RecentActivity from "../components/Dashboard/RecentActivity";
import QuickActions from "../components/Dashboard/QuickActions";

import useMobileDetection from "../hooks/useMobileDetection";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoading: isUserLoading } = useSelector((state) => state.auth);
  const {
    lessons,
    isLoading: isLessonsLoading,
    error,
  } = useSelector((state) => state.lessons);
  const state = useSelector((state) => state);

  const isMobile = useMobileDetection();

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchLessons());
  }, [dispatch]);

  // Если идёт загрузка
  if (isUserLoading || isLessonsLoading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }

  // Если ошибка
  if (error) {
    return <p className="text-error text-center mt-6">Ошибка: {error}</p>;
  }

  // Общие вычисления
  const totalLessonsVisited =
    user?.lessonsVisited?.reduce(
      (total, entry) => total + (entry.count || 0),
      0
    ) || 0;

const currentMonth = new Date().toISOString().slice(0, 7);

const monthlyLessons = lessons.filter(
  (l) => l.intern?._id === user._id && l.date?.slice(0, 7) === currentMonth
).length;

  const monthlyLessonsObj = lessons.filter(
  (l) => l.intern?._id === user._id && l.date?.slice(0, 7) === currentMonth
)
  const monthlyGoal = user?.goal || 0;
  const actualLessons = monthlyLessons;

  const lessonsProgressPercentage =
    monthlyGoal > 0 ? Math.min((actualLessons / monthlyGoal) * 100, 100) : 0;

  const averageScore = user?.score || 0;
  const scoreProgressPercentage =
    averageScore > 0 ? Math.min((averageScore / 5) * 100, 100) : 0;

  const overallProgressPercentage =
    (lessonsProgressPercentage + scoreProgressPercentage) / 2;

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    return "error";
  };

  const lessonsStatusColor = getStatusColor(lessonsProgressPercentage);
  const scoreStatusColor = getStatusColor(scoreProgressPercentage);
  const overallStatusColor = getStatusColor(overallProgressPercentage);

  return (
    <div className="space-y-4 md:space-y-6 md:px-0">
      {/* Header */}
      <DashboardHeader user={user} />

      <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
        <div>
          <GradeBadge
            grades={user?.grades || "Ошибка с получением grades"}
            grade={user?.grade || "Не указан"}
          />
        </div>

        <ProbationTimer user={user} isMobile={isMobile} />
      </div>

      {/* Progress Section */}
      {isMobile ? (
        <MobileProgressSection
          lessonsProgressPercentage={lessonsProgressPercentage}
          actualLessons={actualLessons}
          monthlyGoal={monthlyGoal}
          scoreProgressPercentage={scoreProgressPercentage}
          averageScore={averageScore}
          overallProgressPercentage={overallProgressPercentage}
          overallStatusColor={overallStatusColor}
        />
      ) : (
        <DesktopProgressSection
          monthlyGoal={monthlyGoal}
          actualLessons={actualLessons}
          averageScore={averageScore}
          overallProgressPercentage={overallProgressPercentage}
          overallStatusColor={overallStatusColor}
          lessonsProgressPercentage={lessonsProgressPercentage}
          lessonsStatusColor={lessonsStatusColor}
          scoreProgressPercentage={scoreProgressPercentage}
          scoreStatusColor={scoreStatusColor}
        />
      )}

      {/* Timeline прогресса */}
      <ProgressTimeline
        internGrade={user?.grade}
        grades={user?.grades}
        lessonsVisited={user?.lessonsVisited?.length}
        overallProgressPercentage={overallProgressPercentage}
        isMobile={isMobile}
      />

      {/* Основная статистика */}
      <StatsGrid
        user={user}
        totalLessonsVisited={totalLessonsVisited}
        monthlyLessons={monthlyLessons}
        isMobile={isMobile}
      />

      {/* Recent Activity */}
      <RecentActivity user={user} lessons={lessons} isMobile={isMobile} />
    </div>
  );
};

export default Dashboard;
