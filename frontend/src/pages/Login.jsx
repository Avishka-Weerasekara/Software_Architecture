import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate(`/${result.role.toLowerCase()}/dashboard`);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <LanguageSelector />
      </div>
      <div className="auth-card glass-panel">
        <div className="auth-seal">
          <div className="auth-seal-inner">
            <img src="/logo.png" alt="Sri Lanka Police Logo" />
          </div>
        </div>

        <div className="auth-eyebrow">Sri Lanka Police</div>
        <h1 className="auth-title">{t('app_title')}</h1>
        <p className="auth-subtitle">{t('login_subtitle')}</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">{t('email')}</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? t('loading') : t('login_btn')}
          </button>
        </form>

        <div className="auth-footer">
          {t('no_account')} <Link to="/register">{t('signup_link')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
