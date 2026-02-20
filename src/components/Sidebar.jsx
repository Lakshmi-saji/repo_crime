import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    MdShield, MdDashboard, MdAssignment, MdPeople,
    MdBarChart, MdNotifications, MdPerson, MdAdd,
    MdList, MdSupervisorAccount, MdWarning, MdLocationOn,
} from 'react-icons/md';

const adminNav = [
    { to: '/admin', label: 'Dashboard', icon: <MdDashboard />, end: true },
    { to: '/admin/firs', label: 'All FIRs', icon: <MdAssignment /> },
    { to: '/admin/officers', label: 'Officers', icon: <MdPeople /> },
    { to: '/admin/stations', label: 'Stations', icon: <MdLocationOn /> },
    { to: '/criminals', label: 'Criminal Records', icon: <MdWarning /> },
    { to: '/analytics', label: 'Analytics', icon: <MdBarChart /> },
];

const officerNav = [
    { to: '/officer', label: 'Dashboard', icon: <MdDashboard />, end: true },
    { to: '/officer/cases', label: 'My Cases', icon: <MdAssignment /> },
    { to: '/criminals', label: 'Criminal Records', icon: <MdWarning /> },
    { to: '/analytics', label: 'Analytics', icon: <MdBarChart /> },
];

const citizenNav = [
    { to: '/citizen', label: 'Dashboard', icon: <MdDashboard />, end: true },
    { to: '/citizen/submit-fir', label: 'Submit FIR', icon: <MdAdd /> },
    { to: '/citizen/my-firs', label: 'My FIRs', icon: <MdList /> },
];

export default function Sidebar() {
    const { userProfile, userRole } = useAuth();
    const navLinks = userRole === 'admin' ? adminNav : userRole === 'officer' ? officerNav : citizenNav;

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">🛡️</div>
                <div>
                    <div className="logo-text">CrimeGuard</div>
                    <div className="logo-sub">Smart Management System</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-title">Navigation</div>
                {navLinks.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="icon">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-pill">
                    <div className="avatar">{userProfile?.name?.[0]?.toUpperCase() || 'U'}</div>
                    <div className="user-info">
                        <div className="user-name">{userProfile?.name || 'User'}</div>
                        <div className="user-role">{userRole || 'citizen'}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
