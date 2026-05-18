import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Bell } from 'lucide-react';

const Header = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="top-header">
      <div className="header-title">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your financial overview.</p>
      </div>

      <div className="header-actions">
        <div className="search-bar">
          <Search size={18} color="var(--text-muted)" />
          <input type="text" placeholder="Search..." />
        </div>
        
        <button className="icon-btn notif-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>

        <div className="profile-pill">
          <div className="avatar">{initials}</div>
          <div className="profile-info">
            <span className="profile-name">{user.name}</span>
            <span className="profile-role">Member</span>
          </div>
        </div>
      </div>

      <style>{`
        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30px;
          border-bottom: 1px solid transparent;
        }

        .header-title h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .header-title p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: var(--bg-card);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          width: 280px;
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
          margin-left: 10px;
          width: 100%;
          font-family: inherit;
          font-size: 0.95rem;
        }

        .search-bar input::placeholder {
          color: var(--text-muted);
        }

        .notif-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: var(--radius-md);
          position: relative;
        }

        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--accent-light);
          color: #1c1c1e;
          font-size: 11px;
          font-weight: 700;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .profile-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          padding: 8px 16px 8px 8px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s;
        }

        .profile-pill:hover {
          background: var(--bg-card-hover);
        }

        .avatar {
          background: var(--accent-gradient);
          color: #1c1c1e;
          font-weight: 700;
          height: 38px;
          width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .profile-role {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .top-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .search-bar { display: none; }
        }
      `}</style>
    </header>
  );
};

export default Header;
