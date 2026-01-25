
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD9o0vgj_nsKqcrha52r1ftd5xd_7XI2l0",
    authDomain: "smart-pocket-ledger.firebaseapp.com",
    projectId: "smart-pocket-ledger",
    storageBucket: "smart-pocket-ledger.firebasestorage.app",
    messagingSenderId: "354153098273",
    appId: "1:354153098273:web:a7b7af678a69f0b79d4760"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    console.log('Searching for user...');
    const usersRef = collection(db, 'users');
    const uq = query(usersRef, where('email', '==', 'admintest@admin.ru'));
    const userSnap = await getDocs(uq);

    if (userSnap.empty) {
        console.log('User not found!');
        return;
    }

    const user = userSnap.docs[0].data();
    const userId = userSnap.docs[0].id;
    console.log('Found user:', user.email, 'ID:', userId);

    console.log('Searching for properties...');
    const propRef = collection(db, 'properties');
    const pq = query(propRef, where('userId', '==', userId));
    const propSnap = await getDocs(pq);

    let targetPropertyId;
    if (propSnap.empty) {
        console.log('No properties found for this user. checking all properties...');
        const allProps = await getDocs(propRef);
        if (allProps.empty) {
            console.log('No properties in DB at all!');
            return;
        }
        targetPropertyId = allProps.docs[0].id;
        console.log('Using first available property:', targetPropertyId);
    } else {
        targetPropertyId = propSnap.docs[0].id;
        console.log('Using user property:', targetPropertyId);
    }

    console.log('Sending message...');
    const msgRef = collection(db, 'messages');
    await addDoc(msgRef, {
        propertyId: targetPropertyId,
        unitId: null,
        userId: userId,
        text: 'Привет! Это тестовое сообщение от Antigravity. Если ты это видишь, значит переписка работает корректно! 🚀',
        sender: 'manager',
        timestamp: new Date().toISOString()
    });

    console.log('SUCCESS: Message sent!');
    process.exit(0);
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
