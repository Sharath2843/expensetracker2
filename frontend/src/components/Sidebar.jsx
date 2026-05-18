import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, LogOut, Settings, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => {
    return isActive ? "sidebar-link active" : "sidebar-link";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-icon">ET</div>
        <h2>ExpenseTracker</h2>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">MAIN MENU</p>
        <nav className="sidebar-nav">
          <NavLink to="/" className={navLinkClass}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          {/* We can leave these disabled for future features */}
          <NavLink to="/reports" className={navLinkClass}>
            <BarChart2 size={20} />
            <span>Reports</span>
          </NavLink>
          <NavLink to="/add-expense" className={navLinkClass}>
            <PlusCircle size={20} />
            <span>Add Expense</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-heading">ACCOUNT</p>
        <nav className="sidebar-nav">
          <NavLink to="/settings" className={navLinkClass}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
      
      <style>{`
        .sidebar {
          width: 280px;
          background-color: var(--bg-sidebar);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          z-index: 100;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          padding: 0 10px;
        }

        .logo-icon {
          background: var(--accent-gradient);
          color: #1c1c1e;
          font-weight: 700;
          font-size: 18px;
          height: 40px;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .sidebar-brand h2 {
          font-size: 1.4rem;
          color: var(--text-primary);
          font-weight: 700;
        }

        .sidebar-section {
          margin-bottom: 30px;
        }

        .sidebar-heading {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 1px;
          margin-bottom: 12px;
          padding: 0 10px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 1.05rem;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sidebar-link:hover:not(.disabled) {
          color: var(--text-primary);
          background-color: var(--bg-card);
        }

        .sidebar-link.active {
          background: var(--accent-gradient);
          color: #1c1c1e;
          box-shadow: 0 4px 12px rgba(184, 115, 51, 0.2);
        }

        .sidebar-link.active svg {
          color: #1c1c1e;
        }

        .sidebar-link.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .logout-btn {
          width: 100%;
          color: var(--danger);
        }
        .logout-btn:hover {
          background-color: rgba(194, 120, 120, 0.1) !important;
          color: var(--danger) !important;
        }

        @media (max-width: 1024px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
