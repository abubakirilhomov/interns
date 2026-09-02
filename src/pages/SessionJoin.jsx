import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const HEARTBEAT_INTERVAL_MS = 20 * 1000;

const fmtDateTime = (d) =>
  new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

const SessionJoin = () => {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [excuseMode, setExcuseMode] = useState(false);
  const [excuseText, setExcuseText] = useState("");
  const [excuseSubmitting, setExcuseSubmitting] = useState(false);
  const heartbeatRef = useRef(null);

  useEffect(() => {
    fetchInfo();
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      // best-effort — sahifadan chiqayotganda serverga xabar beramiz
      axios.post(`${API_URL}/monthly-interview-sessions/token/${token}/leave`).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/monthly-interview-sessions/token/${token}`);
      setInfo(res.data);
      setJoined(!!res.data.myAttendance?.joinedAt);
      if (res.data.myAttendance?.excuseReason) {
        setExcuseText(res.data.myAttendance.excuseReason);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Sessiya topilmadi");
    } finally {
      setLoading(false);
    }
  };

  const startHeartbeat = () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = setInterval(() => {
      axios
        .post(`${API_URL}/monthly-interview-sessions/token/${token}/heartbeat`)
        .catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);
  };

  const handleJoin = async () => {
    try {
      await axios.post(`${API_URL}/monthly-interview-sessions/token/${token}/join`);
      setJoined(true);
      startHeartbeat();
      window.open(info.meetingUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleExcuseSubmit = async () => {
    if (!excuseText.trim()) {
      toast.error("Sababni kiriting");
      return;
    }
    setExcuseSubmitting(true);
    try {
      await axios.post(`${API_URL}/monthly-interview-sessions/token/${token}/excuse`, {
        reason: excuseText.trim(),
      });
      toast.success("Sabab yuborildi");
      setExcuseMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setExcuseSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6">
      <div className="bg-base-100 shadow rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold">📹 Oylik online suhbat</h2>
        <p className="text-base-content/70">{fmtDateTime(info.scheduledAt)}</p>

        {info.status === "finalized" ? (
          <div
            className={`alert ${
              info.myAttendance?.result === "present" ? "alert-success" : "alert-error"
            }`}
          >
            <span>
              {info.myAttendance?.result === "present"
                ? "Siz suhbatga kirgansiz ✅"
                : "Siz suhbatga kirmagansiz — sessiya yakunlangan"}
            </span>
          </div>
        ) : (
          <>
            {joined ? (
              <div className="alert alert-success">
                <span>Kirganingiz qayd etildi. Suhbat oynasi yangi tabda ochildi.</span>
              </div>
            ) : (
              <button className="btn btn-primary w-full" onClick={handleJoin}>
                Suhbatga kirish
              </button>
            )}

            {!excuseMode ? (
              <button
                className="btn btn-ghost btn-sm w-full"
                onClick={() => setExcuseMode(true)}
              >
                Kira olmayman
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Sababni yozing..."
                  value={excuseText}
                  onChange={(e) => setExcuseText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => setExcuseMode(false)}
                    disabled={excuseSubmitting}
                  >
                    Bekor qilish
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleExcuseSubmit}
                    disabled={excuseSubmitting}
                  >
                    {excuseSubmitting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      "Yuborish"
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SessionJoin;
