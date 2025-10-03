const GradeBadge = ({ grade, grades }) => {
  // Derive text from grade key (e.g., 'strongJunior' -> 'Strong Junior')
  const text = grade
    .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Map grade to a DaisyUI badge color variant
  let badgeClass;
  switch (grade) {
    case 'junior':
      badgeClass = 'badge-neutral';
      break;
    case 'strongJunior':
      badgeClass = 'badge-info';
      break;
    case 'middle':
      badgeClass = 'badge-primary';
      break;
    case 'strongMiddle':
      badgeClass = 'badge-success';
      break;
    case 'senior':
      badgeClass = 'badge-accent';
      break;
    default:
      badgeClass = 'badge-ghost'; // Fallback for unknown grades
  }

  return (
    <div className={`badge ${badgeClass} badge-xl font-semibold`}>
      {text}
    </div>
  );
};

export default GradeBadge;