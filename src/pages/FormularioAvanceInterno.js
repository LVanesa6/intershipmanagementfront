import React, { useState, useEffect } from "react";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import { Form, Button, Alert } from "react-bootstrap";

const FormularioAvanceInterno = () => {
  const { keycloak } = useKeycloak();
  const [internId, setInternId] = useState(null);
  const [description, setDescription] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = keycloak.tokenParsed.preferred_username;
        const response = await axios.get(`http://localhost:8080/api/users`, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        });
        console.log("Usuarios:", response.data);

        const usuario = response.data.find(
          (u) => u.username === username && u.role === "INTERN"
        );

        if (usuario && usuario.intern && usuario.intern.id) {
          setInternId(usuario.intern.id);
        } else {
          setError("No se pudo identificar al practicante.");
        }
      } catch (err) {
        setError("Error al obtener datos del usuario.");
      }
    };

    if (keycloak.authenticated) {
      fetchUserData();
    }
  }, [keycloak]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!description || !registrationDate || !internId) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const dateISO = new Date(registrationDate).toISOString();

      await axios.post(
        "http://localhost:8080/api/progress",
        {
          description,
          registrationDate: dateISO,
          internId,
        },
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );
      setMensaje("Avance registrado correctamente.");
      setDescription("");
      setRegistrationDate("");
    } catch (err) {
      setError("Error al registrar el avance.");
    }
  };

  return (
    <div className="container">
      <h6 className="fw-bold mb-3">Registrar nuevo avance</h6>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="description" className="mb-3">
          <Form.Label>Descripción del avance</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe las actividades realizadas..."
          />
        </Form.Group>

        <Form.Group controlId="registrationDate" className="mb-3">
          <Form.Label>Fecha del avance</Form.Label>
          <Form.Control
            type="date"
            value={registrationDate}
            onChange={(e) => setRegistrationDate(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button type="submit" variant="primary">
            Guardar Avance
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default FormularioAvanceInterno;
