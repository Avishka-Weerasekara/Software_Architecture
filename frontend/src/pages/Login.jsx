import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, ShieldAlert } from 'lucide-react';

const Login = () => {
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
      <div className="auth-card glass-panel">
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1.5rem'}}>
          <div style={{
            background: '#ffffff',
            padding: '1.5rem',
            borderRadius: '50%',
            display: 'inline-flex',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <img src="/logo.png" alt="Sri Lanka Police Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
          </div>
        </div>
        
        <h1 className="auth-title">Traffic Fine System</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="input-field" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="input-field" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <div className="error-message" style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%', marginTop: '1rem'}}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)'}}>
          Don't have an account? <Link to="/register" style={{fontWeight: '600'}}>Register now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
