import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import VerUsuarios from "./VerUsuarios";
import FormularioUsuario from "./FormularioUsuario";
import "../styles/Usuarios.css";

const Usuarios = () => {
  const [tab, setTab] = useState("crear");

  const volverASeleccion = () => {
    setTab("crear");
  };

  return (
    <div className="container my-1">
      <h5 className="fw-bold">Gestión de Practicantes</h5>

      <ul className="nav nav-tabs border-bottom-0 mt-3">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "crear" ? "active" : ""}`}
            onClick={() => setTab("crear")}
          >
            Crear practicante
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "ver" ? "active" : ""}`}
            onClick={() => setTab("ver")}
          >
            Ver practicanntes
          </button>
        </li>
      </ul>

      <div className="bg-light p-4 border rounded-bottom shadow-sm">
        {tab === "crear" ? (
          <FormularioUsuario volver={volverASeleccion} />
        ) : (
          <VerUsuarios />
        )}
      </div>
    </div>
  );
};

export default Usuarios;
