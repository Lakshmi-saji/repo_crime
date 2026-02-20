import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

const getLS = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLS = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize mock data if clean
    useEffect(() => {
        if (!localStorage.getItem('firs')) {
            setLS('firs', []);
            setLS('criminals', []);
            setLS('notifications', []);
            setLS('stations', [
                { id: '1', name: 'Central District Station', location: 'Downtown', email: 'dist1@police.com', coverageAreas: ['Downtown', 'Central', 'Financial District'] }
            ]);

            const seedUsers = [
                { uid: 'admin_1', email: 'admin@test.com', name: 'Global Admin', role: 'admin', password: 'password' },
                { uid: 'officer_1', email: 'officer@test.com', name: 'Officer Max', role: 'officer', password: 'password' },
                { uid: 'citizen_1', email: 'citizen@test.com', name: 'Jane Doe', role: 'citizen', password: 'password' },
            ];
            setLS('users', seedUsers);
        }

        // Check if there is already an active "session"
        const storedAuth = JSON.parse(localStorage.getItem('currentUser'));
        if (storedAuth) {
            setCurrentUser({ uid: storedAuth.uid, email: storedAuth.email });
            setUserRole(storedAuth.role);
            setUserProfile(storedAuth);
        }
        setLoading(false);
    }, []);

    async function register(email, password, name, role = 'citizen') {
        const users = getLS('users');
        if (users.find(u => u.email === email)) throw new Error('Email already in use.');

        const newUser = {
            uid: uuidv4(),
            email,
            password,
            name,
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        setLS('users', users);

        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setCurrentUser({ uid: newUser.uid, email: newUser.email });
        setUserRole(newUser.role);
        setUserProfile(newUser);
        return newUser;
    }

    function login(email, password) {
        return new Promise((resolve, reject) => {
            const users = getLS('users');
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                setCurrentUser({ uid: user.uid, email: user.email });
                setUserRole(user.role);
                setUserProfile(user);
                resolve(user);
            } else {
                reject(new Error('Invalid credentials'));
            }
        });
    }

    function logout() {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
    }

    return (
        <AuthContext.Provider value={{ currentUser, userRole, userProfile, register, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
