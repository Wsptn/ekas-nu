import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const closeMobileSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ height: '70px', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--primary-color)', lineHeight: 1.2 }}>E-KAS NU</h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.2 }}>Ranting NU Karanganyar</span>
        </div>
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          ☰
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end onClick={closeMobileSidebar} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/pemasukan" onClick={closeMobileSidebar} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Pemasukan
            </NavLink>
          </li>
          <li>
            <NavLink to="/pengeluaran" onClick={closeMobileSidebar} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Pengeluaran
            </NavLink>
          </li>
          <li>
            <NavLink to="/kegiatan" onClick={closeMobileSidebar} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Kegiatan
            </NavLink>
          </li>
          <li>
            <NavLink to="/laporan" onClick={closeMobileSidebar} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Laporan
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" onClick={closeMobileSidebar} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
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
