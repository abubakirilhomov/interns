import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import LessonForm from "../components/LessonForm";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Месяц урока по Ташкенту — чтобы после сохранения вернуться в тот же месяц истории.
const tashkentMonth = (d) =>
  new Date(new Date(d).getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 7);

/**
 * «Darsni tahrirlash»: интерн исправляет свой урок, пока ментор его не подтвердил.
 * Права и статус перепроверяет бэкенд (PATCH /lessons/:id) — здесь только UX.
 */
const EditLesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [lesson, setLesson] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/lessons/${id}`)
      .then((res) => setLesson(res.data))
      .catch((err) => setLoadError(err.response?.status === 404 ? "notFound" : "load"));
  }, [id]);

  const backTo = lesson
    ? { pathname: "/lessons/history", search: `?month=${tashkentMonth(lesson.date)}` }
    : "/lessons/history";

  const handleSubmit = async (values) => {
    setSaving(true);
    setSaveError(null);
    try {
      await axios.patch(`${API_URL}/lessons/${id}`, {
        topic: values.topic,
        time: values.time,
        group: values.group,
        mentor: values.mentor,
        feedback: values.feedback || "",
      });
      toast.success(t("lessonEdit.saved"));
      navigate(backTo);
    } catch (err) {
      setSaveError(err.response?.data?.message || t("lessonEdit.saveError"));
    } finally {
      setSaving(false);
    }
    return false;
  };

  const ownerId = lesson && String(lesson.intern?._id || lesson.intern);
  const editable =
    lesson && lesson.status === "pending" && (!user?._id || ownerId === String(user._id));

  return (
    <div className="w-full max-w-lg mx-auto mt-6 sm:mt-10 p-4 sm:p-6 bg-base-100 shadow rounded-2xl">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="text-xl font-bold">{t("lessonEdit.title")}</h2>
        <Link to={backTo} className="btn btn-ghost btn-sm">
          ← {t("lessonEdit.back")}
        </Link>
      </div>
      <p className="text-sm text-base-content/60 mb-4">{t("lessonEdit.hint")}</p>

      {loadError ? (
        <div className="alert alert-error">
          {t(loadError === "notFound" ? "lessonEdit.notFound" : "history.error")}
        </div>
      ) : !lesson ? (
        <LoadingSpinner size="lg" className="py-16" />
      ) : !editable ? (
        <div className="alert alert-warning">{t("lessonEdit.notEditable")}</div>
      ) : (
        <LessonForm
          initialValues={{
            topic: lesson.topic || "",
            time: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(lesson.time || "") ? lesson.time : "",
            group: lesson.group || "",
            mentor: String(lesson.mentor?._id || lesson.mentor || ""),
            feedback: lesson.feedback || "",
          }}
          currentMentor={lesson.mentor?._id ? lesson.mentor : null}
          onSubmit={handleSubmit}
          submitLabel={t("lessonEdit.save")}
          isSubmitting={saving}
        >
          {saveError && <div className="alert alert-error text-sm">{saveError}</div>}
        </LessonForm>
      )}
    </div>
  );
};

export default EditLesson;
