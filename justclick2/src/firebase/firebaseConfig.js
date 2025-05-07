// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage'; 


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpHw_eBKkNOHt8U82HBDO_XCVUxMTTej8",
  authDomain: "tfg-almi-f0864.firebaseapp.com",
  projectId: "tfg-almi-f0864",
  storageBucket: "tfg-almi-f0864.firebasestorage.app",
  messagingSenderId: "447143105340",
  appId: "1:447143105340:web:931fe45f0941ae81c24439",
  measurementId: "G-SCEJYB176J"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, db, auth, storage };

