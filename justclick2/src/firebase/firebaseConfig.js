// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpHw_eBKkNOHt8U82HBDO_XCVUxMTTej8",
  authDomain: "tfg-almi-f0864.firebaseapp.com",
  projectId: "tfg-almi-f0864",
  storageBucket: "tfg-almi-f0864.appspot.com", // ✅ CORREGIDO
  messagingSenderId: "447143105340",
  appId: "1:447143105340:web:931fe45f0941ae81c24439",
  measurementId: "G-SCEJYB176J"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { db, auth, analytics, storage };