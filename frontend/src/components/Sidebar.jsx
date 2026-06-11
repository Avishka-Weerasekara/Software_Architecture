import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

/**
 * Shared sidebar navigation for the dashboard shells.
 *
 * Props:
 * - title: small line under the brand name (role label)
 * - navItems: [{ key, label, icon: LucideIcon }]
 * - activeTab, onTabChange
 * - onLogout
 * - logoutLabel
 */
const Sidebar = ({ title, navItems, activeTab, onTabChange, onLogout, logoutLabel }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ShieldCheck size={20} color="var(--color-gold)" />
        </div>
        <div className="sidebar-brand-text">
          <strong>Traffic Fine Portal</strong>
          <span>{title}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`sidebar-link ${activeTab === key ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <LanguageSelector />
        <button onClick={onLogout} className="btn btn-danger" style={{ width: '100%' }}>
          <LogOut size={16} />
          {logoutLabel}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
