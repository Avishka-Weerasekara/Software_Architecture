import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Car, FileText, CreditCard, AlertCircle, User as UserIcon, Save, Printer } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [data, setData] = useState({
    message: t('loading'),
    paymentHistory: '',
    outstandingFines: 0
  });

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
        const dashRes = await api.get('/user/dashboard');
        setData(dashRes.data);
        
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
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #000; }
            .slip { border: 2px dashed #333; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            .total { font-size: 1.5rem; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; font-size: 0.9rem; border-top: 1px solid #333; padding-top: 20px; }
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

  return (
    <div className="dashboard-layout">
      <nav className="navbar glass-panel" style={{borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem'}}>
        
        {/* Row 1: Title in center, Exit button on right */}
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative'}}>
          <div className="nav-brand" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.75rem'}}>
            <Car color="var(--secondary-color)" size={32} />
            <span>{t('app_title')}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-danger" style={{position: 'absolute', right: 0, borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}} title={t('logout')}>
            <LogOut size={18} />
          </button>
        </div>

        {/* Row 2: Navigation controls */}
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', width: '100%'}}>
          <button onClick={() => setActiveTab('dashboard')} className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`} style={{padding: '0.5rem 1rem', background: activeTab !== 'dashboard' ? 'transparent' : '', border: activeTab !== 'dashboard' ? '1px solid rgba(255,255,255,0.1)' : ''}}>
            {t('dashboard')}
          </button>
          <button onClick={() => setActiveTab('profile')} className={`btn ${activeTab === 'profile' ? 'btn-primary' : ''}`} style={{padding: '0.5rem 1rem', background: activeTab !== 'profile' ? 'transparent' : '', border: activeTab !== 'profile' ? '1px solid rgba(255,255,255,0.1)' : ''}}>
            <UserIcon size={18} style={{marginRight: '0.5rem'}} /> {t('profile')}
          </button>
          <div style={{width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem'}}></div>
          <LanguageSelector />
        </div>

      </nav>

      <main className="dashboard-content">
        {activeTab === 'dashboard' ? (
          <>
            <div className="dashboard-header">
              <h1>{t('welcome')}, {profile.fullName || t('citizen_default')}</h1>
              <p>{t('manage_desc')}</p>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'}}>
              <div className="stat-card glass-panel" style={{borderLeft: calculateTotalOutstanding() > 0 ? '4px solid var(--danger-color)' : '4px solid var(--success-color)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div className="stat-title">{t('outstanding_fines')}</div>
                    <div className="stat-value" style={{color: calculateTotalOutstanding() > 0 ? 'var(--danger-color)' : 'var(--success-color)'}}>
                      LKR {loading ? '...' : calculateTotalOutstanding().toLocaleString()}
                    </div>
                  </div>
                  <div style={{background: calculateTotalOutstanding() > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px'}}>
                    {calculateTotalOutstanding() > 0 ? <AlertCircle size={24} color="var(--danger-color)" /> : <CreditCard size={24} color="var(--success-color)" />}
                  </div>
                </div>
              </div>

              <div className="stat-card glass-panel">
                <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <FileText size={20} color="var(--text-muted)" />
                  {t('my_vehicles')}
                </h3>
                <div style={{background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', color: 'var(--text-muted)'}}>
                  <p>{t('no_vehicles')}</p>
                </div>
              </div>
            </div>

            <div className="panel-content glass-panel" style={{marginTop: '2rem'}}>
              <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <AlertCircle size={20} color="var(--danger-color)" />
                {t('my_fines')}
              </h2>
              
              {loading ? (
                <p style={{color: 'var(--text-muted)'}}>{t('loading')}</p>
              ) : fines.length === 0 ? (
                <div style={{background: 'var(--background-dark)', padding: '3rem', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)'}}>
                  <AlertCircle size={48} style={{opacity: 0.2, margin: '0 auto 1rem auto'}} />
                  <p>{t('no_fines')}</p>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {fines.map((fine, index) => (
                    <div key={index} style={{
                      background: 'var(--background-dark)', 
                      padding: '1.5rem', 
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                          <span style={{background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                            {fine.status}
                          </span>
                          <strong style={{fontSize: '1.1rem'}}>{fine.referenceNumber}</strong>
                        </div>
                        <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem'}}>
                          <strong>{t('date')}:</strong> {fine.fineDate} | <strong>{t('location')}:</strong> {fine.location}
                        </div>
                        <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                          <strong>{t('offenses')}:</strong> {fine.reasons.map(r => r.reason).join(', ')}
                        </div>
                      </div>
                      
                      <div style={{textAlign: 'right'}}>
                        <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger-color)', marginBottom: '0.5rem'}}>
                          LKR {fine.totalAmount.toLocaleString()}
                        </div>
                        <button onClick={() => handlePrintSlip(fine)} className="btn" style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem'}}>
                          <Printer size={16} style={{marginRight: '0.5rem'}} />
                          {t('download_slip')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="panel-content glass-panel" style={{maxWidth: '800px', margin: '0 auto'}}>
            <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <UserIcon size={24} color="var(--primary-color)" /> {t('profile')}
            </h2>
            <form onSubmit={handleSaveProfile}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                  <div className="input-group"><label>{t('full_name')}</label><input type="text" id="fullName" className="input-field" value={profile.fullName || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('email')}</label><input type="email" id="email" className="input-field" value={profile.email || ''} disabled style={{opacity: 0.5}} /></div>
                  <div className="input-group"><label>{t('age')}</label><input type="text" inputMode="numeric" id="age" className="input-field" value={profile.age || ''} onChange={(e) => { if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) handleProfileChange(e); }} /></div>
                  <div className="input-group"><label>{t('gender')}</label><select id="gender" className="input-field" value={profile.gender || ''} onChange={handleProfileChange}><option value="Male">{t('male')}</option><option value="Female">{t('female')}</option></select></div>
                  <div className="input-group" style={{gridColumn: '1 / span 2'}}><h3 style={{color: 'var(--text-muted)'}}>{t('citizen_details')}</h3></div>
                  <div className="input-group" style={{gridColumn: '1 / span 2'}}><label>{t('address')}</label><input type="text" id="address" className="input-field" value={profile.address || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('province')}</label><input type="text" id="province" className="input-field" value={profile.province || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('district')}</label><input type="text" id="district" className="input-field" value={profile.district || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('nic')}</label><input type="text" id="nic" className="input-field" value={profile.nic || ''} onChange={handleProfileChange} /></div>
                  <div className="input-group"><label>{t('telephone')}</label><input type="tel" id="telephone" className="input-field" value={profile.telephone || ''} onChange={handleProfileChange} /></div>
                </div>
                {message && <div style={{marginTop: '1.5rem', padding: '1rem', color: 'var(--success-color)'}}>{message}</div>}
                <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'flex-end'}}><button type="submit" className="btn btn-primary">{t('save_changes')}</button></div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
