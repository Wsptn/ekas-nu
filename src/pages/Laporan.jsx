import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { API_URL } from '../config';

const Laporan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth() + 1);
  const currentYear = new Date().getFullYear();
  const [filterTahun, setFilterTahun] = useState(currentYear);

  const startYear = 2020;
  const years = [];
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      if (API_URL.includes('YOUR_SCRIPT_ID')) {
        setTimeout(() => {
          setData([
            { id: 'PEM-001', tanggal: '2026-06-10', tipe: 'Pemasukan', kategori: 'Iuran', uraian: 'Iuran anggota', nominal: 500000 },
            { id: 'KLR-001', tanggal: '2026-06-11', tipe: 'Pengeluaran', kategori: 'Operasional', uraian: 'Biaya listrik', nominal: -150000 },
          ]);
          setLoading(false);
        }, 800);
        return;
      }

      // Idealnya ini menggunakan endpoint gabungan Pemasukan & Pengeluaran dari backend.
      // Karena kita ambil terpisah, kita fetch dua kali dan gabungkan di frontend.
      const resPem = await fetch(`${API_URL}?action=getPemasukan`);
      const dataPem = await resPem.json();
      
      const resPeng = await fetch(`${API_URL}?action=getPengeluaran`);
      const dataPeng = await resPeng.json();

      let combinedData = [];

      if (dataPem.status === 'success') {
        dataPem.data.forEach(item => {
          combinedData.push({
            id: item.id_masuk,
            tanggal: item.tanggal,
            tipe: 'Pemasukan',
            kategori: item.id_kat_masuk,
            uraian: item.uraian,
            nominal: Number(item.nominal)
          });
        });
      }

      if (dataPeng.status === 'success') {
        dataPeng.data.forEach(item => {
          combinedData.push({
            id: item.id_keluar,
            tanggal: item.tanggal,
            tipe: 'Pengeluaran',
            kategori: item.id_kat_keluar,
            uraian: item.uraian,
            nominal: -Number(item.nominal) // Negatif untuk pengeluaran
          });
        });
      }

      // Urutkan berdasarkan tanggal
      combinedData.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
      setData(combinedData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const getFilteredData = () => {
    if (!filterBulan || !filterTahun) return data;
    return data.filter(item => {
      const date = new Date(item.tanggal);
      return (date.getMonth() + 1) === Number(filterBulan) && date.getFullYear() === Number(filterTahun);
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Laporan Keuangan Ranting NU Karanganyar', 14, 22);
    doc.setFontSize(12);
    doc.text(`Periode: Bulan ${filterBulan} Tahun ${filterTahun}`, 14, 30);

    const filteredData = getFilteredData();
    const tableColumn = ["Tanggal", "ID", "Tipe", "Kategori", "Uraian", "Nominal (Rp)"];
    const tableRows = [];

    let totalSaldo = 0;

    filteredData.forEach(item => {
      totalSaldo += item.nominal;
      const itemData = [
        formatDate(item.tanggal),
        item.id,
        item.tipe,
        item.kategori,
        item.uraian,
        new Intl.NumberFormat('id-ID').format(Math.abs(item.nominal))
      ];
      tableRows.push(itemData);
    });

    tableRows.push(['', '', '', '', 'TOTAL SALDO PERIODE INI', new Intl.NumberFormat('id-ID').format(totalSaldo)]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save(`Laporan_Keuangan_Bulan_${filterBulan}_${filterTahun}.pdf`);
  };

  const exportExcel = () => {
    const filteredData = getFilteredData();
    let exportData = filteredData.map(item => ({
      Tanggal: formatDate(item.tanggal),
      ID: item.id,
      Tipe: item.tipe,
      Kategori: item.kategori,
      Uraian: item.uraian,
      Pemasukan: item.nominal > 0 ? item.nominal : 0,
      Pengeluaran: item.nominal < 0 ? Math.abs(item.nominal) : 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(dataBlob, `Laporan_Keuangan_Bulan_${filterBulan}_${filterTahun}.xlsx`);
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
      return `${day}-${month}-${year}`;
    } catch(e) {
      return dateString;
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="animate-fade-in">
      <h2 className="page-title">Laporan Buku Kas</h2>
      
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bulan</label>
            <select className="form-control" value={filterBulan} onChange={e => setFilterBulan(e.target.value)}>
              <option value="">Semua Bulan</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tahun</label>
            <select className="form-control" value={filterTahun} onChange={e => setFilterTahun(e.target.value)}>
              <option value="">Semua Tahun</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, display: 'flex', gap: '0.5rem', gridColumn: 'span 2' }}>
            <button className="btn btn-outline" style={{ flex: 1, backgroundColor: '#f1f5f9' }} onClick={exportExcel}>
              Export Excel
            </button>
            <button className="btn btn-danger" style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={exportPDF}>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex-center" style={{ height: '200px' }}><span className="spinner"></span></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>ID / Tipe</th>
                  <th>Uraian</th>
                  <th className="text-right">Pemasukan</th>
                  <th className="text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? filteredData.map((item, index) => (
                  <tr key={index}>
                    <td>{formatDate(item.tanggal)}</td>
                    <td>
                      <div>{item.id}</div>
                      <span className={`badge ${item.tipe === 'Pemasukan' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '0.25rem' }}>
                        {item.tipe}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold">{item.kategori}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{item.uraian}</div>
                    </td>
                    <td className="text-right text-success font-semibold">
                      {item.nominal > 0 ? formatRupiah(item.nominal) : '-'}
                    </td>
                    <td className="text-right text-danger font-semibold">
                      {item.nominal < 0 ? formatRupiah(Math.abs(item.nominal)) : '-'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center" style={{ padding: '2rem' }}>Tidak ada data pada periode ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporan;
