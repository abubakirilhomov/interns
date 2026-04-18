import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LessonFeedbackModal, { PENDING_FEEDBACK_KEY } from '../LessonFeedbackModal';
import AchievementToast from '../Gamification/AchievementToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const readPendingId = () => {
  try {
    return localStorage.getItem(PENDING_FEEDBACK_KEY) || null;
  } catch {
    return null;
  }
};

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [pendingFeedbackId, setPendingFeedbackId] = useState(() => readPendingId());
  const [celebrateBadges, setCelebrateBadges] = useState([]);

  // Listen for new badges from dashboard stats
  useEffect(() => {
    const onNewBadges = (e) => {
      if (e.detail?.length > 0) setCelebrateBadges(e.detail);
    };
    window.addEventListener('new-badges', onNewBadges);
    return () => window.removeEventListener('new-badges', onNewBadges);
  }, []);

  // Self-heal: if the server tracks an unrated lesson for this intern but
  // our localStorage is empty (stale client / PWA cache / fresh device),
  // fetch it and open the modal anyway.
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'intern') return;
    let cancelled = false;
    axios
      .get(`${API_URL}/lessons/pending-feedback`)
      .then((res) => {
        if (cancelled) return;
        const serverId = res.data?.pending?._id;
        if (serverId) {
          localStorage.setItem(PENDING_FEEDBACK_KEY, serverId);
          setPendingFeedbackId(serverId);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?._id, user?.role]);

  // Re-check pending feedback on auth change, storage events (cross-tab),
  // and a custom in-tab event dispatched when a lesson is created.
  useEffect(() => {
    if (!isAuthenticated) {
      setPendingFeedbackId(null);
      return;
    }
    setPendingFeedbackId(readPendingId());

    const onStorage = (e) => {
      if (e.key === PENDING_FEEDBACK_KEY) setPendingFeedbackId(e.newValue || null);
    };
    const onPendingChange = () => setPendingFeedbackId(readPendingId());

    window.addEventListener('storage', onStorage);
    window.addEventListener('feedback-pending-changed', onPendingChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('feedback-pending-changed', onPendingChange);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-base-200">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 md:p-0 lg:ml-0">
          <div className="p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {pendingFeedbackId && (
        <LessonFeedbackModal
          lessonId={pendingFeedbackId}
          onSuccess={() => {
            setPendingFeedbackId(null);
            window.dispatchEvent(new Event('feedback-pending-changed'));
          }}
        />
      )}

      <AchievementToast
        badges={celebrateBadges}
        onDone={() => setCelebrateBadges([])}
      />
    </div>
  );
};

export default Layout;
