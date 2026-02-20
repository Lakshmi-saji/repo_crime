import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getFIRsByUser } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { MdAdd, MdAssignment, MdHourglassTop, MdCheckCircle } from 'react-icons/md';

export default function CitizenDashboard() {
    const { currentUser, userProfile } = useAuth();
    const [firs, setFirs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        getFIRsByUser(currentUser.uid).then(data => { setFirs(data); setLoading(false); });
    }, [currentUser]);

    const statusColor = { Pending: 'badge-pending', Investigating: 'badge-investigating', Closed: 'badge-closed' };

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="Citizen Dashboard" />
                <div className="main-content">
                    <div className="page-header flex-between">
                        <div>
                            <h1>Welcome, {userProfile?.name?.split(' ')[0]} 👋</h1>
                            <p>Track your filed reports and their investigation status</p>
                        </div>
                        <Link to="/citizen/submit-fir" className="btn btn-primary"><MdAdd /> File New FIR</Link>
                    </div>

                    <div className="grid-3 mb-24">
                        {[
                            { label: 'Total FIRs', value: firs.length, color: 'var(--accent-light)', bg: 'var(--accent-glow)', icon: <MdAssignment /> },
                            { label: 'Pending', value: firs.filter(f => f.status === 'Pending').length, color: 'var(--yellow)', bg: 'var(--yellow-light)', icon: <MdHourglassTop /> },
                            { label: 'Closed', value: firs.filter(f => f.status === 'Closed').length, color: 'var(--green)', bg: 'var(--green-light)', icon: <MdCheckCircle /> },
                        ].map(s => (
                            <div className="stat-card" key={s.label}>
                                <div className="stat-icon" style={{ background: s.bg }}><span style={{ color: s.color, fontSize: 22 }}>{s.icon}</span></div>
                                <div className="stat-info"><div className="label">{s.label}</div><div className="value" style={{ color: s.color }}>{s.value}</div></div>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div className="flex-between mb-16">
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>My Filed FIRs</h3>
                            <Link to="/citizen/my-firs" className="btn btn-secondary btn-sm">View All</Link>
                        </div>
                        {loading ? <div className="loader-wrap"><div className="spinner" /></div> : (
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>FIR ID</th><th>Crime Type</th><th>Location</th><th>Filed Date</th><th>Status</th><th>Officer</th></tr></thead>
                                    <tbody>
                                        {firs.slice(0, 5).map(f => (
                                            <tr key={f.id}>
                                                <td style={{ color: 'var(--accent-light)', fontWeight: 600, fontSize: 12 }}>#{f.id.slice(-6).toUpperCase()}</td>
                                                <td><span className="badge badge-info">{f.crimeType}</span></td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{f.location}</td>
                                                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.dateTime}</td>
                                                <td><span className={`badge ${statusColor[f.status] || ''}`}>{f.status}</span></td>
                                                <td style={{ fontSize: 13 }}>{f.assignedOfficerName || <span style={{ color: 'var(--text-muted)' }}>Pending assignment</span>}</td>
                                            </tr>
                                        ))}
                                        {firs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>You haven't filed any FIRs yet. <Link to="/citizen/submit-fir" style={{ color: 'var(--accent-light)' }}>File one now.</Link></td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
