import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { setSession } from "../store/slices/authSlice";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const parseFragment = () => {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const out = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
};

const MarsIdReturn = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [linkage, setLinkage] = useState(null);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fragment = useMemo(() => parseFragment(), []);

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (fragment.marsIdError) {
      setError(decodeURIComponent(fragment.marsIdError));
      return;
    }
    if (fragment.token && fragment.user) {
      try {
        const user = JSON.parse(fragment.user);
        dispatch(setSession({
          token: fragment.token,
          refreshToken: fragment.refreshToken,
          user,
        }));
      } catch {
        setError("Не удалось разобрать ответ Mars ID");
      }
      return;
    }
    if (fragment.linkageToken) {
      setLinkage({
        token: fragment.linkageToken,
        handle: fragment.handle || "",
        kind: fragment.kind || "intern",
      });
      return;
    }
    setError("Mars ID не вернул ни сессию, ни запрос на привязку");
  }, [dispatch, fragment]);

  const handleLink = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/marsid/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkageToken: linkage.token,
          username: username.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Не удалось привязать Mars ID");
        return;
      }
      dispatch(setSession(data));
    } catch {
      setError("Ошибка сети при привязке");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  if (linkage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body">
            <h2 className="card-title text-xl justify-center mb-2">Привяжите Mars ID</h2>
            <p className="text-center text-sm text-base-content/70 mb-4">
              Mars ID {linkage.handle && <strong>@{linkage.handle}</strong>} ещё не привязан к
              вашему аккаунту. Введите ваш текущий username и пароль интерна — это разовая
              процедура.
            </p>
            <form onSubmit={handleLink} className="space-y-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Username</span></label>
                <input
                  className="input input-bordered"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Пароль</span></label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="alert alert-error text-sm">{error}</div>}
              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? <LoadingSpinner size="sm" /> : "Привязать и войти"}
              </button>
              <Link to="/login" className="btn btn-ghost w-full">Отмена</Link>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body items-center text-center">
          {error ? (
            <>
              <h2 className="card-title">Ошибка Mars ID</h2>
              <p className="text-sm text-base-content/70">{error}</p>
              <Link to="/login" className="btn btn-primary mt-4">Вернуться ко входу</Link>
            </>
          ) : (
            <>
              <LoadingSpinner />
              <p className="mt-3">Завершаем вход через Mars ID…</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarsIdReturn;
