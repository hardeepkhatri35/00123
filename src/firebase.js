import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACnWRvpTx1E6Gzte_kQep6UmtDk1gCVpA",
  authDomain: "demo1-451b4.firebaseapp.com",
  projectId: "demo1-451b4",
  storageBucket: "demo1-451b4.firebasestorage.app",
  messagingSenderId: "942625913398",
  appId: "1:942625913398:web:30ca4995ee8640a399f697",
  measurementId: "G-E7ZBJ850CG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// TEST: Try to fetch orders once on startup
(async () => {
  try {
    const snapshot = await getDocs(collection(db, "orders"));
    console.log("Firebase connection successful! Orders count:", snapshot.size);
  } catch (err) {
    console.error("Firebase connection error:", err);
  }
})(); 