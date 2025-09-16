import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLesson, resetLessonState } from "../store/slices/lessonSlice";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const AddLessonPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Get logged-in intern
  const { isLoading, error, success } = useSelector((state) => state.lessons);

  const [topic, setTopic] = useState("");
  const [time, setTime] = useState("");
  const [group, setGroup] = useState("");
  const [feedback, setFeedback] = useState("");
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  console.log(success);

  useEffect(() => {
    if (success) {
      toast.success("Успешно отправлено");
      dispatch(resetLessonState()); // сбрасываем success
    }
  }, [success, dispatch]);

  // Fetch available mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(`${API_URL}/mentors`);
        setMentors(res.data);
      } catch (err) {
        console.error("Ошибка при загрузке менторов:", err);
      }
    };
    fetchMentors();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic || !time || !group || !selectedMentor) {
      return alert("Пожалуйста, заполните все обязательные поля");
    }

    const lessonData = {
      intern: user?._id,
      mentor: selectedMentor,
      topic,
      time,
      group,
      feedback: feedback || undefined, // Optional field
    };

    dispatch(createLesson(lessonData));

    setTopic("");
    setTime("");
    setGroup("");
    setFeedback("");
    setSelectedMentor("");
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
                {mentor.name}
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

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? "Сохранение..." : "Добавить урок"}
        </button>
      </form>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default AddLessonPage;
