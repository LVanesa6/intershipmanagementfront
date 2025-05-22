import React, { useEffect, useState } from "react";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import { Spinner, Table, Alert } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const ListarPracticas = () => {
  const { keycloak } = useKeycloak();
  const [activas, setActivas] = useState([]);
  const [finalizadas, setFinalizadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPracticas = async () => {
    setLoading(true);
    setError(null);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      };

      const [resActivas, resFinalizadas] = await Promise.all([
        axios.get("http://localhost:8080/api/interns/status/ACTIVE", config),
        axios.get("http://localhost:8080/api/interns/status/FINISHED", config),
      ]);

      setActivas(resActivas.data);
      setFinalizadas(resFinalizadas.data);
    } catch (err) {
      console.error("Error al obtener prácticas:", err);
      setError("Hubo un error al cargar las prácticas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticas();
  }, []);

  const formatFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString("es-CO");
    } catch {
      return fecha;
    }
  };

  const renderTabla = (practicas, titulo) => (
    <>
      <h6 className="mt-4 fw-bold">{titulo}</h6>
      {practicas.length === 0 ? (
        <p className="text-muted">No hay prácticas registradas.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Programa académico</th>
              <th>Fecha de ingreso</th>
              <th>Supervisor</th>
            </tr>
          </thead>
          <tbody>
            {practicas.map((practica) => (
              <tr key={practica.id}>
                <td>{practica.name}</td>
                <td>{practica.academicProgram}</td>
                <td>{formatFecha(practica.entryDate)}</td>
                <td>{practica.supervisorId || "No asignado"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );

  const dataGrafica = [
    { nombre: "Activas", cantidad: activas.length },
    { nombre: "Finalizadas", cantidad: finalizadas.length },
  ];

  return (
    <div>
      <div className="mb-3">
        <h5 className="fw-bold mb-0">Listado de Prácticas</h5>
      </div>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
          <p className="mt-2">Cargando prácticas...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <div style={{ width: "100%", height: 300 }} className="mb-4">
            <h6 className="fw-bold">Resumen de Prácticas</h6>
            <ResponsiveContainer>
              <BarChart data={dataGrafica}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {renderTabla(activas, "Prácticas Activas")}
          {renderTabla(finalizadas, "Prácticas Finalizadas")}
        </>
      )}
    </div>
  );
};

export default ListarPracticas;
