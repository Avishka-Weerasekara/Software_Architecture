import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

const sriLankaData = {
  "Western": ["Colombo", "Gampaha", "Kalutara"],
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Southern": ["Galle", "Matara", "Hambantota"],
  "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
  "Eastern": ["Batticaloa", "Ampara", "Trincomalee"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "Uva": ["Badulla", "Monaragala"],
  "Sabaragamuwa": ["Ratnapura", "Kegalle"]
};

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    role: 'USER',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    age: '',
    address: '',
    province: 'Western',
    district: 'Colombo',
    nic: '',
    telephone: '',
    policeId: '',
    jobPosition: '',
    workStation: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleProvinceChange = (e) => {
    const newProvince = e.target.value;
    setFormData({
      ...formData,
      province: newProvince,
      district: sriLankaData[newProvince][0]
    });
  };

  const setRole = (newRole) => {
    setFormData({ ...formData, role: newRole });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.age) {
      setError('Please fill in all core fields.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'USER') {
      if (!formData.nic || !formData.address || !formData.telephone) {
        setError('Please fill in all Citizen fields (NIC, Address, Telephone).');
        setIsLoading(false);
        return;
      }
    } else {
      if (!formData.policeId || !formData.jobPosition || !formData.workStation) {
        setError('Please fill in all Officer fields (Police ID, Position, Station).');
        setIsLoading(false);
        return;
      }
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate(`/${result.role.toLowerCase()}/dashboard`);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container" style={{ padding: '2.5rem 1rem' }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <LanguageSelector />
      </div>
      <div className="auth-card glass-panel" style={{ maxWidth: '650px' }}>

        <div className="auth-seal">
          <div className="auth-seal-inner">
            <img src="/logo.png" alt="Sri Lanka Police Logo" />
          </div>
        </div>

        <div className="auth-eyebrow">Sri Lanka Police</div>
        <h1 className="auth-title">{t('register_title')}</h1>
        <p className="auth-subtitle">{t('register_subtitle')}</p>

        <div className="role-tabs">
          <button
            type="button"
            onClick={() => setRole('USER')}
            className={`role-tab ${formData.role === 'USER' ? 'active' : ''}`}
          >
            <User size={18} /> {t('citizen')}
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`role-tab ${formData.role === 'ADMIN' ? 'active' : ''}`}
          >
            <Shield size={18} /> {t('police')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label htmlFor="fullName">{t('full_name')}</label>
              <input type="text" id="fullName" className="input-field" placeholder="John Doe" value={formData.fullName} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="email">{t('email')}</label>
              <input type="email" id="email" className="input-field" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="password">{t('password')}</label>
              <input type="password" id="password" className="input-field" placeholder="Create password" value={formData.password} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" className="input-field" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="gender">{t('gender')}</label>
              <select id="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="age">{t('age')}</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" id="age" className="input-field" placeholder="Age (e.g. 25)" value={formData.age} onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[0-9\b]+$/.test(val)) {
                  handleChange(e);
                }
              }} />
            </div>
          </div>

          <div className="auth-divider"></div>

          {formData.role === 'USER' && (
            <>
              <div className="input-group">
                <label htmlFor="address">{t('address')}</label>
                <input type="text" id="address" className="input-field" placeholder="123 Main Street, City" value={formData.address} onChange={handleChange} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label htmlFor="province">{t('province')}</label>
                  <select id="province" className="input-field" value={formData.province} onChange={handleProvinceChange}>
                    {Object.keys(sriLankaData).map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="district">{t('district')}</label>
                  <select id="district" className="input-field" value={formData.district} onChange={handleChange}>
                    {sriLankaData[formData.province].map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="nic">{t('nic')}</label>
                  <input type="text" id="nic" className="input-field" placeholder="199XXXXXXXXX or 99XXXXXXXV" value={formData.nic} onChange={handleChange} />
                </div>

                <div className="input-group">
                  <label htmlFor="telephone">{t('telephone')}</label>
                  <input type="tel" id="telephone" className="input-field" placeholder="07XXXXXXXX" value={formData.telephone} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          {formData.role === 'ADMIN' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label htmlFor="province">{t('province')}</label>
                <select id="province" className="input-field" value={formData.province} onChange={handleProvinceChange}>
                  {Object.keys(sriLankaData).map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="district">{t('district')}</label>
                <select id="district" className="input-field" value={formData.district} onChange={handleChange}>
                  {sriLankaData[formData.province].map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="policeId">{t('police_id')}</label>
                <input type="text" id="policeId" className="input-field" placeholder="PID-XXXX" value={formData.policeId} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label htmlFor="jobPosition">{t('job_position')}</label>
                <input type="text" id="jobPosition" className="input-field" placeholder="E.g., Inspector, Sergeant" value={formData.jobPosition} onChange={handleChange} />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
                <label htmlFor="workStation">{t('work_station')}</label>
                <input type="text" id="workStation" className="input-field" placeholder="E.g., Colombo Central Police Station" value={formData.workStation} onChange={handleChange} />
              </div>
            </div>
          )}

          {error && <div className="error-message" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? t('loading') : t('register_btn')}
          </button>
        </form>

        <div className="auth-footer">
          {t('have_account')} <Link to="/login">{t('login_link')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
