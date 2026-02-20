import { getAllStations } from './firestoreService';
import { v4 as uuidv4 } from 'uuid';

const getLS = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLS = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export async function createNotification(recipientId, type, title, message, actionUrl = null) {
    const n = getLS('notifications');
    n.push({
        id: uuidv4(),
        recipientId,
        type,
        title,
        message,
        actionUrl,
        read: false,
        createdAt: new Date().toISOString()
    });
    setLS('notifications', n);
}

export async function notifyStationForFIR(firData, firId) {
    const stations = await getAllStations();
    const locationLower = firData.location.toLowerCase();

    // Find station covering this block
    const station = stations.find(s =>
        s.coverageAreas.some(area => locationLower.includes(area.toLowerCase()))
    );

    const targetStation = station || stations[0]; // fallback
    if (!targetStation) return;

    // Pretend we emailed them
    console.log(`[SIMULATED EMAIL SENT TO ${targetStation.email}]: New FIR Filed at ${firData.location}`);

    // Create local notification for admins
    const users = getLS('users');
    users.filter(u => u.role === 'admin').forEach(admin => {
        createNotification(
            admin.uid,
            'new_fir',
            '🚨 New FIR Alert',
            `New FIR filed in ${targetStation.name} jurisdiction (${firData.location}).`
        );
    });
}
