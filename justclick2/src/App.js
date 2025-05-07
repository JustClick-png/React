// src/App.js
import React from 'react';
import './css/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importa React Router
import Login from './components/Login'; // Asegúrate de importar Login
import Inicio from './components/Inicio'; // Importa el componente de inicio
import Registro from './components/Registro'; // Importa el componente de inicio
import Perfil from './components/Perfil'; // Importa el componente de inicio

function App() {
  return (
    <Router> {/* Envuélvelo con Router */}
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Ruta para el login */}
          <Route path="/inicio" element={<Inicio />} /> {/* Ruta para la página de inicio */}
          <Route path="/registro" element={<Registro />} /> {/* Ruta para la página de registro */}
          <Route path="/perfil" element={<Perfil />} /> {/* Ruta para la página de perfil */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
