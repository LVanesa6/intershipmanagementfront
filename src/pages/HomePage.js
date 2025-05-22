import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import logo from '../assets/Logo.png';
import job from '../assets/job.png';
import '../styles/PublicHomePage.css';

const HomePage = () => {
  const { keycloak } = useKeycloak();

  const handleLogin = () => {
    keycloak.login(); // inicia el login con Keycloak
  };

  return (
    <div className="public-container">
      <header className="header-container-public-home">
        <div className="header-content">
          <img
            src={logo}
            alt="Logo Instituto"
            className="header-logo-overlay-public-home"
          />
          <div className="header-banner-public-home text-center">
            <h5 className="mb-0 fw-bold text-dark">
              Aplicación y Gestión de Vacantes <br />
              Banco de Bogotá
            </h5>
          </div>
        </div>
      </header>

      <div className="public-buttons" style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <button className="btn-yellow" onClick={handleLogin}>
          Iniciar Sesión
        </button>
      </div>

      <footer className="public-footer">
        <img
          src={job}
          alt="imagen de empleo"
          className="footer-empleo"
        />
      </footer>
    </div>
  );
};

export default HomePage;
