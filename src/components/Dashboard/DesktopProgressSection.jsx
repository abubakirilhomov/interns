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
}) => (
  <div className="space-y-6">
    {/* План vs Факт */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow">
        <div className="card-body">
          <h3 className="card-title text-primary">📋 План на месяц</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">{monthlyGoal}</div>
              <div className="text-sm text-base-content/60">Уроков</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">5.0</div>
              <div className="text-sm text-base-content/60">Макс. балл</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow">
        <div className="card-body">
          <h3 className="card-title text-secondary">✅ Факт</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-secondary">{actualLessons}</div>
              <div className="text-sm text-base-content/60">Уроков</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">{typeof averageScore === 'number' ? averageScore.toFixed(1) : averageScore}</div>
              <div className="text-sm text-base-content/60">Средний балл</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Прогресс-бар и статус */}
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title">Прогресс выполнения</h3>
          <div className={`badge badge-${overallStatusColor} badge-lg`}>
            {overallProgressPercentage}%
          </div>
        </div>

        <div className="space-y-4">
          {/* Прогресс по урокам */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Уроки ({actualLessons} из {monthlyGoal})</span>
              <span className={`text-${lessonsStatusColor}`}>{lessonsProgressPercentage}%</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-3">
              <div
                className={`bg-${lessonsStatusColor} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${lessonsProgressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Прогресс по баллам */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Качество ({typeof averageScore === 'number' ? averageScore.toFixed(1) : averageScore} из 5.0)</span>
              <span className={`text-${scoreStatusColor}`}>{scoreProgressPercentage}%</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-3">
              <div
                className={`bg-${scoreStatusColor} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${scoreProgressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Общий прогресс */}
          <div className="pt-2 border-t border-base-300">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold">Общий прогресс</span>
              <span className={`text-${overallStatusColor} font-semibold`}>{overallProgressPercentage}%</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-4">
              <div
                className={`bg-${overallStatusColor} h-4 rounded-full transition-all duration-500`}
                style={{ width: `${overallProgressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Статус индикаторы */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'error' ? 'bg-error/10 text-error' : 'bg-base-200 text-base-content/50'}`}>
            <div className="text-lg">🔴</div>
            <div className="text-xs">0-50%</div>
            <div className="text-xs">Критично</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'warning' ? 'bg-warning/10 text-warning' : 'bg-base-200 text-base-content/50'}`}>
            <div className="text-lg">🟡</div>
            <div className="text-xs">50-80%</div>
            <div className="text-xs">Нормально</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${overallStatusColor === 'success' ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/50'}`}>
            <div className="text-lg">🟢</div>
            <div className="text-xs">80-100%</div>
            <div className="text-xs">Отлично</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DesktopProgressSection;