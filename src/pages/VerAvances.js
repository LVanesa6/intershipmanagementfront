import React, { useState, useEffect } from "react";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import { Table, Alert, Spinner, Button, Form } from "react-bootstrap";

const VerAvances = () => {
  const { keycloak } = useKeycloak();
  const [internId, setInternId] = useState(null);
  const [avances, setAvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [avanceEditando, setAvanceEditando] = useState(null);
  const [descripcionEditada, setDescripcionEditada] = useState("");
  const [fechaEditada, setFechaEditada] = useState("");

  // Formatea "YYYY-MM-DD" a "DD/MM/YYYY" SIN conversión a Date para evitar desfase
  const formatDateLocal = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = keycloak.tokenParsed?.preferred_username;
        if (!username) throw new Error("Usuario no encontrado en token.");

        const response = await axios.get(`http://localhost:8080/api/users`, {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });

        const usuario = response.data.find(
          (u) => u.username === username && u.role === "INTERN"
        );

        if (usuario?.intern?.id) {
          setInternId(usuario.intern.id);
          setError(null);
        } else {
          setError("No se pudo identificar al practicante.");
        }
      } catch (err) {
        setError("Error al obtener datos del usuario.");
      } finally {
        setLoading(false);
      }
    };

    if (keycloak.authenticated) {
      fetchUserData();
    }
  }, [keycloak]);

  // Obtener avances del practicante
  useEffect(() => {
    const fetchAvances = async () => {
      if (!internId) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/progress/intern/${internId}`,
          {
            headers: { Authorization: `Bearer ${keycloak.token}` },
          }
        );
        setAvances(response.data);
        setError(null);
      } catch {
        setError("Error al cargar los avances.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvances();
  }, [internId, keycloak.token]);

  // Eliminar un avance
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este avance?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/progress/${id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });

      setAvances((prev) => prev.filter((avance) => avance.id !== id));
    } catch {
      alert("Error al eliminar el avance.");
    }
  };

  // Preparar edición
  const handleEdit = (avance) => {
    setAvanceEditando(avance);
    setDescripcionEditada(avance.description);
    // Usar la fecha directamente en formato "YYYY-MM-DD"
    setFechaEditada(avance.registrationDate?.slice(0, 10) || "");
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setAvanceEditando(null);
    setDescripcionEditada("");
    setFechaEditada("");
  };

  // Guardar edición
  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/progress/${avanceEditando.id}`,
        {
          internId: internId,
          description: descripcionEditada,
          registrationDate: fechaEditada, // enviar string YYYY-MM-DD directamente
        },
        {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        }
      );

      setAvanceEditando(null);
      setDescripcionEditada("");
      setFechaEditada("");

      // Recargar avances para mostrar cambios actualizados
      const response = await axios.get(
        `http://localhost:8080/api/progress/intern/${internId}`,
        {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        }
      );
      setAvances(response.data);
    } catch {
      alert("Error al actualizar el avance.");
    }
  };

  return (
    <div className="container">
      <h5 className="mb-3">Avances del Practicante</h5>

      {loading && <Spinner animation="border" />}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && avances.length === 0 && (
        <Alert variant="info">No hay avances registrados.</Alert>
      )}

      {!loading && avances.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Fecha Registro</th>
              <th>Feedback</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {avances.map((avance) => (
              <tr key={avance.id}>
                <td>
                  {avanceEditando?.id === avance.id ? (
                    <Form.Control
                      type="text"
                      value={descripcionEditada}
                      onChange={(e) => setDescripcionEditada(e.target.value)}
                    />
                  ) : (
                    avance.description
                  )}
                </td>
                <td>
                  {avanceEditando?.id === avance.id ? (
                    <Form.Control
                      type="date"
                      value={fechaEditada}
                      onChange={(e) => setFechaEditada(e.target.value)}
                    />
                  ) : (
                    formatDateLocal(avance.registrationDate)
                  )}
                </td>
                <td>{avance.feedback || "Sin feedback"}</td>
                <td>
                  {avanceEditando?.id === avance.id ? (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={handleSaveEdit}
                      >
                        Guardar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(avance)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(avance.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default VerAvances;
