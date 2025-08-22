import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginIntern, clearError } from '../store/slices/authSlice';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginIntern(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">InternHub</h1>
          <p className="text-base-content/70 text-lg">Добро пожаловать в систему управления стажировками</p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl text-center justify-center mb-6">Вход в систему</h2>
            
            {error && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Имя пользователя</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Введите ваше имя пользователя"
                  className="input input-bordered input-primary w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Пароль</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введите ваш пароль"
                  className="input input-bordered input-primary w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-control mt-8">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Вход...</span>
                    </>
                  ) : (
                    'Войти'
                  )}
                </button>
              </div>
            </form>

            <div className="divider text-base-content/50">или</div>

            <div className="text-center">
              <p className="text-sm text-base-content/70">
                Нет аккаунта? Обратитесь к администратору для регистрации
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-base-content/50">
          © 2024 InternHub. Все права защищены.
        </div>
      </div>
    </div>
  );
};

export default Login;