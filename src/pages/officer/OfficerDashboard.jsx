import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getFIRsByOfficer, updateFIR } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { MdAssignment, MdWarning, MdCheckCircle, MdSearch } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function OfficerDashboard() {
    const { currentUser, userProfile } = useAuth();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCase, setSelectedCase] = useState(null);
    const [note, setNote] = useState('');
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        getFIRsByOfficer(currentUser.uid).then(data => { setCases(data); setLoading(false); });
    }, [currentUser]);

    async function updateCase() {
        if (!selectedCase) return;
        const updates = {};
        if (newStatus) updates.status = newStatus;
        if (note.trim()) updates.notes = [...(selectedCase.notes || []), { text: note.trim(), officer: userProfile?.name, date: new Date().toISOString() }];
        await updateFIR(selectedCase.id, updates);
        toast.success('Case updated!');
        setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, ...updates } : c));
        setSelectedCase(null);
        setNote(''); setNewStatus('');
    }

    const statusColor = { Pending: 'badge-pending', Investigating: 'badge-investigating', Closed: 'badge-closed' };
    const filtered = cases.filter(c =>
        c.crimeType?.toLowerCase().includes(search.toLowerCase()) ||
        c.location?.toLowerCase().includes(search.toLowerCase()) ||
        c.citizenName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="Officer Dashboard" />
                <div className="main-content">
                    <div className="page-header">
                        <h1>My Cases</h1>
                        <p>Welcome, {userProfile?.name}. Manage your assigned cases below.</p>
                    </div>

                    <div className="grid-3 mb-24">
                        {[
                            { label: 'Total Assigned', value: cases.length, color: 'var(--accent-light)', bg: 'var(--accent-glow)', icon: <MdAssignment /> },
                            { label: 'Pending', value: cases.filter(c => c.status === 'Pending').length, color: 'var(--yellow)', bg: 'var(--yellow-light)', icon: <MdWarning /> },
                            { label: 'Closed', value: cases.filter(c => c.status === 'Closed').length, color: 'var(--green)', bg: 'var(--green-light)', icon: <MdCheckCircle /> },
                        ].map(s => (
                            <div className="stat-card" key={s.label}>
                                <div className="stat-icon" style={{ background: s.bg }}><span style={{ color: s.color, fontSize: 22 }}>{s.icon}</span></div>
                                <div className="stat-info"><div className="label">{s.label}</div><div className="value" style={{ color: s.color }}>{s.value}</div></div>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div className="flex-between mb-16">
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Assigned FIRs</h3>
                            <div style={{ position: 'relative' }}>
                                <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="form-control" style={{ paddingLeft: 36, width: 220 }} placeholder="Search cases…" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>

                        {loading ? <div className="loader-wrap"><div className="spinner" /></div> : (
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>FIR ID</th><th>Citizen</th><th>Crime Type</th><th>Location</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filtered.map(c => (
                                            <tr key={c.id}>
                                                <td style={{ color: 'var(--accent-light)', fontWeight: 600, fontSize: 12 }}>#{c.id.slice(-6).toUpperCase()}</td>
                                                <td>{c.citizenName}</td>
                                                <td><span className="badge badge-info">{c.crimeType}</span></td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.location}</td>
                                                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.dateTime}</td>
                                                <td><span className={`badge ${statusColor[c.status] || ''}`}>{c.status}</span></td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedCase(c); setNewStatus(c.status); }}>Update</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No cases assigned yet</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Update Case Modal */}
                    {selectedCase && (
                        <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
                            <div className="modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Update Case #{selectedCase.id.slice(-6).toUpperCase()}</h3>
                                    <button className="modal-close" onClick={() => setSelectedCase(null)}>✕</button>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>CRIME TYPE</div><strong>{selectedCase.crimeType}</strong></div>
                                        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>LOCATION</div><strong>{selectedCase.location}</strong></div>
                                        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>CITIZEN</div><strong>{selectedCase.citizenName}</strong></div>
                                        <div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>DATE</div><strong>{selectedCase.dateTime}</strong></div>
                                    </div>
                                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Description:</div>
                                        <div style={{ fontSize: 13 }}>{selectedCase.description}</div>
                                    </div>
                                    {selectedCase.evidenceUrl && (
                                        <a href={selectedCase.evidenceUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>View Evidence</a>
                                    )}
                                </div>
                                <div className="form-group" style={{ marginBottom: 16 }}>
                                    <label>Update Status</label>
                                    <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                        <option>Pending</option><option>Investigating</option><option>Closed</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 20 }}>
                                    <label>Add Investigation Notes</label>
                                    <textarea className="form-control" rows={3} placeholder="Add your notes here…" value={note} onChange={e => setNote(e.target.value)} />
                                </div>
                                {(selectedCase.notes || []).length > 0 && (
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>PREVIOUS NOTES</div>
                                        {selectedCase.notes.map((n, i) => (
                                            <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: 13 }}>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 4 }}>{n.officer} • {new Date(n.date).toLocaleDateString()}</div>
                                                {n.text}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn btn-primary" onClick={updateCase}>Save Changes</button>
                                    <button className="btn btn-secondary" onClick={() => setSelectedCase(null)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
