const StatsCard = ({ title, value, icon, trend, trendValue, colorClass = 'text-primary' }) => {
  return (
    <div className="stats shadow bg-base-100">
      <div className="stat">
        <div className="stat-figure text-secondary">
          <div className={`text-3xl ${colorClass}`}>
            {icon}
          </div>
        </div>
        <div className="stat-title text-base-content/70">{title}</div>
        <div className="stat-value text-base-content">{value}</div>
        {trend && (
          <div className={`stat-desc ${trend === 'up' ? 'text-success' : 'text-error'}`}>
            <span className="font-semibold">{trendValue}</span> за неделю
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;