const StatsCard = ({ title, value, icon, trend, trendValue, colorClass = 'text-primary' }) => {
  return (
    <div className="glass-card p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-base-content/60 mb-1">{title}</div>
          <div className={`text-2xl md:text-3xl font-bold text-base-content`}>
            {value}
          </div>
          {trend && (
            <div className={`text-xs mt-2 px-2 py-0.5 rounded-full inline-block ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              <span className="font-bold">{trendValue}</span> за месяц
            </div>
          )}
        </div>

        <div className={`text-3xl p-3 rounded-xl bg-base-200/50 group-hover:scale-110 transition-transform ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;