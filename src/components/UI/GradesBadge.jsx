import { GRADE_LABELS, GRADE_BADGE } from '../../constants/gradeColors';

const GradeBadge = ({ grade }) => {
  const text = GRADE_LABELS[grade] || grade;
  const badgeClass = GRADE_BADGE[grade] || 'badge-ghost';

  return (
    <div className={`badge ${badgeClass} badge-xl font-semibold`}>
      {text}
    </div>
  );
};

export default GradeBadge;
