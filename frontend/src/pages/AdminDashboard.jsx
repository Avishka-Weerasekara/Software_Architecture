import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, CreditCard, Activity, ShieldCheck, User as UserIcon, Save, Search, Plus, Trash2, FileText } from 'lucide-react';
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
    fullName: '', email: '', age: '', gender: '', policeId: '', jobPosition: '', workStation: ''
  });

  // Issue Fine States
  const [searchNic, setSearchNic] = useState('');
  const [foundCitizen, setFoundCitizen] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [fineForm, setFineForm] = useState({
    location: '',
    reasons: [{ reason: '', amount: '' }]
  });
  const [fineMessage, setFineMessage] = useState('');

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

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.id]: e.target.value });

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

  const handleSearchNic = async (e) => {
    e.preventDefault();
    if (!searchNic) return;
    setSearchError('');
    setFoundCitizen(null);
    try {
      const res = await api.get(`/admin/users/search?nic=${searchNic}`);
      setFoundCitizen(res.data);
    } catch (error) {
      setSearchError(error.response?.data?.message || error.response?.data || 'Citizen not found.');
    }
  };

  const handleAddReason = () => {
    setFineForm({ ...fineForm, reasons: [...fineForm.reasons, { reason: '', amount: '' }] });
  };

  const handleRemoveReason = (index) => {
    const newReasons = fineForm.reasons.filter((_, i) => i !== index);
    setFineForm({ ...fineForm, reasons: newReasons });
  };

  const handleReasonChange = (index, field, value) => {
    const newReasons = [...fineForm.reasons];
    newReasons[index][field] = value;
    setFineForm({ ...fineForm, reasons: newReasons });
  };

  const calculateTotal = () => {
    return fineForm.reasons.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  };

  const handleSubmitFine = async (e) => {
    e.preventDefault();
    setFineMessage('');
    if (!fineForm.location) {
      setFineMessage('Error: Location is required.');
      return;
    }
    const validReasons = fineForm.reasons.filter(r => r.reason && r.amount);
    if (validReasons.length === 0) {
      setFineMessage('Error: Add at least one valid reason and amount.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/admin/fines', {
        citizenNic: foundCitizen.nic,
        location: fineForm.location,
        reasons: validReasons.map(r => ({ reason: r.reason, amount: parseFloat(r.amount) }))
      });
      setFineMessage('Success: Traffic fine issued and reference generated!');
      setFineForm({ location: '', reasons: [{ reason: '', amount: '' }] });
      setFoundCitizen(null);
      setSearchNic('');
      setTimeout(() => setFineMessage(''), 5000);
    } catch (error) {
      setFineMessage('Error: Failed to issue fine.');
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
          <button onClick={() => setActiveTab('dashboard')} className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`} style={{padding: '0.5rem 1rem', background: activeTab !== 'dashboard' ? 'transparent' : '', border: activeTab !== 'dashboard' ? '1px solid rgba(255,255,255,0.1)' : ''}}>Dashboard</button>
          <button onClick={() => setActiveTab('issueFine')} className={`btn ${activeTab === 'issueFine' ? 'btn-primary' : ''}`} style={{padding: '0.5rem 1rem', background: activeTab !== 'issueFine' ? 'transparent' : '', border: activeTab !== 'issueFine' ? '1px solid rgba(255,255,255,0.1)' : ''}}>
            <FileText size={18} style={{marginRight: '0.5rem'}} /> Issue Fine
          </button>
          <button onClick={() => setActiveTab('profile')} className={`btn ${activeTab === 'profile' ? 'btn-primary' : ''}`} style={{padding: '0.5rem 1rem', background: activeTab !== 'profile' ? 'transparent' : '', border: activeTab !== 'profile' ? '1px solid rgba(255,255,255,0.1)' : ''}}>
            <UserIcon size={18} style={{marginRight: '0.5rem'}} /> Edit Profile
          </button>
          
          <div style={{width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem'}}></div>
          <button onClick={handleLogout} className="btn btn-danger" style={{padding: '0.5rem 1rem'}}><LogOut size={18} style={{marginRight: '0.5rem'}} /> Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-header">
              <h1>{loading ? 'Welcome, Admin' : data.message}</h1>
              <p>Here's an overview of the Traffic Fine System status.</p>
            </div>
            {/* ... stats grid ... */}
            <div className="stats-grid">
              <div className="stat-card glass-panel" style={{borderLeft: '4px solid var(--primary-color)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div className="stat-title">Total Users</div>
                    <div className="stat-value">{loading ? '...' : data.totalUsers}</div>
                  </div>
                  <div style={{background: 'rgba(79, 70, 229, 0.2)', padding: '0.75rem', borderRadius: '12px'}}><Users size={24} color="var(--primary-color)" /></div>
                </div>
              </div>
              <div className="stat-card glass-panel" style={{borderLeft: '4px solid var(--success-color)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div className="stat-title">Total Payments</div>
                    <div className="stat-value">${loading ? '...' : data.totalPayments.toLocaleString()}</div>
                  </div>
                  <div style={{background: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px'}}><CreditCard size={24} color="var(--success-color)" /></div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'issueFine' && (
          <div className="panel-content glass-panel" style={{maxWidth: '900px', margin: '0 auto'}}>
            <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <FileText size={24} color="var(--primary-color)" /> Issue Traffic Fine
            </h2>
            
            <form onSubmit={handleSearchNic} style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
              <input type="text" className="input-field" placeholder="Search Citizen by NIC Number..." value={searchNic} onChange={(e) => setSearchNic(e.target.value)} style={{flex: 1}} />
              <button type="submit" className="btn btn-primary"><Search size={18} style={{marginRight: '0.5rem'}} /> Search</button>
            </form>

            {searchError && <div style={{color: 'var(--danger-color)', marginBottom: '2rem'}}>{searchError}</div>}

            {foundCitizen && (
              <div style={{background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)'}}>
                <h3 style={{marginBottom: '1rem', color: 'var(--primary-color)'}}>Citizen Found</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem'}}>
                  <div><strong style={{color: 'var(--text-muted)'}}>Name:</strong> {foundCitizen.fullName}</div>
                  <div><strong style={{color: 'var(--text-muted)'}}>NIC:</strong> {foundCitizen.nic}</div>
                  <div><strong style={{color: 'var(--text-muted)'}}>Address:</strong> {foundCitizen.address}</div>
                  <div><strong style={{color: 'var(--text-muted)'}}>Contact:</strong> {foundCitizen.telephone}</div>
                </div>

                <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.5rem 0'}}></div>

                <form onSubmit={handleSubmitFine}>
                  <div className="input-group" style={{marginBottom: '1.5rem'}}>
                    <label>Location of Offense</label>
                    <input type="text" className="input-field" placeholder="e.g. Galle Road, Colombo 03" value={fineForm.location} onChange={(e) => setFineForm({...fineForm, location: e.target.value})} required />
                  </div>

                  <label style={{display: 'block', marginBottom: '1rem'}}>Offenses & Fines</label>
                  {fineForm.reasons.map((reason, index) => (
                    <div key={index} style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                      <input type="text" className="input-field" placeholder="Reason (e.g. Speeding)" value={reason.reason} onChange={(e) => handleReasonChange(index, 'reason', e.target.value)} style={{flex: 2}} required />
                      <input type="number" className="input-field" placeholder="Amount (LKR)" value={reason.amount} onChange={(e) => handleReasonChange(index, 'amount', e.target.value)} style={{flex: 1}} required />
                      {fineForm.reasons.length > 1 && (
                        <button type="button" onClick={() => handleRemoveReason(index)} className="btn btn-danger" style={{padding: '0 1rem'}}><Trash2 size={18} /></button>
                      )}
                    </div>
                  ))}
                  
                  <button type="button" onClick={handleAddReason} className="btn" style={{background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.3)', width: '100%', marginBottom: '2rem'}}>
                    <Plus size={18} style={{marginRight: '0.5rem'}} /> Add Another Reason
                  </button>

                  <div style={{background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                    <h3 style={{margin: 0}}>Total Fine Amount:</h3>
                    <h2 style={{margin: 0, color: 'var(--danger-color)'}}>LKR {calculateTotal().toLocaleString()}</h2>
                  </div>

                  {fineMessage && (
                    <div style={{marginBottom: '1.5rem', padding: '1rem', background: fineMessage.includes('Success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: fineMessage.includes('Success') ? 'var(--success-color)' : 'var(--danger-color)', borderRadius: '8px'}}>
                      {fineMessage}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={saving}>
                    {saving ? 'Processing...' : 'Issue Traffic Fine'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="panel-content glass-panel" style={{maxWidth: '800px', margin: '0 auto'}}>
            <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <UserIcon size={24} color="var(--primary-color)" /> Edit Officer Profile
            </h2>
            <form onSubmit={handleSaveProfile}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                  <div className="input-group"><label>Full Name</label><input type="text" id="fullName" className="input-field" value={profile.fullName || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>Email Address</label><input type="email" id="email" className="input-field" value={profile.email || ''} disabled style={{opacity: 0.5}} /></div>
                  <div className="input-group"><label>Age</label><input type="text" inputMode="numeric" id="age" className="input-field" value={profile.age || ''} onChange={(e) => { if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) handleProfileChange(e); }} /></div>
                  <div className="input-group">
                    <label>Gender</label>
                    <select id="gender" className="input-field" value={profile.gender || ''} onChange={handleProfileChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="input-group" style={{gridColumn: '1 / span 2'}}><h3 style={{color: 'var(--text-muted)'}}>Police Assignment</h3></div>
                  <div className="input-group"><label>Police ID</label><input type="text" id="policeId" className="input-field" value={profile.policeId || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>Job Position</label><input type="text" id="jobPosition" className="input-field" value={profile.jobPosition || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group" style={{gridColumn: '1 / span 2'}}><label>Station</label><input type="text" id="workStation" className="input-field" value={profile.workStation || ''} onChange={handleProfileChange} /></div>
                </div>
                {message && <div style={{marginTop: '1.5rem', padding: '1rem', color: 'var(--success-color)'}}>{message}</div>}
                <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end'}}><button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
