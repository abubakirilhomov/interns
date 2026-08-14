import React, { useState } from "react";
import { useSelector } from "react-redux";
import HeadInternDashboard from "./HeadInternDashboard";
import HeadInternInterviews from "./HeadInternInterviews";
import HeadInternWarnings from "./HeadInternWarnings";
import HeadInternCreateIntern from "./HeadInternCreateIntern";

const TABS = [
  {
    id: "activity",
    label: "Aktivlik",
    component: HeadInternDashboard,
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3l7 4 7-4M5 3v14l7 4 7-4V3"
        />
      </svg>
    ),
  },
  {
    id: "interviews",
    label: "Oylik imtihon",
    component: HeadInternInterviews,
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: "warnings",
    label: "Izoh / Shtraf",
    component: HeadInternWarnings,
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "create",
    label: "Yangi intern",
    component: HeadInternCreateIntern,
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    ),
  },
];

const HeadInternPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("activity");

  if (!user?.isHeadIntern) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <div className="alert alert-error">
          <span>Bu sahifaga faqat Head Intern kira oladi</span>
        </div>
      </div>
    );
  }

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || HeadInternDashboard;

  return (
    <div className="w-full">
      {/* Tab navigation */}
      <div className="sticky top-0 z-10 bg-base-200/95 backdrop-blur border-b border-base-300 px-4 sm:px-6 py-3">
        <div className="tabs tabs-boxed flex-wrap gap-1 max-w-6xl mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab tab-lg flex-1 min-w-[130px] ${
                activeTab === tab.id ? "tab-active bg-warning text-warning-content" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="w-full max-w-6xl mx-auto">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default HeadInternPanel;