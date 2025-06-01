import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth"; 
import { doc, setDoc } from "firebase/firestore";
import "../css/Registro.css";
import logo from "../fotos/logo.png";

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [propietario, setPropietario] = useState(""); 
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [ubicacion, setUbicacion] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUbicacion({ lat: latitude, lng: longitude });
        },
        () => {
          setError("No se pudo obtener la ubicación.");
        }
      );
    } else {
      setError("Geolocalización no disponible en tu navegador.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ubicacion) {
      setError("Debes permitir el acceso a la ubicación.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
      const user = userCredential.user;

      await setDoc(doc(db, "empresa", user.uid), {
        nombre,
        propietario,
        telefono,
        correo,
        ubicacion,
        usuarioId: user.uid,
      });

      console.log("Empresa registrada con éxito.");

      navigate("/inicio");
    } catch (err) {
      console.error("Error en el registro:", err); 
      if (err.code === "auth/email-already-in-use") {
        setError("El correo ya está en uso.");
      } else if (err.code === "auth/invalid-email") {
        setError("El formato del correo es inválido.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña es demasiado débil. Usa al menos 6 caracteres.");
      } else {
        setError(`Error al registrar: ${err.message}`); 
      }
    }
    
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        <div className="registro-right">
          <div className="registro-info">
            <h2 style={{ color: "black" }}>Bienvenido a JustClick</h2>
          </div>
        </div>
        <div className="registro-left">
          <img src={logo} alt="Logo" className="registro-logo" />
          <p className="registro-slogan">Gestiona tus reservas con un solo click</p>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nombre de la Peluquería"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nombre del Propietario"
              value={propietario}
              onChange={(e) => setPropietario(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Número de Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <button className="button-ubi" onClick={obtenerUbicacion} type="button">
              Obtener Ubicación
            </button>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="button-cuenta" type="submit">Crear Cuenta</button>
            <p onClick={() => navigate("/")} style={{ cursor: "pointer", color: "black" }}>
              ¿Ya tienes cuenta? Inicia sesión
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registro;
