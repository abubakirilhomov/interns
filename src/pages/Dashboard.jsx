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

// Импорт хука
import useMobileDetection from "../hooks/useMobileDetection";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { lessons } = useSelector((state) => state.lessons);
  const isMobile = useMobileDetection();
  console.log(user)
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchLessons());
  }, [dispatch]);

  const totalLessonsVisited = user?.lessonsVisited
    ? user.lessonsVisited.reduce(
        (total, entry) => total + (entry.count || 0),
        0
      )
    : 0;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyLessons = user?.lessonsVisited
    ? user.lessonsVisited.reduce((total, entry) => {
        const lesson = lessons.find((l) => l._id === entry.lessonId);
        if (lesson && lesson.createdAt?.slice(0, 7) === currentMonth) {
          return total + (entry.count || 0);
        }
        return total;
      }, 0)
    : 0;

  // Расчет прогресса
  const monthlyGoal = user?.goal || 0;
  const actualLessons = monthlyLessons;
  const lessonsProgressPercentage = monthlyGoal > 0 ? Math.min((actualLessons / monthlyGoal) * 100, 100) : 0;
  
  const averageScore = user?.score || 0;
  const scoreProgressPercentage = averageScore > 0 ? Math.min((averageScore / 5) * 100, 100) : 0;
  
  const overallProgressPercentage = (lessonsProgressPercentage + scoreProgressPercentage) / 2;
  
  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const lessonsStatusColor = getStatusColor(lessonsProgressPercentage);
  const scoreStatusColor = getStatusColor(scoreProgressPercentage);
  const overallStatusColor = getStatusColor(overallProgressPercentage);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }

  return (
    <div className="space-y-4 md:space-y-6 md:px-0 ">
      {/* Header */}
      <DashboardHeader user={user} />

      <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-3 md:gap-5">
        <div>
          <GradeBadge grades={user?.grades || "Оошибка с получением grades"} grade={user?.grade || "Не указан"} />
        </div>
        
        {/* Timer для испытательного срока */}
        <ProbationTimer user={user} isMobile={isMobile} />
      </div>

      {/* Progress Section - Mobile vs Desktop */}
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
      <RecentActivity 
        user={user}
        lessons={lessons}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Dashboard;