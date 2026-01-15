import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../store/slices/authSlice";
import { fetchDashboardStats } from "../store/slices/dashboardSlice";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import LoadingSpinner from "../components/UI/LoadingSpinner";
import GradeBadge from "../components/UI/GradesBadge";

import DashboardHeader from "../components/Dashboard/DashboardHeader";
import ProbationTimer from "../components/Dashboard/ProbationTimer";
import ProgressTimeline from "../components/Dashboard/ProgressTimeline";
import StatsGrid from "../components/Dashboard/StatsGrid";
import StatusPanel from "../components/Dashboard/StatusPanel";
import DashboardAlerts from "../components/Dashboard/DashboardAlerts";

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
    lessonsConfirmed,
    lessonsPending,
    totalLessons,
    monthlyGoal,
    adjustedMonthlyGoal,
    averageScore,
    overallProgress,
    probation,
    grade,
    perks,
    daysWorking,
    trialPeriodDays,
    daysRemaining,
    percentage,
    nearDeadline,
    canGetConcession,
    trialStats // 🆕 Получаем новые статы
  } = stats;

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Header Section */}
      <DashboardHeader user={user} />

      {/* Hero Section: Alerts + Grade + Timer */}
      <div className="space-y-6">
        <DashboardAlerts
          daysRemaining={daysRemaining}
          percentage={percentage} // Можно переключить на trialStats.progressPercentage если нужно
          canGetConcession={canGetConcession}
          nearDeadline={nearDeadline}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Grade Badge - занимает левую часть */}
          <div className="md:col-span-4 card bg-base-100/60 shadow-xl backdrop-blur p-6 flex flex-col justify-center items-center text-center border border-base-200">
            <h3 className="text-sm uppercase tracking-widest text-base-content/60 mb-4 font-semibold">Ваш текущий грейд</h3>
            <div className="transform scale-125 mb-2">
              <GradeBadge
                grades={user?.grades || "Ошибка"}
                grade={grade || "Не указан"}
              />
            </div>
          </div>

          {/* Timer - занимает правую часть */}
          <div className="md:col-span-8">
            <ProbationTimer
              probation={probation}
              isMobile={isMobile}
              daysWorking={daysWorking}
              trialPeriodDays={trialPeriodDays}
              daysRemaining={daysRemaining}
            // Передаем также trialStats если нужно
            />
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <StatusPanel
        lessonsConfirmed={lessonsConfirmed || lessonsThisMonth}
        lessonsPending={lessonsPending || 0}
        // adjustedMonthlyGoal={adjustedMonthlyGoal || monthlyGoal} // Removed legacy prop requirement if handled inside
        trialStats={trialStats} // 🆕 Передаём объект статистики испытательного срока
        percentage={percentage || 0}
        daysWorking={daysWorking || 0}
        trialPeriodDays={trialPeriodDays || 30}
        averageScore={averageScore}
      />

      <div className="divider opacity-50"></div>

      {/* Timeline Section */}
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-base-content px-2">Ваш путь развития</h2>
          <Link to="/activity" className="btn btn-sm btn-ghost gap-2 text-primary">
            Вся активность <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProgressTimeline
          internGrade={grade}
          grades={user?.grades}
          overallProgressPercentage={overallProgress}
          lessonsVisited={lessonsThisMonth}
          isMobile={isMobile}
        />
      </div>

      {/* Additional Stats */}
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
