import { useEffect, useState } from 'react';
import './Header.css';

const Header = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.nama);
      } catch (e) {
        console.error("Failed to parse user");
      }
    }
  }, []);

  return (
    <header className="header">
      <div className="header-title">
        {/* Placeholder for future page titles if needed */}
      </div>
      <div className="header-profile">
        <span className="profile-name">Halo, {userName || 'User'}</span>
        <div className="profile-avatar">
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
