import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { subscribeToFIRs, getAllOfficers, updateFIR } from '../../services/firestoreService';
import { useNotifications } from '../../contexts/NotificationContext';
import { MdPerson, MdSearch, MdFilterList } from 'react-icons/md';
import toast from 'react-hot-toast';

const CRIME_TYPES = ['Theft', 'Assault', 'Fraud', 'Murder', 'Robbery', 'Cybercrime', 'Vandalism', 'Drug Offense', 'Kidnapping', 'Other'];

export default function AllFIRs() {
    const [firs, setFirs] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCrime, setFilterCrime] = useState('All');
    const [assigning, setAssigning] = useState(null);
    const [selOfficer, setSelOfficer] = useState('');
    const { createNotification } = useNotifications();

    useEffect(() => {
        const unsub = subscribeToFIRs(setFirs);
        getAllOfficers().then(setOfficers);
        return unsub;
    }, []);

    async function assignOfficer(fir) {
        if (!selOfficer) return toast.error('Select an officer first');
        const officer = officers.find(o => o.uid === selOfficer || o.id === selOfficer);
        await updateFIR(fir.id, { assignedTo: selOfficer, assignedOfficerName: officer?.name, status: 'Investigating' });
        await createNotification(selOfficer, 'Case Assigned', `You have been assigned FIR #${fir.id.slice(-6).toUpperCase()}. Crime: ${fir.crimeType} at ${fir.location}.`, 'info');
        toast.success('Officer assigned!');
        setAssigning(null);
        setSelOfficer('');
    }

    const statusColor = { Pending: 'badge-pending', Investigating: 'badge-investigating', Closed: 'badge-closed' };

    const filtered = firs.filter(f => {
        const matchSearch = f.citizenName?.toLowerCase().includes(search.toLowerCase()) ||
            f.crimeType?.toLowerCase().includes(search.toLowerCase()) ||
            f.location?.toLowerCase().includes(search.toLowerCase()) ||
            f.id.includes(search);
        const matchStatus = filterStatus === 'All' || f.status === filterStatus;
        const matchCrime = filterCrime === 'All' || f.crimeType === filterCrime;
        return matchSearch && matchStatus && matchCrime;
    });

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="FIR Management" />
                <div className="main-content">
                    <div className="page-header flex-between">
                        <div><h1>All FIRs</h1><p>Manage and assign all filed FIRs</p></div>
                    </div>

                    <div className="card mb-24">
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                                <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Search by name, crime, location…" value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <select className="form-control" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option>Pending</option><option>Investigating</option><option>Closed</option>
                            </select>
                            <select className="form-control" style={{ width: 180 }} value={filterCrime} onChange={e => setFilterCrime(e.target.value)}>
                                <option value="All">All Crime Types</option>
                                {CRIME_TYPES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="card">
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>FIR ID</th><th>Citizen</th><th>Crime Type</th><th>Location</th><th>Date</th><th>Status</th><th>Assigned To</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map(f => (
                                        <tr key={f.id}>
                                            <td style={{ color: 'var(--accent-light)', fontWeight: 600, fontSize: 12 }}>#{f.id.slice(-6).toUpperCase()}</td>
                                            <td>{f.citizenName}</td>
                                            <td><span className="badge badge-info">{f.crimeType}</span></td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{f.location}</td>
                                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.dateTime}</td>
                                            <td><span className={`badge ${statusColor[f.status] || 'badge-info'}`}>{f.status}</span></td>
                                            <td style={{ fontSize: 13 }}>{f.assignedOfficerName || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                                            <td>
                                                {assigning === f.id ? (
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <select className="form-control" style={{ fontSize: 12, padding: '5px 8px', width: 140 }} value={selOfficer} onChange={e => setSelOfficer(e.target.value)}>
                                                            <option value="">Select officer</option>
                                                            {officers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                                        </select>
                                                        <button className="btn btn-primary btn-sm" onClick={() => assignOfficer(f)}>Assign</button>
                                                        <button className="btn btn-secondary btn-sm" onClick={() => setAssigning(null)}>✕</button>
                                                    </div>
                                                ) : (
                                                    <button className="btn btn-secondary btn-sm" onClick={() => { setAssigning(f.id); setSelOfficer(f.assignedTo || ''); }}>
                                                        <MdPerson /> {f.assignedTo ? 'Reassign' : 'Assign'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No FIRs found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
