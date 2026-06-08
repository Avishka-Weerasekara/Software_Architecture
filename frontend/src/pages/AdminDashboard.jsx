import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, CreditCard, Activity, ShieldCheck, User as UserIcon, Save } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [data, setData] = useState({
    message: 'Loading...',
    totalUsers: 0,
    totalPayments: 0,
    recentActivities: ''
  });

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    age: '',
    gender: '',
    policeId: '',
    jobPosition: '',
    workStation: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await api.get('/admin/dashboard');
        setData(dashRes.data);

        const profRes = await api.get('/user/profile');
        setProfile(profRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/user/profile', profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <nav className="navbar glass-panel" style={{borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0}}>
        <div className="nav-brand" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <ShieldCheck color="var(--primary-color)" />
          <span>Admin Portal</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
            style={{padding: '0.5rem 1rem', background: activeTab !== 'dashboard' ? 'transparent' : '', border: activeTab !== 'dashboard' ? '1px solid rgba(255,255,255,0.1)' : ''}}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : ''}`}
            style={{padding: '0.5rem 1rem', background: activeTab !== 'profile' ? 'transparent' : '', border: activeTab !== 'profile' ? '1px solid rgba(255,255,255,0.1)' : ''}}
          >
            <UserIcon size={18} style={{marginRight: '0.5rem'}} />
            Edit Profile
          </button>
          
          <div style={{width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem'}}></div>

          <button onClick={handleLogout} className="btn btn-danger" style={{padding: '0.5rem 1rem'}}>
            <LogOut size={18} style={{marginRight: '0.5rem'}} />
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'dashboard' ? (
          <>
            <div className="dashboard-header">
              <h1>{loading ? 'Welcome, Admin' : data.message}</h1>
              <p>Here's an overview of the Traffic Fine System status.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card glass-panel" style={{borderLeft: '4px solid var(--primary-color)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div className="stat-title">Total Users</div>
                    <div className="stat-value">{loading ? '...' : data.totalUsers}</div>
                  </div>
                  <div style={{background: 'rgba(79, 70, 229, 0.2)', padding: '0.75rem', borderRadius: '12px'}}>
                    <Users size={24} color="var(--primary-color)" />
                  </div>
                </div>
              </div>

              <div className="stat-card glass-panel" style={{borderLeft: '4px solid var(--success-color)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div className="stat-title">Total Payments</div>
                    <div className="stat-value">${loading ? '...' : data.totalPayments.toLocaleString()}</div>
                  </div>
                  <div style={{background: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px'}}>
                    <CreditCard size={24} color="var(--success-color)" />
                  </div>
                </div>
              </div>

              <div className="stat-card glass-panel" style={{borderLeft: '4px solid var(--secondary-color)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div className="stat-title">System Status</div>
                    <div className="stat-value" style={{fontSize: '1.5rem', marginTop: '0.5rem', color: 'var(--success-color)'}}>Operational</div>
                  </div>
                  <div style={{background: 'rgba(6, 182, 212, 0.2)', padding: '0.75rem', borderRadius: '12px'}}>
                    <Activity size={24} color="var(--secondary-color)" />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-content glass-panel" style={{marginTop: '2rem'}}>
              <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Activity size={20} color="var(--text-muted)" />
                Recent Activities
              </h2>
              <div style={{
                background: 'var(--background-dark)', 
                padding: '1.5rem', 
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {loading ? (
                  <p style={{color: 'var(--text-muted)'}}>Loading activities...</p>
                ) : (
                  <p>{data.recentActivities}</p>
                )}
                
                <ul style={{marginTop: '1rem', listStylePosition: 'inside', color: 'var(--text-muted)'}}>
                  <li style={{marginBottom: '0.5rem'}}>User "Jane Doe" paid fine #TF-8492</li>
                  <li style={{marginBottom: '0.5rem'}}>New fine issued to plate #ABC-1234</li>
                  <li>System backup completed successfully</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="panel-content glass-panel" style={{maxWidth: '800px', margin: '0 auto'}}>
            <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <UserIcon size={24} color="var(--primary-color)" />
              Edit Officer Profile
            </h2>
            
            {loading ? (
              <p>Loading profile...</p>
            ) : (
              <form onSubmit={handleSaveProfile}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                  
                  <div className="input-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input type="text" id="fullName" className="input-field" value={profile.fullName || ''} onChange={handleProfileChange} />
                  </div>

                  <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" className="input-field" value={profile.email || ''} disabled style={{opacity: 0.5, cursor: 'not-allowed'}} title="Email cannot be changed" />
                  </div>

                  <div className="input-group">
                    <label htmlFor="age">Age</label>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" id="age" className="input-field" value={profile.age || ''} onChange={(e) => {
                      if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) {
                        handleProfileChange(e);
                      }
                    }} />
                  </div>

                  <div className="input-group">
                    <label htmlFor="gender">Gender</label>
                    <select id="gender" className="input-field" value={profile.gender || ''} onChange={handleProfileChange}>
                      <option value="Male" style={{background: 'var(--background-dark)'}}>Male</option>
                      <option value="Female" style={{background: 'var(--background-dark)'}}>Female</option>
                    </select>
                  </div>
                  
                  <div className="input-group" style={{gridColumn: '1 / span 2'}}>
                    <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0'}}></div>
                    <h3 style={{color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem'}}>Police Assignment Details</h3>
                  </div>

                  <div className="input-group">
                    <label htmlFor="policeId">Police ID (Badge Number)</label>
                    <input type="text" id="policeId" className="input-field" value={profile.policeId || ''} onChange={handleProfileChange} />
                  </div>

                  <div className="input-group">
                    <label htmlFor="jobPosition">Job Position / Rank</label>
                    <input type="text" id="jobPosition" className="input-field" value={profile.jobPosition || ''} onChange={handleProfileChange} />
                  </div>

                  <div className="input-group" style={{gridColumn: '1 / span 2'}}>
                    <label htmlFor="workStation">Police Division / Station</label>
                    <input type="text" id="workStation" className="input-field" value={profile.workStation || ''} onChange={handleProfileChange} />
                  </div>

                </div>

                {message && (
                  <div style={{
                    marginTop: '1.5rem', 
                    padding: '1rem', 
                    background: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.includes('success') ? 'var(--success-color)' : 'var(--danger-color)',
                    border: message.includes('success') ? '1px solid var(--success-color)' : '1px solid var(--danger-color)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    {message}
                  </div>
                )}

                <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end'}}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={18} style={{marginRight: '0.5rem'}} />
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
