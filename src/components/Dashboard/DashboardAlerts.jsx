import React from "react";
import { AlertTriangle, Gift } from "lucide-react";

const DashboardAlerts = ({
    daysRemaining,
    percentage,
    canGetConcession,
    nearDeadline
}) => {
    if (!nearDeadline && !canGetConcession) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Alert: Близко к дедлайну */}
            {nearDeadline && (
                <div role="alert" className="alert shadow-lg bg-warning/10 border-warning/20 text-base-content backdrop-blur flex items-start text-start">
                    <AlertTriangle className="stroke-warning w-6 h-6 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-lg">Испытательный срок завершается</h3>
                        <div className="text-sm mt-1">
                            Осталось всего <span className="font-bold text-warning">{daysRemaining} {daysRemaining === 1 ? 'день' : daysRemaining <= 4 ? 'дня' : 'дней'}</span>.
                            Ваш текущий прогресс составляет <span className="font-bold">{percentage}%</span>.
                        </div>
                    </div>
                </div>
            )}

            {/* Alert: Возможность уступки */}
            {canGetConcession && (
                <div role="alert" className="alert shadow-lg bg-info/10 border-info/20 text-base-content backdrop-blur flex items-start text-start">
                    <Gift className="stroke-info w-6 h-6 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-lg">Доступна возможность уступки!</h3>
                        <div className="text-sm mt-1">
                            Отличные новости! Даже если вы не полностью выполнили план ({percentage}%),
                            при окончании срока возможно повышение с уступкой.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAlerts;
