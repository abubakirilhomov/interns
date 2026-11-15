import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { createLesson, resetLessonState } from "../store/slices/lessonSlice";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { PENDING_FEEDBACK_KEY } from "../components/LessonFeedbackModal";
import LessonForm from "../components/LessonForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const AddLessonPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error } = useSelector((state) => state.lessons);
  // Phase 2: gate on weeklyPlan.status (что enforced на бэке в
  // lessonController). Старое user.planStatus.isPlanBlocked — от daily
  // правила из internPlanStatus.js, оно теперь dead. Если читать его —
  // фронт блокирует кнопку, а бэк бы пропустил → "у меня заблок, а админ
  // показывает Активен" (как репортили 2026-05-26).
  const weeklyPlan = useSelector((state) => state.weeklyPlan.data);
  const isPlanBlocked = ["restricted", "admin_block"].includes(
    weeklyPlan?.status
  );
  const isFrozen = Boolean(user?.status === "frozen" || user?.isFrozen || user?.planStatus?.isFrozen);
  const freezeReturnDate = user?.freezeInfo?.expectedReturn
    ? new Date(user.freezeInfo.expectedReturn).toLocaleDateString("ru-RU")
    : null;

  // Валидация обязательных полей и защита от двойного сабмита — в LessonForm.
  // Возвращаем true, чтобы форма очистилась после успешного создания.
  const handleSubmit = async (values) => {
    if (isFrozen) {
      toast.warning(
        freezeReturnDate
          ? `Аккаунт временно заморожен до ${freezeReturnDate}. Добавление уроков недоступно.`
          : "Аккаунт временно заморожен. Добавление уроков недоступно."
      );
      return false;
    }

    const lessonData = {
      intern: user?._id,
      mentor: values.mentor,
      topic: values.topic,
      time: values.time,
      group: values.group,
      feedback: values.feedback || undefined, // Optional field
    };

    try {
      const lesson = await dispatch(createLesson(lessonData)).unwrap();
      // Урок создан — сразу подтверждаем тостом при любом исходе. Раньше тост
      // стоял в ветке else (когда у урока нет _id), но у реально созданного
      // урока _id есть всегда → выполнялась ветка if (открывала фидбек-модалку),
      // а тост успеха не показывался никогда — интерн не понимал, добавился урок
      // или нет.
      toast.success(t('common.sentSuccess'));
      dispatch(resetLessonState());
      // Урок требует оценки интерна — открываем фидбек-модалку (её рендерит Layout).
      if (lesson?._id) {
        localStorage.setItem(PENDING_FEEDBACK_KEY, lesson._id);
        window.dispatchEvent(new Event("feedback-pending-changed"));
      }
      return true;
    } catch (err) {
      // If backend says there's a pending feedback lesson — show modal for it
      const pendingId = err?.pendingFeedbackLessonId;
      if (pendingId) {
        localStorage.setItem(PENDING_FEEDBACK_KEY, pendingId);
        window.dispatchEvent(new Event("feedback-pending-changed"));
        return false;
      }
      // Fallback: if we got blocked but don't know which lesson, ask the server.
      try {
        const res = await axios.get(`${API_URL}/lessons/pending-feedback`);
        const serverId = res.data?.pending?._id;
        if (serverId) {
          localStorage.setItem(PENDING_FEEDBACK_KEY, serverId);
          window.dispatchEvent(new Event("feedback-pending-changed"));
        }
      } catch {
        // ignore — Redux state already holds the error message
      }
      return false;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-6 sm:mt-10 p-4 sm:p-6 bg-base-100 shadow rounded-2xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold">{t('lessons.title')}</h2>
        <Link to="/lessons/history" className="btn btn-ghost btn-sm text-primary">
          {t('history.title')} →
        </Link>
      </div>

      <LessonForm
        onSubmit={handleSubmit}
        submitLabel={t('lessons.submit')}
        isSubmitting={isLoading}
        disabled={isPlanBlocked || isFrozen}
      >
        {/* Inline-сообщение про блок убрано — Layout рендерит WeeklyPlanBanner,
            который не только сообщает о блоке, но и предлагает кнопку
            "Реактивировать" (если есть активации в этом месяце). Тут нам
            достаточно disabled-state на самой кнопке. */}
        {isFrozen && (
          <div className="alert alert-warning">
            <span>
              {freezeReturnDate
                ? `Ваш аккаунт временно заморожен до ${freezeReturnDate}. Добавление уроков недоступно.`
                : "Ваш аккаунт временно заморожен. Добавление уроков недоступно."}
            </span>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </LessonForm>
      {/* z-index выше модалки фидбека (z-[9999]) — иначе тост успеха окажется
          под затемнённым backdrop модалки и его не будет видно. */}
      <ToastContainer position="top-right" style={{ zIndex: 10000 }} />
    </div>
  );
};

export default AddLessonPage;
