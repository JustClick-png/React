// firebaseFunctions.js
import { db } from './firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const agregarReserva = async (nombre, fecha, hora) => {
  const user = getAuth().currentUser;
  if (!user) {
    console.error("Usuario no autenticado");
    return;
  }

  const empresaId = user.uid;  // Usamos el UID como empresaId

  const fechaTimestamp = Timestamp.fromDate(new Date(fecha));  // Convierte la fecha a un Timestamp

  try {
    const docRef = await addDoc(collection(db, "reservas"), {
      nombre,
      fecha: fechaTimestamp,
      hora,
      empresaId,  // Guardamos el ID de la empresa
    });
    console.log("Reserva añadida con ID: ", docRef.id);
  } catch (e) {
    console.error("Error añadiendo la reserva: ", e);
  }
};
