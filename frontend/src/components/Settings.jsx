import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Lock, Smartphone, Shield, Clock, AlertTriangle, Link as LinkIcon, DollarSign } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Profile');

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const tabs = ['Profile', 'Security', 'Notifications', 'Preferences', 'Connected'];

  const renderProfile = () => (
    <div className="card fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'var(--accent-gradient)', color: '#1c1c1e', fontWeight: 700, fontSize: '24px', height: '80px', width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
          {initials}
        </div>
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>{user.name}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{user.email}</p>
          <span style={{ fontSize: '0.75rem', background: 'rgba(184, 115, 51, 0.2)', color: 'var(--accent-light)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>Member</span>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        <div className="form-group mb-4">
          <label className="form-label">First Name</label>
          <input type="text" className="form-control" defaultValue={user.name.split(' ')[0]} />
        </div>
        <div className="form-group mb-4">
          <label className="form-label">Last Name</label>
          <input type="text" className="form-control" defaultValue={user.name.split(' ').slice(1).join(' ')} />
        </div>
      </div>
      
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        <div className="form-group mb-4">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-control" defaultValue={user.email} />
        </div>
        <div className="form-group mb-4">
          <label className="form-label">Phone Number</label>
          <input type="text" className="form-control" placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      <div className="form-group mb-4">
        <label className="form-label">Financial Goal</label>
        <input type="text" className="form-control" defaultValue="Saving up for a new house deposit by 2028." />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary">Save Changes</button>
        <button className="btn btn-outline">Cancel</button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <>
      <div className="list-group fade-in mb-4">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Security Settings</h3>
            <p className="header-caption">Manage your account security and authentication methods</p>
          </div>
        </div>
        
        <div className="list-group-item">
          <div className="list-info">
            <div className="list-icon"><Lock size={20} /></div>
            <div className="list-text">
              <h4>Password</h4>
              <p>Last changed 30 days ago</p>
            </div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Change Password</button>
        </div>

        <div className="list-group-item">
          <div className="list-info">
            <div className="list-icon"><Smartphone size={20} /></div>
            <div className="list-text">
              <h4>Two-Factor Authentication</h4>
              <p style={{ color: 'var(--success)' }}>Enabled via Authenticator App</p>
            </div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Manage</button>
        </div>

        <div className="list-group-item">
          <div className="list-info">
            <div className="list-icon"><Shield size={20} /></div>
            <div className="list-text">
              <h4>Biometric Login</h4>
              <p>Not configured</p>
            </div>
          </div>
          <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Enable</button>
        </div>

        <div className="list-group-item">
          <div className="list-info">
            <div className="list-icon"><Clock size={20} /></div>
            <div className="list-text">
              <h4>Active Sessions</h4>
              <p>3 devices currently logged in</p>
            </div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>View All</button>
        </div>
      </div>

      <div className="list-group fade-in">
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--danger)' }}>Danger Zone</h3>
            <p className="header-caption">Irreversible actions for your account tracking data</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '8px 16px' }}>Delete Account</button>
            <button className="btn btn-outline" style={{ padding: '8px 16px' }}>Export Financial Data</button>
          </div>
        </div>
      </div>
    </>
  );

  const renderNotifications = () => (
    <div className="list-group fade-in">
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem' }}>Notification Preferences</h3>
          <p className="header-caption">Choose how you want to receive updates</p>
        </div>
      </div>

      <div className="list-group-item">
        <div className="list-text">
          <h4>Budget Alerts</h4>
          <p>Get notified when spending crosses your threshold limits</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="list-group-item">
        <div className="list-text">
          <h4>Transaction Updates</h4>
          <p>Receive alerts for deposits and expenses linked to connected bank accounts</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="list-group-item">
        <div className="list-text">
          <h4>Security Alerts</h4>
          <p>Important security notifications and anomalous login alerts</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked />
          <span className="toggle-slider"></span>
        </label>
      </div>
      
      <div className="list-group-item">
        <div className="list-text">
          <h4>Marketing Emails</h4>
          <p>News, updates, and promotional offers from ExpenseTracker</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="list-group-item">
        <div className="list-text">
          <h4>Weekly Report</h4>
          <p>Financial performance summary delivered each week</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="card fade-in">
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem' }}>Display Preferences</h3>
          <p className="header-caption">Customize how your expense app looks and behaves</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        <div className="form-group mb-4">
          <label className="form-label">Currency</label>
          <select className="form-control" defaultValue="INR">
            <option value="INR">INR - Indian Rupee</option>
            <option value="USD">USD - US Dollar</option>
          </select>
        </div>
        <div className="form-group mb-4">
          <label className="form-label">Language</label>
          <select className="form-control" defaultValue="EN">
            <option value="EN">English</option>
            <option value="ES">Spanish</option>
            <option value="FR">French</option>
          </select>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        <div className="form-group mb-4">
          <label className="form-label">Timezone</label>
          <select className="form-control" defaultValue="IST">
            <option value="IST">Indian Standard Time (IST)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div className="form-group mb-4">
          <label className="form-label">Date Format</label>
          <select className="form-control" defaultValue="MM/DD/YYYY">
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="list-group-item" style={{ borderBottom: '1px solid var(--border-color)', padding: '20px 0', background: 'transparent' }}>
        <div className="list-text">
          <h4>Dark Mode</h4>
          <p>Use dark theme for the interface</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="list-group-item" style={{ borderBottom: 'none', padding: '20px 0 30px 0', background: 'transparent' }}>
        <div className="list-text">
          <h4>Compact View</h4>
          <p>Show more ledger rows with smaller row heights</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary">Save Preferences</button>
        <button className="btn btn-outline">Reset to Default</button>
      </div>
    </div>
  );

  const renderConnected = () => (
    <>
      <div className="list-group fade-in mb-4">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem' }}>Connected Accounts</h3>
            <p className="header-caption">Link your banks & cards for seamless synchronization</p>
          </div>
        </div>

        <div className="list-group-item">
          <div className="list-info">
            <div className="list-icon" style={{ background: '#1c1c1e' }}><DollarSign size={20} color="#10b981" /></div>
            <div className="list-text">
              <h4>Bank of America</h4>
              <p style={{ color: 'var(--success)' }}>Connected • Checking (...1234)</p>
            </div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Disconnect</button>
        </div>

        <div className="list-group-item">
          <div className="list-info">
            <div className="list-icon" style={{ background: '#003087' }}><LinkIcon size={20} color="#fff" /></div>
            <div className="list-text">
              <h4>PayPal Integration</h4>
              <p style={{ color: 'var(--success)' }}>Connected • alex.m@email.com</p>
            </div>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Disconnect</button>
        </div>

        <div className="list-group-item">
          <div className="list-info">
             <div className="list-icon" style={{ background: '#f59e0b' }}><AlertTriangle size={20} color="#fff" /></div>
            <div className="list-text">
              <h4>Amex Credit Card</h4>
              <p>Not connected</p>
            </div>
          </div>
          <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Connect</button>
        </div>

        <div style={{ padding: '24px' }}>
          <button className="btn btn-primary">
            + Add Institution
          </button>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile': return renderProfile();
      case 'Security': return renderSecurity();
      case 'Notifications': return renderNotifications();
      case 'Preferences': return renderPreferences();
      case 'Connected': return renderConnected();
      default: return renderProfile();
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content">
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h2>
          <p className="header-caption" style={{ marginBottom: '30px' }}>Manage your account preferences and security</p>

          <div className="tabs-header">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            {renderContent()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
