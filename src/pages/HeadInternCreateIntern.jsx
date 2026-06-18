import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const SPHERES = [
  { value: "backend-nodejs", label: "Backend (Node.js)" },
  { value: "backend-python", label: "Backend (Python)" },
  { value: "frontend-react", label: "Frontend (React)" },
  { value: "frontend-vue", label: "Frontend (Vue)" },
  { value: "mern-stack", label: "MERN Stack" },
  { value: "full-stack", label: "Full Stack" },
];

const STATUS_BADGE = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
};

const emptyForm = {
  name: "",
  lastName: "",
  username: "",
  sphere: "backend-nodejs",
  mentor: "",
  phoneNumber: "",
  telegram: "",
  profilePhoto: "",
};

const HeadInternCreateIntern = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState(emptyForm);
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const activeBranchId =
    localStorage.getItem("activeBranchId") || user?.branchId;

  const loadRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/intern-requests/mine`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t("headInternCreate.loadRequestsError"));
    }
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/mentors`);
        const all = Array.isArray(res.data) ? res.data : res.data?.data || [];
        // Only teaching mentors in the head intern's active branch.
        const filtered = all.filter(
          (m) =>
            m.role === "mentor" &&
            m.branches?.some(
              (b) => String(b._id || b) === String(activeBranchId)
            )
        );
        setMentors(filtered);
      } catch {
        toast.error(t("headInternCreate.submitError"));
      } finally {
        setDataLoading(false);
      }
      loadRequests();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranchId]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "interns");
      const { data } = await axios.post(`/uploads/image`, fd);
      if (!data?.success) throw new Error();
      setForm((prev) => ({ ...prev, profilePhoto: data.data.url }));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || t("headInternCreate.submitError")
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.lastName || !form.username || !form.mentor) {
      toast.error(t("headInternCreate.fillRequired"));
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/intern-requests`, {
        name: form.name,
        lastName: form.lastName,
        username: form.username,
        sphere: form.sphere,
        mentor: form.mentor,
        phoneNumber: form.phoneNumber,
        telegram: form.telegram,
        profilePhoto: form.profilePhoto,
      });
      toast.success(t("headInternCreate.success"));
      setForm(emptyForm);
      loadRequests();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t("headInternCreate.submitError");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isHeadIntern) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <div className="alert alert-error">
          <span>{t("headIntern.accessDenied")}</span>
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
        <h2 className="text-xl font-bold">{t("headInternCreate.title")}</h2>
      </div>
      <p className="text-sm text-base-content/70 mb-6">
        {t("headInternCreate.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">
              {t("headInternCreate.name")}
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              {t("headInternCreate.lastName")}
            </label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">
            {t("headInternCreate.username")}
          </label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">
              {t("headInternCreate.sphere")}
            </label>
            <select
              name="sphere"
              value={form.sphere}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              {SPHERES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">
              {t("headInternCreate.mentor")}
            </label>
            <select
              name="mentor"
              value={form.mentor}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">
                {t("headInternCreate.mentorPlaceholder")}
              </option>
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} {m.lastName}
                </option>
              ))}
            </select>
            {mentors.length === 0 && (
              <p className="text-xs text-warning mt-1">
                {t("headInternCreate.noMentors")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">
              {t("headInternCreate.phone")}
            </label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="+998..."
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              {t("headInternCreate.telegram")}
            </label>
            <input
              name="telegram"
              value={form.telegram}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="@username"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">
            {t("headInternCreate.photo")}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
            className="file-input file-input-bordered w-full"
            disabled={uploading}
          />
          {form.profilePhoto && (
            <img
              src={form.profilePhoto}
              alt=""
              className="mt-2 w-16 h-16 rounded-full object-cover"
            />
          )}
        </div>

        <div className="alert alert-warning py-2">
          <span className="text-sm">{t("headInternCreate.notice")}</span>
        </div>

        <button
          type="submit"
          className="btn btn-warning w-full"
          disabled={loading || uploading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            t("headInternCreate.submit")
          )}
        </button>
      </form>

      {/* My requests */}
      <div className="mt-8">
        <h3 className="font-semibold mb-3">
          {t("headInternCreate.myRequests")}
        </h3>
        {requests.length === 0 ? (
          <p className="text-sm text-base-content/60">
            {t("headInternCreate.noRequests")}
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <div
                key={r._id}
                className="bg-base-200 rounded-xl p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {r.name} {r.lastName} (@{r.username})
                  </span>
                  <span
                    className={`badge badge-sm ${
                      STATUS_BADGE[r.status] || "badge-ghost"
                    }`}
                  >
                    {t(
                      `headInternCreate.status${
                        r.status.charAt(0).toUpperCase() + r.status.slice(1)
                      }`
                    )}
                  </span>
                </div>
                {r.status === "approved" && r.tempPassword && (
                  <div className="mt-2 bg-success/10 border border-success/30 rounded-lg p-2">
                    <p className="text-xs">
                      {t("headInternCreate.tempPassword")}:{" "}
                      <span className="font-mono font-semibold">
                        {r.tempPassword}
                      </span>
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">
                      {t("headInternCreate.changeOnLogin")}
                    </p>
                  </div>
                )}
                {r.status === "rejected" && r.rejectionReason && (
                  <p className="text-xs text-error mt-1">
                    {t("headInternCreate.rejectionReason")}:{" "}
                    {r.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default HeadInternCreateIntern;
