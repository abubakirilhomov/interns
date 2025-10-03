const ProgressTimeline = ({ lessonsVisited = 0, grades, internGrade }) => {
  const gradeOrder = ["junior", "strongJunior", "middle", "strongMiddle", "senior"];
  
  const gradeLabels = {
    junior: "Junior",
    strongJunior: "Strong Jr",
    middle: "Middle",
    strongMiddle: "Strong Mid",
    senior: "Senior"
  };

  const internGradeIndex = gradeOrder.indexOf(internGrade);
  let remaining = lessonsVisited;

  const steps = gradeOrder.map((grade, index) => {
    const required = grades?.[grade]?.lessonsPerMonth || 0;
    let progress = 0;
    let completed = false;
    let current = false;

    if (index < internGradeIndex) {
      progress = 100;
      completed = true;
    } else if (index === internGradeIndex) {
      if (remaining >= required) {
        progress = 100;
        completed = true;
      } else if (remaining > 0) {
        progress = Math.floor((remaining / required) * 100);
        current = true;
      }
      remaining = 0;
    } else {
      progress = 0;
    }

    return {
      id: index,
      name: grade,
      label: gradeLabels[grade],
      completed,
      current,
      progress,
      required
    };
  });

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 sm:p-6">
        <h3 className="card-title mb-4 text-base sm:text-lg md:text-xl">Карта прогресса</h3>
        
        {/* Desktop/Tablet View (horizontal) */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`radial-progress text-xs sm:text-sm font-bold ${
                      step.completed 
                        ? "text-success" 
                        : step.current 
                        ? "text-primary" 
                        : "text-base-content/30"
                    }`}
                    style={{
                      "--value": step.progress,
                      "--size": "2.5rem",
                      "--thickness": "4px"
                    }}
                    role="progressbar"
                    aria-valuenow={step.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {step.completed
                      ? "✓"
                      : step.current
                      ? `${step.progress}%`
                      : "○"}
                  </div>
                  <span className="text-xs text-center text-base-content/60 mt-2 whitespace-nowrap">
                    {step.label}
                  </span>
                  {step.current && (
                    <span className="text-xs text-primary font-medium mt-1">
                      {lessonsVisited}/{step.required}
                    </span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-12 lg:w-16 h-1 mx-2 rounded transition-colors ${
                      step.completed ? "bg-success" : "bg-base-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View (vertical) */}
        <div className="block sm:hidden space-y-3">
          {steps.map((step, index) => (
            <div key={step.id}>
              <div className="flex items-center gap-3">
                <div
                  className={`radial-progress text-sm font-bold flex-shrink-0 ${
                    step.completed 
                      ? "text-success" 
                      : step.current 
                      ? "text-primary" 
                      : "text-base-content/30"
                  }`}
                  style={{
                    "--value": step.progress,
                    "--size": "3rem",
                    "--thickness": "4px"
                  }}
                  role="progressbar"
                  aria-valuenow={step.progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {step.completed
                    ? "✓"
                    : step.current
                    ? `${step.progress}%`
                    : "○"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-base-content">
                      {step.label}
                    </span>
                    {step.current && (
                      <span className="text-xs text-primary font-medium">
                        {lessonsVisited}/{step.required}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        step.completed 
                          ? "bg-success" 
                          : step.current 
                          ? "bg-primary" 
                          : "bg-base-300"
                      }`}
                      style={{ width: `${step.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTimeline