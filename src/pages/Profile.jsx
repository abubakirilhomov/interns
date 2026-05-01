import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { updateProfile } from '../store/slices/authSlice';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import BadgeShowcase from '../components/Gamification/BadgeShowcase';
import { GRADE_ORDER as GRADES, GRADE_LABELS, GRADE_COLORS, GRADE_BG } from '../constants/gradeColors';

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    phoneNumber: user?.phoneNumber || '',
    telegram: user?.telegram || '',
    sphere: user?.sphere || 'backend-nodejs',
    profilePhoto: user?.profilePhoto || '',
  });

  useEffect(() => {
    axios
      .get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch {}
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    const token = localStorage.getItem('token');
    try {
      setUploadingPhoto(true);
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'interns');
      const response = await fetch(`${API_URL}/uploads/image`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: data,
      });
      const result = await response.json();
      if (!response.ok || !result?.success) throw new Error();
      setFormData((prev) => ({ ...prev, profilePhoto: result.data.url }));
    } catch {
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      phoneNumber: user?.phoneNumber || '',
      telegram: user?.telegram || '',
      sphere: user?.sphere || 'backend-nodejs',
      profilePhoto: user?.profilePhoto || '',
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t('profile.minChars'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('profile.passwordsDontMatch'));
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.patch('/interns/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess(t('profile.passwordChanged'));
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || error.response?.data?.error || t('profile.passwordError')
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="min-h-96" />;

  const grade = stats?.grade || user?.grade || 'junior';
  const gradeIdx = GRADES.indexOf(grade);
  const nextGrade = gradeIdx < GRADES.length - 1 ? GRADES[gradeIdx + 1] : null;
  const lessonsConfirmed = stats?.lessonsConfirmed || 0;
  const monthlyGoal = stats?.monthlyGoal || 24;
  const lessonsPct = monthlyGoal > 0 ? Math.min(Math.round((lessonsConfirmed / monthlyGoal) * 100), 100) : 0;
  const rawScore = stats?.averageScore ?? user?.score;
  const avgScore = typeof rawScore === 'number' && Number.isFinite(rawScore) ? rawScore.toFixed(1) : '0.0';
  const feedbackCount = user?.feedbacks?.length || 0;
  const branchCount = user?.branches?.length || 0;
  const isPlanBlocked = stats?.planStatus?.isPlanBlocked || user?.isPlanBlocked;
  const isFrozen = Boolean(user?.status === 'frozen' || user?.isFrozen || stats?.planStatus?.isFrozen);
  const freezeReturnDate = user?.freezeInfo?.expectedReturn || stats?.planStatus?.freezeExpectedReturn
    ? new Date(user?.freezeInfo?.expectedReturn || stats?.planStatus?.freezeExpectedReturn).toLocaleDateString('ru-RU')
    : null;
  const xp = stats?.xp || 0;
  const lvl = stats?.level || 1;
  const xpCurrent = xp - (lvl - 1) * (lvl - 1) * 100;
  const xpNeeded = lvl * lvl * 100 - (lvl - 1) * (lvl - 1) * 100;
  const xpPct = xpNeeded > 0 ? Math.min(Math.round((xpCurrent / xpNeeded) * 100), 100) : 0;
  const photo = user?.profilePhoto;
  const initials = `${user?.name?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const tgLink = (link) =>
    link?.startsWith('@') ? `https://t.me/${link.slice(1)}` : link;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {isFrozen && (
        <div className="alert alert-warning shadow">
          <span>
            {freezeReturnDate
              ? `Аккаунт временно заморожен до ${freezeReturnDate}.`
              : 'Аккаунт временно заморожен.'}
          </span>
        </div>
      )}
      {/* ═══ HERO CARD ═══ */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-primary text-primary-content text-3xl font-bold overflow-hidden shadow-lg">
                {photo ? (
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex justify-center items-center h-full">{initials}</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-2xl font-bold text-base-content leading-tight">
                {user?.name} {user?.lastName}
              </h1>
              <p className="text-base-content/50 text-sm mt-0.5">
                @{user?.username}
                {user?.sphere && <span> · {user.sphere}</span>}
              </p>

              {/* Grade badge + plan status */}
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${GRADE_BG[grade]}`}>
                  {GRADE_LABELS[grade]}
                </span>
                {isPlanBlocked && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                    {t('profile.planBlocked')}
                  </span>
                )}
                {isFrozen && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                    Заморожен
                  </span>
                )}
                {user?.isHeadIntern && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    Head Intern
                  </span>
                )}
              </div>

              {/* Lesson progress bar */}
              <div className="mt-4 w-full max-w-sm mx-auto sm:mx-0">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-base-content">
                    {lessonsConfirmed} / {monthlyGoal} {t('profile.lessonsProgress')}
                  </span>
                  <span className="text-base-content/50">{lessonsPct}%</span>
                </div>
                <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${GRADE_COLORS[grade]}`}
                    style={{ width: `${lessonsPct}%` }}
                  />
                </div>
                {nextGrade && (
                  <p className="text-xs text-base-content/40 mt-1">
                    {t('profile.nextGrade')} <span className="font-medium">{GRADE_LABELS[nextGrade]}</span>
                  </p>
                )}

                {/* XP bar */}
                <div className="mt-3 w-full max-w-sm mx-auto sm:mx-0">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-secondary">
                      {t('gamification.level', { level: lvl })} · {xp} XP
                    </span>
                    <span className="text-base-content/40">{xpCurrent}/{xpNeeded}</span>
                  </div>
                  <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-accent transition-all duration-500"
                      style={{ width: `${xpPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: avgScore, label: t('profile.avgScore'), icon: '⭐' },
          { value: feedbackCount, label: t('profile.feedbackCount'), icon: '💬' },
          { value: branchCount, label: t('profile.branchCount'), icon: '🏢' },
        ].map((s) => (
          <div key={s.label} className="card bg-base-100 shadow">
            <div className="card-body p-4 items-center text-center">
              <span className="text-lg">{s.icon}</span>
              <span className="text-2xl font-bold text-base-content">{s.value}</span>
              <span className="text-xs text-base-content/50">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ BADGES ═══ */}
      <BadgeShowcase />

      {/* ═══ TELEGRAM ═══ */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm text-base-content/60 uppercase tracking-wide mb-3">
            {t('profile.telegramGroups')}
          </h3>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://t.me/+fiZVGvlBSIxkZGQy"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary gap-1"
            >
              {t('profile.generalGroup')}
            </a>
            {user?.branches?.map((b, i) =>
              b.branch?.telegramLink ? (
                <a
                  key={i}
                  href={tgLink(b.branch.telegramLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline btn-primary gap-1"
                >
                  {b.branch?.name || t('profile.branches')}
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* ═══ PERSONAL INFO ═══ */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-base-content/60 uppercase tracking-wide">
              {t('profile.title')}
            </h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-ghost btn-primary">
                {t('profile.edit')}
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">{t('profile.name')}</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="input input-bordered input-primary" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">{t('profile.lastName')}</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="input input-bordered input-primary" required />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">{t('profile.username')}</span></label>
                <input type="text" name="username" value={formData.username} onChange={handleChange}
                  className="input input-bordered input-primary" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">{t('profile.phone')}</span></label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                    className="input input-bordered input-primary" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">{t('profile.telegram')}</span></label>
                  <input type="text" name="telegram" value={formData.telegram} onChange={handleChange}
                    className="input input-bordered input-primary" />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">{t('profile.sphere')}</span></label>
                <select name="sphere" value={formData.sphere} onChange={handleChange} className="select select-bordered">
                  <option value="backend-nodejs">Backend (Node.js)</option>
                  <option value="backend-python">Backend (Python)</option>
                  <option value="frontend-react">Frontend (React)</option>
                  <option value="frontend-vue">Frontend (Vue)</option>
                  <option value="mern-stack">MERN Stack</option>
                  <option value="full-stack">Full Stack</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">{t('profile.profilePhoto')}</span></label>
                <input type="file" accept="image/*" className="file-input file-input-bordered"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0])} disabled={uploadingPhoto} />
                {uploadingPhoto && <span className="text-xs mt-1">{t('common.uploading')}</span>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
                  {isLoading ? <><LoadingSpinner size="sm" /> {t('common.saving')}</> : t('common.save')}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-ghost btn-sm">{t('common.cancel')}</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                [t('profile.name'), user?.name],
                [t('profile.lastName'), user?.lastName],
                [t('profile.username'), `@${user?.username}`],
                [t('profile.phone'), user?.phoneNumber],
                [t('profile.telegram'), user?.telegram],
                [t('profile.sphere'), user?.sphere],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="text-base-content/40 text-xs uppercase tracking-wide">{label}</span>
                  <p className="font-medium text-base-content mt-0.5">{val || '—'}</p>
                </div>
              ))}
              <div>
                <span className="text-base-content/40 text-xs uppercase tracking-wide">{t('profile.grade')}</span>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${GRADE_BG[grade]}`}>
                    {GRADE_LABELS[grade]}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-base-content/40 text-xs uppercase tracking-wide">{t('profile.branches')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user?.branches?.length
                    ? user.branches.map((b, i) => (
                        <span key={i} className="badge badge-outline badge-sm">
                          {b.branch?.name || String(b.branch)}
                        </span>
                      ))
                    : <p className="font-medium text-base-content">—</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SECURITY ═══ */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="font-bold text-sm text-base-content/60 uppercase tracking-wide mb-3">
            {t('profile.security')}
          </h3>

          {passwordSuccess && !isChangingPassword && (
            <div className="alert alert-success text-sm py-2 mb-3"><span>{passwordSuccess}</span></div>
          )}

          {!isChangingPassword ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setIsChangingPassword(true); setPasswordSuccess(''); }}
                className="btn btn-sm btn-outline btn-warning flex-1">
                {t('profile.changePassword')}
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {passwordError && (
                <div className="alert alert-error text-sm py-2"><span>{passwordError}</span></div>
              )}
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">{t('profile.currentPassword')}</span></label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword}
                  onChange={handlePasswordChange} className="input input-bordered input-primary" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">{t('profile.newPassword')}</span></label>
                <input type="password" name="newPassword" value={passwordForm.newPassword}
                  onChange={handlePasswordChange} className="input input-bordered input-primary" required />
                <label className="label"><span className="label-text-alt">{t('profile.minChars')}</span></label>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">{t('profile.confirmPassword')}</span></label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange} className="input input-bordered input-primary" required />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn btn-primary btn-sm flex-1" disabled={passwordLoading}>
                  {passwordLoading ? <><LoadingSpinner size="sm" /> {t('common.saving')}</> : t('common.save')}
                </button>
                <button type="button" onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                }} className="btn btn-ghost btn-sm flex-1">{t('common.cancel')}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
