import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { MdNotifications, MdLogout } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Navbar({ title }) {
    const { userProfile, logout } = useAuth();
    const { notifications, unreadCount, markRead } = useNotifications();
    const [showNotif, setShowNotif] = useState(false);
    const panelRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        function handleClick(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) setShowNotif(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    async function handleLogout() {
        await logout();
        toast('Logged out', { icon: '👋' });
        navigate('/login');
    }

    return (
        <div className="topbar">
            <span className="topbar-title">{title}</span>
            <div className="topbar-actions">
                <div style={{ position: 'relative' }} ref={panelRef}>
                    <button className="notif-btn" onClick={() => setShowNotif(v => !v)} id="notif-btn">
                        <MdNotifications />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>
                    {showNotif && (
                        <div className="notif-panel">
                            <div className="notif-header">🔔 Notifications ({unreadCount} unread)</div>
                            {notifications.length === 0 ? (
                                <div className="notif-empty">No notifications yet</div>
                            ) : (
                                notifications.slice(0, 20).map(n => (
                                    <div
                                        key={n.id}
                                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                                        onClick={() => markRead(n.id)}
                                    >
                                        <div className="notif-title">{n.title}</div>
                                        <div className="notif-msg">{n.message}</div>
                                        <div className="notif-time">
                                            {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : ''}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                        {userProfile?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{userProfile?.name || 'User'}</span>
                </div>

                <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="logout-btn">
                    <MdLogout /> Logout
                </button>
            </div>
        </div>
    );
}
