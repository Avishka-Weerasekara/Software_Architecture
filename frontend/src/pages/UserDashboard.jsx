import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Car, FileText, CreditCard, AlertCircle, User as UserIcon, Save } from 'lucide-react';
import api from '../services/api';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [data, setData] = useState({
    message: 'Loading...',
    paymentHistory: '',
    outstandingFines: 0
  });
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    age: '',
    gender: '',
    address: '',
    province: '',
    district: '',
    nic: '',
    telephone: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashRes = await api.get('/user/dashboard');
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
          <Car color="var(--secondary-color)" />
          <span>Traffic Portal</span>
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
              <h1>{loading ? 'Welcome' : data.message}</h1>
              <p>Manage your vehicles, fines, and payment history.</p>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
              <div className="stat-card glass-panel" style={{borderLeft: data.outstandingFines > 0 ? '4px solid var(--danger-color)' : '4px solid var(--success-color)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div className="stat-title">Outstanding Fines</div>
                    <div className="stat-value" style={{color: data.outstandingFines > 0 ? 'var(--danger-color)' : 'var(--success-color)'}}>
                      ${loading ? '...' : data.outstandingFines.toLocaleString()}
                    </div>
                  </div>
                  <div style={{background: data.outstandingFines > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px'}}>
                    {data.outstandingFines > 0 ? <AlertCircle size={24} color="var(--danger-color)" /> : <CreditCard size={24} color="var(--success-color)" />}
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  style={{marginTop: '1.5rem', width: '100%'}}
                  disabled={data.outstandingFines === 0 || loading}
                >
                  <CreditCard size={18} style={{marginRight: '0.5rem'}} />
                  {data.outstandingFines > 0 ? 'Pay Outstanding Fines' : 'No Fines to Pay'}
                </button>
              </div>

              <div className="stat-card glass-panel">
                <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <FileText size={20} color="var(--text-muted)" />
                  My Vehicles
                </h3>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '100px',
                  color: 'var(--text-muted)'
                }}>
                  <p>No vehicles registered to this account yet.</p>
                </div>
              </div>
            </div>

            <div className="panel-content glass-panel" style={{marginTop: '2rem'}}>
              <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <FileText size={20} color="var(--text-muted)" />
                Payment History
              </h2>
              <div style={{
                background: 'var(--background-dark)', 
                padding: '1.5rem', 
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {loading ? (
                  <p style={{color: 'var(--text-muted)'}}>Loading history...</p>
                ) : (
                  <div style={{color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0'}}>
                    <FileText size={48} style={{opacity: 0.2, margin: '0 auto 1rem auto'}} />
                    <p>{data.paymentHistory}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="panel-content glass-panel" style={{maxWidth: '800px', margin: '0 auto'}}>
            <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <UserIcon size={24} color="var(--primary-color)" />
              Edit Profile
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
                    <h3 style={{color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem'}}>Citizen Details</h3>
                  </div>

                  <div className="input-group" style={{gridColumn: '1 / span 2'}}>
                    <label htmlFor="address">Address</label>
                    <input type="text" id="address" className="input-field" value={profile.address || ''} onChange={handleProfileChange} />
                  </div>

                  <div className="input-group">
                    <label htmlFor="province">Province</label>
                    <input type="text" id="province" className="input-field" value={profile.province || ''} onChange={handleProfileChange} />
                  </div>

                  <div className="input-group">
                    <label htmlFor="district">District</label>
                    <input type="text" id="district" className="input-field" value={profile.district || ''} onChange={handleProfileChange} />
                  </div>

                  <div className="input-group">
                    <label htmlFor="nic">NIC Number</label>
                    <input type="text" id="nic" className="input-field" value={profile.nic || ''} onChange={handleProfileChange} />
                  </div>

                  <div className="input-group">
                    <label htmlFor="telephone">Telephone Number</label>
                    <input type="tel" id="telephone" className="input-field" value={profile.telephone || ''} onChange={handleProfileChange} />
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

export default UserDashboard;
