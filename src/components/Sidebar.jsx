import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ height: '70px', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--primary-color)', lineHeight: 1.2 }}>E-KAS NU</h2>
        <span style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.2 }}>Ranting NU Karanganyar</span>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/pemasukan" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Pemasukan
            </NavLink>
          </li>
          <li>
            <NavLink to="/pengeluaran" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Pengeluaran
            </NavLink>
          </li>
          <li>
            <NavLink to="/kegiatan" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Kegiatan
            </NavLink>
          </li>
          <li>
            <NavLink to="/laporan" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Laporan
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Kelola User
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', marginBottom: '1rem' }}>
          Logout
        </button>
        <div style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Developer by Muhammad Babun Waseptian
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
