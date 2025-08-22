import { useSelector } from 'react-redux';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Feedback = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }

  const feedbacks = user?.feedbacks || [];
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, feedback) => sum + feedback.stars, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = feedbacks.filter(f => f.stars === rating).length;
    const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-base-content">Обратная связь</h1>
        <p className="text-base-content/70 mt-1">
          Отзывы и оценки от ваших менторов
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-warning">
              <span className="text-3xl">⭐</span>
            </div>
            <div className="stat-title">Средняя оценка</div>
            <div className="stat-value text-warning">{averageRating}</div>
            <div className="stat-desc">из 5 звёзд</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-info">
              <span className="text-3xl">💬</span>
            </div>
            <div className="stat-title">Всего отзывов</div>
            <div className="stat-value text-info">{feedbacks.length}</div>
            <div className="stat-desc">за всё время</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-success">
              <span className="text-3xl">📈</span>
            </div>
            <div className="stat-title">Положительные</div>
            <div className="stat-value text-success">
              {feedbacks.filter(f => f.stars >= 4).length}
            </div>
            <div className="stat-desc">4+ звёзд</div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title mb-4">Распределение оценок</h3>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <span className="text-warning">⭐</span>
                </div>
                
                <div className="flex-1">
                  <div className="w-full bg-base-200 rounded-full h-3">
                    <div 
                      className="bg-warning h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-base-content/70 w-16 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title mb-4">Последние отзывы</h3>
          
          {feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((feedback, index) => (
                  <div key={index} className="border-l-4 border-primary bg-base-200 p-4 rounded-r-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="badge badge-warning badge-lg">
                          {feedback.stars} ⭐
                        </div>
                        <span className="text-sm text-base-content/70">
                          ID: {feedback.mentorId}
                        </span>
                      </div>
                      <span className="text-sm text-base-content/60">
                        {new Date(feedback.date).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {feedback.feedback && (
                      <div className="mt-3 p-3 bg-base-100 rounded-lg">
                        <p className="text-base-content/80 italic">
                          "{feedback.feedback}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-base-content/40 text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-base-content/70 mb-2">
                Пока нет отзывов
              </h3>
              <p className="text-base-content/60">
                Отзывы от ваших менторов появятся здесь
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;