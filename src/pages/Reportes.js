import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ListarPracticas from "./ListarPracticas";
import ResumenPorPracticante from "./ResumenPorPracticante";
import "../styles/Usuarios.css";

const Reportes = () => {
  const [tab, setTab] = useState("crear");

  const volverASeleccion = () => {
    setTab("crear");
  };

  return (
    <div className="container my-1">
      <h5 className="fw-bold">Gestión de Reportes</h5>

      <ul className="nav nav-tabs border-bottom-0 mt-3">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "crear" ? "active" : ""}`}
            onClick={() => setTab("crear")}
          >
            ListarPracticas
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "ver" ? "active" : ""}`}
            onClick={() => setTab("ver")}
          >
            Resumen por practicante
          </button>
        </li>
      </ul>

      <div className="bg-light p-4 border rounded-bottom shadow-sm">
        {tab === "crear" ? (
          <ListarPracticas volver={volverASeleccion} />
        ) : (
          <ResumenPorPracticante />
        )}
      </div>
    </div>
  );
};

export default Reportes;
