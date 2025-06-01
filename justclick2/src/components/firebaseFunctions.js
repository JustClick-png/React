import { db } from './firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const agregarReserva = async (nombre, fecha, hora) => {
  const user = getAuth().currentUser;
  if (!user) {
    console.error("Usuario no autenticado");
    return;
  }

  const empresaId = user.uid;  

  const fechaTimestamp = Timestamp.fromDate(new Date(fecha));  

  try {
    const docRef = await addDoc(collection(db, "reservas"), {
      nombre,
      fecha: fechaTimestamp,
      hora,
      empresaId,  
    });
    console.log("Reserva añadida con ID: ", docRef.id);
  } catch (e) {
    console.error("Error añadiendo la reserva: ", e);
  }
};
