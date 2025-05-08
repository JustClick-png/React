import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore'; // <-- añadido setDoc y getDoc
import 'leaflet/dist/leaflet.css';
import '../css/Perfil.css';
import ubiIcon from '../fotos/ubi.png';
import { storage, db } from '../firebase/firebaseConfig';
import logo from '../fotos/logoo.png';
import perfil from '../fotos/perfil2.png';
import instaLogo from '../fotos/isnta.png';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';

const Perfil = () => {
  const [usuarioData, setUsuarioData] = useState(null);
  const [ubicacion, setUbicacion] = useState({ lat: 40.4168, lng: -3.7038 });
  const [showModal, setShowModal] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUsuarioData(userData);
      setUbicacion(userData.ubicacion || ubicacion);
    }
  }, []);

  if (!usuarioData) {
    return <p>Cargando o no hay datos de usuario...</p>;
  }

  const icon = new L.Icon({
    iconUrl: ubiIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const inicio = () => {
    navigate("/inicio");
  };

  const handleSubmitInfo = async () => {
    setLoading(true);
    console.log("Iniciando actualización...");
    console.log("usuarioId:", usuarioData.usuarioId);
    console.log("Descripción a guardar:", descripcion);
    console.log("Foto seleccionada:", foto);

    try {
      let fotoUrl = usuarioData.foto;

      if (foto) {
        const fotoRef = ref(storage, `fotos/${foto.name}`);
        await uploadBytes(fotoRef, foto);
        fotoUrl = await getDownloadURL(fotoRef);
        console.log("Foto subida con éxito:", fotoUrl);
      }

      const empresaRef = doc(db, 'empresa', usuarioData.usuarioId);
      const empresaSnap = await getDoc(empresaRef);

      if (!empresaSnap.exists()) {
        // Si NO existe, lo creamos
        console.log("Perfil no existía, creando uno nuevo...");
        await setDoc(empresaRef, {
          descripcion,
          foto: fotoUrl,
        });
      } else {
        // Si existe, actualizamos
        console.log("Perfil encontrado, actualizando...");
        await updateDoc(empresaRef, {
          descripcion,
          foto: fotoUrl,
        });
      }

      setUsuarioData((prevData) => ({
        ...prevData,
        descripcion,
        foto: fotoUrl,
      }));

      alert("¡Información actualizada!");
      setShowModal(false);
    } catch (error) {
      console.error("Error al actualizar la información:", error);
      alert(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      localStorage.removeItem("userUID");
      localStorage.removeItem("userData");
      navigate("/");
    }).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  };

  return (
    <div className="perfil-container">
      <div className="nav-menu">
        <div className="container">
          <img src={logo} alt="Logo" className="logo" />
          <div className="nav-links">
            <a onClick={inicio}>Inicio</a>
          </div>
          <div className="perfil-img">
            <img className="perfil-img" src={perfil} alt="Perfil" />
          </div>
        </div>
      </div>

      <div className="perfil-box">
        <div className="perfil-info">
          <h2>{usuarioData.nombre}</h2>
          <p><strong>Propietario:</strong> {usuarioData.propietario || "No disponible"}</p>
          <p><strong>Teléfono:</strong> {usuarioData.telefono || "Teléfono no disponible"}</p>
          <p><strong>Email:</strong> {usuarioData.correo || "Email no disponible"}</p>
          <p><strong>Descripción:</strong> {usuarioData.descripcion || "No disponible"}</p>
          {usuarioData.foto && <img src={usuarioData.foto} alt="Foto de la peluquería" />}
          <button className="button-info" onClick={() => setShowModal(true)}>Añadir Información</button>
        </div>

        <div className="perfil-map">
          <MapContainer center={ubicacion} zoom={16} style={{ width: '100%', height: '300px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={ubicacion} icon={icon}>
              <Popup>{usuarioData.nombre}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      <button className="button-info" onClick={handleLogout}>Cerrar sesión</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Añadir Información</h3>
            <textarea
              placeholder="Añadir descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <input type="file" onChange={handleFileChange} />
            <button className="button-info" onClick={handleSubmitInfo} disabled={loading}>
              {loading ? "Cargando..." : "Guardar Información"}
            </button>
            <button className="button-info" onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

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
          <div className="footer-links">
            <h4>Enlaces útiles</h4>
            <ul>
              <li><a href="https://www.protocolo.com/politica-privacidad/">Política de Privacidad</a></li>
              <li><a href="https://es.wikipedia.org/wiki/T%C3%A9rminos_y_condiciones_de_uso">Términos y Condiciones</a></li>
              <li><a href="https://www.zendesk.es/service/help-center/faq-software/">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 JuegAlmi - Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Perfil;
