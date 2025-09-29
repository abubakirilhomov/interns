const MobileProgressSection = ({ 
  lessonsProgressPercentage, 
  actualLessons, 
  monthlyGoal, 
  scoreProgressPercentage, 
  averageScore, 
  overallProgressPercentage, 
  overallStatusColor 
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow">
        <div className="card-body items-center text-center p-4">
          <div 
            className={`radial-progress text-primary text-xl font-bold`}
            style={{"--value": lessonsProgressPercentage, "--size": "5rem", "--thickness": "6px"}}
            role="progressbar"
          >
            {lessonsProgressPercentage.toFixed(0)}%
          </div>
          <div className="mt-2">
            <div className="text-xs text-base-content/60">Уроки</div>
            <div className="text-sm font-semibold">{actualLessons} из {monthlyGoal}</div>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow">
        <div className="card-body items-center text-center p-4">
          <div 
            className={`radial-progress text-secondary text-xl font-bold`}
            style={{"--value": scoreProgressPercentage, "--size": "5rem", "--thickness": "6px"}}
            role="progressbar"
          >
            {scoreProgressPercentage.toFixed(0)}%
          </div>
          <div className="mt-2">
            <div className="text-xs text-base-content/60">Качество</div>
            <div className="text-sm font-semibold">{averageScore.toFixed(1)} из 5.0</div>
          </div>
        </div>
      </div>
    </div>

    {/* Overall progress for mobile */}
    <div className="card bg-base-100 shadow">
      <div className="card-body items-center text-center">
        <h3 className="card-title text-lg mb-4">Общий прогресс</h3>
        <div 
          className={`radial-progress text-${overallStatusColor} text-2xl font-bold mb-4`}
          style={{"--value": overallProgressPercentage, "--size": "8rem", "--thickness": "8px"}}
          role="progressbar"
        >
          {overallProgressPercentage.toFixed(1)}%
        </div>
        
        {/* Mobile status indicators */}
        <div className="flex justify-center gap-4">
          <div className={`text-center p-2 rounded-lg ${overallStatusColor === 'error' ? 'bg-error/10 text-error' : 'bg-base-200 text-base-content/50'}`}>
            <div className="text-sm">🔴</div>
            <div className="text-xs">0-50%</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${overallStatusColor === 'warning' ? 'bg-warning/10 text-warning' : 'bg-base-200 text-base-content/50'}`}>
            <div className="text-sm">🟡</div>
            <div className="text-xs">50-80%</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${overallStatusColor === 'success' ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/50'}`}>
            <div className="text-sm">🟢</div>
            <div className="text-xs">80-100%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MobileProgressSection;