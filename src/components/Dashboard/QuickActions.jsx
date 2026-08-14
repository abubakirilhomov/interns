import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, User, BarChart3 } from 'lucide-react';

const QuickActions = ({ isMobile }) => {
  const { t } = useTranslation();

  const actions = [
    { to: '/lessons', icon: BookOpen, label: isMobile ? t('dashboard.lessonsMobile') : t('dashboard.viewLessons'), color: 'btn-primary' },
    { to: '/feedback', icon: MessageSquare, label: t('dashboard.feedback'), color: 'btn-secondary' },
    { to: '/profile', icon: User, label: t('dashboard.profileAction'), color: 'btn-accent' },
    { to: '/rating', icon: BarChart3, label: t('dashboard.stats'), color: 'btn-info' },
  ];

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 sm:grid-cols-4 gap-4'}`}>
      {actions.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          className={`btn ${a.color} btn-outline ${isMobile ? 'btn-sm' : ''} gap-2`}
        >
          <a.icon className="w-4 h-4" />
          {a.label}
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
