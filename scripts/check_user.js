
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function check() {
    console.log('--- USER DATA DIAGNOSTIC ---');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'admin@example.com'));
    const snap = await getDocs(q);

    if (snap.empty) {
        console.log('User admin@example.com not found!');
    } else {
        const user = snap.docs[0].data();
        console.log('User ID:', snap.docs[0].id);
        console.log('User Data:', JSON.stringify(user, null, 2));
    }
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
