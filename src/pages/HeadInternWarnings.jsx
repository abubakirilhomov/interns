import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const HeadInternWarnings = () => {
  const { t } = useTranslation();
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
        // Backend уже скоупит по филиалу (GET /interns фильтрует по user.branchId),
        // здесь только исключаем самого себя.
        const branchInterns = allInterns.filter(
          (i) => String(i._id) !== String(user?._id)
        );
        setInterns(branchInterns);

        const allRules = Array.isArray(rulesRes.data)
          ? rulesRes.data
          : rulesRes.data?.data || [];
        setRules(allRules);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        toast.error(t('headIntern.loadError'));
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
      toast.error(t('headIntern.selectBoth'));
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
        t('headIntern.success', { name: internName?.name || "", lastName: internName?.lastName || "" })
      );
      setSelectedIntern("");
      setSelectedRule("");
      setNotes("");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t('headIntern.submitError');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isHeadIntern) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <div className="alert alert-error">
          <span>{t('headIntern.accessDenied')}</span>
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
    <div className="w-full max-w-lg mx-auto mt-6 sm:mt-10 p-4 sm:p-6 bg-base-100 shadow rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👑</span>
        <h2 className="text-xl font-bold">{t('headIntern.title')}</h2>
      </div>

      <p className="text-sm text-base-content/70 mb-6">
        {t('headIntern.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">{t('headIntern.selectIntern')}</label>
          <select
            className="select select-bordered w-full"
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
            required
          >
            <option value="">{t('headIntern.selectInternPlaceholder')}</option>
            {interns.map((intern) => (
              <option key={intern._id} value={intern._id}>
                {intern.name} {intern.lastName} — {intern.grade}
              </option>
            ))}
          </select>
          {interns.length === 0 && (
            <p className="text-xs text-warning mt-1">
              {t('headIntern.noInterns')}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">{t('headIntern.selectRule')}</label>
          <select
            className="select select-bordered w-full"
            value={selectedRule}
            onChange={(e) => setSelectedRule(e.target.value)}
            required
          >
            <option value="">{t('headIntern.selectRulePlaceholder')}</option>
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
                      <p className="text-xs opacity-70 mt-1">{t('rules.exampleLabel')} {rule.example}</p>
                    )}
                    {rule.consequence && (
                      <p className="text-xs text-error mt-1">
                        {t('rules.consequenceLabel')} {rule.consequence}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">{t('headIntern.comment')}</label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder={t('headIntern.commentPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="alert alert-warning py-2">
          <span className="text-sm">
            {t('headIntern.notice')}
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
            t('headIntern.submitWarning')
          )}
        </button>
      </form>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default HeadInternWarnings;
