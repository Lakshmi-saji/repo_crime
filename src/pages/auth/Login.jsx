import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MdShield, MdEmail, MdLock, MdPerson, MdArrowForward } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const roleRedirects = { admin: '/admin', officer: '/officer', citizen: '/citizen' };

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="shield"><MdShield /></div>
                    <h2>Smart Crime Management</h2>
                    <p>Region-Based Alert System</p>
                </div>

                {error && <div className="alert alert-error mb-16">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <MdEmail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                            <input
                                className="form-control"
                                type="email"
                                style={{ paddingLeft: 40 }}
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <MdLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }} />
                            <input
                                className="form-control"
                                type="password"
                                style={{ paddingLeft: 40 }}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary w-full mt-8" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '13px' }}>
                        {loading ? 'Signing In…' : <><span>Sign In</span><MdArrowForward /></>}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>

            </div>
        </div>
    );
}
