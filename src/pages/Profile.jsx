import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import GradeBadge from '../components/UI/GradesBadge';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
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

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="min-h-96" />;
  }

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto">
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
          <div className="flex items-center space-x-6 mb-6">
            <div className="avatar">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-content text-2xl font-bold">
                <span className='flex justify-center items-center h-full'>{user?.name?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                {user?.name} {user?.lastName}
              </h2>
              <p className="text-base-content/70">@{user?.username}</p>
              <p className="text-sm text-base-content/60 mt-1">
                ID: {user?._id}
              </p>
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
              <div className="flex justify-between">
                <span className="text-base-content/70">ID филиала</span>
                <span className="font-semibold text-sm">{user?.branchId || 'Не указан'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Безопасность</h3>
            <div className="space-y-3">
              <button className="btn btn-outline btn-warning w-full">
                Изменить пароль
              </button>
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