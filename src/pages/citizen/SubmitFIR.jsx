import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { createFIR, updateFIR } from '../../services/firestoreService';
import { uploadEvidence } from '../../services/storageService';
import { notifyStationForFIR } from '../../services/alertService';
import { useAuth } from '../../contexts/AuthContext';
import { MdCloudUpload, MdSend } from 'react-icons/md';
import toast from 'react-hot-toast';

const CRIME_TYPES = ['Theft', 'Assault', 'Fraud', 'Murder', 'Robbery', 'Cybercrime', 'Vandalism', 'Drug Offense', 'Kidnapping', 'Other'];

export default function SubmitFIR() {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        citizenName: userProfile?.name || '',
        crimeType: '',
        description: '',
        location: '',
        dateTime: new Date().toISOString().slice(0, 16),
    });
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [dragover, setDragover] = useState(false);

    function handleFile(f) {
        if (f && f.size > 20 * 1024 * 1024) { toast.error('File too large (max 20MB)'); return; }
        setFile(f);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.crimeType) { toast.error('Please select a crime type'); return; }
        setLoading(true);
        try {
            const firData = { ...form, citizenId: currentUser.uid, citizenEmail: currentUser.email };
            const docRef = await createFIR(firData);
            const firId = docRef.id;

            let evidenceUrl = null;
            if (file) {
                toast('Uploading evidence…', { icon: '📎' });
                evidenceUrl = await uploadEvidence(file, firId, setProgress);
                await updateFIR(firId, { evidenceUrl, evidenceName: file.name });
            }

            await notifyStationForFIR(firData, firId);
            toast.success('FIR submitted successfully! 🔔 Responsible station notified.');
            navigate('/citizen/my-firs');
        } catch (err) {
            console.error(err);
            toast.error('Failed to submit FIR. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Navbar title="Submit FIR" />
                <div className="main-content">
                    <div className="page-header">
                        <h1>File a New FIR</h1>
                        <p>Provide accurate details to help law enforcement respond effectively</p>
                    </div>

                    <div style={{ maxWidth: 780, margin: '0 auto' }}>
                        <form className="card" onSubmit={handleSubmit}>
                            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>FIR Details</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Your Full Name *</label>
                                    <input className="form-control" required value={form.citizenName}
                                        onChange={e => setForm(p => ({ ...p, citizenName: e.target.value }))} />
                                </div>

                                <div className="form-group">
                                    <label>Crime Type *</label>
                                    <select className="form-control" required value={form.crimeType}
                                        onChange={e => setForm(p => ({ ...p, crimeType: e.target.value }))}>
                                        <option value="">Select crime type</option>
                                        {CRIME_TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Location / Address *</label>
                                    <input className="form-control" required placeholder="Street, Area, City"
                                        value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                                </div>

                                <div className="form-group">
                                    <label>Date & Time of Incident *</label>
                                    <input className="form-control" type="datetime-local" required
                                        value={form.dateTime} onChange={e => setForm(p => ({ ...p, dateTime: e.target.value }))} />
                                </div>

                                <div className="form-group full">
                                    <label>Description of Incident *</label>
                                    <textarea className="form-control" rows={5} required
                                        placeholder="Describe the incident in detail — what happened, who was involved, sequence of events…"
                                        value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                                </div>

                                <div className="form-group full">
                                    <label>Evidence Upload (optional)</label>
                                    <div
                                        className={`upload-area ${dragover ? 'dragover' : ''}`}
                                        onDragOver={e => { e.preventDefault(); setDragover(true); }}
                                        onDragLeave={() => setDragover(false)}
                                        onDrop={e => { e.preventDefault(); setDragover(false); handleFile(e.dataTransfer.files[0]); }}
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        <input id="fileInput" type="file" hidden accept="image/*,video/*,.pdf,.doc,.docx"
                                            onChange={e => handleFile(e.target.files[0])} />
                                        <div className="u-icon"><MdCloudUpload /></div>
                                        {file ? (
                                            <p style={{ color: 'var(--accent-light)', fontWeight: 600 }}>📎 {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
                                        ) : (
                                            <>
                                                <p>Drag & drop or click to upload</p>
                                                <p style={{ fontSize: 12, marginTop: 4 }}>Images, videos, PDFs, documents (max 20MB)</p>
                                            </>
                                        )}
                                        {progress > 0 && progress < 100 && (
                                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => navigate('/citizen')}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 160 }}>
                                    {loading ? 'Submitting…' : <><MdSend /> Submit FIR</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
