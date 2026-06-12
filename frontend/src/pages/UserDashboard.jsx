import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, AlertCircle, CreditCard, User as UserIcon, Printer, Car } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';

const UserDashboard = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [fines, setFines] = useState([]);

  const [profile, setProfile] = useState({
    fullName: '', email: '', age: '', gender: '', address: '', province: '', district: '', nic: '', telephone: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profRes = await api.get('/user/profile');
        setProfile(profRes.data);

        const finesRes = await api.get('/user/fines');
        setFines(finesRes.data);

        const paymentsRes = await api.get('/payment/me');
        setPayments(paymentsRes.data.payments || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location.state && location.state.refresh) {
      const refreshData = async () => {
        setLoading(true);
        try {
          const [finesRes, paymentsRes] = await Promise.all([
            api.get('/user/fines'),
            api.get('/payment/me')
          ]);
          setFines(finesRes.data);
          setPayments(paymentsRes.data.payments || []);
        } catch (error) {
          console.error('Failed to refresh fines or payments:', error);
        } finally {
          setLoading(false);
        }
      };
      refreshData();
      navigate(location.pathname, { replace: true, state: { ...location.state, refresh: false } });
    }
  }, [location, navigate]);

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

  const handleDownloadReceipt = (fine) => {
    const paymentRecord = payments.find((payment) => payment.fineId === fine.id && payment.status === 'SUCCESS');
    if (!paymentRecord) {
      window.alert(t('no_receipt_available'));
      return;
    }

    const receiptFine = fines.find((f) => f.id === paymentRecord.fineId) || fine;
    const paymentDate = paymentRecord.updatedAt || paymentRecord.createdAt || new Date().toISOString();
    const paymentMethod = paymentRecord.paymentMethod || 'Card';
    const receiptWindow = window.open('', '_blank');

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receiptFine.referenceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; background: #f2f5f8; color: #132c40; }
            .receipt { max-width: 700px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 1.6rem; letter-spacing: 0.03em; }
            .details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
            .detail-item label { display: block; font-size: 0.8rem; color: #627d98; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.08em; }
            .detail-item span { display: block; font-size: 0.95rem; font-weight: 600; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { text-align: left; padding: 14px 12px; border-bottom: 1px solid #e8eff5; }
            .table th { color: #4b5d6a; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; }
            .summary { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e8eff5; }
            .summary strong { font-size: 1rem; color: #132c40; }
            .footer { margin-top: 32px; font-size: 0.9rem; color: #5e7488; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div>
                <h1>Payment Receipt</h1>
                <p style="margin:4px 0 0; color:#5e7488;">Traffic Fine Management System</p>
              </div>
              <div style="text-align:right;">
                <p style="margin:0; font-size:0.9rem; color:#5e7488;">Receipt Date</p>
                <strong>${new Date().toLocaleDateString()}</strong>
              </div>
            </div>

            <div class="details">
              <div class="detail-item"><label>Reference</label><span>${receiptFine.referenceNumber}</span></div>
              <div class="detail-item"><label>Fine Status</label><span>${receiptFine.status}</span></div>
              <div class="detail-item"><label>Paid Amount</label><span>LKR ${paymentRecord.amount.toLocaleString()}</span></div>
              <div class="detail-item"><label>Payment Method</label><span>${paymentMethod}</span></div>
              <div class="detail-item"><label>Paid On</label><span>${new Date(paymentDate).toLocaleString()}</span></div>
              <div class="detail-item"><label>Session</label><span>${paymentRecord.paymentId || paymentRecord.id}</span></div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${fine.reasons.map((r) => `
                  <tr>
                    <td>${r.reason}</td>
                    <td>LKR ${r.amount.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary">
              <strong>Total Paid</strong>
              <strong>LKR ${fine.totalAmount.toLocaleString()}</strong>
            </div>

            <div class="footer">
              Thank you for paying your traffic fine. Keep this receipt for your records.
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  const filteredFines = fines.filter((fine) => {
    const matchesTerm = searchTerm.trim() === '' ||
      fine.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.reasons.some((reason) => reason.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || fine.status === statusFilter;
    return matchesTerm && matchesStatus;
  });

  const totalPaidCount = fines.filter((fine) => fine.status === 'PAID').length;
  const totalPendingCount = fines.filter((fine) => fine.status === 'PENDING').length;
  const totalPaidAmount = fines.filter((fine) => fine.status === 'PAID').reduce((sum, fine) => sum + (fine.totalAmount || 0), 0);
  const totalOutstandingAmount = fines.filter((fine) => fine.status === 'PENDING').reduce((sum, fine) => sum + (fine.totalAmount || 0), 0);

  const recentPayments = payments.slice(0, 5);

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

                <div className="dashboard-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('search_fines')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, minWidth: '220px' }}
                  />
                  <select
                    className="input-field"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '180px' }}
                  >
                    <option value="ALL">{t('all_statuses')}</option>
                    <option value="PENDING">{t('pending')}</option>
                    <option value="PAID">{t('paid')}</option>
                  </select>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="tag">{t('total_fines')}: {fines.length}</span>
                    <span className="tag">{t('paid_count')}: {totalPaidCount}</span>
                    <span className="tag">{t('pending_count')}: {totalPendingCount}</span>
                  </div>
                </div>

                {loading ? (
                  <p style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</p>
                ) : fines.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle className="ti" style={{ width: 40, height: 40, opacity: 0.3, margin: '0 auto 1rem auto' }} />
                    <p>{t('no_fines')}</p>
                  </div>
                ) : filteredFines.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle className="ti" style={{ width: 40, height: 40, opacity: 0.3, margin: '0 auto 1rem auto' }} />
                    <p>{t('no_fines_match')}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredFines.map((fine, index) => (
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
                            {fine.status === 'PAID' && (
                              <button onClick={() => handleDownloadReceipt(fine)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                {t('download_receipt')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {payments.length > 0 && (
                  <div className="panel-content glass-panel" style={{ marginTop: '1.75rem' }}>
                    <h2 className="panel-title">
                      <CreditCard size={20} color="var(--color-gold)" /> {t('recent_payments')}
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gold)' }}>{t('fine_ref')}</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-gold)' }}>{t('amount')}</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gold)' }}>{t('status')}</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gold)' }}>{t('date')}</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-gold)' }}>{t('action')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPayments.map((payment) => {
                      const paymentFine = fines.find((f) => f.id === payment.fineId);
                      return (
                        <tr key={payment.id} style={{ borderBottom: '1px solid rgba(201,164,92,0.15)' }}>
                          <td style={{ padding: '1rem', color: '#d0d0d0' }}>{payment.fineReference}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: '#c9a45c', fontWeight: 600 }}>LKR {payment.amount.toLocaleString()}</td>
                          <td style={{ padding: '1rem' }}>{payment.status}</td>
                          <td style={{ padding: '1rem', color: '#a6a195' }}>{new Date(payment.updatedAt || payment.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {payment.status === 'SUCCESS' ? (
                              <button
                                onClick={() => handleDownloadReceipt(paymentFine || { id: payment.fineId, referenceNumber: payment.fineReference, status: payment.status, totalAmount: payment.amount, reasons: [] })}
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              >
                                {t('download_receipt')}
                              </button>
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                        </tbody>
                      </table>
                    </div>
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
