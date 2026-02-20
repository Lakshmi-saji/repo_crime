import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const getLS = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLS = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export function NotificationProvider({ children }) {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Polling mock to pretend real-time sync works
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        const interval = setInterval(() => {
            const all = getLS('notifications');
            const userNotifs = all.filter(n => n.recipientId === currentUser.uid);
            userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(userNotifs);
            setUnreadCount(userNotifs.filter(n => !n.read).length);
        }, 1000);
        return () => clearInterval(interval);
    }, [currentUser]);

    function markRead(notifId) {
        const all = getLS('notifications');
        const index = all.findIndex(n => n.id === notifId);
        if (index > -1) {
            all[index].read = true;
            setLS('notifications', all);
        }
    }

    function createNotification(recipientId, title, message, type = 'info') {
        const all = getLS('notifications');
        all.push({
            id: uuidv4(),
            recipientId,
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        });
        setLS('notifications', all);
    }

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markRead, createNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
