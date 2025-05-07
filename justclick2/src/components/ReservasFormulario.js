// ReservasFormulario.js
import React, { useState } from 'react';
import { agregarReserva } from './firebaseFunctions'; // Importamos la función para agregar reservas

const ReservasFormulario = () => {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const manejarEnvioReserva = (e) => {
    e.preventDefault();
    agregarReserva(nombre, fecha, hora);
  };

  return (
    <form onSubmit={manejarEnvioReserva}>
      <label>Nombre</label>
      <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />

      <label>Fecha</label>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

      <label>Hora</label>
      <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />

      <button type="submit">Hacer Reserva</button>
    </form>
  );
};

export default ReservasFormulario;
