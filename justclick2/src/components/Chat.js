import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import '../css/Chat.css';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [usuarioId, setUsuarioId] = useState('');
  const [emisorId, setEmisorId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [clientesConReserva, setClientesConReserva] = useState([]);
  const navigate = useNavigate();
  const mensajesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (mensajesEndRef.current) {
      mensajesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
        setEmisorId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerClientes = async () => {
      const snapshot = await getDocs(collection(db, 'cliente'));
      const datos = snapshot.docs.map(doc => ({ clienteId: doc.id, ...doc.data() }));
      setClientes(datos);
    };
    obtenerClientes();
  }, []);

  useEffect(() => {
    const obtenerClientesConReserva = async () => {
      if (!usuarioId) return;

      const reservasSnapshot = await getDocs(
        query(collection(db, 'reservas'), where('usuarioId', '==', usuarioId))
      );
      const clienteIds = reservasSnapshot.docs.map(doc => doc.data().clienteId);
      setClientesConReserva([...new Set(clienteIds)]);
    };

    obtenerClientesConReserva();
  }, [usuarioId]);

  useEffect(() => {
    if (!clienteSeleccionado) return;

    const q = query(
      collection(db, 'chat'),
      where('clienteId', '==', clienteSeleccionado.clienteId)
    );


    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const mensajesData = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        mensajesData.push(data);

        if (data.emisorId !== emisorId && data.leido === false) {
          updateDoc(doc(db, 'chat', docSnap.id), { leido: true });
        }
      });

      mensajesData.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return a.timestamp.seconds - b.timestamp.seconds;
      });

      setMensajes(mensajesData);
      setTimeout(scrollToBottom, 100); 
    });

    return () => unsubscribe();
  }, [clienteSeleccionado]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !clienteSeleccionado) return;

    await addDoc(collection(db, 'chat'), {
      clienteId: clienteSeleccionado.clienteId,
      usuarioId,
      emisorId,
      mensaje: nuevoMensaje,
      timestamp: serverTimestamp(),
      leido: false
    });

    setNuevoMensaje('');
  };

  const clientesFiltrados = clientes
    .filter(c => clientesConReserva.includes(c.clienteId))
    .filter(c =>
      (`${c.nombre} ${c.apellido1}`).toLowerCase().includes(busqueda.toLowerCase())
    );

  return (
    <div className="chat-container">
      <div className="chat-clientes">
        <button className="chat-volver-icono" onClick={() => navigate('/inicio')}>←</button>
        <h3>Clientes</h3>
        <div className="chat-buscador">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <ul>
          {clientesFiltrados.map((cliente) => (
            <li
              key={cliente.clienteId}
              className={clienteSeleccionado?.clienteId === cliente.clienteId ? 'seleccionado' : ''}
              onClick={() => setClienteSeleccionado(cliente)}
            >
              {cliente.nombre} {cliente.apellido1}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-mensajes-container">
        {clienteSeleccionado ? (
          <>
            <div className="chat-mensajes-titulo">
              Chat con {clienteSeleccionado.nombre} {clienteSeleccionado.apellido1}
            </div>
            <div className="chat-mensajes">
              {mensajes.length > 0 ? (
                mensajes.map((msg, idx) => (
                  <div key={idx} className={`chat-burbuja ${msg.emisorId === emisorId ? 'emisor' : ''}`}>
                    <div className="chat-mensaje">
                      <div>{msg.mensaje}</div>
                      {msg.timestamp && (
                        <div className="chat-hora">
                          {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontStyle: 'italic', color: '#888' }}>
                  No hay mensajes aún.
                </p>
              )}
              <div ref={mensajesEndRef}></div>
            </div>

            <form onSubmit={enviarMensaje} className="chat-formulario">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
              />
              <button type="submit">Enviar</button>
            </form>
          </>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#888' }}>
            Selecciona un cliente para comenzar a chatear.
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat;
