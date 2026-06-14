import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const Pengeluaran = () => {
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
    id_kat_keluar: '',
    penerima: '',
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
            { id_keluar: 'KLR-001', tanggal: '2026-06-11', id_kat_keluar: 'Operasional', penerima: 'Pak Ahmad', uraian: 'Biaya listrik', nominal: 150000, bukti: '-', input_by: 'Admin' },
            { id_keluar: 'KLR-002', tanggal: '2026-06-13', id_kat_keluar: 'Kegiatan', penerima: 'Panitia', uraian: 'Konsumsi rapat rutin', nominal: 350000, bukti: '-', input_by: 'Admin' },
          ]);
          setLoading(false);
        }, 800);
        return;
      }
      
      const response = await fetch(`${API_URL}?action=getPengeluaran`);
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
    
    let maxId = 0;
    if (data.length > 0) {
      data.forEach(item => {
        const parts = String(item.id_keluar).split('-');
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
      id_keluar: `KLR-${nextId}`,
      tanggal: formData.tanggal,
      id_kat_keluar: formData.id_kat_keluar,
      penerima: formData.penerima,
      uraian: formData.uraian,
      nominal: formData.nominal,
      bukti: formData.bukti || '-',
      input_by: user ? user.nama : 'Unknown'
    };

    if (isEditing) {
      payload.id_keluar = editId; // Pertahankan ID lama jika edit
    }

    if (API_URL.includes('YOUR_SCRIPT_ID')) {
      setTimeout(() => {
        if (isEditing) {
          setData(data.map(item => item.id_keluar === editId ? payload : item));
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
          action: isEditing ? 'editPengeluaran' : 'addPengeluaran',
          payload: payload
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        if (isEditing) {
          setData(prev => prev.map(item => item.id_keluar === editId ? payload : item));
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
          action: 'deletePengeluaran',
          id: id
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(prev => prev.filter(item => item.id_keluar !== id)); // Optimasi hapus state lokal
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
    setFormData({ tanggal: '', id_kat_keluar: '', penerima: '', uraian: '', nominal: '', bukti: '' });
  };

  const handleEditClick = (item) => {
    setFormData({
      tanggal: formatDate(item.tanggal),
      id_kat_keluar: item.id_kat_keluar,
      penerima: item.penerima,
      uraian: item.uraian,
      nominal: item.nominal,
      bukti: item.bukti
    });
    setEditId(item.id_keluar);
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
        <h2 className="page-title" style={{ marginBottom: 0 }}>Data Pengeluaran</h2>
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
          <h3 style={{ marginBottom: '1rem' }}>{isEditing ? 'Form Edit Pengeluaran' : 'Form Tambah Pengeluaran'}</h3>
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
                  value={formData.id_kat_keluar} onChange={e => setFormData({...formData, id_kat_keluar: e.target.value})}>
                  <option value="">Pilih Kategori</option>
                  <option value="Operasional">Operasional</option>
                  <option value="ATK">ATK</option>
                  <option value="Sarana Prasarana">Sarana Prasarana</option>
                  <option value="Barang Habis Pakai">Barang Habis Pakai</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Sosial">Sosial</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Konsumsi">Konsumsi</option>
                  <option value="Administrasi Bank">Administrasi Bank</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Penerima</label>
                <input type="text" className="form-control" required 
                  value={formData.penerima} onChange={e => setFormData({...formData, penerima: e.target.value})} />
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
                {loading ? 'Menyimpan...' : (isEditing ? 'Update Pengeluaran' : 'Simpan Pengeluaran')}
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
                    <th>Penerima</th>
                    <th>Uraian</th>
                    <th className="text-right">Nominal</th>
                    {canDelete && <th className="text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.id_keluar}</td>
                      <td>{formatDate(item.tanggal)}</td>
                      <td><span className="badge badge-danger">{item.id_kat_keluar}</span></td>
                      <td>{item.penerima}</td>
                      <td>{item.uraian}</td>
                      <td className="text-right font-semibold text-danger">
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
                            onClick={() => handleDelete(item.id_keluar)}
                            disabled={isDeleting}
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>Belum ada data pengeluaran.</td>
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

export default Pengeluaran;
