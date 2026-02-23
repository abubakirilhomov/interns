import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const HeadInternWarnings = () => {
  const { user } = useSelector((state) => state.auth);
  const [interns, setInterns] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState("");
  const [selectedRule, setSelectedRule] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [internsRes, rulesRes] = await Promise.all([
          axios.get(`${API_URL}/interns`),
          axios.get(`${API_URL}/rules`),
        ]);

        const allInterns = internsRes.data || [];
        const branchInterns = allInterns.filter(
          (i) =>
            i._id !== user?._id &&
            (i.branch?._id === user?.branchId ||
              i.branch === user?.branchId ||
              i.branch?._id?.toString() === user?.branchId?.toString())
        );
        setInterns(branchInterns);

        const allRules = Array.isArray(rulesRes.data)
          ? rulesRes.data
          : rulesRes.data?.data || [];
        setRules(allRules);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        toast.error("Ошибка при загрузке данных");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getCategoryColor = (category) => {
    switch (category) {
      case "black":
        return "badge-neutral";
      case "red":
        return "badge-error";
      case "yellow":
        return "badge-warning";
      case "green":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIntern || !selectedRule) {
      toast.error("Выберите стажёра и правило");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/interns/${selectedIntern}/warnings`, {
        ruleId: selectedRule,
        notes,
      });

      const internName = interns.find((i) => i._id === selectedIntern);
      toast.success(
        `Предупреждение выдано стажёру ${internName?.name || ""} ${internName?.lastName || ""}`
      );
      setSelectedIntern("");
      setSelectedRule("");
      setNotes("");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Ошибка при выдаче предупреждения";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isHeadIntern) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <div className="alert alert-error">
          <span>Эта страница доступна только Head Intern</span>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-base-300 shadow rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👑</span>
        <h2 className="text-xl font-bold">Выдать предупреждение</h2>
      </div>

      <p className="text-sm text-base-content/70 mb-6">
        Как Head Intern вы можете выдавать предупреждения стажёрам вашего филиала
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Стажёр *</label>
          <select
            className="select select-bordered w-full"
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
            required
          >
            <option value="">Выберите стажёра</option>
            {interns.map((intern) => (
              <option key={intern._id} value={intern._id}>
                {intern.name} {intern.lastName} — {intern.grade}
              </option>
            ))}
          </select>
          {interns.length === 0 && (
            <p className="text-xs text-warning mt-1">
              Нет стажёров в вашем филиале
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Нарушение *</label>
          <select
            className="select select-bordered w-full"
            value={selectedRule}
            onChange={(e) => setSelectedRule(e.target.value)}
            required
          >
            <option value="">Выберите правило</option>
            {rules.map((rule) => (
              <option key={rule._id} value={rule._id}>
                [{rule.category?.toUpperCase()}] {rule.title}
              </option>
            ))}
          </select>

          {selectedRule && (
            <div className="mt-2">
              {(() => {
                const rule = rules.find((r) => r._id === selectedRule);
                if (!rule) return null;
                return (
                  <div className="bg-base-200 rounded p-2 text-sm">
                    <span className={`badge badge-sm ${getCategoryColor(rule.category)} mr-2`}>
                      {rule.category}
                    </span>
                    <span className="font-medium">{rule.title}</span>
                    {rule.example && (
                      <p className="text-xs opacity-70 mt-1">Пример: {rule.example}</p>
                    )}
                    {rule.consequence && (
                      <p className="text-xs text-error mt-1">
                        Последствие: {rule.consequence}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Комментарий</label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Опционально: опишите ситуацию..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="alert alert-warning py-2">
          <span className="text-sm">
            Предупреждение будет зафиксировано в системе и видно администратору
          </span>
        </div>

        <button
          type="submit"
          className="btn btn-warning w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "⚠️ Выдать предупреждение"
          )}
        </button>
      </form>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default HeadInternWarnings;
