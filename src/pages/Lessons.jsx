import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLesson, resetLessonState } from "../store/slices/lessonSlice";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { PENDING_FEEDBACK_KEY } from "../components/LessonFeedbackModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const AddLessonPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error, success } = useSelector((state) => state.lessons);
  const isPlanBlocked = Boolean(user?.planStatus?.isPlanBlocked || user?.isPlanBlocked);

  const [topic, setTopic] = useState("");
  const [time, setTime] = useState("");
  const [group, setGroup] = useState("");
  const [feedback, setFeedback] = useState("");
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [lookbackDays, setLookbackDays] = useState(2);

  // Fetch lesson lookback days setting
  useEffect(() => {
    axios.get(`${API_URL}/settings`).then((res) => {
      if (res.data?.lessonLookbackDays) setLookbackDays(res.data.lessonLookbackDays);
    }).catch(() => {});
  }, []);

  // Fetch available mentors for the intern's active branch
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic || !time || !group || !selectedMentor) {
      return toast.error("Пожалуйста, заполните все обязательные поля");
    }

    const lessonData = {
      intern: user?._id,
      mentor: selectedMentor,
      topic,
      time,
      group,
      feedback: feedback || undefined, // Optional field
    };

    try {
      const lesson = await dispatch(createLesson(lessonData)).unwrap();
      setTopic("");
      setTime("");
      setGroup("");
      setFeedback("");
      setSelectedMentor("");
      if (lesson?._id) {
        localStorage.setItem(PENDING_FEEDBACK_KEY, lesson._id);
        window.dispatchEvent(new Event("feedback-pending-changed"));
      } else {
        toast.success("Успешно отправлено");
        dispatch(resetLessonState());
      }
    } catch (err) {
      // If backend says there's a pending feedback lesson — show modal for it
      const pendingId = err?.pendingFeedbackLessonId;
      if (pendingId) {
        localStorage.setItem(PENDING_FEEDBACK_KEY, pendingId);
        window.dispatchEvent(new Event("feedback-pending-changed"));
        return;
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
    }
  };
  const formatDateTimeLocal = (date) => {
    const offset = date.getTimezoneOffset(); // в минутах
    const local = new Date(date.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-base-300 shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Добавить урок</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Тема урока *</label>
          <input
            type="text"
            className="input input-bordered text-base w-full"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Например: React Basics"
          />
        </div>

        <div>
          <label className="block font-medium">Время *</label>
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            min={formatDateTimeLocal(
              new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)
            )}
            max={formatDateTimeLocal(new Date())}
          />
        </div>

        <div>
          <label className="block font-medium">Группа *</label>
          <input
            type="text"
            className="input input-bordered text-base w-full"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="Например: Group A"
          />
        </div>

        <div>
          <label className="block font-medium">Ментор *</label>
          <select
            className="select select-bordered w-full"
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
          >
            <option value="">Выберите ментора</option>
            {mentors.map((mentor) => (
              <option key={mentor._id} value={mentor._id}>
                {`${mentor.name || ""} ${mentor.lastName || ""}`.trim() || "-"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Обратная связь</label>
          <select
            className="select select-bordered w-full"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          >
            <option value="">Выберите обратную связь</option>
            <option value="🔥">🔥 Отлично</option>
            <option value="👍">👍 Хорошо</option>
            <option value="😐">😐 Нормально</option>
            <option value="👎">👎 Плохо</option>
          </select>
        </div>

        {isPlanBlocked && (
          <p className="text-red-500">
            Аккаунт ограничен: пока недоступно добавление уроков из-за невыполненного плана к текущей дате.
          </p>
        )}
        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading || isPlanBlocked}
        >
          {isLoading ? "Сохранение..." : "Добавить урок"}
        </button>
      </form>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default AddLessonPage;
