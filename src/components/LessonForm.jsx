import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const EMPTY_LESSON = { topic: "", time: "", group: "", mentor: "", feedback: "" };

const formatDateTimeLocal = (date) => {
  const offset = date.getTimezoneOffset(); // в минутах
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

/**
 * Поля урока — общие для «Dars qo'shish» и «Darsni tahrirlash».
 * Сам грузит менторов филиала и окно бэкдейта, проверяет обязательные поля и
 * защищает от двойного сабмита. `onSubmit(values)` возвращает true, если форму
 * надо очистить (после создания урока).
 */
const LessonForm = ({
  initialValues = EMPTY_LESSON,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  disabled = false,
  currentMentor = null,
  children = null,
}) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [values, setValues] = useState({ ...EMPTY_LESSON, ...initialValues });
  const [mentors, setMentors] = useState([]);
  const [lookbackDays, setLookbackDays] = useState(2);
  // Synchronous guard against double-submit: useState updates don't take
  // effect until after the next render, so a fast second tap can race past
  // the disabled={isSubmitting} check. A ref flips synchronously in the
  // handler, before any await, and rejects the second click outright.
  const submittingRef = useRef(false);

  useEffect(() => {
    axios.get(`${API_URL}/settings`).then((res) => {
      if (res.data?.lessonLookbackDays) setLookbackDays(res.data.lessonLookbackDays);
    }).catch(() => {});
  }, []);

  // Менторы активного филиала интерна
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(`${API_URL}/mentors`);
        const activeBranchId =
          localStorage.getItem("activeBranchId") || user?.branchId;
        const filtered = res.data.filter(
          (mentor) =>
            mentor.role === "mentor" &&
            mentor.branches?.some(
              (b) => String(b._id || b) === String(activeBranchId)
            )
        );
        setMentors(filtered);
      } catch (err) {
        console.error("Ошибка при загрузке менторов:", err);
      }
    };
    if (user?.branchId || user?.branchIds?.length) {
      fetchMentors();
    }
  }, [user]);

  // При правке урок мог быть записан на ментора из другого филиала —
  // он должен остаться в списке, иначе select покажет пустое значение.
  const mentorOptions =
    currentMentor && !mentors.some((m) => String(m._id) === String(currentMentor._id))
      ? [currentMentor, ...mentors]
      : mentors;

  const defaultMin = formatDateTimeLocal(
    new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)
  );
  // Уже записанное время урока не должно делать форму невалидной.
  const minTime =
    initialValues.time && initialValues.time < defaultMin ? initialValues.time : defaultMin;

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;

    if (!values.topic || !values.time || !values.group || !values.mentor) {
      return toast.error(t("common.fillRequired"));
    }

    submittingRef.current = true;
    try {
      const shouldReset = await onSubmit(values);
      if (shouldReset) setValues({ ...EMPTY_LESSON });
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">{t("lessons.topic")}</label>
        <input
          type="text"
          className="input input-bordered text-base w-full"
          value={values.topic}
          onChange={set("topic")}
          placeholder={t("lessons.topicPlaceholder")}
        />
      </div>

      <div>
        <label className="block font-medium">{t("lessons.time")}</label>
        <input
          type="datetime-local"
          className="input input-bordered w-full"
          value={values.time}
          onChange={set("time")}
          min={minTime}
          max={formatDateTimeLocal(new Date())}
        />
      </div>

      <div>
        <label className="block font-medium">{t("lessons.group")}</label>
        <input
          type="text"
          className="input input-bordered text-base w-full"
          value={values.group}
          onChange={set("group")}
          placeholder={t("lessons.groupPlaceholder")}
        />
      </div>

      <div>
        <label className="block font-medium">{t("lessons.mentor")}</label>
        <select
          className="select select-bordered w-full"
          value={values.mentor}
          onChange={set("mentor")}
        >
          <option value="">{t("lessons.selectMentor")}</option>
          {mentorOptions.map((mentor) => (
            <option key={mentor._id} value={mentor._id}>
              {`${mentor.name || ""} ${mentor.lastName || ""}`.trim() || "-"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">{t("lessons.feedback")}</label>
        <select
          className="select select-bordered w-full"
          value={values.feedback}
          onChange={set("feedback")}
        >
          <option value="">{t("lessons.selectFeedback")}</option>
          <option value="🔥">{t("lessons.excellent")}</option>
          <option value="👍">{t("lessons.good")}</option>
          <option value="😐">{t("lessons.normal")}</option>
          <option value="👎">{t("lessons.bad")}</option>
        </select>
      </div>

      {children}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? t("common.saving") : submitLabel}
      </button>
    </form>
  );
};

export default LessonForm;
