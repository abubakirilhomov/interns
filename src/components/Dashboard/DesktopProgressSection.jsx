import { useTranslation } from 'react-i18next';

const DesktopProgressSection = ({
  monthlyGoal,
  actualLessons,
  averageScore,
  overallProgressPercentage,
  overallStatusColor,
  lessonsProgressPercentage,
  lessonsStatusColor,
  scoreProgressPercentage,
  scoreStatusColor
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Plan vs Fact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow">
          <div className="card-body">
            <h3 className="card-title text-primary">{t('dashboard.planForMonth')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-primary">{monthlyGoal}</div>
                <div className="text-sm text-base-content/60">{t('dashboard.lessonsLabel')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">5.0</div>
                <div className="text-sm text-base-content/60">{t('dashboard.maxScore')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow">
          <div className="card-body">
            <h3 className="card-title text-secondary">{t('dashboard.fact')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-secondary">{actualLessons}</div>
                <div className="text-sm text-base-content/60">{t('dashboard.lessonsLabel')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{typeof averageScore === 'number' ? averageScore.toFixed(1) : averageScore}</div>
                <div className="text-sm text-base-content/60">{t('dashboard.avgScoreLabel')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar and status */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">{t('dashboard.progressCompletion')}</h3>
            <div className={`badge badge-lg ${overallStatusColor === 'error' ? 'badge-error' : overallStatusColor === 'warning' ? 'badge-warning' : 'badge-success'}`}>
              {overallProgressPercentage}%
            </div>
          </div>

          <div className="space-y-4">
            {/* Lessons progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('dashboard.lessonsOf', { actual: actualLessons, goal: monthlyGoal })}</span>
                <span className={`${lessonsStatusColor === 'error' ? 'text-error' : lessonsStatusColor === 'warning' ? 'text-warning' : 'text-success'}`}>{lessonsProgressPercentage}%</span>
              </div>
              <div className="w-full bg-base-200 rounded-full h-3">
                <div
                  className={`${lessonsStatusColor === 'error' ? 'bg-error' : lessonsStatusColor === 'warning' ? 'bg-warning' : 'bg-success'} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${lessonsProgressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Score progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('dashboard.qualityOf', { score: typeof averageScore === 'number' ? averageScore.toFixed(1) : averageScore })}</span>
                <span className={`${scoreStatusColor === 'error' ? 'text-error' : scoreStatusColor === 'warning' ? 'text-warning' : 'text-success'}`}>{scoreProgressPercentage}%</span>
              </div>
              <div className="w-full bg-base-200 rounded-full h-3">
                <div
                  className={`${scoreStatusColor === 'error' ? 'bg-error' : scoreStatusColor === 'warning' ? 'bg-warning' : 'bg-success'} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${scoreProgressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Overall progress */}
            <div className="pt-2 border-t border-base-300">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{t('dashboard.overallProgress')}</span>
                <span className={`${overallStatusColor === 'error' ? 'text-error' : overallStatusColor === 'warning' ? 'text-warning' : 'text-success'} font-semibold`}>{overallProgressPercentage}%</span>
              </div>
              <div className="w-full bg-base-200 rounded-full h-4">
                <div
                  className={`${overallStatusColor === 'error' ? 'bg-error' : overallStatusColor === 'warning' ? 'bg-warning' : 'bg-success'} h-4 rounded-full transition-all duration-500`}
                  style={{ width: `${overallProgressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'error' ? 'bg-error/10 text-error' : 'bg-base-200 text-base-content/50'}`}>
              <div className="text-lg">🔴</div>
              <div className="text-xs">0-50%</div>
              <div className="text-xs">{t('dashboard.critical')}</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'warning' ? 'bg-warning/10 text-warning' : 'bg-base-200 text-base-content/50'}`}>
              <div className="text-lg">🟡</div>
              <div className="text-xs">50-80%</div>
              <div className="text-xs">{t('dashboard.normal')}</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'success' ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/50'}`}>
              <div className="text-lg">🟢</div>
              <div className="text-xs">80-100%</div>
              <div className="text-xs">{t('dashboard.excellent')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopProgressSection;
