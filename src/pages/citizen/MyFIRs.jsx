import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getFIRsByUser } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MdAdd, MdOpenInNew } from 'react-icons/md';

export default function MyFIRs() {
    const { currentUser } = useAuth();
    const [firs, setFirs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        if (!currentUser) return;
        getFIRsByUser(currentUser.uid).then(data => { setFirs(data); setLoading(false); });
    }, [currentUser]);

    const statusColor = { Pending: 'badge-pending', Investigating: 'badge-investigating', Closed: 'badge-closed' };
    const statusSteps = ['Pending', 'Investigating', 'Closed'];

    const filtered = filter === 'All' ? firs : firs.filter(f => f.status === filter);

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="My FIRs" />
                <div className="main-content">
                    <div className="page-header flex-between">
                        <div><h1>My FIRs</h1><p>Track the status of your filed reports</p></div>
                        <Link to="/citizen/submit-fir" className="btn btn-primary"><MdAdd /> New FIR</Link>
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        {['All', 'Pending', 'Investigating', 'Closed'].map(s => (
                            <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(s)}>
                                {s} {s !== 'All' && <span style={{ marginLeft: 4 }}>({firs.filter(f => f.status === s).length})</span>}
                            </button>
                        ))}
                    </div>

                    {loading ? <div className="loader-wrap"><div className="spinner" /></div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {filtered.map(f => (
                                <div key={f.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(f)}>
                                    <div className="flex-between" style={{ marginBottom: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '4px 10px', borderRadius: 6 }}>
                                                #{f.id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className={`badge ${statusColor[f.status] || ''}`}>{f.status}</span>
                                            <span className="badge badge-info">{f.crimeType}</span>
                                        </div>
                                        <MdOpenInNew style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                        <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>LOCATION</div><div style={{ fontSize: 13, fontWeight: 500, marginTop: 3 }}>{f.location}</div></div>
                                        <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>DATE & TIME</div><div style={{ fontSize: 13, fontWeight: 500, marginTop: 3 }}>{f.dateTime}</div></div>
                                        <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ASSIGNED OFFICER</div><div style={{ fontSize: 13, fontWeight: 500, marginTop: 3 }}>{f.assignedOfficerName || '—'}</div></div>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            {statusSteps.map((step, i) => {
                                                const idx = statusSteps.indexOf(f.status);
                                                const done = i <= idx;
                                                return (
                                                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: done ? 'var(--accent)' : 'var(--border)', border: done ? 'none' : '2px solid var(--border)' }} />
                                                        <span style={{ fontSize: 11, color: done ? 'var(--accent-light)' : 'var(--text-muted)', fontWeight: done ? 600 : 400 }}>{step}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ height: 3, background: 'var(--bg-secondary)', borderRadius: 99 }}>
                                            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--cyan))', width: `${(statusSteps.indexOf(f.status) / (statusSteps.length - 1)) * 100}%`, borderRadius: 99, transition: 'width 0.5s' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No {filter !== 'All' ? filter.toLowerCase() : ''} FIRs found.</p>
                                    <Link to="/citizen/submit-fir" className="btn btn-primary"><MdAdd /> File a New FIR</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>FIR #{selected.id.slice(-6).toUpperCase()}</h3>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            {[['Crime Type', selected.crimeType], ['Status', selected.status], ['Location', selected.location], ['Date & Time', selected.dateTime], ['Assigned Officer', selected.assignedOfficerName || 'Not yet assigned'], ['Station', selected.stationId || '—']].map(([k, v]) => (
                                <div key={k}><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{k.toUpperCase()}</div><strong style={{ fontSize: 14 }}>{v}</strong></div>
                            ))}
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>DESCRIPTION</div>
                            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{selected.description}</div>
                        </div>
                        {selected.evidenceUrl && (
                            <a href={selected.evidenceUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginBottom: 14 }}>📎 View Evidence: {selected.evidenceName}</a>
                        )}
                        {(selected.notes || []).length > 0 && (
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>OFFICER NOTES</div>
                                {selected.notes.map((n, i) => (
                                    <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: 13 }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 4 }}>{n.officer} • {new Date(n.date).toLocaleDateString()}</div>
                                        {n.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
