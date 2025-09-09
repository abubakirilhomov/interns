import axios from "axios";
import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const Rules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get(`${API_URL}/rules`);
        console.log(response.data.data);
        setRules(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const categoryColors = {
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-500 text-black",
    red: "bg-red-500 text-white",
    black: "bg-black text-white",
  };
    if (loading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }
  return (
    <div>
      <p className="text-3xl font-bold mb-4">Правила и нарушения</p>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Пример</th>
                  <th>Последствие</th>
                  <th>Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule._id}>
                    <td>{rule.title}</td>
                    <td>
                      <div
                        className={`w-8 h-8 rounded-full ${
                          categoryColors[rule.category] || "bg-gray-300"
                        }`}
                      ></div>
                    </td>
                    <td>{rule.example || "Нет"}</td>
                    <td>{rule.consequence || "Нет"}</td>
                    <td>
                      {new Date(rule.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;
