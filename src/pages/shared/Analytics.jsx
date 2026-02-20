import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getAllFIRs } from '../../services/firestoreService';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
    PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CRIME_TYPES = ['Theft', 'Assault', 'Fraud', 'Murder', 'Robbery', 'Cybercrime', 'Vandalism', 'Drug Offense', 'Kidnapping', 'Other'];
const COLORS = ['#4f7cff', '#06d6c7', '#ffa502', '#ff4757', '#9c68f0', '#2ed573', '#ff6b81', '#26de81', '#fd9644', '#45aaf2'];

const chartOpts = {
    responsive: true,
    plugins: { legend: { labels: { color: '#8899bb', font: { family: 'Inter', size: 12 } } } },
    scales: {
        x: { ticks: { color: '#8899bb' }, grid: { color: 'rgba(99,140,255,0.08)' } },
        y: { ticks: { color: '#8899bb' }, grid: { color: 'rgba(99,140,255,0.08)' } },
    },
};

export default function Analytics() {
    const [firs, setFirs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { getAllFIRs().then(d => { setFirs(d); setLoading(false); }); }, []);

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { label: MONTHS[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
    });
    const monthlyCounts = monthlyData.map(m =>
        firs.filter(f => {
            if (!f.createdAt?.toDate) return false;
            const d = f.createdAt.toDate();
            return d.getFullYear() === m.year && d.getMonth() === m.month;
        }).length
    );

    // Crime type distribution
    const crimeTypeCounts = CRIME_TYPES.map(t => firs.filter(f => f.crimeType === t).length);

    // By region (location)
    const regions = [...new Set(firs.map(f => f.location || 'Unknown'))].slice(0, 8);
    const regionCounts = regions.map(r => firs.filter(f => f.location === r).length);

    // Status breakdown
    const statusCounts = [
        firs.filter(f => f.status === 'Pending').length,
        firs.filter(f => f.status === 'Investigating').length,
        firs.filter(f => f.status === 'Closed').length,
    ];

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="Analytics" />
                <div className="main-content">
                    <div className="page-header">
                        <h1>Crime Analytics</h1>
                        <p>Visual insights into crime trends across regions</p>
                    </div>

                    {loading ? <div className="loader-wrap"><div className="spinner" /></div> : (
                        <>
                            {/* Summary cards */}
                            <div className="grid-4 mb-24">
                                {[
                                    { label: 'Total FIRs', value: firs.length, color: 'var(--accent-light)' },
                                    { label: 'Pending', value: statusCounts[0], color: 'var(--yellow)' },
                                    { label: 'Investigating', value: statusCounts[1], color: 'var(--cyan)' },
                                    { label: 'Closed', value: statusCounts[2], color: 'var(--green)' },
                                ].map(s => (
                                    <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
                                        <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid-2 mb-24">
                                {/* Monthly trend */}
                                <div className="card">
                                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>📈 Monthly Crime Trend (Last 6 Months)</h3>
                                    <Line data={{
                                        labels: monthlyData.map(m => m.label),
                                        datasets: [{
                                            label: 'FIRs Filed',
                                            data: monthlyCounts,
                                            borderColor: '#4f7cff',
                                            backgroundColor: 'rgba(79,124,255,0.1)',
                                            tension: 0.4,
                                            fill: true,
                                            pointBackgroundColor: '#4f7cff',
                                            pointRadius: 5,
                                        }],
                                    }} options={chartOpts} />
                                </div>

                                {/* FIR Status Pie */}
                                <div className="card">
                                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>🥧 FIR Status Distribution</h3>
                                    <div style={{ maxWidth: 300, margin: '0 auto' }}>
                                        <Pie data={{
                                            labels: ['Pending', 'Investigating', 'Closed'],
                                            datasets: [{
                                                data: statusCounts,
                                                backgroundColor: ['#ffa502', '#06d6c7', '#2ed573'],
                                                borderColor: '#131929',
                                                borderWidth: 3,
                                            }],
                                        }} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#8899bb', font: { family: 'Inter', size: 12 } } } } }} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2">
                                {/* Crime type bar */}
                                <div className="card">
                                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>📊 Crime Types (All Time)</h3>
                                    <Bar data={{
                                        labels: CRIME_TYPES,
                                        datasets: [{
                                            label: 'Number of Cases',
                                            data: crimeTypeCounts,
                                            backgroundColor: COLORS.map(c => c + 'bb'),
                                            borderColor: COLORS,
                                            borderWidth: 2,
                                            borderRadius: 6,
                                        }],
                                    }} options={{ ...chartOpts, indexAxis: 'y' }} />
                                </div>

                                {/* Region bar */}
                                <div className="card">
                                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>🗺️ Crimes by Region</h3>
                                    {regions.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No location data yet</div>
                                    ) : (
                                        <Bar data={{
                                            labels: regions,
                                            datasets: [{
                                                label: 'FIRs Filed',
                                                data: regionCounts,
                                                backgroundColor: 'rgba(79,124,255,0.7)',
                                                borderColor: '#4f7cff',
                                                borderWidth: 2,
                                                borderRadius: 6,
                                            }],
                                        }} options={chartOpts} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
