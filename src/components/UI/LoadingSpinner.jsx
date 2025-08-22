const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <span className={`loading loading-spinner text-primary ${sizeClasses[size]}`}></span>
    </div>
  );
};

export default LoadingSpinner;