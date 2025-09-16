import axios from "axios";
import { Trash2, AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const Rules = () => {
  const [rules, setRules] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  // Category colors configuration
  const categoryColors = {
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-500 text-black",
    red: "bg-red-500 text-white",
    black: "bg-black text-white",
  };

  useEffect(() => {
    fetchRulesAndGrades();
  }, []);

  const fetchRulesAndGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/rules`);
      
      if (response.data) {
        setRules(response.data.data || []);
        setGrades(response.data.grades || {});
      }
    } catch (error) {
      console.error("Error fetching rules and grades:", error);
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const hasGrades = grades && Object.keys(grades).length > 0;
  const hasRules = rules && rules.length > 0;

  // Mobile Card Component for Rules
  const RuleCard = ({ rule }) => (
    <div className="card bg-base-200 shadow-sm border border-base-300 mb-4">
      <div className="card-body p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-sm md:text-base flex-1">{rule.title}</h3>
          <div
            className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              categoryColors[rule.category] || "bg-gray-300"
            }`}
            title={`Категория: ${rule.category}`}
          >
            <span className="sr-only">{rule.category}</span>
          </div>
        </div>
        
        {rule.example && (
          <div>
            <span className="text-xs font-medium text-base-content/70 uppercase tracking-wide">Пример:</span>
            <p className="text-sm mt-1">{rule.example}</p>
          </div>
        )}
        
        {rule.consequence && (
          <div>
            <span className="text-xs font-medium text-base-content/70 uppercase tracking-wide">Последствие:</span>
            <p className="text-sm mt-1">{rule.consequence}</p>
          </div>
        )}
        
      </div>
    </div>
  );

  // Mobile Card Component for Grades
  const GradeCard = ({ grade, level }) => (
    <div className="card bg-base-200 shadow-sm border border-base-300 mb-4">
      <div className="card-body p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{level}</h3>
          <div className="badge badge-outline text-xs">
            {grade.lessonsPerMonth || 0} уроков
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/70">Пробный период:</span>
          <span className="badge badge-ghost badge-sm">
            {grade.trialPeriod || 0} мес
          </span>
        </div>
        
        {grade.plus && grade.plus.length > 0 && (
          <div>
            <span className="text-xs font-medium text-base-content/70 uppercase tracking-wide block mb-2">
              Дополнительные возможности:
            </span>
            <div className="flex flex-wrap gap-1">
              {grade.plus.map((feature, index) => (
                <div key={index} className="badge badge-secondary badge-sm">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center p-4">
        <div className="alert alert-error w-full max-w-md">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm md:text-base">Ошибка загрузки</h3>
            <div className="text-xs md:text-sm break-words">{error}</div>
          </div>
          <button 
            className="btn btn-sm btn-outline flex-shrink-0"
            onClick={fetchRulesAndGrades}
          >
            <span className="hidden sm:inline">Повторить</span>
            <span className="sm:hidden">↻</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-0">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
          Правила и нарушения
        </h1>
      </div>

      {/* Rules Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 md:p-6">
          <h2 className="card-title text-lg md:text-xl mb-4">Правила</h2>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-xs md:text-sm">Название</th>
                  <th className="text-xs md:text-sm">Категория</th>
                  <th className="text-xs md:text-sm">Пример</th>
                  <th className="text-xs md:text-sm">Последствие</th>
                  <th className="text-xs md:text-sm">Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {hasRules ? (
                  rules.map((rule) => (
                    <tr key={rule._id} className="hover">
                      <td className="font-medium text-sm">{rule.title}</td>
                      <td>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            categoryColors[rule.category] || "bg-gray-300"
                          }`}
                          title={`Категория: ${rule.category}`}
                        >
                          <span className="sr-only">{rule.category}</span>
                        </div>
                      </td>
                      <td className="text-sm">{rule.example || "—"}</td>
                      <td className="text-sm">{rule.consequence || "—"}</td>
                      <td className="text-sm">{formatDate(rule.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-base-content/50 text-sm">
                      Нет правил для отображения
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {hasRules ? (
              rules.map((rule) => (
                <RuleCard key={rule._id} rule={rule} />
              ))
            ) : (
              <div className="text-center py-8 text-base-content/50 text-sm">
                Нет правил для отображения
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grades Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 md:p-6">
          <h2 className="card-title text-lg md:text-xl mb-4">Уровни и привилегии</h2>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-xs md:text-sm">Класс</th>
                  <th className="text-xs md:text-sm">Уроки за месяц</th>
                  <th className="text-xs md:text-sm">Пробный период</th>
                  <th className="text-xs md:text-sm">Дополнительные возможности</th>
                </tr>
              </thead>
              <tbody>
                {hasGrades ? (
                  Object.entries(grades).map(([key, value]) => (
                    <tr key={key} className="hover">
                      <td className="font-medium text-sm">{key}</td>
                      <td>
                        <div className="badge badge-outline text-xs">
                          {value.lessonsPerMonth || 0}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ghost text-xs">
                          {value.trialPeriod || 0} мес
                        </span>
                      </td>
                      <td>
                        {value.plus && value.plus.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {value.plus.map((feature, index) => (
                              <div key={index} className="badge badge-secondary badge-sm text-xs">
                                {feature}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-base-content/50 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-base-content/50 text-sm">
                      Нет уровней для отображения
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {hasGrades ? (
              Object.entries(grades).map(([key, value]) => (
                <GradeCard key={key} grade={value} level={key} />
              ))
            ) : (
              <div className="text-center py-8 text-base-content/50 text-sm">
                Нет уровней для отображения
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;