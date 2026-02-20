import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getAllStations, addStation } from '../../services/firestoreService';
import { MdAdd, MdLocationOn } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function Stations() {
    const [stations, setStations] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', address: '', coverageAreas: '' });
    const [loading, setLoading] = useState(false);

    const fetchStations = () => getAllStations().then(setStations);
    useEffect(() => { fetchStations(); }, []);

    async function handleAdd(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await addStation({
                name: form.name,
                email: form.email,
                address: form.address,
                coverageAreas: form.coverageAreas.split(',').map(s => s.trim()).filter(Boolean),
                officerIds: [],
            });
            toast.success('Station added!');
            setForm({ name: '', email: '', address: '', coverageAreas: '' });
            setShowForm(false);
            fetchStations();
        } catch {
            toast.error('Failed to add station');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="Stations" />
                <div className="main-content">
                    <div className="page-header flex-between">
                        <div><h1>Police Stations</h1><p>Manage station coverage areas for auto-alerts</p></div>
                        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}><MdAdd /> Add Station</button>
                    </div>

                    {showForm && (
                        <div className="card mb-24">
                            <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>New Police Station</h3>
                            <form onSubmit={handleAdd}>
                                <div className="form-grid">
                                    <div className="form-group"><label>Station Name</label><input className="form-control" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                                    <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                                    <div className="form-group full"><label>Address</label><input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                                    <div className="form-group full">
                                        <label>Coverage Areas (comma-separated)</label>
                                        <input className="form-control" placeholder="e.g. Downtown, Sector 5, North Zone" value={form.coverageAreas} onChange={e => setForm(p => ({ ...p, coverageAreas: e.target.value }))} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                    <button className="btn btn-primary" type="submit" disabled={loading}>Save Station</button>
                                    <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid-auto">
                        {stations.map(s => (
                            <div className="card" key={s.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 44, height: 44, background: 'var(--cyan-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}><MdLocationOn style={{ color: 'var(--cyan)' }} /></div>
                                    <div><div style={{ fontWeight: 700 }}>{s.name}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.email}</div></div>
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{s.address}</div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 6 }}>COVERAGE AREAS</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {(s.coverageAreas || []).map(area => (
                                            <span key={area} className="badge badge-info">{area}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stations.length === 0 && (
                            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No stations added yet. Click "Add Station" to get started.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
