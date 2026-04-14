import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import LessonFeedbackModal, { PENDING_FEEDBACK_KEY } from '../LessonFeedbackModal';

const readPendingId = () => {
  try {
    return localStorage.getItem(PENDING_FEEDBACK_KEY) || null;
  } catch {
    return null;
  }
};

const Layout = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [pendingFeedbackId, setPendingFeedbackId] = useState(() => readPendingId());

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
    </div>
  );
};

export default Layout;
