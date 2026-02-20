import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getAllCriminals, addCriminal, updateCriminal, deleteCriminal } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdPerson, MdSearch } from 'react-icons/md';
import toast from 'react-hot-toast';

const emptyForm = { name: '', dob: '', gender: 'Male', nationality: '', crimeHistory: '', linkedFIRs: '', address: '', status: 'Active', photoUrl: '' };

export default function CriminalRecords() {
    const { userRole } = useAuth();
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');

    const canEdit = userRole === 'admin' || userRole === 'officer';

    const fetch = () => getAllCriminals().then(d => { setCriminals(d); setLoading(false); });
    useEffect(() => { fetch(); }, []);

    function openAdd() { setForm(emptyForm); setEditId(null); setShowModal(true); }
    function openEdit(c) {
        setForm({ ...c, crimeHistory: c.crimeHistory || '', linkedFIRs: Array.isArray(c.linkedFIRs) ? c.linkedFIRs.join(', ') : (c.linkedFIRs || '') });
        setEditId(c.id); setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        const data = { ...form, linkedFIRs: form.linkedFIRs.split(',').map(s => s.trim()).filter(Boolean) };
        try {
            if (editId) { await updateCriminal(editId, data); toast.success('Record updated!'); }
            else { await addCriminal(data); toast.success('Criminal record added!'); }
            setShowModal(false); fetch();
        } catch { toast.error('Operation failed'); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this criminal record?')) return;
        await deleteCriminal(id); toast.success('Deleted'); fetch();
    }

    const filtered = criminals.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.crimeHistory?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="Criminal Records" />
                <div className="main-content">
                    <div className="page-header flex-between">
                        <div><h1>Criminal Records</h1><p>Database of known criminals linked to cases</p></div>
                        {canEdit && <button className="btn btn-primary" onClick={openAdd}><MdAdd /> Add Record</button>}
                    </div>

                    <div className="card mb-16" style={{ padding: '14px 18px' }}>
                        <div style={{ position: 'relative' }}>
                            <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Search by name or crime history…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {loading ? <div className="loader-wrap"><div className="spinner" /></div> : (
                        <div className="grid-auto">
                            {filtered.map(c => (
                                <div key={c.id} className="card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                        <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
                                            {c.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                                            <span className={`badge ${c.status === 'Active' ? 'badge-alert' : 'badge-closed'}`}>{c.status || 'Active'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                                        {[['DOB', c.dob], ['Gender', c.gender], ['Nationality', c.nationality], ['Address', c.address]].filter(([, v]) => v).map(([k, v]) => (
                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                                                <span style={{ fontWeight: 500 }}>{v}</span>
                                            </div>
                                        ))}
                                        {c.crimeHistory && (
                                            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                                                <strong style={{ color: 'var(--text-primary)' }}>Crime History: </strong>{c.crimeHistory}
                                            </div>
                                        )}
                                        {(c.linkedFIRs || []).length > 0 && (
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {c.linkedFIRs.map(f => <span key={f} className="badge badge-info">FIR #{f.slice(-6).toUpperCase()}</span>)}
                                            </div>
                                        )}
                                    </div>
                                    {canEdit && (
                                        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}><MdEdit /> Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><MdDelete /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No criminal records found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editId ? 'Edit' : 'Add'} Criminal Record</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-grid">
                                <div className="form-group"><label>Full Name *</label><input className="form-control" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                                <div className="form-group"><label>Date of Birth</label><input className="form-control" type="date" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} /></div>
                                <div className="form-group"><label>Gender</label>
                                    <select className="form-control" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                                        <option>Male</option><option>Female</option><option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Status</label>
                                    <select className="form-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                        <option>Active</option><option>Arrested</option><option>Deceased</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Nationality</label><input className="form-control" value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))} /></div>
                                <div className="form-group"><label>Address</label><input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                                <div className="form-group full"><label>Crime History</label><textarea className="form-control" rows={3} value={form.crimeHistory} onChange={e => setForm(p => ({ ...p, crimeHistory: e.target.value }))} /></div>
                                <div className="form-group full"><label>Linked FIR IDs (comma-separated)</label><input className="form-control" placeholder="firId1, firId2, …" value={form.linkedFIRs} onChange={e => setForm(p => ({ ...p, linkedFIRs: e.target.value }))} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="submit" className="btn btn-primary">Save Record</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
