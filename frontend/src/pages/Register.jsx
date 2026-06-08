import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    role: 'USER',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Shared
    gender: 'Male',
    age: '',
    // User fields
    address: '',
    province: 'Western',
    district: 'Colombo',
    nic: '',
    telephone: '',
    // Admin fields
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
      district: sriLankaData[newProvince][0] // Reset district to first in list
    });
  };

  const setRole = (newRole) => {
    setFormData({ ...formData, role: newRole, error: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic Validation
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
    <div className="auth-container" style={{ padding: '2rem 1rem' }}>
      <div className="auth-card glass-panel" style={{maxWidth: '650px', padding: '2rem'}}>
        
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
        
        <h1 className="auth-title" style={{fontSize: '1.75rem'}}>Create Account</h1>
        
        {/* Role Selector Tabs */}
        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem', marginTop: '1rem'}}>
          <button 
            type="button"
            onClick={() => setRole('USER')}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s',
              background: formData.role === 'USER' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
              color: formData.role === 'USER' ? '#fff' : 'var(--text-muted)',
              border: formData.role === 'USER' ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <User size={20} /> Citizen User
          </button>
          <button 
            type="button"
            onClick={() => setRole('ADMIN')}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.3s',
              background: formData.role === 'ADMIN' ? 'var(--secondary-color)' : 'rgba(255,255,255,0.05)',
              color: formData.role === 'ADMIN' ? '#fff' : 'var(--text-muted)',
              border: formData.role === 'ADMIN' ? '1px solid var(--secondary-color)' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Shield size={20} /> System Administrator
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* SHARED FIELDS */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" className="input-field" placeholder="John Doe" value={formData.fullName} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" className="input-field" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" className="input-field" placeholder="Create password" value={formData.password} onChange={handleChange} />
            </div>
            
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" className="input-field" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" className="input-field" style={{cursor: 'pointer'}} value={formData.gender} onChange={handleChange}>
                <option value="Male" style={{background: 'var(--background-dark)'}}>Male</option>
                <option value="Female" style={{background: 'var(--background-dark)'}}>Female</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="age">Age</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" id="age" className="input-field" placeholder="Age (e.g. 25)" value={formData.age} onChange={(e) => {
                // Only allow digits to be typed
                const val = e.target.value;
                if (val === '' || /^[0-9\b]+$/.test(val)) {
                  handleChange(e);
                }
              }} />
            </div>
          </div>

          <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1rem 0 1.5rem 0'}}></div>

          {/* DYNAMIC FIELDS: CITIZEN USER */}
          {formData.role === 'USER' && (
            <>
              <div className="input-group">
                <label htmlFor="address">Address</label>
                <input type="text" id="address" className="input-field" placeholder="123 Main Street, City" value={formData.address} onChange={handleChange} />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="input-group">
                  <label htmlFor="province">Province</label>
                  <select id="province" className="input-field" style={{cursor: 'pointer'}} value={formData.province} onChange={handleProvinceChange}>
                    {Object.keys(sriLankaData).map(prov => (
                      <option key={prov} value={prov} style={{background: 'var(--background-dark)'}}>{prov}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="district">District</label>
                  <select id="district" className="input-field" style={{cursor: 'pointer'}} value={formData.district} onChange={handleChange}>
                    {sriLankaData[formData.province].map(dist => (
                      <option key={dist} value={dist} style={{background: 'var(--background-dark)'}}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="nic">NIC Number</label>
                  <input type="text" id="nic" className="input-field" placeholder="199XXXXXXXXX or 99XXXXXXXV" value={formData.nic} onChange={handleChange} />
                </div>

                <div className="input-group">
                  <label htmlFor="telephone">Telephone Number</label>
                  <input type="tel" id="telephone" className="input-field" placeholder="07XXXXXXXX" value={formData.telephone} onChange={handleChange} />
                </div>
              </div>
            </>
          )}

          {/* DYNAMIC FIELDS: SYSTEM ADMINISTRATOR (POLICE) */}
          {formData.role === 'ADMIN' && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="input-group">
                <label htmlFor="province">Province</label>
                <select id="province" className="input-field" style={{cursor: 'pointer'}} value={formData.province} onChange={handleProvinceChange}>
                  {Object.keys(sriLankaData).map(prov => (
                    <option key={prov} value={prov} style={{background: 'var(--background-dark)'}}>{prov}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="district">District</label>
                <select id="district" className="input-field" style={{cursor: 'pointer'}} value={formData.district} onChange={handleChange}>
                  {sriLankaData[formData.province].map(dist => (
                    <option key={dist} value={dist} style={{background: 'var(--background-dark)'}}>{dist}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="policeId">Police ID (Badge Number)</label>
                <input type="text" id="policeId" className="input-field" placeholder="PID-XXXX" value={formData.policeId} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label htmlFor="jobPosition">Job Position / Rank</label>
                <input type="text" id="jobPosition" className="input-field" placeholder="E.g., Inspector, Sergeant" value={formData.jobPosition} onChange={handleChange} />
              </div>

              <div className="input-group" style={{gridColumn: '1 / span 2'}}>
                <label htmlFor="workStation">Police Division / Station</label>
                <input type="text" id="workStation" className="input-field" placeholder="E.g., Colombo Central Police Station" value={formData.workStation} onChange={handleChange} />
              </div>
            </div>
          )}
          
          {error && <div className="error-message" style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{
              width: '100%', marginTop: '1rem', 
              background: formData.role === 'ADMIN' ? 'var(--secondary-color)' : 'var(--primary-color)'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : `Register as ${formData.role === 'USER' ? 'Citizen' : 'Administrator'}`}
          </button>
        </form>
        
        <div style={{marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)'}}>
          Already have an account? <Link to="/login" style={{fontWeight: '600'}}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
