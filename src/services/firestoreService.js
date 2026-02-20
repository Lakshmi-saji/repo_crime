import { v4 as uuidv4 } from 'uuid';

const getLS = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLS = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// FIRs
export async function createFIR(data) {
    const firs = getLS('firs');
    const id = uuidv4();
    const newFIR = { ...data, id, createdAt: new Date().toISOString() };
    firs.push(newFIR);
    setLS('firs', firs);
    return id;
}

export async function getFIRsByUser(citizenId) {
    return getLS('firs').filter(f => f.citizenId === citizenId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getFIRsByOfficer(officerId) {
    return getLS('firs').filter(f => f.assignedOfficerId === officerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getAllFIRs() {
    return getLS('firs').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function updateFIR(firId, updates) {
    const firs = getLS('firs');
    const index = firs.findIndex(f => f.id === firId);
    if (index > -1) {
        firs[index] = { ...firs[index], ...updates };
        setLS('firs', firs);
    }
}

// Subscriptions
export function subscribeToFIRs(callback) {
    const fetch = () => {
        callback(getLS('firs').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
}

export function subscribeToAssignedFIRs(officerId, callback) {
    const fetch = () => {
        callback(getLS('firs').filter(f => f.assignedOfficerId === officerId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
}

// Users
export async function getAllUsers() {
    return getLS('users');
}

export async function updateUser(uid, updates) {
    const users = getLS('users');
    const index = users.findIndex(u => u.uid === uid);
    if (index > -1) {
        users[index] = { ...users[index], ...updates };
        setLS('users', users);
    }
}

export async function getAllOfficers() {
    return getLS('users').filter(u => u.role === 'officer');
}

// Criminals
export async function getAllCriminals() {
    return getLS('criminals').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function addCriminal(data) {
    const c = getLS('criminals');
    c.push({ ...data, id: uuidv4(), createdAt: new Date().toISOString() });
    setLS('criminals', c);
}

export async function updateCriminal(id, updates) {
    const c = getLS('criminals');
    const index = c.findIndex(x => x.id === id);
    if (index > -1) {
        c[index] = { ...c[index], ...updates };
        setLS('criminals', c);
    }
}

export async function deleteCriminal(id) {
    setLS('criminals', getLS('criminals').filter(x => x.id !== id));
}

// Stations
export async function getAllStations() {
    return getLS('stations');
}

export async function addStation(data) {
    const s = getLS('stations');
    s.push({ ...data, id: uuidv4() });
    setLS('stations', s);
}

export async function updateStation(id, updates) {
    const s = getLS('stations');
    const index = s.findIndex(x => x.id === id);
    if (index > -1) {
        s[index] = { ...s[index], ...updates };
        setLS('stations', s);
    }
}

export async function deleteStation(id) {
    setLS('stations', getLS('stations').filter(x => x.id !== id));
}
