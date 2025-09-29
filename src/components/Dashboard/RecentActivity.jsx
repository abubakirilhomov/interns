const RecentActivity = ({ user, lessons, isMobile }) => (
  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title text-base md:text-lg mb-4">
          {isMobile ? "Отзывы" : "Последние отзывы"}
        </h3>
        {user?.feedbacks && user.feedbacks > 0 ? (
          <div className="space-y-3 max-h-[20vh] overflow-y-auto">
            {Array.from({ length: Math.min(user.feedbacks, isMobile ? 3 : 5) }).map((_, index) => (
              <div
                key={index}
                className="relative flex items-start space-x-3 p-3 bg-base-200 rounded-lg backdrop-blur-sm cursor-not-allowed"
                title="Фидбеки конфиденциальные и недоступны для просмотра"
              >
                <div className="flex-shrink-0">
                  <div className="badge badge-warning">⭐</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-base-content/50 select-none blur-sm">
                    Содержимое отзыва скрыто
                  </p>
                  <p className="text-xs text-base-content/40 mt-1 select-none">
                    Дата скрыта
                  </p>
                </div>
                <div className="absolute inset-0 bg-base-200/40 backdrop-blur-sm rounded-lg pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-base-content/60">
            <p>Пока нет отзывов</p>
          </div>
        )}
      </div>
    </div>

    {/* Monthly Progress */}
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title text-base md:text-lg mb-4">
          {isMobile ? "По месяцам" : "Прогресс по месяцам"}
        </h3>
        {user?.lessonsVisited && user.lessonsVisited.length > 0 ? (
          <div className="space-y-3">
            {Object.entries(
              user.lessonsVisited.reduce((acc, entry) => {
                const lesson = lessons.find(
                  (l) => l._id === entry.lessonId
                );
                if (!lesson) return acc;
                const month = lesson.createdAt?.slice(0, 7) || "Unknown";
                acc[month] = (acc[month] || 0) + (entry.count || 0);
                return acc;
              }, {})
            )
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, isMobile ? 4 : 6)
              .map(([month, count]) => (
                <div
                  key={month}
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                    {month === "Unknown"
                      ? "Неизвестный месяц"
                      : new Date(month + "-01").toLocaleDateString(
                          "ru-RU",
                          {
                            year: isMobile ? "2-digit" : "numeric",
                            month: isMobile ? "short" : "long",
                          }
                        )}
                  </span>
                  <div className={`badge badge-primary ${isMobile ? 'badge-sm' : ''}`}>
                    {count} {isMobile ? '' : 'уроков'}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-base-content/60">
            <p className={isMobile ? 'text-sm' : ''}>Пока нет данных о посещённых уроках</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default RecentActivity;