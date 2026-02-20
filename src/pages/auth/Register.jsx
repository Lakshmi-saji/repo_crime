import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MdShield, MdEmail, MdLock, MdPerson, MdArrowForward } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'citizen' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await register(form.email, form.password, form.name, form.role);
            toast.success('Account created! Welcome.');
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="shield"><MdShield /></div>
                    <h2>Create Account</h2>
                    <p>Join the Crime Management System</p>
                </div>

                {error && <div className="alert alert-error mb-16">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input className="form-control" type="text" placeholder="Your full name"
                            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="form-control" type="email" placeholder="Your email"
                            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <select className="form-control" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                            <option value="citizen">Citizen</option>
                            <option value="officer">Police Officer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-control" type="password" placeholder="Create password"
                            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input className="form-control" type="password" placeholder="Repeat password"
                            value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required />
                    </div>

                    <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '13px' }}>
                        {loading ? 'Creating Account…' : <><span>Create Account</span><MdArrowForward /></>}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
