import React, { useState, useEffect } from "react";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import { Table, Button, Form, Spinner, Alert, Accordion, Card } from "react-bootstrap";

const VerAvancesSupervisor = () => {
  const { keycloak } = useKeycloak();
  const [interns, setInterns] = useState([]);
  const [avancesByIntern, setAvancesByIntern] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [feedbackEdit, setFeedbackEdit] = useState("");

  useEffect(() => {
    // Función para obtener la lista de interns asignados al supervisor
    const fetchInterns = async () => {
      setLoading(true);
      setError(null);
      try {
        // Primero obtener el usuario actual para saber su id
        const username = keycloak.tokenParsed?.preferred_username;
        if (!username) throw new Error("Usuario no autenticado");

        // Obtener usuario con su id (suponiendo endpoint general)
        const usersResp = await axios.get("http://localhost:8080/api/users", {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });
        const supervisorUser = usersResp.data.find(u => u.username === username && u.role === "SUPERVISOR");
        if (!supervisorUser) throw new Error("Usuario supervisor no encontrado");

        // Obtener interns que supervisa el usuario (endpoint adaptado)
        // Asumiendo que se tiene un endpoint para filtrar por supervisor
        const internsResp = await axios.get(`http://localhost:8080/api/interns?supervisorId=${supervisorUser.id}`, {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });

        setInterns(internsResp.data);

        // Por cada intern, cargar sus avances
        const avancesMap = {};
        for (const intern of internsResp.data) {
          const avancesResp = await axios.get(`http://localhost:8080/api/progress/intern/${intern.id}`, {
            headers: { Authorization: `Bearer ${keycloak.token}` },
          });
          avancesMap[intern.id] = avancesResp.data;
        }
        setAvancesByIntern(avancesMap);

      } catch (err) {
        setError(err.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    if (keycloak.authenticated) {
      fetchInterns();
    }
  }, [keycloak]);

  // Función para iniciar edición de feedback
  const startEditingFeedback = (avance) => {
    setEditingFeedbackId(avance.id);
    setFeedbackEdit(avance.feedback || "");
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingFeedbackId(null);
    setFeedbackEdit("");
  };

  // Guardar feedback editado
  const saveFeedback = async (avanceId) => {
    try {
      await axios.post(
        "http://localhost:8080/api/progress/feedback",
        { progressId: avanceId, feedback: feedbackEdit },
        { headers: { Authorization: `Bearer ${keycloak.token}` } }
      );

      // Actualizar estado local para reflejar cambio
      const newAvancesByIntern = { ...avancesByIntern };
      for (const internId in newAvancesByIntern) {
        newAvancesByIntern[internId] = newAvancesByIntern[internId].map(av =>
          av.id === avanceId ? { ...av, feedback: feedbackEdit } : av
        );
      }
      setAvancesByIntern(newAvancesByIntern);
      cancelEditing();
    } catch (err) {
      alert("Error guardando feedback");
    }
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return <Alert variant="danger" className="my-3">{error}</Alert>;

  if (interns.length === 0)
    return <Alert variant="info" className="my-3">No tienes practicantes asignados.</Alert>;

  return (
    <div>
      <h5>Practicantes y Avances</h5>

      <Accordion defaultActiveKey="0">
        {interns.map((intern, index) => (
          <Card key={intern.id}>
            <Accordion.Item eventKey={index.toString()}>
              <Accordion.Header>
                {intern.name} - {intern.academic_program} - Estado: {intern.practice_status}
              </Accordion.Header>
              <Accordion.Body>
                {avancesByIntern[intern.id]?.length > 0 ? (
                  <Table striped bordered hover size="sm" responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Descripción</th>
                        <th>Fecha</th>
                        <th>Feedback</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {avancesByIntern[intern.id].map((avance, i) => (
                        <tr key={avance.id}>
                          <td>{i + 1}</td>
                          <td>{avance.description}</td>
                          <td>{avance.registrationDate?.slice(0, 10)}</td>
                          <td>
                            {editingFeedbackId === avance.id ? (
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={feedbackEdit}
                                onChange={e => setFeedbackEdit(e.target.value)}
                              />
                            ) : (
                              avance.feedback || <i>No hay feedback</i>
                            )}
                          </td>
                          <td>
                            {editingFeedbackId === avance.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => saveFeedback(avance.id)}
                                  className="me-2"
                                >
                                  Guardar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={cancelEditing}
                                >
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => startEditingFeedback(avance)}
                              >
                                Editar feedback
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>No hay avances registrados para este practicante.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>
          </Card>
        ))}
      </Accordion>
    </div>
  );
};

export default VerAvancesSupervisor;
