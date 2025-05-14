import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
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
import { deleteObject } from "firebase/storage";

const Perfil = () => {
  const [usuarioData, setUsuarioData] = useState(null);
  const [ubicacion, setUbicacion] = useState({ lat: 40.4168, lng: -3.7038 });
  const [showModal, setShowModal] = useState(false);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [empresaForm, setEmpresaForm] = useState({
    nombre: '',
    propietario: '',
    telefono: '',
    correo: '',
    descripcion: ''
  });

  const handleDeleteFoto = async (url) => {
  const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar esta foto?");
    if (!confirmDelete) return;

    try {
      // Obtener la referencia del archivo en Storage
      const pathStart = url.indexOf("/o/") + 3;
      const pathEnd = url.indexOf("?alt=");
      const path = decodeURIComponent(url.substring(pathStart, pathEnd));
      const fotoRef = ref(storage, path);

      // Eliminar de Firebase Storage
      await deleteObject(fotoRef);

      // Eliminar de Firestore
      const auth = getAuth();
      const user = auth.currentUser;
      const empresaRef = doc(db, 'empresa', user.uid);
      const nuevasFotos = usuarioData.fotos.filter(f => f !== url);
      await updateDoc(empresaRef, { fotos: nuevasFotos });

      // Actualizar estado local
      setUsuarioData(prev => ({
        ...prev,
        fotos: nuevasFotos
      }));

    } catch (error) {
      console.error("Error al eliminar la foto:", error);
      alert("Hubo un error al eliminar la foto.");
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const empresaRef = doc(db, "empresa", user.uid);
        const empresaSnap = await getDoc(empresaRef);

        if (empresaSnap.exists()) {
          const empresaData = empresaSnap.data();
          setUsuarioData({ ...empresaData, usuarioId: user.uid });
          setEmpresaForm({
            nombre: empresaData.nombre || '',
            propietario: empresaData.propietario || '',
            telefono: empresaData.telefono || '',
            correo: empresaData.correo || '',
            descripcion: empresaData.descripcion || ''
          });
          setUbicacion(empresaData.ubicacion || ubicacion);
        } else {
          console.error("No se encontró empresa para este usuario.");
        }
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const icon = new L.Icon({
    iconUrl: ubiIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const handleFileChange = (e) => {
    setFotos(Array.from(e.target.files));
  };

  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUbicacion({ lat: latitude, lng: longitude });
        },
        () => alert("No se pudo obtener la ubicación actual.")
      );
    } else {
      alert("Geolocalización no disponible en tu navegador.");
    }
  };

  const handleSubmitInfo = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }

      let fotosUrls = usuarioData.fotos ? [...usuarioData.fotos] : [];

      if (fotos.length > 0) {
        for (const file of fotos) {
          const fotoRef = ref(storage, `fotos/${file.name}`);
          await uploadBytes(fotoRef, file);
          const url = await getDownloadURL(fotoRef);
          fotosUrls.push(url);
        }
      }


      const empresaRef = doc(db, 'empresa', user.uid);
      await updateDoc(empresaRef, {
        ...empresaForm,
        fotos: fotosUrls,
        ubicacion
      });

      setUsuarioData(prev => ({
        ...prev,
        ...empresaForm,
        fotos: fotosUrls,
        ubicacion
      }));

      setShowModal(false);
    } catch (error) {
      console.error("Error al actualizar la información:", error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      localStorage.clear();
      navigate("/");
    }).catch(console.error);
  };

  if (!usuarioData) return <p>Cargando...</p>;

  return (
    <div className="perfil-container">
      <div className="nav-menu">
        <div className="container">
          <img src={logo} alt="Logo" className="logo" />
          <div className="nav-links"><a onClick={() => navigate("/inicio")}>Inicio</a></div>
          <div className="perfil-img"><img className="perfil-img" src={perfil} alt="Perfil" /></div>
        </div>
      </div>

      <div className="perfil-box">
        <div className="perfil-info">
          <h2>{usuarioData.nombre}</h2>
          <p><strong>Propietario:</strong> {usuarioData.propietario || "No disponible"}</p>
          <p><strong>Teléfono:</strong> {usuarioData.telefono || "No disponible"}</p>
          <p><strong>Email:</strong> {usuarioData.correo || "No disponible"}</p>
          <p><strong>Descripción:</strong> {usuarioData.descripcion || "No disponible"}</p>
          {usuarioData.fotos && usuarioData.fotos.map((url, i) => (
            <div key={i} className="foto-empresa-wrapper">
              <img src={url} alt={`foto${i}`} className="foto-empresa" />
              <button
                className="delete-icon"
                onClick={() => handleDeleteFoto(url)}
                title="Eliminar foto"
              >
                🗑
              </button>
            </div>
          ))}
          <button className="button-info" onClick={() => setShowModal(true)}>Editar Información</button>
        </div>

        {!showModal && (
          <div className="perfil-map">
            <MapContainer center={ubicacion} zoom={16} scrollWheelZoom={false} zoomControl={false} style={{ width: '100%', height: '300px' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={ubicacion} icon={icon}>
                <Popup>{usuarioData.nombre}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      <button className="button-logout" onClick={handleLogout}>Cerrar sesión</button>

      {showModal && (
        <div className="modal">
          <div className="modal-content modal-wide">
            <h3>Editar Información</h3>

            <label>Nombre:</label>
            <input type="text" value={empresaForm.nombre} onChange={(e) => setEmpresaForm({ ...empresaForm, nombre: e.target.value })} />

            <label>Propietario:</label>
            <input type="text" value={empresaForm.propietario} onChange={(e) => setEmpresaForm({ ...empresaForm, propietario: e.target.value })} />

            <label>Teléfono:</label>
            <input type="text" value={empresaForm.telefono} onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })} />

            <label>Correo electrónico:</label>
            <input type="email" value={empresaForm.correo} onChange={(e) => setEmpresaForm({ ...empresaForm, correo: e.target.value })} />

            <label>Descripción:</label>
            <textarea value={empresaForm.descripcion} onChange={(e) => setEmpresaForm({ ...empresaForm, descripcion: e.target.value })} />

            <div className="ubicacion-section">
              <p><strong>Ubicación actual:</strong></p>
              <p>Lat: {ubicacion.lat.toFixed(5)} | Lng: {ubicacion.lng.toFixed(5)}</p>
              <button className="button-info" onClick={obtenerUbicacion}>Obtener ubicación actual</button>
            </div>

            <label>Subir nuevas fotos:</label>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileChange}
              />
            <button className="button-info" onClick={handleSubmitInfo} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button className="button-info-cerrar" onClick={() => setShowModal(false)}>Cerrar</button>
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
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 JuegAlmi - Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Perfil;
