const ProgressTimeline = ({ lessonsVisited = 0, grades, internGrade }) => {
  const gradeOrder = ["junior", "strongJunior", "middle", "strongMiddle", "senior"];

  const internGradeIndex = gradeOrder.indexOf(internGrade); // индекс текущего грейда
  let remaining = lessonsVisited;

  const steps = gradeOrder.map((grade, index) => {
    const required = grades?.[grade]?.lessonsPerMonth || 0;
    let progress = 0;
    let completed = false;
    let current = false;

    // Если грейд ниже, чем текущий у интерна → показать полностью завершённым
    if (index < internGradeIndex) {
      progress = 100;
      completed = true;
    }
    // Если это текущий грейд интерна → считаем прогресс от lessonsVisited
    else if (index === internGradeIndex) {
      if (remaining >= required) {
        progress = 100;
        completed = true;
      } else if (remaining > 0) {
        progress = Math.floor((remaining / required) * 100);
        current = true;
      }
      remaining = 0;
    }
    // Если грейд выше текущего интерна → пока пустой
    else {
      progress = 0;
    }

    return {
      id: index,
      name: grade,
      completed,
      current,
      progress,
      required
    };
  });

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title mb-4 text-base md:text-lg">Карта прогресса</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className="radial-progress text-xs font-bold capitalize"
                style={{
                  "--value": step.progress,
                  "--size": "3rem",
                  "--thickness": "4px"
                }}
              >
                {step.completed
                  ? "✓"
                  : step.current
                  ? `${step.progress}%`
                  : "○"}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-6 md:w-12 h-1 mx-1 ${
                    step.completed ? "bg-success" : "bg-base-300"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-base-content/60 mt-2">
          {steps.map((step) => (
            <span key={step.id} className="capitalize">
              {step.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTimeline;
