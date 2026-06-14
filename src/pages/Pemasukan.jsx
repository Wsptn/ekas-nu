import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Pemasukan = () => {
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
    tanggal: '',
    id_kat_masuk: '',
    sumber_dana: '',
    uraian: '',
    nominal: '',
    bukti: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (API_URL.includes('YOUR_SCRIPT_ID')) {
        setTimeout(() => {
          setData([
            { id_masuk: 'PEM-001', tanggal: '2026-06-10', id_kat_masuk: 'Iuran', sumber_dana: 'Anggota', uraian: 'Iuran bulanan anggota', nominal: 500000, bukti: '-', input_by: 'Admin' },
            { id_masuk: 'PEM-002', tanggal: '2026-06-12', id_kat_masuk: 'Donatur', sumber_dana: 'Hamba Allah', uraian: 'Sumbangan pembangunan', nominal: 1500000, bukti: '-', input_by: 'Admin' },
          ]);
          setLoading(false);
        }, 800);
        return;
      }
      
      const response = await fetch(`${API_URL}?action=getPemasukan`);
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
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    const nextId = data.length > 0 ? Math.max(...data.map(item => {
      const parts = String(item.id_masuk).split('-');
      return parts.length > 1 ? parseInt(parts[1]) || 0 : 0;
    })) + 1 : 1;

    const payload = {
      id_masuk: `PEM-${nextId}`,
      tanggal: formData.tanggal,
      id_kat_masuk: formData.id_kat_masuk,
      sumber_dana: formData.sumber_dana,
      uraian: formData.uraian,
      nominal: formData.nominal,
      bukti: formData.bukti || '-',
      input_by: user ? user.nama : 'Unknown'
    };

    if (isEditing) {
      payload.id_masuk = editId; // Pertahankan ID lama jika edit
    }

    if (API_URL.includes('YOUR_SCRIPT_ID')) {
      setTimeout(() => {
        if (isEditing) {
          setData(data.map(item => item.id_masuk === editId ? payload : item));
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
          action: isEditing ? 'editPemasukan' : 'addPemasukan',
          payload: payload
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        if (isEditing) {
          setData(prev => prev.map(item => item.id_masuk === editId ? payload : item));
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
    if (!window.confirm('Yakin ingin menghapus data ini? Saldo akan disesuaikan kembali.')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deletePemasukan',
          id: id
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(prev => prev.filter(item => item.id_masuk !== id)); // Optimasi hapus state lokal
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
    setFormData({ tanggal: '', id_kat_masuk: '', sumber_dana: '', uraian: '', nominal: '', bukti: '' });
  };

  const handleEditClick = (item) => {
    setFormData({
      tanggal: formatDate(item.tanggal),
      id_kat_masuk: item.id_kat_masuk,
      sumber_dana: item.sumber_dana,
      uraian: item.uraian,
      nominal: item.nominal,
      bukti: item.bukti
    });
    setEditId(item.id_masuk);
    setIsEditing(true);
    setShowForm(true);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const formatDate = (dateString) => {
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Data Pemasukan</h2>
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
            {showForm ? 'Kembali' : '+ Tambah Data'}
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>{isEditing ? 'Form Edit Pemasukan' : 'Form Tambah Pemasukan'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input type="date" className="form-control" required 
                  value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-control" required
                  value={formData.id_kat_masuk} onChange={e => setFormData({...formData, id_kat_masuk: e.target.value})}>
                  <option value="">Pilih Kategori</option>
                  <option value="UPZIS NU">UPZIS NU</option>
                  <option value="Lembaga Eksternal">Lembaga Eksternal</option>
                  <option value="Donatur">Donatur</option>
                  <option value="Hibah">Hibah</option>
                  <option value="Iuran">Iuran</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sumber Dana</label>
                <input type="text" className="form-control" required 
                  value={formData.sumber_dana} onChange={e => setFormData({...formData, sumber_dana: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Nominal (Rp)</label>
                <input type="number" className="form-control" required 
                  value={formData.nominal} onChange={e => setFormData({...formData, nominal: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Uraian</label>
                <textarea className="form-control" rows="3" required
                  value={formData.uraian} onChange={e => setFormData({...formData, uraian: e.target.value})}></textarea>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : (isEditing ? 'Update Pemasukan' : 'Simpan Pemasukan')}
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
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Sumber</th>
                    <th>Uraian</th>
                    <th className="text-right">Nominal</th>
                    {canDelete && <th className="text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.id_masuk}</td>
                      <td>{formatDate(item.tanggal)}</td>
                      <td><span className="badge badge-success">{item.id_kat_masuk}</span></td>
                      <td>{item.sumber_dana}</td>
                      <td>{item.uraian}</td>
                      <td className="text-right font-semibold text-success">
                        {formatRupiah(item.nominal)}
                      </td>
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
                            onClick={() => handleDelete(item.id_masuk)}
                            disabled={isDeleting}
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>Belum ada data pemasukan.</td>
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

export default Pemasukan;
