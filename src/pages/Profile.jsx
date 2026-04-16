import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateProfile } from '../store/slices/authSlice';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const GRADES = ['junior', 'strongJunior', 'middle', 'strongMiddle', 'senior'];
const GRADE_LABELS = {
  junior: 'Junior',
  strongJunior: 'Strong Junior',
  middle: 'Middle',
  strongMiddle: 'Strong Middle',
  senior: 'Senior',
};
const GRADE_COLORS = {
  junior: 'bg-green-500',
  strongJunior: 'bg-blue-500',
  middle: 'bg-yellow-500',
  strongMiddle: 'bg-orange-500',
  senior: 'bg-red-500',
};
const GRADE_BG = {
  junior: 'bg-green-100 text-green-700',
  strongJunior: 'bg-blue-100 text-blue-700',
  middle: 'bg-yellow-100 text-yellow-700',
  strongMiddle: 'bg-orange-100 text-orange-700',
  senior: 'bg-red-100 text-red-700',
};

const Profile = () => {
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
      setPasswordError("Kamida 6 ta belgi bo'lishi kerak");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Parollar mos kelmaydi");
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.patch('/interns/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Parol muvaffaqiyatli o'zgartirildi");
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || error.response?.data?.error || "Parolni o'zgartirishda xatolik"
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
  const photo = user?.profilePhoto;
  const initials = `${user?.name?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const tgLink = (link) =>
    link?.startsWith('@') ? `https://t.me/${link.slice(1)}` : link;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
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
                    Reja bajarilmagan
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
                    {lessonsConfirmed} / {monthlyGoal} dars
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
                    Keyingi daraja: <span className="font-medium">{GRADE_LABELS[nextGrade]}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: avgScore, label: "O'rtacha ball", icon: '⭐' },
          { value: feedbackCount, label: 'Fikrlar soni', icon: '💬' },
          { value: branchCount, label: 'Filiallar', icon: '🏢' },
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

      {/* ═══ TELEGRAM ═══ */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm text-base-content/60 uppercase tracking-wide mb-3">
            Telegram guruhlar
          </h3>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://t.me/+fiZVGvlBSIxkZGQy"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary gap-1"
            >
              Umumiy guruh
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
                  {b.branch?.name || 'Filial'}
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
              Shaxsiy ma'lumotlar
            </h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-ghost btn-primary">
                Tahrirlash
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Ism</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="input input-bordered input-primary" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Familiya</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                    className="input input-bordered input-primary" required />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Username</span></label>
                <input type="text" name="username" value={formData.username} onChange={handleChange}
                  className="input input-bordered input-primary" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Telefon</span></label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                    className="input input-bordered input-primary" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Telegram</span></label>
                  <input type="text" name="telegram" value={formData.telegram} onChange={handleChange}
                    className="input input-bordered input-primary" />
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Soha</span></label>
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
                <label className="label"><span className="label-text font-medium">Profil rasmi</span></label>
                <input type="file" accept="image/*" className="file-input file-input-bordered"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0])} disabled={uploadingPhoto} />
                {uploadingPhoto && <span className="text-xs mt-1">Yuklanmoqda...</span>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
                  {isLoading ? <><LoadingSpinner size="sm" /> Saqlanmoqda...</> : 'Saqlash'}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-ghost btn-sm">Bekor qilish</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ['Ism', user?.name],
                ['Familiya', user?.lastName],
                ['Username', `@${user?.username}`],
                ['Telefon', user?.phoneNumber],
                ['Telegram', user?.telegram],
                ['Soha', user?.sphere],
              ].map(([label, val]) => (
                <div key={label}>
                  <span className="text-base-content/40 text-xs uppercase tracking-wide">{label}</span>
                  <p className="font-medium text-base-content mt-0.5">{val || '—'}</p>
                </div>
              ))}
              <div>
                <span className="text-base-content/40 text-xs uppercase tracking-wide">Daraja</span>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${GRADE_BG[grade]}`}>
                    {GRADE_LABELS[grade]}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-base-content/40 text-xs uppercase tracking-wide">Filiallar</span>
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
            Xavfsizlik
          </h3>

          {passwordSuccess && !isChangingPassword && (
            <div className="alert alert-success text-sm py-2 mb-3"><span>{passwordSuccess}</span></div>
          )}

          {!isChangingPassword ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setIsChangingPassword(true); setPasswordSuccess(''); }}
                className="btn btn-sm btn-outline btn-warning flex-1">
                Parolni o'zgartirish
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              {passwordError && (
                <div className="alert alert-error text-sm py-2"><span>{passwordError}</span></div>
              )}
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Joriy parol</span></label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword}
                  onChange={handlePasswordChange} className="input input-bordered input-primary" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Yangi parol</span></label>
                <input type="password" name="newPassword" value={passwordForm.newPassword}
                  onChange={handlePasswordChange} className="input input-bordered input-primary" required />
                <label className="label"><span className="label-text-alt">Kamida 6 ta belgi</span></label>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Parolni tasdiqlang</span></label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange} className="input input-bordered input-primary" required />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn btn-primary btn-sm flex-1" disabled={passwordLoading}>
                  {passwordLoading ? <><LoadingSpinner size="sm" /> Saqlanmoqda...</> : 'Saqlash'}
                </button>
                <button type="button" onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                }} className="btn btn-ghost btn-sm flex-1">Bekor qilish</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
