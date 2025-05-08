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
import CalendarioReservas from './CalendarioReservas';
import { db } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

function Inicio() {
  const [date, setDate] = useState(new Date());
  const today = new Date();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleChangePerfil = () => {
    navigate("/perfil");
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(date);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    if (prevMonth >= today) {
      setDate(prevMonth);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setDate(nextMonth);
  };

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="inicio">
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

      <div className="fondo-imagen" style={{ backgroundImage: `url(${fondoImage})` }}>
        <div className="texto-sobre-imagen">
          <div className="titulo">JustClick</div>
          <div className="descripcion">
            Aquí puedes gestionar tus reservas, ver clientes interesados y promocionar tus servicios <br/> fácilmente. Disfruta de todas las herramientas para hacer crecer tu peluquería.
          </div>
        </div>
      </div>

      <div className="inicio-container">
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
              date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
                .replace(/^./, (str) => str.toUpperCase())
            }
          />
        </section>

        <section id="lista" className="section-container">
          <h2 className="h2">Lista de Nombres</h2>
          <CalendarioReservas selectedDate={date} />
        </section>

        <section id="reservas" className="section-container">
          <h2 className="h2">Reservas</h2>
          {reservas.length === 0 ? (
            <p>todavía no hay reservas</p>
          ) : (
            <ul>
              {reservas.map((reserva, index) => (
                <li key={index}>
                  {reserva.nombre} - {reserva.fecha.toLocaleDateString()} {reserva.fecha.toLocaleTimeString()} ({reserva.hora}) - Cliente ID: {reserva.clienteId} - Servicio: {reserva.servicio}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="estadisticas" className="section-container">
          <h2 className="h2">Estadísticas</h2>
          <div className="estadisticas-imagenes">
            <h4>Estadísticas del Mes</h4>
            <img src={mesImage} alt="Estadísticas del Mes" className="estadisticas-img" />
            <h4>Estadísticas del Año</h4>
            <img src={añoImage} alt="Estadísticas del Año" className="estadisticas-img" />
          </div>
        </section>

        {/* Sección de Contacto */}
        <section id="contacto" className="section-container">
        <h2 className="h2">Contacto</h2>
        <div className="contacto-container">
          <div className="contacto-formulario">
            <form onSubmit={handleSubmit} className="contact-form">
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
              <textarea
                placeholder="Escribe tu mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                required
              />
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

      <button className="scroll-to-top" onClick={() => window.scrollTo(0, 0)}>
        ↑
      </button>
    </div>
  );
}

export default Inicio;
