import React, { useState, useEffect } from 'react';
import '../css/Inicio.css';
import logo from '../fotos/logoo.png';
import perfil from '../fotos/perfil2.png';
import mesImage from '../fotos/mes.png';
import añoImage from '../fotos/año.png';
import fondoImage from '../fotos/fondo.jpg'; 
import Calendar from 'react-calendar';
import instaLogo from '../fotos/isnta.png';
import 'react-calendar/dist/Calendar.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function Inicio() {
  const [date, setDate] = useState(new Date());
  const today = new Date();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleDateChange = (newDate) => {
    setDate(newDate);
    filtrarReservasPorFecha(newDate);
  };
  const handleChangePerfil = () => navigate("/perfil");

  const handlePrevMonth = () => {
    const prevMonth = new Date(date);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    if (prevMonth >= today) setDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setDate(nextMonth);
  };

  const obtenerNombreCorto = (clienteId) => {
  const cliente = clientes.find(c => c.clienteId === clienteId);
    if (cliente) {
      return `${cliente.nombre} ${cliente.apellido1}`;
    }
    return `Cliente #${clienteId}`;
  };

  const filtrarReservasPorFecha = (fechaSeleccionada) => {
  const fechaSolo = fechaSeleccionada.toDateString(); // Ignora hora
  const filtradas = reservas.filter(reserva =>
      reserva.fecha.toDateString() === fechaSolo
    );
    setReservasFiltradas(filtradas);
  };

  const esHoy = (fecha) => {
  const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const obtenerNombreCliente = (clienteId) => {
    const cliente = clientes.find(c => c.clienteId === clienteId);
    if (cliente) {
      return `${cliente.nombre} ${cliente.apellido1} ${cliente.apellido2}`;
    }
    return `Cliente #${clienteId}`;
  };

  const handleReservaClick = (reserva) => {
    setReservaSeleccionada(reserva);
    setMostrarModal(true);
  };

  const actualizarEstadoReserva = async (reservaId, nuevoEstado) => {
    try {
      const ref = doc(db, 'reservas', reservaId);
      await updateDoc(ref, { estado: nuevoEstado });
      setReservas(prev =>
        prev.map(r => r.id === reservaId ? { ...r, estado: nuevoEstado } : r)
      );
      setMostrarModal(false);
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !correo || !mensaje) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const templateParams = {
      from_name: nombre,
      from_email: correo,
      message: mensaje,
    };

    emailjs
      .send('service_4s1z1md', 'template_hsio978', templateParams, '-yuJvUuMfk_LqKgKI')
      .then(() => {
        alert('Mensaje enviado correctamente');
        setNombre('');
        setCorreo('');
        setMensaje('');
        setError('');
      })
      .catch(() => {
        setError('Error de red al enviar el mensaje');
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        try {
          const reservasQuery = query(collection(db, "reservas"), where("usuarioId", "==", user.uid));
          const reservasSnapshot = await getDocs(reservasQuery);
          const reservasData = reservasSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              clienteId: data.clienteId,
              estado: data.estado,
              servicio: data.servicio,
              hora: data.hora,
              fecha: data.fecha.toDate(),
            };
          });
          setReservas(reservasData);
          filtrarReservasPorFecha(new Date()); // Al cargar, muestra reservas del día actual

          const clientesSnapshot = await getDocs(collection(db, "cliente"));
          const clientesData = clientesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              clienteId: data.clienteId,
              nombre: data.nombre,
              apellido1: data.apellido1,
              apellido2: data.apellido2,
              telefono: data.telefono,
              correo: data.correo
            };
          });
          setClientes(clientesData);
        } catch (error) {
          console.error("❌ Error cargando datos:", error);
        }

      } else {
        setIsAuthenticated(false);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="inicio">
      {/* NAV */}
      <div className="nav-menu">
        <div className="container">
          <img src={logo} alt="Logo" className="logo" />
          <div className="nav-links">
            <a href="#calendario">Calendario</a>
            <a href="#lista">Lista</a>
            <a href="#estadisticas">Estadísticas</a>
          </div>
          <div className="perfil-img">
            <img onClick={handleChangePerfil} className="perfil-img" src={perfil} alt="Perfil" />
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="fondo-imagen" style={{ backgroundImage: `url(${fondoImage})` }}>
        <div className="texto-sobre-imagen">
          <div className="titulo">JustClick</div>
          <div className="descripcion">
            Aquí puedes gestionar tus reservas, ver clientes interesados y promocionar tus servicios <br /> fácilmente.
          </div>
        </div>
      </div>

      <div className="inicio-container">
        {/* CALENDARIO */}
        <section id="calendario" className="section-container">
          <h2 className="h2">Calendario</h2>
          <Calendar
            onChange={handleDateChange}
            value={date}
            minDate={today}
            next2Label={null}
            prev2Label={null}
            prevLabel={<span onClick={handlePrevMonth} className="react-calendar__navigation__arrow">&#10094;</span>}
            nextLabel={<span onClick={handleNextMonth} className="react-calendar__navigation__arrow">&#10095;</span>}
            formatMonthYear={(locale, date) =>
              date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^./, str => str.toUpperCase())
            }
          />
        </section>

        {/* RESERVAS */}
        <section id="reservas" className="section-container">
          <h2 className="h2">Reservas</h2>
          {!isAuthenticated ? (
            <p>Usuario no autenticado</p>
          ) : reservas.length === 0 ? (
            <p>Todavía no hay reservas</p>
          ) : (
            <ul>
              {reservasFiltradas.length === 0 ? (
                esHoy(date) ? (
                  <p>Hoy no hay reservas programadas.</p>
                ) : (
                  <p>No hay reservas en esta fecha.</p>
                )
              ) : (
                <ul>
                  {reservasFiltradas.map((reserva, index) => (
                    <li
                      key={index}
                      onClick={() => handleReservaClick(reserva)}
                      className="reserva-item"
                    >
                      <strong>{reserva.fecha.toLocaleDateString()}</strong> – {obtenerNombreCorto(reserva.clienteId)} – {reserva.estado}
                    </li>
                  ))}
                </ul>
              )}
            </ul>
          )}
        </section>

        {/* MODAL DE RESERVA */}
        {mostrarModal && reservaSeleccionada && (
          <div className="modal-fondo">
            <div className="modal-contenido">
              <h3>Detalles de la reserva</h3>
              <p><strong>Servicio:</strong> {reservaSeleccionada.servicio}</p>
              <p><strong>Fecha:</strong> {reservaSeleccionada.fecha.toLocaleString()}</p>
              {(() => {
                const cliente = clientes.find(c => c.clienteId === reservaSeleccionada.clienteId);
                if (cliente) {
                  return (
                    <>
                      <p><strong>Cliente:</strong> {cliente.nombre} {cliente.apellido1} {cliente.apellido2}</p>
                      <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                      <p><strong>Correo:</strong> {cliente.correo}</p>
                    </>
                  );
                }
                return <p>Cliente no encontrado.</p>;
              })()}
              <div className="estado-botones">
                <button onClick={() => actualizarEstadoReserva(reservaSeleccionada.id, 'Aceptada')}>
                  Aceptar
                </button>
                <button onClick={() => actualizarEstadoReserva(reservaSeleccionada.id, 'Cancelada')}>
                  Cancelar
                </button>
                <button onClick={() => actualizarEstadoReserva(reservaSeleccionada.id, 'Completada')}>
                  Completada
                </button>
              </div>
              <button onClick={() => setMostrarModal(false)}>Cerrar</button>
            </div>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        <section id="estadisticas" className="section-container">
          <h2 className="h2">Estadísticas</h2>
          <div className="estadisticas-imagenes">
            <h4>Estadísticas del Mes</h4>
            <img src={mesImage} alt="Estadísticas del Mes" className="estadisticas-img" />
            <h4>Estadísticas del Año</h4>
            <img src={añoImage} alt="Estadísticas del Año" className="estadisticas-img" />
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="section-container">
          <h2 className="h2">Contacto</h2>
          <div className="contacto-container">
            <div className="contacto-formulario">
              <form onSubmit={handleSubmit} className="contact-form">
                <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <input type="email" placeholder="Tu correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                <textarea placeholder="Escribe tu mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} required />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" className="button-contact">Enviar Mensaje</button>
              </form>
            </div>
            <div className="contacto-info">
              <p><FaEnvelope /> <a href="mailto:equipo.almi.a@gmail.com">equipo.almi.a@gmail.com</a></p>
              <p><FaPhone /> <a href="tel:+34698375148">698375148</a></p>
              <p><FaMapMarkerAlt /> Agirre Lehendakariaren Etorb., 29, 48014 Bilbao</p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="contact-info">
            <h4>Contacta con Nosotros</h4>
            <ul>
              <li><FaEnvelope className="icon" /> <a href="mailto:equipo.almi.a@gmail.com">equipo.almi.a@gmail.com</a></li>
              <li><FaPhone className="icon" /> <a href="tel:+34698375148">698375148</a></li>
              <li><FaMapMarkerAlt className="icon" /> Agirre Lehendakariaren Etorb., 29, 48014 Bilbao</li>
            </ul>
          </div>
          <div className="social-media">
            <h4>Síguenos</h4>
            <a href="https://www.instagram.com/justclick_oficial/" target="_blank" rel="noopener noreferrer">
              <img src={instaLogo} alt="Instagram" className="instagram-logo" />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 JuegAlmi - Todos los derechos reservados.</p>
        </div>
      </footer>

      <button className="scroll-to-top" onClick={() => window.scrollTo(0, 0)}>↑</button>
    </div>
  );
}

export default Inicio;
