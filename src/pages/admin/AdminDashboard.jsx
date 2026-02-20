import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { subscribeToFIRs, getAllOfficers, getAllUsers } from '../../services/firestoreService';
import { MdAssignment, MdPeople, MdWarning, MdCheckCircle, MdArrowForward } from 'react-icons/md';

export default function AdminDashboard() {
    const [firs, setFirs] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const unsub = subscribeToFIRs(setFirs);
        getAllOfficers().then(setOfficers);
        getAllUsers().then(setUsers);
        return unsub;
    }, []);

    const stats = {
        total: firs.length,
        pending: firs.filter(f => f.status === 'Pending').length,
        investigating: firs.filter(f => f.status === 'Investigating').length,
        closed: firs.filter(f => f.status === 'Closed').length,
    };

    const statusColor = { Pending: 'badge-pending', Investigating: 'badge-investigating', Closed: 'badge-closed' };

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="Admin Dashboard" />
                <div className="main-content">
                    <div className="page-header">
                        <h1>Command Center</h1>
                        <p>Overview of all crime reports and system activity</p>
                    </div>

                    <div className="grid-4 mb-24">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'var(--accent-glow)' }}><MdAssignment style={{ color: 'var(--accent-light)', fontSize: 24 }} /></div>
                            <div className="stat-info"><div className="label">Total FIRs</div><div className="value">{stats.total}</div></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'var(--yellow-light)' }}><MdWarning style={{ color: 'var(--yellow)', fontSize: 24 }} /></div>
                            <div className="stat-info"><div className="label">Pending</div><div className="value" style={{ color: 'var(--yellow)' }}>{stats.pending}</div></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'var(--cyan-light)' }}><MdAssignment style={{ color: 'var(--cyan)', fontSize: 24 }} /></div>
                            <div className="stat-info"><div className="label">Investigating</div><div className="value" style={{ color: 'var(--cyan)' }}>{stats.investigating}</div></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'var(--green-light)' }}><MdCheckCircle style={{ color: 'var(--green)', fontSize: 24 }} /></div>
                            <div className="stat-info"><div className="label">Closed</div><div className="value" style={{ color: 'var(--green)' }}>{stats.closed}</div></div>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="card">
                            <div className="flex-between mb-16">
                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent FIRs</h3>
                                <Link to="/admin/firs" className="btn btn-secondary btn-sm">View All <MdArrowForward /></Link>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>FIR ID</th><th>Crime Type</th><th>Location</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {firs.slice(0, 6).map(f => (
                                            <tr key={f.id}>
                                                <td style={{ color: 'var(--accent-light)', fontSize: 12 }}>#{f.id.slice(-6).toUpperCase()}</td>
                                                <td>{f.crimeType}</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{f.location}</td>
                                                <td><span className={`badge ${statusColor[f.status] || 'badge-info'}`}>{f.status}</span></td>
                                            </tr>
                                        ))}
                                        {firs.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No FIRs registered yet</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>System Overview</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { label: 'Total Officers', value: officers.length, color: 'var(--cyan)' },
                                    { label: 'Total Citizens', value: users.filter(u => u.role === 'citizen').length, color: 'var(--accent-light)' },
                                    { label: 'Unassigned FIRs', value: firs.filter(f => !f.assignedTo).length, color: 'var(--yellow)' },
                                    {
                                        label: 'This Week', value: firs.filter(f => {
                                            if (!f.createdAt?.toDate) return false;
                                            const d = f.createdAt.toDate();
                                            return (Date.now() - d.getTime()) < 7 * 24 * 3600000;
                                        }).length, color: 'var(--green)'
                                    },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                                        <span style={{ fontWeight: 800, color: item.color, fontSize: 20 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
