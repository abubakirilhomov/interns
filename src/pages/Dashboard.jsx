import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { fetchProfile } from "../store/slices/authSlice";
import { fetchDashboardStats } from "../store/slices/dashboardSlice";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { DashboardSkeleton } from "../components/UI/Skeleton";
import GradeBadge from "../components/UI/GradesBadge";

import DashboardHeader from "../components/Dashboard/DashboardHeader";
import InfoTooltip from "../components/UI/InfoTooltip";
import ProbationTimer from "../components/Dashboard/ProbationTimer";
import ProgressTimeline from "../components/Dashboard/ProgressTimeline";
import StatsGrid from "../components/Dashboard/StatsGrid";
import StatusPanel from "../components/Dashboard/StatusPanel";
import DashboardAlerts from "../components/Dashboard/DashboardAlerts";
import PlanProgressWidget from "../components/Dashboard/PlanProgressWidget";
import QuickActions from "../components/Dashboard/QuickActions";
import WeeklyChampion from "../components/Dashboard/WeeklyChampion";
import RecentActivityWidget from "../components/Dashboard/RecentActivity";
import LocationShare from "../components/LocationShare";

import useMobileDetection from "../hooks/useMobileDetection";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

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
    return <DashboardSkeleton />;
  }

  if (error) {
    return <p className="text-error text-center mt-6">{t('dashboard.error', { error })}</p>;
  }

  if (!stats) {
    return (
      <div className="space-y-6 pb-10">
        <DashboardHeader user={user} streak={null} />
        <div className="card bg-base-100 shadow p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-bold text-base-content mb-2">{t('tooltips.emptyLessons')}</h3>
          <QuickActions isMobile={isMobile} />
        </div>
      </div>
    );
  }

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
    trialStats,
    planStatus,
    recentReviews,
    streak,
    ranking,
    weeklyChampion,
  } = stats;
  const isFrozen = Boolean(user?.status === "frozen" || user?.isFrozen || planStatus?.isFrozen);
  const freezeReturnDate = (user?.freezeInfo?.expectedReturn || planStatus?.freezeExpectedReturn)
    ? new Date(user?.freezeInfo?.expectedReturn || planStatus?.freezeExpectedReturn).toLocaleDateString()
    : null;

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Header Section */}
      <DashboardHeader user={user} streak={streak} />

      {/* Hero Section: Alerts + Grade + Timer */}
      <div className="space-y-6">
        {planStatus?.isPlanBlocked && (
          <div className="alert alert-error shadow">
            <span>
              {t('dashboard.planBlockedAlert', { confirmed: planStatus.confirmedLessonsThisMonth, required: planStatus.requiredLessonsByNow })}
            </span>
          </div>
        )}
        {isFrozen && (
          <div className="alert alert-warning shadow">
            <span>
              {freezeReturnDate
                ? t('dashboard.frozenWithDate', { date: freezeReturnDate })
                : t('dashboard.frozenNoDate')}
            </span>
          </div>
        )}
        <DashboardAlerts
          daysRemaining={daysRemaining}
          percentage={percentage}
          canGetConcession={canGetConcession}
          nearDeadline={nearDeadline}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Grade Badge */}
          <div className="md:col-span-4 card bg-base-100/60 shadow-xl backdrop-blur p-6 flex flex-col justify-center items-center text-center border border-base-200">
            <h3 className="text-sm uppercase tracking-widest text-base-content/60 mb-4 font-semibold flex items-center justify-center">{t('dashboard.yourGrade')}<InfoTooltip text={t('tooltips.yourGrade')} /></h3>
            <div className="transform scale-125 mb-2">
              <GradeBadge
                grades={user?.grades || t('common.error')}
                grade={grade || t('common.notSpecified')}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="md:col-span-8">
            <ProbationTimer
              probation={probation}
              isMobile={isMobile}
              daysWorking={daysWorking}
              trialPeriodDays={trialPeriodDays}
              daysRemaining={daysRemaining}
            />
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <StatusPanel
        lessonsConfirmed={lessonsConfirmed || lessonsThisMonth}
        lessonsPending={lessonsPending || 0}
        trialStats={trialStats}
        percentage={percentage || 0}
        daysWorking={daysWorking || 0}
        trialPeriodDays={trialPeriodDays || 30}
        averageScore={averageScore}
      />

      {/* Trial Plan Progress */}
      <PlanProgressWidget
        lessonsConfirmed={trialStats?.totalLessons ?? lessonsConfirmed}
        monthlyGoal={trialStats?.targetLessons ?? monthlyGoal}
        daysRemaining={daysRemaining}
        planStatus={planStatus}
      />

      <div className="divider opacity-50"></div>

      {/* Timeline Section */}
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-base-content px-2">{t('dashboard.yourPath')}</h2>
          <Link to="/activity" className="btn btn-sm btn-ghost gap-2 text-primary">
            {t('dashboard.allActivity')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProgressTimeline
          internGrade={grade}
          grades={user?.grades}
          overallProgressPercentage={overallProgress}
          lessonsVisited={trialStats?.totalLessons || lessonsThisMonth}
          isMobile={isMobile}
        />
      </div>

      {/* Weekly Champion */}
      <WeeklyChampion champion={weeklyChampion} currentUserId={user?._id} />

      {/* Quick Actions */}
      <QuickActions isMobile={isMobile} />

      {/* Rank + Percentile */}
      {ranking && ranking.rank > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow">
            <div className="card-body p-4 items-center text-center">
              <span className="text-2xl">🏅</span>
              <span className="text-2xl font-bold text-primary">
                #{ranking.rank}
              </span>
              <span className="text-xs text-base-content/50">
                {t('gamification.rankOf', { rank: ranking.rank, total: ranking.totalInterns })}
              </span>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-success/10 to-success/5 shadow">
            <div className="card-body p-4 items-center text-center">
              <span className="text-2xl">📊</span>
              <span className="text-2xl font-bold text-success">
                {ranking.percentile}%
              </span>
              <span className="text-xs text-base-content/50">
                {t('gamification.percentile', { percent: ranking.percentile })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent reviews + monthly progress */}
      <RecentActivityWidget user={user} lessons={stats?.recentLessons || []} isMobile={isMobile} />

      {/* Location sharing */}
      <LocationShare />

      {/* Additional Stats */}
      <StatsGrid
        totalLessonsVisited={totalLessons}
        monthlyLessons={lessonsThisMonth}
        averageScore={Number(averageScore)}
        grade={grade}
        feedbackCount={Array.isArray(recentReviews) ? recentReviews.length : (user?.feedbacks?.length || 0)}
        perks={perks}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Dashboard;
