import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginIntern, clearError, selectBranch } from '../store/slices/authSlice';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, needsBranchSelect, pendingLoginData } = useSelector((state) => state.auth);

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

  // Branch selector screen
  if (needsBranchSelect && pendingLoginData) {
    const branchIds = pendingLoginData.user?.branchIds || [];
    const branches = pendingLoginData.user?.branches || [];
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="max-w-md w-full mx-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl justify-center mb-2">{t('login.selectBranch')}</h2>
              <p className="text-center text-base-content/60 text-sm mb-4">
                {t('login.selectBranchDesc')}
              </p>
              <div className="flex flex-col gap-3">
                {branchIds.map((id, i) => (
                  <button
                    key={id}
                    className="btn btn-outline btn-primary"
                    onClick={() => dispatch(selectBranch(String(id)))}
                  >
                    {branches[i]?.branch?.name || String(id)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">InternHub</h1>
          <p className="text-base-content/70 text-lg">{t('login.subtitle')}</p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl text-center justify-center mb-6">{t('login.title')}</h2>
            
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
                  <span className="label-text font-medium">{t('login.username')}</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={t('login.usernamePlaceholder')}
                  className="input input-bordered input-primary text-base w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t('login.password')}</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('login.passwordPlaceholder')}
                  className="input input-bordered input-primary text-base w-full"
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
                      <span className="ml-2">{t('login.submitting')}</span>
                    </>
                  ) : (
                    t('login.submit')
                  )}
                </button>
              </div>
            </form>

            <div className="divider text-base-content/50">{t('login.or')}</div>

            <div className="text-center">
              <p className="text-sm text-base-content/70">
                {t('login.noAccount')}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-base-content/50">
          {t('login.copyright')}
        </div>
      </div>
    </div>
  );
};

export default Login;