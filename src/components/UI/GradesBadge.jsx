const GradeBadge = ({ grade }) => {
  const gradeConfig = {
    junior: {
      class: 'badge-info',
      text: 'Junior'
    },
    middle: {
      class: 'badge-warning',
      text: 'Middle'
    },
    senior: {
      class: 'badge-success',
      text: 'Senior'
    }
  };

  const config = gradeConfig[grade] || gradeConfig.junior;

  return (
    <div className={`badge ${config.class} badge-lg font-semibold`}>
      {config.text}
    </div>
  );
};

export default GradeBadge;