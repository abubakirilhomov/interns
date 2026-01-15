import { Check } from "lucide-react";

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
    <div className="glass-panel p-6 overflow-x-auto">
      {/* Desktop/Tablet View (horizontal) */}
      <div className="min-w-[600px]">
        <div className="flex items-center justify-between relative">
          {/* Connecting Line Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-base-300 -z-10 rounded-full transform -translate-y-1/2"></div>

          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-10 group">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${step.completed
                  ? "bg-success border-success/30 scale-110 shadow-lg shadow-success/20"
                  : step.current
                    ? "bg-base-100 border-primary scale-125 shadow-lg shadow-primary/20"
                    : "bg-base-200 border-base-300"
                  }`}
              >
                {step.completed ? (
                  <Check className="w-6 h-6 text-success-content" />
                ) : step.current ? (
                  <span className="text-xs font-bold text-primary">{step.progress}%</span>
                ) : (
                  <span className="w-3 h-3 bg-base-content/20 rounded-full"></span>
                )}
              </div>

              <div className={`mt-4 flex flex-col items-center transition-all duration-300 ${step.current ? 'transform translate-y-1' : ''}`}>
                <span className={`text-sm font-bold ${step.completed ? "text-success" : step.current ? "text-primary" : "text-base-content/40"
                  }`}>
                  {step.label}
                </span>

                {step.current && (
                  <div className="mt-1 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                    <span className="text-xs font-semibold text-primary">
                      {lessonsVisited} / {step.required}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Active Filling Line (simplified logic for demo) */}
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-success to-primary -z-10 rounded-full transform -translate-y-1/2 transition-all duration-1000 ease-out"
            style={{ width: `${(internGradeIndex / (gradeOrder.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTimeline;