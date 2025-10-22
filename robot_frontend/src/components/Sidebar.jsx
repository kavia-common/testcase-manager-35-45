import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span style={{ display: 'inline-flex', width: 12, height: 12, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: 3 }} />
        Robot Manager
      </div>
      <nav className="nav">
        <NavLink to="/" end>{({ isActive }) => <span className={isActive ? 'active' : ''}>Dashboard</span>}</NavLink>
        <NavLink to="/testcases">{({ isActive }) => <span className={isActive ? 'active' : ''}>Testcases</span>}</NavLink>
        <NavLink to="/groups">{({ isActive }) => <span className={isActive ? 'active' : ''}>Groups</span>}</NavLink>
        <NavLink to="/scenarios">{({ isActive }) => <span className={isActive ? 'active' : ''}>Scenarios</span>}</NavLink>
        <NavLink to="/run">{({ isActive }) => <span className={isActive ? 'active' : ''}>Execution</span>}</NavLink>
        <NavLink to="/history">{({ isActive }) => <span className={isActive ? 'active' : ''}>History</span>}</NavLink>
        <NavLink to="/logs/last">{({ isActive }) => <span className={isActive ? 'active' : ''}>Logs</span>}</NavLink>
        <NavLink to="/config">{({ isActive }) => <span className={isActive ? 'active' : ''}>Config</span>}</NavLink>
      </nav>
      <div style={{ marginTop: 18 }}>
        <div className="helper">API Base</div>
        <div className="badge">{process.env.REACT_APP_API_BASE || 'http://localhost:3001'}</div>
      </div>
    </aside>
  );
}
