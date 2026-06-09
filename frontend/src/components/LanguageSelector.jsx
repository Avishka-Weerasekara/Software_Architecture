import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Globe size={16} color="var(--primary-color)" />
      <select 
        value={i18n.language} 
        onChange={changeLanguage}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-light)',
          outline: 'none',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        <option value="en" style={{color: '#000'}}>English</option>
        <option value="si" style={{color: '#000'}}>සිංහල (Sinhala)</option>
        <option value="ta" style={{color: '#000'}}>தமிழ் (Tamil)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
