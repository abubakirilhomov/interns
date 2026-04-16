import React from "react";
import { useTranslation } from 'react-i18next';
import { Activity, CheckCircle, Calendar, Award } from "lucide-react";

const StatusPanel = ({
    lessonsConfirmed,
    lessonsPending,
    trialStats,
    daysWorking,
    trialPeriodDays,
    averageScore
}) => {
    const { t } = useTranslation();
    const { totalLessons, targetLessons, progressPercentage } = trialStats || { totalLessons: 0, targetLessons: 0, progressPercentage: 0 };

    const normColor = progressPercentage >= 80 ? 'text-success' : progressPercentage >= 50 ? 'text-warning' : 'text-error';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Norm completion (trial period) */}
            <div className="card bg-base-100/60 shadow-xl backdrop-blur p-4 relative overflow-hidden group border border-base-200">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-12 h-12 text-primary" />
                </div>
                <div className="text-sm font-medium text-base-content/60 mb-1">{t('dashboard.normTrialPeriod')}</div>
                <div className={`text-3xl font-bold ${normColor} mb-1`}>
                    {totalLessons} <span className="text-lg text-base-content/40 font-normal">/ {targetLessons}</span>
                </div>
                <div className="text-xs font-semibold px-2 py-1 bg-base-200 rounded-full inline-block text-base-content/70">
                    {progressPercentage}% {t('dashboard.completed')}
                </div>
            </div>

            {/* Rated / Pending */}
            <div className="card bg-base-100/60 shadow-xl backdrop-blur p-4 relative overflow-hidden group border border-base-200">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CheckCircle className="w-12 h-12 text-secondary" />
                </div>
                <div className="text-sm font-medium text-base-content/60 mb-1">{t('dashboard.ratedPending')}</div>
                <div className="text-3xl font-bold text-base-content mb-1">
                    {lessonsConfirmed} <span className="text-lg text-base-content/40 font-normal">/ {lessonsPending}</span>
                </div>
                <div className="text-xs text-base-content/40 font-medium">{t('dashboard.currentMonth')}</div>
            </div>

            {/* Grade deadline */}
            <div className="card bg-base-100/60 shadow-xl backdrop-blur p-4 relative overflow-hidden group border border-base-200">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar className="w-12 h-12 text-accent" />
                </div>
                <div className="text-sm font-medium text-base-content/60 mb-1">{t('dashboard.gradeDeadline')}</div>
                <div className="text-3xl font-bold text-base-content mb-1">
                    {daysWorking} <span className="text-lg text-base-content/40 font-normal">/ {trialPeriodDays}</span>
                </div>
                <div className="text-xs text-base-content/40 font-medium">{t('dashboard.daysPassed')}</div>
            </div>

            {/* Average score */}
            <div className="card bg-base-100/60 shadow-xl backdrop-blur p-4 relative overflow-hidden group border border-base-200">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Award className="w-12 h-12 text-warning" />
                </div>
                <div className="text-sm font-medium text-base-content/60 mb-1">{t('dashboard.avgScore')}</div>
                <div className="text-3xl font-bold text-warning mb-1">
                    {(typeof averageScore === 'number' ? averageScore : parseFloat(averageScore) || 0).toFixed(1)}
                </div>
                <div className="text-xs font-semibold px-2 py-1 bg-warning/10 text-warning rounded-full inline-block">
                    {t('dashboard.outOf5')}
                </div>
            </div>
        </div>
    );
};

export default StatusPanel;
