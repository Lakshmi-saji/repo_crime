import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { getAllOfficers, getAllUsers, updateUser } from '../../services/firestoreService';
import { getAllStations, addStation } from '../../services/firestoreService';
import { MdPersonAdd, MdPeople, MdEdit, MdCheck } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function Officers() {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllOfficers().then(data => { setOfficers(data); setLoading(false); });
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="Officers Management" />
                <div className="main-content">
                    <div className="page-header">
                        <h1>Police Officers</h1>
                        <p>All registered officers in the system</p>
                    </div>

                    <div className="card">
                        {loading ? (
                            <div className="loader-wrap"><div className="spinner" /></div>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                                    <tbody>
                                        {officers.map(o => (
                                            <tr key={o.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                                                            {o.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        {o.name}
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{o.email}</td>
                                                <td><span className="badge badge-officer">Officer</span></td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{o.createdAt?.slice(0, 10) || '—'}</td>
                                            </tr>
                                        ))}
                                        {officers.length === 0 && (
                                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No officers registered yet</td></tr>
                                        )}
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
