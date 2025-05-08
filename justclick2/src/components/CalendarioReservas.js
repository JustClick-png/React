import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

const CalendarioReservas = ({ selectedDate }) => {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    const obtenerReservas = async () => {
      const user = getAuth().currentUser;
      if (!user) {
        console.error("Usuario no autenticado");
        return;
      }

      const empresaId = user.uid;  // El UID del usuario autenticado, que se usará como empresaId

      const q = query(collection(db, "reservas"), where("empresaId", "==", empresaId));
      const querySnapshot = await getDocs(q);

      const reservasData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          fecha: data.fecha.toDate(), // Convierte el Timestamp a Date
          hora: data.hora,
          clienteId: data.clienteId,
          servicio: data.servicio
        };
      });
      setReservas(reservasData);
    };

    obtenerReservas();
  }, []);

  const filteredReservas = reservas.filter(reserva => {
    const reservaDate = new Date(reserva.fecha);
    return reservaDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div>
      <h3>Reservas</h3>
      {filteredReservas.length === 0 ? (
        <p>todavía no hay reservas</p>
      ) : (
        <ul>
          {filteredReservas.map((reserva, index) => (
            <li key={index}>
              {reserva.nombre} - {reserva.fecha.toLocaleDateString()} {reserva.fecha.toLocaleTimeString()} ({reserva.hora}) - Cliente ID: {reserva.clienteId} - Servicio: {reserva.servicio}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}; 

export default CalendarioReservas;
