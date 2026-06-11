import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, AlertCircle, CreditCard, User as UserIcon, Printer, Car } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';

const UserDashboard = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [fines, setFines] = useState([]);

  const [profile, setProfile] = useState({
    fullName: '', email: '', age: '', gender: '', address: '', province: '', district: '', nic: '', telephone: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profRes = await api.get('/user/profile');
        setProfile(profRes.data);

        const finesRes = await api.get('/user/fines');
        setFines(finesRes.data);
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

  const handlePayNow = (fine) => {
    // Navigate to payment processing page with fine ID
    navigate(`/payment-processing?fineId=${fine.id}`);
  };

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

  const calculateTotalOutstanding = () => {
    return fines.filter(f => f.status === 'PENDING').reduce((acc, curr) => acc + curr.totalAmount, 0);
  };

  const handlePrintSlip = (fine) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Traffic Fine Slip - ${fine.referenceNumber}</title>
          <style>
            body { font-family: Georgia, 'Times New Roman', serif; padding: 40px; color: #1a2332; }
            .slip { border: 2px solid #1a2332; padding: 30px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #c9a45c; padding-bottom: 20px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-family: 'Courier New', monospace; font-size: 0.95rem; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            .total { font-size: 1.5rem; font-weight: bold; text-align: right; margin-top: 20px; color: #c1502e; }
            .footer { text-align: center; margin-top: 40px; font-size: 0.9rem; border-top: 1px solid #1a2332; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="header">
              <img src="/logo.png" alt="Logo" style="width: 80px; height: 80px; margin-bottom: 10px;" />
              <h2>SRI LANKA POLICE</h2>
              <h3>OFFICIAL TRAFFIC FINE SLIP</h3>
            </div>

            <div class="row"><strong>Reference No:</strong> <span>${fine.referenceNumber}</span></div>
            <div class="row"><strong>Date / Time:</strong> <span>${fine.fineDate} / ${fine.fineTime}</span></div>
            <div class="row"><strong>Location:</strong> <span>${fine.location}</span></div>
            <div class="row"><strong>Police Officer ID:</strong> <span>${fine.policeId}</span></div>
            <div class="row" style="margin-top: 20px;"><strong>Citizen Name:</strong> <span>${fine.citizenName}</span></div>
            <div class="row"><strong>Citizen NIC:</strong> <span>${fine.citizenNic}</span></div>

            <table class="table">
              <thead>
                <tr>
                  <th>Offense Reason</th>
                  <th style="text-align: right;">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                ${fine.reasons.map(r => `
                  <tr>
                    <td>${r.reason}</td>
                    <td style="text-align: right;">${r.amount.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total">
              TOTAL FINE: LKR ${fine.totalAmount.toLocaleString()}
            </div>

            <div class="footer">
              <p><strong>PAYMENT INSTRUCTIONS</strong></p>
              <p>Please pay the above amount to the following bank account within 14 days.</p>
              <p>Bank: <strong>${fine.bankName}</strong></p>
              <p>Account No: <strong>${fine.bankAccountNumber}</strong></p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const navItems = [
    { key: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { key: 'profile', label: t('profile'), icon: UserIcon },
  ];

  return (
    <div className="app-shell">
      <Sidebar
        title={t('citizen')}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        logoutLabel={t('logout')}
      />

      <div className="dashboard-layout">
        <main className="dashboard-content">
          {activeTab === 'dashboard' ? (
            <>
              <div className="dashboard-header">
                <div className="dashboard-eyebrow">{t('citizen_default')} portal</div>
                <h1>{t('welcome')}, {profile.fullName || t('citizen_default')}</h1>
                <p>{t('manage_desc')}</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-title">{t('outstanding_fines')}</div>
                      <div className="stat-value" style={{ color: calculateTotalOutstanding() > 0 ? 'var(--color-terracotta-light)' : 'var(--color-sage-light)' }}>
                        LKR {loading ? '...' : calculateTotalOutstanding().toLocaleString()}
                      </div>
                    </div>
                    <div className={`stat-icon ${calculateTotalOutstanding() > 0 ? 'terracotta' : 'sage'}`}>
                      {calculateTotalOutstanding() > 0 ? <AlertCircle size={22} color="var(--color-terracotta-light)" /> : <CreditCard size={22} color="var(--color-sage-light)" />}
                    </div>
                  </div>
                </div>

                <div className="stat-card glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div className="stat-title" style={{ marginBottom: 0 }}>{t('my_vehicles')}</div>
                    <div className="stat-icon gold"><Car size={22} color="var(--color-gold)" /></div>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('no_vehicles')}</p>
                </div>
              </div>

              <div className="panel-content glass-panel">
                <h2 className="panel-title">
                  <FileText size={20} color="var(--color-gold)" />
                  {t('my_fines')}
                </h2>

                {loading ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</p>
                ) : fines.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle className="ti" style={{ width: 40, height: 40, opacity: 0.3, margin: '0 auto 1rem auto' }} />
                    <p>{t('no_fines')}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {fines.map((fine, index) => (
                      <div key={index} className={`fine-card ${fine.status === 'PENDING' ? 'pending' : 'paid'}`}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
                            <span className={`stamp ${fine.status === 'PENDING' ? 'pending' : 'paid'}`}>
                              {fine.status}
                            </span>
                            <span className="fine-ref">{fine.referenceNumber}</span>
                          </div>
                          <div className="fine-meta">
                            <strong>{t('date')}:</strong> {fine.fineDate} &nbsp;|&nbsp; <strong>{t('location')}:</strong> {fine.location}
                          </div>
                          <div className="fine-meta">
                            <strong>{t('offenses')}:</strong> {fine.reasons.map(r => r.reason).join(', ')}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className={`fine-amount ${fine.status !== 'PENDING' ? 'paid' : ''}`} style={{ marginBottom: '0.5rem' }}>
                            LKR {fine.totalAmount.toLocaleString()}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {fine.status === 'PENDING' && (
                              <button 
                                onClick={() => handlePayNow(fine)} 
                                className="btn btn-primary" 
                                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              >
                                <CreditCard size={16} />
                                {t('pay_now')}
                              </button>
                            )}
                            <button onClick={() => handlePrintSlip(fine)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                              <Printer size={16} />
                              {t('download_slip')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="panel-content glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 className="panel-title">
                <UserIcon size={22} color="var(--color-gold)" /> {t('profile')}
              </h2>
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group"><label>{t('full_name')}</label><input type="text" id="fullName" className="input-field" value={profile.fullName || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('email')}</label><input type="email" id="email" className="input-field" value={profile.email || ''} disabled style={{ opacity: 0.5 }} /></div>
                  <div className="input-group"><label>{t('age')}</label><input type="text" inputMode="numeric" id="age" className="input-field" value={profile.age || ''} onChange={(e) => { if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) handleProfileChange(e); }} /></div>
                  <div className="input-group"><label>{t('gender')}</label><select id="gender" className="input-field" value={profile.gender || ''} onChange={handleProfileChange}><option value="Male">{t('male')}</option><option value="Female">{t('female')}</option></select></div>
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}><h3 className="section-title">{t('citizen_details')}</h3></div>
                  <div className="input-group" style={{ gridColumn: '1 / span 2' }}><label>{t('address')}</label><input type="text" id="address" className="input-field" value={profile.address || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('province')}</label><input type="text" id="province" className="input-field" value={profile.province || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('district')}</label><input type="text" id="district" className="input-field" value={profile.district || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('nic')}</label><input type="text" id="nic" className="input-field" value={profile.nic || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('telephone')}</label><input type="tel" id="telephone" className="input-field" value={profile.telephone || ''} onChange={handleProfileChange} /></div>
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

export default UserDashboard;
