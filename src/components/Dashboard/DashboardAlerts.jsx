import React from "react";
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Gift } from "lucide-react";

const DashboardAlerts = ({
    daysRemaining,
    percentage,
    canGetConcession,
    nearDeadline
}) => {
    const { t } = useTranslation();

    if (!nearDeadline && !canGetConcession) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Alert: Near deadline */}
            {nearDeadline && (
                <div role="alert" className="alert shadow-lg bg-warning/10 border-warning/20 text-base-content backdrop-blur flex items-start text-start">
                    <AlertTriangle className="stroke-warning w-6 h-6 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-lg">{t('dashboard.probationEnding')}</h3>
                        <div className="text-sm mt-1">
                            {t('dashboard.daysRemaining', { count: daysRemaining })}{' '}
                            {t('dashboard.currentProgress', { percentage })}
                        </div>
                    </div>
                </div>
            )}

            {/* Alert: Concession available */}
            {canGetConcession && (
                <div role="alert" className="alert shadow-lg bg-info/10 border-info/20 text-base-content backdrop-blur flex items-start text-start">
                    <Gift className="stroke-info w-6 h-6 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-lg">{t('dashboard.concessionAvailable')}</h3>
                        <div className="text-sm mt-1">
                            {t('dashboard.concessionDesc', { percentage })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAlerts;
