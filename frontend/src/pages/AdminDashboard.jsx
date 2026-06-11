import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, ShieldCheck, User as UserIcon,
  Search, Plus, Trash2, FileText, BarChart3, MapPin
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';

// Palette used for chart series - matches the app's navy/gold/sage/terracotta theme
const CHART_COLORS = ['#c9a45c', '#5c8a6a', '#c1502e', '#7896b3', '#9b7fc2', '#d6a04f'];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [data, setData] = useState({
    message: t('loading'),
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

  // Monitoring states
  const [monitoring, setMonitoring] = useState({ districtCollections: [], categoryBreakdown: [] });
  const [monitoringLoading, setMonitoringLoading] = useState(true);

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

  useEffect(() => {
    if (activeTab !== 'monitoring') return;

    const fetchMonitoring = async () => {
      setMonitoringLoading(true);
      try {
        // Expected shape:
        // { districtCollections: [{ district, total }], categoryBreakdown: [{ category, total }] }
        const res = await api.get('/admin/monitoring');
        const payload = res.data || {};
        setMonitoring({
          districtCollections: Array.isArray(payload.districtCollections) ? payload.districtCollections : [],
          categoryBreakdown: Array.isArray(payload.categoryBreakdown) ? payload.categoryBreakdown : []
        });
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
        setMonitoring({ districtCollections: [], categoryBreakdown: [] });
      } finally {
        setMonitoringLoading(false);
      }
    };
    fetchMonitoring();
  }, [activeTab]);

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
      setMessage(t('save_changes') + ' successful!');
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

  const navItems = [
    { key: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { key: 'issueFine', label: t('issue_fine'), icon: FileText },
    { key: 'monitoring', label: 'Monitoring', icon: BarChart3 },
    { key: 'profile', label: t('profile'), icon: UserIcon },
  ];

  const districtTotal = (monitoring.districtCollections || []).reduce((acc, d) => acc + (d.total || 0), 0);

  return (
    <div className="app-shell">
      <Sidebar
        title="Officer console"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        logoutLabel={t('logout')}
      />

      <div className="dashboard-layout">
        <main className="dashboard-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="dashboard-header">
                <div className="dashboard-eyebrow">Administration</div>
                <h1>{loading ? t('welcome_admin') : data.message}</h1>
                <p>{t('admin_overview')}</p>
              </div>
              <div className="stats-grid">
                <div className="stat-card glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">{t('total_users')}</div>
                      <div className="stat-value">{loading ? '...' : (data.totalUsers ?? 0)}</div>
                    </div>
                    <div className="stat-icon gold"><Users size={22} color="var(--color-gold)" /></div>
                  </div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">{t('total_payments')}</div>
                      <div className="stat-value">LKR {loading ? '...' : (data.totalPayments ?? 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-icon sage"><CreditCard size={22} color="var(--color-sage-light)" /></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'issueFine' && (
            <div className="panel-content glass-panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h2 className="panel-title">
                <FileText size={22} color="var(--color-gold)" /> {t('issue_fine')}
              </h2>

              <form onSubmit={handleSearchNic} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input type="text" className="input-field" placeholder={t('search_nic')} value={searchNic} onChange={(e) => setSearchNic(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary"><Search size={18} /> {t('search')}</button>
              </form>

              {searchError && <div className="feedback-banner error">{searchError}</div>}

              {foundCitizen && (
                <div className="citizen-result">
                  <h3 className="section-title">{t('citizen_found')}</h3>
                  <div className="citizen-grid">
                    <div><strong>{t('full_name')}:</strong> {foundCitizen.fullName}</div>
                    <div><strong>{t('nic')}:</strong> {foundCitizen.nic}</div>
                    <div><strong>{t('address')}:</strong> {foundCitizen.address}</div>
                    <div><strong>{t('telephone')}:</strong> {foundCitizen.telephone}</div>
                  </div>

                  <div className="divider"></div>

                  <form onSubmit={handleSubmitFine}>
                    <div className="input-group">
                      <label>{t('location')}</label>
                      <input type="text" className="input-field" placeholder="e.g. Galle Road, Colombo 03" value={fineForm.location} onChange={(e) => setFineForm({ ...fineForm, location: e.target.value })} required />
                    </div>

                    <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>{t('offenses')}</label>
                    {fineForm.reasons.map((reason, index) => (
                      <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <input type="text" className="input-field" placeholder={t('offense_reason')} value={reason.reason} onChange={(e) => handleReasonChange(index, 'reason', e.target.value)} style={{ flex: 2 }} required />
                        <input type="number" className="input-field" placeholder={t('amount_lkr')} value={reason.amount} onChange={(e) => handleReasonChange(index, 'amount', e.target.value)} style={{ flex: 1 }} required />
                        {fineForm.reasons.length > 1 && (
                          <button type="button" onClick={() => handleRemoveReason(index)} className="btn btn-danger" style={{ padding: '0 1rem' }}><Trash2 size={18} /></button>
                        )}
                      </div>
                    ))}

                    <button type="button" onClick={handleAddReason} className="btn btn-ghost" style={{ width: '100%', marginBottom: '2rem' }}>
                      <Plus size={18} /> {t('add_reason')}
                    </button>

                    <div className="total-banner">
                      <h3>{t('total_fine')}</h3>
                      <span className="amount">LKR {calculateTotal().toLocaleString()}</span>
                    </div>

                    {fineMessage && (
                      <div className={`feedback-banner ${fineMessage.includes('Success') ? 'success' : 'error'}`}>
                        {fineMessage}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                      {saving ? t('processing') : t('submit_fine')}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <>
              <div className="dashboard-header">
                <div className="dashboard-eyebrow">Nationwide oversight</div>
                <h1>Collections monitoring</h1>
                <p>District-wise totals and fine category breakdown across all stations.</p>
              </div>

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="stat-card glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">Total collected</div>
                      <div className="stat-value">LKR {monitoringLoading ? '...' : districtTotal.toLocaleString()}</div>
                    </div>
                    <div className="stat-icon gold"><CreditCard size={22} color="var(--color-gold)" /></div>
                  </div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">Districts reporting</div>
                      <div className="stat-value">{monitoringLoading ? '...' : monitoring.districtCollections.length}</div>
                    </div>
                    <div className="stat-icon sage"><MapPin size={22} color="var(--color-sage-light)" /></div>
                  </div>
                </div>
                <div className="stat-card glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">Fine categories</div>
                      <div className="stat-value">{monitoringLoading ? '...' : monitoring.categoryBreakdown.length}</div>
                    </div>
                    <div className="stat-icon terracotta"><BarChart3 size={22} color="var(--color-terracotta-light)" /></div>
                  </div>
                </div>
              </div>

              <div className="panel-content glass-panel">
                <h2 className="panel-title">
                  <MapPin size={20} color="var(--color-gold)" /> District-wise collections
                </h2>
                {monitoringLoading ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</p>
                ) : monitoring.districtCollections.length === 0 ? (
                  <div className="empty-state">
                    <BarChart3 className="ti" style={{ width: 40, height: 40, opacity: 0.3, margin: '0 auto 1rem auto' }} />
                    <p>No collection data available yet.</p>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monitoring.districtCollections} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="district" stroke="#a6a195" fontSize={12} />
                        <YAxis stroke="#a6a195" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ background: '#15273f', border: '1px solid rgba(201,164,92,0.3)', borderRadius: 8, color: '#f5f1e8' }}
                          formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Collected']}
                        />
                        <Bar dataKey="total" fill="#c9a45c" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="panel-content glass-panel">
                <h2 className="panel-title">
                  <BarChart3 size={20} color="var(--color-gold)" /> Breakdown by fine category
                </h2>
                {monitoringLoading ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</p>
                ) : monitoring.categoryBreakdown.length === 0 ? (
                  <div className="empty-state">
                    <BarChart3 className="ti" style={{ width: 40, height: 40, opacity: 0.3, margin: '0 auto 1rem auto' }} />
                    <p>No category data available yet.</p>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monitoring.categoryBreakdown}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={(entry) => entry.category}
                        >
                          {monitoring.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#15273f', border: '1px solid rgba(201,164,92,0.3)', borderRadius: 8, color: '#f5f1e8' }}
                          formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Collected']}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.85rem', color: '#a6a195' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="panel-content glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 className="panel-title">
                <UserIcon size={22} color="var(--color-gold)" /> {t('profile')}
              </h2>
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group"><label>{t('full_name')}</label><input type="text" id="fullName" className="input-field" value={profile.fullName || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('email')}</label><input type="email" id="email" className="input-field" value={profile.email || ''} disabled style={{ opacity: 0.5 }} /></div>
                  <div className="input-group"><label>{t('age')}</label><input type="text" inputMode="numeric" id="age" className="input-field" value={profile.age || ''} onChange={(e) => { if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) handleProfileChange(e); }} /></div>
                  <div className="input-group">
                    <label>{t('gender')}</label>
                    <select id="gender" className="input-field" value={profile.gender || ''} onChange={handleProfileChange}>
                      <option value="Male">{t('male')}</option>
                      <option value="Female">{t('female')}</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}><h3 className="section-title">{t('police_assignment')}</h3></div>
                  <div className="input-group"><label>{t('police_id')}</label><input type="text" id="policeId" className="input-field" value={profile.policeId || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('job_position')}</label><input type="text" id="jobPosition" className="input-field" value={profile.jobPosition || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}><label>{t('work_station')}</label><input type="text" id="workStation" className="input-field" value={profile.workStation || ''} onChange={handleProfileChange} /></div>
                </div>
                {message && <div className="feedback-banner success">{message}</div>}
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('processing') : t('save_changes')}</button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;