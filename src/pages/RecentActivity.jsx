import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardStats } from "../store/slices/dashboardSlice";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { Calendar, BookOpen, MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";

const RecentActivity = () => {
    const dispatch = useDispatch();
    const { stats, isLoading, error } = useSelector((state) => state.dashboard);

    useEffect(() => {
        if (!stats && !isLoading && !error) {
            dispatch(fetchDashboardStats());
        }
    }, [dispatch, stats, isLoading, error]);

    if (isLoading) {
        return <LoadingSpinner size="lg" className="min-h-screen" />;
    }

    if (error) {
        return <div className="text-error text-center p-10 bg-base-100 rounded-xl">Ошибка загрузки: {error}</div>;
    }

    if (!stats) return null;

    const { history, recentLessons, recentReviews } = stats;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Моя Активность</h1>
                    <p className="text-base-content/60">История обучения и отзывы</p>
                </div>
                <Link to="/dashboard" className="btn btn-ghost btn-sm">
                    ← Назад
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Monthly History */}
                <div className="card bg-base-100/60 shadow-xl backdrop-blur p-6 border border-base-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-base-content">
                        <Calendar className="w-5 h-5 text-primary" />
                        История по месяцам
                    </h2>
                    <div className="space-y-3">
                        {history && history.length > 0 ? (
                            history.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-base-200/50 rounded-lg">
                                    <div className="font-medium text-base-content">
                                        {item.monthName} {item.year}
                                    </div>
                                    <div className="badge badge-primary badge-outline">
                                        {item.count} уроков
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-base-content/50 text-sm">Нет данных за последние месяцы</p>
                        )}
                    </div>
                </div>

                {/* 2. Recent Lessons */}
                <div className="card bg-base-100/60 shadow-xl backdrop-blur p-6 border border-base-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-base-content">
                        <BookOpen className="w-5 h-5 text-secondary" />
                        Недавние уроки
                    </h2>
                    <div className="space-y-3">
                        {recentLessons && recentLessons.length > 0 ? (
                            recentLessons.map((lesson) => (
                                <div key={lesson._id} className="p-3 bg-base-200/50 rounded-lg group hover:bg-base-200 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-base-content">{lesson.topic}</div>
                                            <div className="text-xs text-base-content/60">
                                                {new Date(lesson.createdAt).toLocaleDateString()} • {lesson.status === 'confirmed' ? 'Подтвержден' : 'Ожидает'}
                                            </div>
                                        </div>
                                        {lesson.stars && (
                                            <div className="flex items-center text-warning text-sm">
                                                <Star className="w-3 h-3 fill-current mr-1" />
                                                {lesson.stars}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-base-content/50 text-sm">Уроков пока нет</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Recent Reviews (Feedback) */}
            <div className="card bg-base-100/60 shadow-xl backdrop-blur p-6 border border-base-200">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-base-content">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    Недавние отзывы
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentReviews && recentReviews.length > 0 ? (
                        recentReviews.map((review, index) => (
                            <div key={index} className="card bg-base-100 shadow-sm border border-base-200 p-4 relative">
                                <div className="absolute top-2 right-2 text-xs text-base-content/40">
                                    {review.mentorName} {/* Anonymous */}
                                </div>
                                <div className="flex items-center gap-1 text-warning mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.stars ? "fill-current" : "text-base-content/20"}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-base-content italic mb-2">
                                    "{review.feedback || "Без комментария"}"
                                </p>
                                <div className="text-xs text-base-content/50 mt-auto pt-2 border-t border-base-200">
                                    {new Date(review.date).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-6 text-base-content/50">
                            Отзывов пока нет
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentActivity;
