import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpHw_eBKkNOHt8U82HBDO_XCVUxMTTej8",
  authDomain: "tfg-almi-f0864.firebaseapp.com",
  projectId: "tfg-almi-f0864",
  storageBucket: "tfg-almi-f0864.appspot.com",
  messagingSenderId: "447143105340",
  appId: "1:447143105340:web:931fe45f0941ae81c24439",
  measurementId: "G-SCEJYB176J"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Instancias de servicios
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Analytics (protegido para evitar errores en localhost o SSR)
let analytics;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Analytics no disponible en este entorno.");
  }
}

// Exportaciones
export { db, auth, storage, analytics };
