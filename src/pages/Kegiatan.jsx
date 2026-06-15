import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Kegiatan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canAdd = user && (user.level === 'Admin' || user.level === 'Bendahara');
  const canDelete = user && user.level === 'Admin';

  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    penanggung_jawab: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (API_URL.includes('YOUR_SCRIPT_ID')) {
        setTimeout(() => {
          setData([
            { id_kegiatan: 'KEG-001', nama_kegiatan: 'Peringatan Harlah NU', tanggal_mulai: '2026-07-01', tanggal_selesai: '2026-07-02', penanggung_jawab: 'Bapak Ahmad' }
          ]);
          setLoading(false);
        }, 800);
        return;
      }
      
      const response = await fetch(`${API_URL}?action=getKegiatan`);
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
    
    let maxId = 0;
    if (data.length > 0) {
      data.forEach(item => {
        const parts = String(item.id_kegiatan).split('-');
        if (parts.length > 1) {
          const num = parseInt(parts[1]) || 0;
          if (num < 1000000 && num > maxId) {
            maxId = num;
          }
        }
      });
    }
    const nextId = maxId + 1;

    const payload = {
      id_kegiatan: `KEG-${nextId}`,
      nama_kegiatan: formData.nama_kegiatan,
      tanggal_mulai: formData.tanggal_mulai,
      tanggal_selesai: formData.tanggal_selesai,
      penanggung_jawab: formData.penanggung_jawab
    };

    if (isEditing) {
      payload.id_kegiatan = editId; // Pertahankan ID lama jika edit
    }

    if (API_URL.includes('YOUR_SCRIPT_ID')) {
      setTimeout(() => {
        if (isEditing) {
          setData(data.map(item => item.id_kegiatan === editId ? payload : item));
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
          action: isEditing ? 'editKegiatan' : 'addKegiatan',
          payload: payload
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        if (isEditing) {
          setData(prev => prev.map(item => item.id_kegiatan === editId ? payload : item));
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
    if (!window.confirm('Yakin ingin menghapus data kegiatan ini?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deleteKegiatan',
          id: id
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(prev => prev.filter(item => item.id_kegiatan !== id));
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
    setFormData({ nama_kegiatan: '', tanggal_mulai: '', tanggal_selesai: '', penanggung_jawab: '' });
  };

  const handleEditClick = (item) => {
    setFormData({
      nama_kegiatan: item.nama_kegiatan,
      tanggal_mulai: formatDateForInput(item.tanggal_mulai),
      tanggal_selesai: formatDateForInput(item.tanggal_selesai),
      penanggung_jawab: item.penanggung_jawab
    });
    setEditId(item.id_kegiatan);
    setIsEditing(true);
    setShowForm(true);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch(e) {
      return dateString;
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${day}-${month}-${year}`;
    } catch(e) {
      return dateString;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Data Kegiatan</h2>
        {canAdd && (
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
            {showForm ? 'Kembali' : '+ Tambah Kegiatan'}
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>{isEditing ? 'Form Edit Kegiatan' : 'Form Tambah Kegiatan'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Nama Kegiatan</label>
                <input type="text" className="form-control" required 
                  value={formData.nama_kegiatan} onChange={e => setFormData({...formData, nama_kegiatan: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Mulai</label>
                <input type="date" className="form-control" required 
                  value={formData.tanggal_mulai} onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Selesai</label>
                <input type="date" className="form-control" required 
                  value={formData.tanggal_selesai} onChange={e => setFormData({...formData, tanggal_selesai: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Penanggung Jawab</label>
                <input type="text" className="form-control" required 
                  value={formData.penanggung_jawab} onChange={e => setFormData({...formData, penanggung_jawab: e.target.value})} />
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : (isEditing ? 'Update Kegiatan' : 'Simpan Kegiatan')}
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
                    <th>Nama Kegiatan</th>
                    <th>Tanggal Mulai</th>
                    <th>Tanggal Selesai</th>
                    <th>Penanggung Jawab</th>
                    {canDelete && <th className="text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.id_kegiatan}</td>
                      <td className="font-semibold text-primary">{item.nama_kegiatan}</td>
                      <td>{formatDateForDisplay(item.tanggal_mulai)}</td>
                      <td>{formatDateForDisplay(item.tanggal_selesai)}</td>
                      <td>{item.penanggung_jawab}</td>
                      {canDelete && (
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
                            onClick={() => handleDelete(item.id_kegiatan)}
                            disabled={isDeleting}
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={canDelete ? "6" : "5"} className="text-center" style={{ padding: '2rem' }}>Belum ada data kegiatan.</td>
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

export default Kegiatan;
