import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { API_URL } from '../config';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState({
    totalSaldo: 0,
    totalPemasukan: 0,
    totalPengeluaran: 0,
    monthlyPemasukan: [0,0,0,0,0,0,0,0,0,0,0,0],
    monthlyPengeluaran: [0,0,0,0,0,0,0,0,0,0,0,0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (API_URL.includes('YOUR_SCRIPT_ID')) {
          // Mock data for development
          setTimeout(() => {
            setData({
              totalSaldo: 15000000,
              totalPemasukan: 20000000,
              totalPengeluaran: 5000000,
              monthlyPemasukan: [1200000, 1900000, 3000000, 5000000, 2000000, 3000000, 0, 0, 0, 0, 0, 0],
              monthlyPengeluaran: [1000000, 500000, 1000000, 2000000, 500000, 0, 0, 0, 0, 0, 0, 0]
            });
            setLoading(false);
          }, 1000);
          return;
        }

        const response = await fetch(`${API_URL}?action=getDashboard`);
        const result = await response.json();
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      {
        label: 'Pemasukan',
        data: data.monthlyPemasukan || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // Emerald
      },
      {
        label: 'Pengeluaran',
        data: data.monthlyPengeluaran || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(239, 68, 68, 0.7)', // Red
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div className="dashboard animate-fade-in">
      <h2 className="page-title">Dashboard</h2>
      
      <div className="summary-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card summary-card bg-primary text-white">
          <div className="summary-title">Total Saldo Kas</div>
          <div className="summary-value">{formatRupiah(data.totalSaldo)}</div>
        </div>
        <div className="card summary-card bg-success text-white">
          <div className="summary-title">Total Pemasukan</div>
          <div className="summary-value">{formatRupiah(data.totalPemasukan)}</div>
        </div>
        <div className="card summary-card bg-danger text-white">
          <div className="summary-title">Total Pengeluaran</div>
          <div className="summary-value">{formatRupiah(data.totalPengeluaran)}</div>
        </div>
      </div>

      <div className="card mt-6 chart-card">
        <h3 className="chart-title">Grafik Pemasukan & Pengeluaran Tahun Ini</h3>
        <div className="chart-container">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
