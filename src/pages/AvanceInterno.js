import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import VerAvances from "./VerAvances";
import FormularioAvanceInterno from "./FormularioAvanceInterno";
import "../styles/Usuarios.css";

const AvanceInterno = () => {
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
            Crear avance
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "ver" ? "active" : ""}`}
            onClick={() => setTab("ver")}
          >
            Ver avances
          </button>
        </li>
      </ul>

      <div className="bg-light p-4 border rounded-bottom shadow-sm">
        {tab === "crear" ? (
          <FormularioAvanceInterno volver={volverASeleccion} />
        ) : (
          <VerAvances />
        )}
      </div>
    </div>
  );
};

export default AvanceInterno;
