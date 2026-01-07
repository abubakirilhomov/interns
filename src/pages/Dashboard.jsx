import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../store/slices/authSlice";
import { fetchDashboardStats } from "../store/slices/dashboardSlice";

import LoadingSpinner from "../components/UI/LoadingSpinner";
import GradeBadge from "../components/UI/GradesBadge";

import DashboardHeader from "../components/Dashboard/DashboardHeader";
import ProbationTimer from "../components/Dashboard/ProbationTimer";
import MobileProgressSection from "../components/Dashboard/MobileProgressSection";
import DesktopProgressSection from "../components/Dashboard/DesktopProgressSection";
import ProgressTimeline from "../components/Dashboard/ProgressTimeline";
import StatsGrid from "../components/Dashboard/StatsGrid";

import useMobileDetection from "../hooks/useMobileDetection";

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user, isLoading: isUserLoading } = useSelector((state) => state.auth);
  const { stats, isLoading, error } = useSelector(
    (state) => state.dashboard
  );

  const isMobile = useMobileDetection();

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isUserLoading || isLoading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }

  if (error) {
    return <p className="text-error text-center mt-6">Ошибка: {error}</p>;
  }

  if (!stats) return null;

  const {
    lessonsThisMonth,
    totalLessons,
    monthlyGoal,
    averageScore,
    overallProgress,
    probation,
    grade,
    perks,
  } = stats;
  console.log(stats)
  return (
    <div className="space-y-4 md:space-y-6 md:px-0">
      {/* Header */}
      <DashboardHeader user={user} />

      <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
        <GradeBadge
          grades={user?.grades || "Ошибка"}
          grade={grade || "Не указан"}
        />

        <ProbationTimer probation={probation} isMobile={isMobile} />
      </div>

      {/* Progress */}
      {isMobile ? (
        <MobileProgressSection
          actualLessons={lessonsThisMonth}
          monthlyGoal={monthlyGoal}
          averageScore={Number(averageScore)}
          lessonsProgressPercentage={(lessonsThisMonth / monthlyGoal) * 100 || 0}
          scoreProgressPercentage={(Number(averageScore) / 5) * 100 || 0}
          overallProgressPercentage={overallProgress}
          overallStatusColor={
            overallProgress >= 80
              ? "success"
              : overallProgress >= 50
                ? "warning"
                : "error"
          }
        />
      ) : (
        <DesktopProgressSection
          actualLessons={lessonsThisMonth}
          monthlyGoal={monthlyGoal}
          averageScore={Number(averageScore)}
          lessonsProgressPercentage={(lessonsThisMonth / monthlyGoal) * 100 || 0}
          lessonsStatusColor={
            (lessonsThisMonth / monthlyGoal) * 100 >= 80
              ? "success"
              : (lessonsThisMonth / monthlyGoal) * 100 >= 50
                ? "warning"
                : "error"
          }
          scoreProgressPercentage={(Number(averageScore) / 5) * 100 || 0}
          scoreStatusColor={
            (Number(averageScore) / 5) * 100 >= 80
              ? "success"
              : (Number(averageScore) / 5) * 100 >= 50
                ? "warning"
                : "error"
          }
          overallProgressPercentage={overallProgress}
          overallStatusColor={
            overallProgress >= 80
              ? "success"
              : overallProgress >= 50
                ? "warning"
                : "error"
          }
        />
      )}

      {/* Timeline */}
      <ProgressTimeline
        internGrade={grade}
        grades={user?.grades}
        overallProgressPercentage={overallProgress}
        lessonsVisited={lessonsThisMonth}
        isMobile={isMobile}
      />

      {/* Stats */}
      <StatsGrid
        totalLessonsVisited={totalLessons}
        monthlyLessons={lessonsThisMonth}
        averageScore={Number(averageScore)}
        grade={grade}
        perks={perks}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Dashboard;
