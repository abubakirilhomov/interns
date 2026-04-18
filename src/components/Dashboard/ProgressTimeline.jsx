import { Check } from "lucide-react";

const GRADE_ORDER = ["junior", "strongJunior", "middle", "strongMiddle", "senior"];
const GRADE_LABELS = {
  junior: "Junior",
  strongJunior: "Strong Jr",
  middle: "Middle",
  strongMiddle: "Strong Mid",
  senior: "Senior",
};

const ProgressTimeline = ({ lessonsVisited = 0, grades, internGrade }) => {
  const internGradeIndex = Math.max(0, GRADE_ORDER.indexOf(internGrade));
  let remaining = lessonsVisited;

  const steps = GRADE_ORDER.map((grade, index) => {
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
        progress = Math.floor((remaining / (required || 1)) * 100);
        current = true;
      }
      remaining = 0;
    }

    return { id: index, label: GRADE_LABELS[grade], completed, current, progress, required };
  });

  const StepCircle = ({ step }) => (
    <div
      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 flex-shrink-0 ${
        step.completed
          ? "bg-success border-success/30 shadow-md shadow-success/20"
          : step.current
          ? "bg-base-100 border-primary shadow-md shadow-primary/20"
          : "bg-base-200 border-base-300"
      }`}
    >
      {step.completed ? (
        <Check className="w-5 h-5 text-success-content" />
      ) : step.current ? (
        <span className="text-xs font-bold text-primary">{step.progress}%</span>
      ) : (
        <span className="w-2.5 h-2.5 bg-base-content/20 rounded-full" />
      )}
    </div>
  );

  return (
    <div className="glass-panel p-4 sm:p-6">
      {/* ═══ DESKTOP — horizontal ═══ */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-base-300 -z-10 rounded-full -translate-y-1/2" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-success to-primary -z-10 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out"
            style={{ width: `${(internGradeIndex / (GRADE_ORDER.length - 1)) * 100}%` }}
          />

          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <StepCircle step={step} />
              <div className="mt-3 flex flex-col items-center">
                <span className={`text-sm font-bold ${step.completed ? "text-success" : step.current ? "text-primary" : "text-base-content/40"}`}>
                  {step.label}
                </span>
                {step.current && (
                  <div className="mt-1 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                    <span className="text-xs font-semibold text-primary">{lessonsVisited}/{step.required}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MOBILE — vertical ═══ */}
      <div className="sm:hidden space-y-0">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-start gap-3">
            {/* Left column: circle + connector line */}
            <div className="flex flex-col items-center">
              <StepCircle step={step} />
              {idx < steps.length - 1 && (
                <div className={`w-0.5 h-8 ${idx < internGradeIndex ? "bg-success" : "bg-base-300"}`} />
              )}
            </div>

            {/* Right column: label + info */}
            <div className="pt-2 pb-4 min-w-0">
              <span className={`text-sm font-bold ${step.completed ? "text-success" : step.current ? "text-primary" : "text-base-content/40"}`}>
                {step.label}
              </span>
              {step.current && (
                <div className="mt-1">
                  <div className="w-32 h-2 bg-base-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${step.progress}%` }} />
                  </div>
                  <span className="text-xs text-primary font-medium">{lessonsVisited}/{step.required}</span>
                </div>
              )}
              {step.completed && (
                <span className="text-xs text-success/60">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTimeline;
