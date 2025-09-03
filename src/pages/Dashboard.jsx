import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../store/slices/authSlice";
import { fetchLessons } from "../store/slices/lessonSlice";
import StatsCard from "../components/UI/StatsCard";
import GradeBadge from "../components/UI/GradesBadge";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { lessons } = useSelector((state) => state.lessons);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchLessons());
  }, [dispatch]);

  const totalLessonsVisited = user?.lessonsVisited
    ? user.lessonsVisited.reduce(
        (total, entry) => total + (entry.count || 0),
        0
      )
    : 0;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyLessons = user?.lessonsVisited
    ? user.lessonsVisited.reduce((total, entry) => {
        const lesson = lessons.find((l) => l._id === entry.lessonId);
        if (lesson && lesson.createdAt?.slice(0, 7) === currentMonth) {
          return total + (entry.count || 0);
        }
        return total;
      }, 0)
    : 0;

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }
  console.log(user);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Добро пожаловать, {user?.name || "Гость"}!
          </h1>
          <p className="text-base-content/70 mt-1">
            Вот ваш прогресс на сегодня
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <GradeBadge grade={user?.grade || "Не указан"} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Средний балл"
          value={user?.score ? user.score.toFixed(1) : "0.0"}
          icon="⭐"
          trend="up"
          trendValue="+0.2"
          colorClass="text-warning"
        />

        <StatsCard
          title="Уроков пройдено"
          value={totalLessonsVisited}
          icon="📚"
          trend="up"
          trendValue={`+${monthlyLessons}`}
          colorClass="text-info"
        />

        <StatsCard
          title="Отзывов получено"
          value={user?.feedbacks || 0}
          icon="💬"
          colorClass="text-success"
        />

        <StatsCard
          title="Уровень"
          value={user?.grade || "Junior"}
          icon="🎯"
          colorClass="text-secondary"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Последние отзывы</h3>
            {user?.feedbacks && user.feedbacks > 0 ? (
              <div className="space-y-3 max-h-[20vh] overflow-y-auto">
                {Array.from({ length: user.feedbacks }).map((_, index) => (
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
                    {/* Затемняющий слой для эффекта стекла */}
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
            <h3 className="card-title text-lg mb-4">Прогресс по месяцам</h3>
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
                  .slice(0, 6)
                  .map(([month, count]) => (
                    <div
                      key={month}
                      className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                    >
                      <span className="font-medium">
                        {month === "Unknown"
                          ? "Неизвестный месяц"
                          : new Date(month + "-01").toLocaleDateString(
                              "ru-RU",
                              {
                                year: "numeric",
                                month: "long",
                              }
                            )}
                      </span>
                      <div className="badge badge-primary">{count} уроков</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <p>Пока нет данных о посещённых уроках</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn btn-primary btn-outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Посмотреть уроки
            </button>

            <button className="btn btn-secondary btn-outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              Обратная связь
            </button>

            <button className="btn btn-accent btn-outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Профиль
            </button>

            <button className="btn btn-info btn-outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Статистика
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
