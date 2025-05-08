import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { collection, query, where, getDocs } from "firebase/firestore"; 
import '../css/Login.css';
import logo from '../fotos/logo.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const q = query(collection(db, "empresa"), where("usuarioId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();

        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userData", JSON.stringify(userData));
        
        console.log("Datos guardados en localStorage:", userData);
      } else {
        console.error("No se encontraron datos de usuario.");
      }

      navigate("/inicio"); 
    } catch (err) {
      setError("Error al iniciar sesión. Verifica tus datos.");
    }
  };

  const handleCreateAccount = () => {
    navigate("/registro"); 
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left">
          <img src={logo} alt="Logo" className="login-logo" />
          <p className="login-slogan">Gestiona tus reservas con un solo click</p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button className="button-iniciar" type="submit">Iniciar sesión</button>
            <p onClick={handleCreateAccount} style={{ cursor: "pointer", color: "black" }}>
              Crear nueva cuenta
            </p>
          </form>
        </div>
        <div className="login-right">
          <div className="login-info">
            <h2>Bienvenido a JustClick</h2>
            <p>
              Únete a nuestra plataforma y lleva tu peluquería al siguiente nivel, 
              ¡conéctate con más clientes y promociónate fácilmente a través de nuestra web!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
