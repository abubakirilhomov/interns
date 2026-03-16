import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateProfile } from '../store/slices/authSlice';
import GradeBadge from '../components/UI/GradesBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    const token = localStorage.getItem("token");

    try {
      setUploadingPhoto(true);
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "interns");

      const response = await fetch(`${API_URL}/uploads/image`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: data,
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Ошибка загрузки фото");
      }

      setFormData((prev) => ({ ...prev, profilePhoto: result.data.url }));
    } catch (error) {
      console.error("Photo upload error:", error);
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
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.patch('/interns/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Пароль успешно изменён');
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при смене пароля'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Профиль</h1>
          <p className="text-base-content/70 mt-1">
            Управляйте информацией своего профиля
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <GradeBadge grade={user?.grade} />
        </div>
      </div>

      {/* Profile Card */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center space-x-4 mb-6">
            <div className="avatar">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-content text-2xl font-bold">
                {(isEditing ? formData.profilePhoto : user?.profilePhoto) ? (
                  <img
                    src={isEditing ? formData.profilePhoto : user?.profilePhoto}
                    alt={`${user?.name || ""} ${user?.lastName || ""}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className='flex justify-center items-center h-full'>
                    {user?.name?.[0]?.toUpperCase()}
                    {user?.lastName?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                {user?.name} {user?.lastName}
              </h2>
              <p className="text-base-content/70">@{user?.username}</p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Имя</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input input-bordered input-primary"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Фамилия</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input input-bordered input-primary"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Имя пользователя</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input input-bordered input-primary"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Телефон</span>
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input input-bordered input-primary"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Telegram</span>
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  className="input input-bordered input-primary"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Сфера</span>
                </label>
                <select
                  name="sphere"
                  value={formData.sphere}
                  onChange={handleChange}
                  className="select select-bordered"
                >
                  <option value="backend-nodejs">Backend (Node.js)</option>
                  <option value="backend-python">Backend (Python)</option>
                  <option value="frontend-react">Frontend (React)</option>
                  <option value="frontend-vue">Frontend (Vue)</option>
                  <option value="mern-stack">MERN Stack</option>
                  <option value="full-stack">Full Stack</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Фото профиля</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto && <span className="text-xs mt-1">Загрузка...</span>}
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-ghost">
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Имя
                  </h3>
                  <p className="text-lg text-base-content mt-1">{user?.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Фамилия
                  </h3>
                  <p className="text-lg text-base-content mt-1">{user?.lastName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Имя пользователя
                  </h3>
                  <p className="text-lg text-base-content mt-1">@{user?.username}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Телефон
                  </h3>
                  <p className="text-lg text-base-content mt-1">{user?.phoneNumber || '—'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Telegram
                  </h3>
                  <p className="text-lg text-base-content mt-1">{user?.telegram || '—'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Сфера
                  </h3>
                  <p className="text-lg text-base-content mt-1">{user?.sphere || '—'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wide">
                    Уровень
                  </h3>
                  <div className="mt-2">
                    <GradeBadge grade={user?.grade} />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  Редактировать профиль
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Статистика</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-base-content/70">Средний балл</span>
                <span className="font-semibold">{user?.score?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Отзывов получено</span>
                <span className="font-semibold">{user?.feedbacks?.length || 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base-content/70">Филиалы</span>
                {user?.branches?.length
                  ? user.branches.map((b, i) => (
                      <span key={i} className="badge badge-outline badge-sm">
                        {b.branch?.name || String(b.branch)}
                        {b.mentor ? ` · ${b.mentor?.name || ''}` : ''}
                      </span>
                    ))
                  : <span className="font-semibold text-sm">{user?.branchId || 'Не указан'}</span>
                }
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Безопасность</h3>
            <div className="space-y-3">
              {passwordSuccess && !isChangingPassword && (
                <div className="alert alert-success text-sm py-2">
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {!isChangingPassword ? (
                <button
                  onClick={() => { setIsChangingPassword(true); setPasswordSuccess(''); }}
                  className="btn btn-outline btn-warning w-full"
                >
                  Изменить пароль
                </button>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  {passwordError && (
                    <div className="alert alert-error text-sm py-2">
                      <span>{passwordError}</span>
                    </div>
                  )}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Текущий пароль</span>
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="input input-bordered input-primary"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Новый пароль</span>
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="input input-bordered input-primary"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Подтвердите пароль</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input input-bordered input-primary"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm flex-1"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Сохранение...
                        </>
                      ) : (
                        'Сохранить'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordCancel}
                      className="btn btn-ghost btn-sm flex-1"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}
              <button className="btn btn-outline btn-info w-full">
                История входов
              </button>
              <button className="btn btn-outline btn-error w-full">
                Выйти из всех устройств
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
