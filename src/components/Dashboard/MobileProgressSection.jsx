import { useTranslation } from 'react-i18next';

const MobileProgressSection = ({
  lessonsProgressPercentage,
  actualLessons,
  monthlyGoal,
  scoreProgressPercentage,
  averageScore,
  overallProgressPercentage,
  overallStatusColor
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Progress Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Lessons Card */}
        <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow">
          <div className="card-body items-center text-center p-3 sm:p-4">
            <div
              className="radial-progress text-primary text-lg sm:text-xl font-bold"
              style={{
                "--value": lessonsProgressPercentage,
                "--size": "4rem",
                "--thickness": "5px"
              }}
              role="progressbar"
            >
              <span className="text-base sm:text-xl">{(typeof lessonsProgressPercentage === 'number' ? lessonsProgressPercentage : 0).toFixed(0)}%</span>
            </div>
            <div className="mt-2 w-full">
              <div className="text-xs text-base-content/60">{t('dashboard.lessonsMobile')}</div>
              <div className="text-xs sm:text-sm font-semibold break-words">
                {actualLessons} {t('common.from')} {monthlyGoal}
              </div>
            </div>
          </div>
        </div>

        {/* Quality Card */}
        <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow">
          <div className="card-body items-center text-center p-3 sm:p-4">
            <div
              className="radial-progress text-secondary text-lg sm:text-xl font-bold"
              style={{
                "--value": scoreProgressPercentage,
                "--size": "4rem",
                "--thickness": "5px"
              }}
              role="progressbar"
            >
              <span className="text-base sm:text-xl">{(typeof scoreProgressPercentage === 'number' ? scoreProgressPercentage : 0).toFixed(0)}%</span>
            </div>
            <div className="mt-2 w-full">
              <div className="text-xs text-base-content/60">{t('dashboard.quality')}</div>
              <div className="text-xs sm:text-sm font-semibold break-words">
                {(typeof averageScore === 'number' ? averageScore : 0).toFixed(1)} {t('common.from')} 5.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Card */}
      <div className="card bg-base-100 shadow">
        <div className="card-body items-center text-center p-4 sm:p-6">
          <h3 className="card-title text-base sm:text-lg mb-3 sm:mb-4">{t('dashboard.overallProgress')}</h3>
          <div
            className={`radial-progress ${overallStatusColor === 'error' ? 'text-error' : overallStatusColor === 'warning' ? 'text-warning' : 'text-success'} text-xl sm:text-2xl font-bold mb-3 sm:mb-4`}
            style={{
              "--value": overallProgressPercentage,
              "--size": "7rem",
              "--thickness": "7px"
            }}
            role="progressbar"
          >
            <span className="text-xl sm:text-2xl">{(typeof overallProgressPercentage === 'number' ? overallProgressPercentage : 0).toFixed(1)}%</span>
          </div>

          {/* Status Indicators */}
          <div className="flex justify-center gap-2 sm:gap-4 w-full max-w-xs">
            <div className={`flex-1 text-center p-2 rounded-lg transition-colors ${
              overallStatusColor === 'error'
                ? 'bg-error/10 text-error ring-2 ring-error/20'
                : 'bg-base-200 text-base-content/50'
            }`}>
              <div className="text-base sm:text-lg">🔴</div>
              <div className="text-xs whitespace-nowrap">0-50%</div>
            </div>
            <div className={`flex-1 text-center p-2 rounded-lg transition-colors ${
              overallStatusColor === 'warning'
                ? 'bg-warning/10 text-warning ring-2 ring-warning/20'
                : 'bg-base-200 text-base-content/50'
            }`}>
              <div className="text-base sm:text-lg">🟡</div>
              <div className="text-xs whitespace-nowrap">50-80%</div>
            </div>
            <div className={`flex-1 text-center p-2 rounded-lg transition-colors ${
              overallStatusColor === 'success'
                ? 'bg-success/10 text-success ring-2 ring-success/20'
                : 'bg-base-200 text-base-content/50'
            }`}>
              <div className="text-base sm:text-lg">🟢</div>
              <div className="text-xs whitespace-nowrap">80-100%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileProgressSection;
