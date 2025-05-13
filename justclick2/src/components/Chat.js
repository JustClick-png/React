import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import '../css/Chat.css';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';

const Chat = () => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [usuarioId, setUsuarioId] = useState('');
  const [emisorId, setEmisorId] = useState('');

  // Detectar usuario autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
        setEmisorId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Cargar lista de clientes
  useEffect(() => {
    const obtenerClientes = async () => {
      const clientesSnapshot = await getDocs(collection(db, 'cliente'));
      const clientesData = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);
    };

    obtenerClientes();
  }, []);

  useEffect(() => {
    if (!clienteSeleccionado) return;

    const idCliente = Number(clienteSeleccionado.clienteId);

    const q = query(
      collection(db, 'chat'),
      where('clienteId', '==', idCliente)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const mensajesData = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        mensajesData.push(data);

        // Marcar como leído si el usuario actual no es el emisor
        if (data.emisorId !== emisorId && data.leido === false) {
          updateDoc(doc(db, 'chat', docSnap.id), { leido: true });
        }
      });

      mensajesData.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return a.timestamp.seconds - b.timestamp.seconds;
      });

      setMensajes(mensajesData);
    });


    return () => unsubscribe();
  }, [clienteSeleccionado]);


  // Enviar mensaje
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !clienteSeleccionado) return;

    await addDoc(collection(db, 'chat'), {
      clienteId: Number(clienteSeleccionado.clienteId),
      usuarioId,
      emisorId,
      mensaje: nuevoMensaje,
      timestamp: serverTimestamp(),
      leido: false 
    });

    setNuevoMensaje('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Lista de clientes */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '16px', overflowY: 'auto' }}>
        <h3>Clientes</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {clientes.map((cliente) => (
            <li
              key={cliente.clienteId}
              onClick={() => setClienteSeleccionado({
                ...cliente,
                clienteId: Number(cliente.clienteId)
              })}
              style={{
                padding: '10px',
                marginBottom: '8px',
                backgroundColor: clienteSeleccionado?.clienteId === Number(cliente.clienteId) ? '#e6f7ff' : '#f9f9f9',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {cliente.nombre} {cliente.apellido1}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat */}
      <div style={{ width: '70%', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        {clienteSeleccionado ? (
          <>
            <h3>Chat con {clienteSeleccionado.nombre} {clienteSeleccionado.apellido1}</h3>
            <div style={{ flexGrow: 1, overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '12px' }}>
              {mensajes.length > 0 ? (
                mensajes.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: msg.emisorId === emisorId ? 'flex-end' : 'flex-start',
                      marginBottom: '8px'
                    }}
                  >
                    <div
                    style={{
                      backgroundColor: msg.emisorId === emisorId ? '#DCF8C6' : '#F1F0F0',
                      padding: '10px',
                      borderRadius: '12px',
                      maxWidth: '70%',
                      position: 'relative'
                    }}
                  >
                    <div>{msg.mensaje}</div>
                    {msg.timestamp && (
                      <div style={{ fontSize: '10px', color: '#555', textAlign: 'right', marginTop: '4px' }}>
                        {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  </div>
                ))
              ) : (
                <p style={{ fontStyle: 'italic', color: '#888' }}>No hay mensajes aún.</p>
              )}
            </div>
            <form onSubmit={enviarMensaje} style={{ display: 'flex' }}>
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
                style={{ flexGrow: 1, padding: '10px' }}
              />
              <button type="submit" style={{ padding: '10px 20px' }}>
                Enviar
              </button>
            </form>
          </>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#888' }}>Selecciona un cliente para comenzar a chatear.</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
