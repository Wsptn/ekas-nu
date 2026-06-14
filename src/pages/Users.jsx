import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Users = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Hanya Admin yang bisa melihat halaman ini seutuhnya, tapi kita ambil levelnya dulu
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser && currentUser.level === 'Admin';

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    password: '',
    level: 'Bendahara',
    status: 'Aktif'
  });

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      if (API_URL.includes('YOUR_SCRIPT_ID')) {
        setTimeout(() => {
          setData([
            { id_user: 'USR-1', nama: 'Admin NU', username: 'admin', password: '***', level: 'Admin', status: 'Aktif' },
            { id_user: 'USR-2', nama: 'Bendahara NU', username: 'bendahara', password: '***', level: 'Bendahara', status: 'Aktif' }
          ]);
          setLoading(false);
        }, 800);
        return;
      }
      
      const response = await fetch(`${API_URL}?action=getUsers`);
      const result = await response.json();
      if (result.status === 'success') {
        setData(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const nextId = data.length > 0 ? Math.max(...data.map(item => {
      const parts = String(item.id_user).split('-');
      return parts.length > 1 ? parseInt(parts[1]) || 0 : 0;
    })) + 1 : 1;

    const payload = {
      id_user: `USR-${nextId}`,
      nama: formData.nama,
      username: formData.username,
      password: formData.password,
      level: formData.level,
      status: formData.status
    };

    if (isEditing) {
      payload.id_user = editId; // Pertahankan ID lama jika edit
    }

    if (API_URL.includes('YOUR_SCRIPT_ID')) {
      setTimeout(() => {
        if (isEditing) {
          setData(data.map(item => item.id_user === editId ? payload : item));
        } else {
          setData([...data, payload]);
        }
        resetForm();
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: isEditing ? 'editUser' : 'addUser',
          payload: payload
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        if (isEditing) {
          setData(prev => prev.map(item => item.id_user === editId ? payload : item));
        } else {
          setData(prev => [...prev, payload]);
        }
        resetForm();
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id_user) {
      alert("Anda tidak bisa menghapus akun Anda sendiri!");
      return;
    }
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deleteUser',
          id: id
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(prev => prev.filter(item => item.id_user !== id));
      } else {
        alert(result.message || 'Gagal menghapus');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({ nama: '', username: '', password: '', level: 'Bendahara', status: 'Aktif' });
  };

  const handleEditClick = (item) => {
    setFormData({
      nama: item.nama,
      username: item.username,
      password: item.password,
      level: item.level,
      status: item.status
    });
    setEditId(item.id_user);
    setIsEditing(true);
    setShowForm(true);
  };

  if (!isAdmin) {
    return (
      <div className="card text-center" style={{ padding: '3rem' }}>
        <h2 style={{ color: 'var(--danger-color)' }}>Akses Ditolak</h2>
        <p>Hanya pengguna dengan level <strong>Admin</strong> yang dapat mengakses halaman Kelola User.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Kelola User</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            if(showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? 'Kembali' : '+ Tambah User'}
        </button>
      </div>

      {showForm ? (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>{isEditing ? 'Form Edit User' : 'Form Tambah User'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Nama Lengkap</label>
                <input type="text" className="form-control" required 
                  value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" required 
                  value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" required 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Level Akses</label>
                <select className="form-control" required
                  value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                  <option value="Admin">Admin</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Ketua">Ketua</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" required
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : (isEditing ? 'Update User' : 'Simpan User')}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>Batal</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card">
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}><span className="spinner"></span></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.id_user}</td>
                      <td className="font-semibold text-primary">{item.nama}</td>
                      <td>{item.username}</td>
                      <td>
                        <span className={`badge ${item.level === 'Admin' ? 'badge-danger' : item.level === 'Bendahara' ? 'badge-success' : 'badge-warning'}`} style={{ backgroundColor: item.level === 'Admin' ? '#ef4444' : item.level === 'Bendahara' ? '#10b981' : '#f59e0b', color: 'white' }}>
                          {item.level}
                        </span>
                      </td>
                      <td>{item.status}</td>
                      <td className="text-center" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          className="btn btn-warning" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#eab308', color: 'white', border: 'none' }}
                          onClick={() => handleEditClick(item)}
                          disabled={isDeleting}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                          onClick={() => handleDelete(item.id_user)}
                          disabled={isDeleting || item.id_user === currentUser.id_user}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>Belum ada data user.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
