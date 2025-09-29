const ProgressTimeline = ({ overallProgressPercentage, isMobile }) => {
  const generateProgressSteps = () => {
    const steps = [];
    const totalSteps = isMobile ? 5 : 10;
    const completedSteps = Math.floor((overallProgressPercentage / 100) * totalSteps);
    
    for (let i = 0; i < totalSteps; i++) {
      steps.push({
        id: i,
        completed: i < completedSteps,
        current: i === completedSteps
      });
    }
    return steps;
  };

  const progressSteps = generateProgressSteps();

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title mb-4 text-base md:text-lg">Карта прогресса</h3>
        <div className="flex items-center justify-between">
          {progressSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${step.completed ? 'bg-success text-success-content' : 
                  step.current ? 'bg-warning text-warning-content' : 
                  'bg-base-300 text-base-content/50'}`}>
                {step.completed ? '✓' : step.current ? '●' : '○'}
              </div>
              {index < progressSteps.length - 1 && (
                <div className={`w-4 md:w-8 h-1 mx-1 ${step.completed ? 'bg-success' : 'bg-base-300'}`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-base-content/60 mt-2">
          <span>Начало</span>
          <span>{isMobile ? "Цель" : "Цель достигнута"}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressTimeline;