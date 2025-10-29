import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRatings } from "../store/slices/ratingSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaChartLine,
  FaBuilding,
  FaUserGraduate,
  FaCheckCircle,
  FaBook
} from "react-icons/fa";

const Rating = () => {
  const dispatch = useDispatch();
  const { interns, branches, loading, error } = useSelector(
    (state) => state.rating
  );
  const [activeTab, setActiveTab] = useState("interns");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchRatings());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBranch]);

  const filteredInterns =
    selectedBranch === "all"
      ? interns
      : interns?.filter((intern) => intern.branch === selectedBranch);

  const paginatedInterns = filteredInterns?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((filteredInterns?.length || 0) / itemsPerPage);

  const getMedalIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-700 text-xl md:text-2xl" />;
    if (index === 1) return <FaMedal className="text-gray-400 text-xl md:text-2xl" />;
    if (index === 2) return <FaMedal className="text-amber-700 text-xl md:text-2xl" />;
    return null;
  };

  const getRatingColor = (score) => {
    if (score >= 4.5) return "text-green-500";
    if (score >= 3.5) return "text-blue-500";
    if (score >= 2.5) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error">
          <span>Ошибка загрузки: {error}</span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-base-200 px-3 py-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Заголовок */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-primary flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            <FaTrophy className="text-yellow-500" />
            Рейтинг
          </h1>
          <p className="text-base-content/70 text-sm md:text-base mt-2">
            Оценка успеваемости интернов и филиалов
          </p>
        </div>

        {/* Табы */}
        <div className="tabs tabs-boxed justify-center mb-6 bg-base-100 p-1.5 md:p-2 flex-nowrap overflow-x-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`tab tab-sm md:tab-lg gap-2 whitespace-nowrap ${
              activeTab === "interns" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("interns")}
          >
            <FaUserGraduate />
            Интерны
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`tab tab-sm md:tab-lg gap-2 whitespace-nowrap ${
              activeTab === "branches" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("branches")}
          >
            <FaBuilding />
            Филиалы
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "interns" ? (
            <motion.div
              key="interns"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Фильтр */}
              <div className="mb-6 flex justify-center">
                <select
                  className="select select-bordered select-primary w-full max-w-xs text-sm md:text-base"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="all">Все филиалы</option>
                  {branches?.map((branch) => (
                    <option key={branch.branch} value={branch.branch}>
                      {branch.branch}
                    </option>
                  ))}
                </select>
              </div>

              {/* ТОП 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredInterns?.slice(0, 3).map((intern, index) => (
                  <motion.div
                    key={intern.internId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`card bg-gradient-to-br ${
                      index === 0
                        ? "from-yellow-400 to-yellow-600"
                        : index === 1
                        ? "from-gray-300 to-gray-500"
                        : "from-amber-600 to-amber-800"
                    } text-white shadow-xl`}
                  >
                    <div className="card-body items-center text-center p-4 md:p-6">
                      <div className="mb-1 md:mb-2">{getMedalIcon(index)}</div>
                      <h2 className="card-title text-lg md:text-2xl">{intern.name}</h2>
                      <p className="opacity-90 text-sm">{intern.branch}</p>
                      <div className="badge badge-lg bg-white/20 border-0 mt-2 text-xs md:text-sm">
                        Рейтинг: {intern.ratingScore}
                      </div>
                      <div className="flex gap-3 md:gap-4 mt-3 text-xs md:text-sm flex-wrap justify-center">
                        <div>
                          <FaStar className="inline mr-1" />
                          {intern.averageStars}
                        </div>
                        <div>
                          <FaBook className="inline mr-1" />
                          {intern.lessons}
                        </div>
                        <div>
                          <FaCheckCircle className="inline mr-1" />
                          {intern.planCompletion}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Таблица */}
              <div className="card bg-base-100 shadow-xl overflow-hidden">
                <div className="card-body p-3 md:p-6">
                  <h2 className="card-title text-lg md:text-2xl mb-3 md:mb-4">
                    <FaChartLine className="text-primary" />
                    Полный список
                  </h2>

                  {/* Mobile version: Cards */}
                  <div className="block sm:hidden">
                    {paginatedInterns?.map((intern, index) => {
                      const globalIndex = (currentPage - 1) * itemsPerPage + index;
                      return (
                        <motion.div
                          key={intern.internId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="card bg-base-100 shadow mb-4"
                        >
                          <div className="card-body p-4 text-xs">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-bold">
                                {globalIndex < 3 ? getMedalIcon(globalIndex) : `#${globalIndex + 1}`} {intern.name}
                              </div>
                              <div className={`font-bold ${getRatingColor(intern.ratingScore)}`}>
                                {intern.ratingScore}
                              </div>
                            </div>
                            <div>Филиал: {intern.branch}</div>
                            <div>Курс: <span className="badge badge-primary">{intern.grade}</span></div>
                            <div>
                              <FaStar className="inline text-yellow-500 mr-1" />
                              {intern.averageStars}
                            </div>
                            <div>Уроки: {intern.lessons}</div>
                            <div>Отзывы: {intern.feedbacks}</div>
                            <div>Активность: {(intern.activityRate * 100).toFixed(0)}%</div>
                            <div className="flex items-center">
                              План: 
                              <progress
                                className="progress progress-success ml-2 w-32"
                                value={intern.planCompletion}
                                max="100"
                              ></progress>
                              <span className="ml-2">{intern.planCompletion}%</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Desktop version: Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="table table-zebra text-xs md:text-sm w-full">
                      <thead>
                        <tr>
                          <th className="text-center">#</th>
                          <th>Имя</th>
                          <th className="hidden sm:table-cell">Филиал</th>
                          <th className="hidden md:table-cell">Курс</th>
                          <th className="text-center">Рейтинг</th>
                          <th className="hidden md:table-cell text-center">⭐</th>
                          <th className="hidden md:table-cell text-center">Уроки</th>
                          <th className="hidden md:table-cell text-center">Отзывы</th>
                          <th className="hidden lg:table-cell text-center">Активность</th>
                          <th className="text-center">План %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedInterns?.map((intern, index) => {
                          const globalIndex = (currentPage - 1) * itemsPerPage + index;
                          return (
                            <motion.tr
                              key={intern.internId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.03 }}
                              className="hover"
                            >
                              <td className="text-center font-bold">
                                {globalIndex < 3 ? (
                                  <div className="flex justify-center">
                                    {getMedalIcon(globalIndex)}
                                  </div>
                                ) : (
                                  globalIndex + 1
                                )}
                              </td>
                              <td className="font-semibold">{intern.name}</td>
                              <td className="hidden sm:table-cell">{intern.branch}</td>
                              <td className="hidden md:table-cell text-center">
                                <div className="badge badge-primary">
                                  {intern.grade}
                                </div>
                              </td>
                              <td className={`text-center font-bold ${getRatingColor(intern.ratingScore)}`}>
                                {intern.ratingScore}
                              </td>
                              <td className="hidden md:table-cell text-center">
                                <FaStar className="inline text-yellow-500 mr-1" />
                                {intern.averageStars}
                              </td>
                              <td className="hidden md:table-cell text-center">{intern.lessons}</td>
                              <td className="hidden md:table-cell text-center">{intern.feedbacks}</td>
                              <td className="hidden lg:table-cell text-center">
                                <div className="badge badge-outline">
                                  {(intern.activityRate * 100).toFixed(0)}%
                                </div>
                              </td>
                              <td className="text-center whitespace-nowrap">
                                <progress
                                  className="progress progress-success w-16 md:w-20"
                                  value={intern.planCompletion}
                                  max="100"
                                ></progress>
                                <span className="text-[10px] ml-1">
                                  {intern.planCompletion}%
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <div className="join">
                        <button
                          className="join-item btn btn-sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                          «
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          className="join-item btn btn-sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ФИЛИАЛЫ */
            <motion.div
              key="branches"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {branches?.map((branch, index) => (
                  <motion.div
                    key={branch.branch}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl"
                  >
                    <div className="card-body p-4 md:p-6">
                      <div className="flex items-center justify-between mb-2 md:mb-4">
                        <h2 className="card-title text-base md:text-xl flex items-center gap-2">
                          <FaBuilding className="text-primary" />
                          {branch.branch}
                        </h2>
                        {index < 3 && <div>{getMedalIcon(index)}</div>}
                      </div>

                      <div className="stats stats-vertical shadow text-sm md:text-base">
                        <div className="stat">
                          <div className="stat-title">Средний рейтинг</div>
                          <div
                            className={`stat-value text-2xl md:text-3xl ${getRatingColor(
                              branch.average
                            )}`}
                          >
                            {branch.average}
                          </div>
                          <div className="stat-desc">из 5.0</div>
                        </div>

                        <div className="stat">
                          <div className="stat-title">Интерны</div>
                          <div className="stat-value text-xl md:text-2xl text-primary">
                            {branch.internsCount}
                          </div>
                          <div className="stat-desc flex items-center gap-1">
                            <FaUserGraduate /> активных
                          </div>
                        </div>
                      </div>

                      <div className="card-actions justify-end mt-4">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setActiveTab("interns");
                            setSelectedBranch(branch.branch);
                          }}
                        >
                          Смотреть интернов
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Общая статистика */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card bg-base-100 shadow-xl mt-6 md:mt-8"
              >
                <div className="card-body p-4 md:p-6">
                  <h2 className="card-title text-lg md:text-2xl mb-3 md:mb-4">
                    <FaChartLine className="text-primary" />
                    Общая статистика
                  </h2>
                  <div className="stats stats-vertical sm:stats-horizontal shadow w-full text-sm md:text-base overflow-x-auto">
                    <div className="stat">
                      <div className="stat-title">Филиалов</div>
                      <div className="stat-value text-primary">
                        {branches?.length || 0}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Интернов</div>
                      <div className="stat-value text-secondary">
                        {interns?.length || 0}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Лучший филиал</div>
                      <div className="stat-value text-accent text-lg">
                        {branches?.[0]?.branch || "-"}
                      </div>
                      <div className="stat-desc text-xs md:text-sm">
                        {branches?.[0]?.average || 0} баллов
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Rating;