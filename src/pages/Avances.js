import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import VerAvancesSupervisor from "./VerAvancesSupervisor";
import "../styles/Usuarios.css";

const Avances = () => {
  const [tab, setTab] = useState("ver");

  return (
    <div className="container my-1">
      <h5 className="fw-bold">Gestión de Avances</h5>

      <ul className="nav nav-tabs border-bottom-0 mt-3">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${tab === "ver" ? "active" : ""}`}
            onClick={() => setTab("ver")}
            disabled
            style={{ cursor: "default" }}
          >
            Ver avances
          </button>
        </li>
      </ul>

      <div className="bg-light p-4 border rounded-bottom shadow-sm">
        {tab === "ver" && <VerAvancesSupervisor />}
      </div>
    </div>
  );
};

export default Avances;
