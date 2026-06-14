import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- MOCK LOGIN UNTUK DEVELOPMENT ---
    if (API_URL.includes('YOUR_SCRIPT_ID')) {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
          localStorage.setItem('user', JSON.stringify({
            id_user: '1', nama: 'Admin Tester', username: 'admin', level: 'Admin', status: 'Aktif'
          }));
          navigate('/');
        } else {
          setError('Username atau Password salah (Mock: gunakan admin/admin)');
          setLoading(false);
        }
      }, 1000);
      return;
    }
    // -------------------------------------

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          username,
          password
        })
      });
      
      // Deteksi jika bukan JSON (contoh: error page dari Google)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (data.status === 'success') {
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/');
        } else {
          setError(data.message || 'Username atau Password salah.');
        }
      } else {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        setError('Gagal menghubungi Database. Pastikan URL Google Script Anda sudah di-Deploy dengan benar (Siapa Saja / Anyone) dan Link sudah tepat.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan atau URL Google Apps Script salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Bagian Kiri: Aesthetic Caption */}
      <div className="login-aesthetic">
        <div className="watermark-logo"></div>
        <div className="aesthetic-content">
          <h1 className="aesthetic-title">Sistem Keuangan Modern & Transparan</h1>
          <p className="aesthetic-subtitle">
            Kelola dana organisasi dengan lebih mudah, cepat, dan akuntabel. E-KAS Ranting NU Karanganyar hadir untuk transparansi umat.
          </p>
        </div>
      </div>

      {/* Bagian Kanan: Login Form */}
      <div className="login-container">
        <div className="login-card">
          <div className="login-header text-center">
            <img src="/logo.png" alt="Logo NU" style={{ width: '80px', marginBottom: '1rem' }} onError={(e) => { e.target.style.display = 'none' }} />
            <h1 className="login-title">Selamat Datang</h1>
            <p className="login-subtitle">Silakan login untuk mengakses E-KAS</p>
          </div>
        
        {error && <div className="alert-error">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary login-btn" 
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Masuk'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Developer by Muhammad Babun Waseptian
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
