import React, { useState, useEffect } from "react";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ResumenPorPracticante = () => {
  const { keycloak } = useKeycloak();
  const [interns, setInterns] = useState([]);
  const [avancesByIntern, setAvancesByIntern] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [practiceStatusFilter, setPracticeStatusFilter] = useState("");

  // Modal y PDF
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!keycloak.authenticated) throw new Error("Usuario no autenticado");

        const internsResp = await axios.get("http://localhost:8080/api/interns", {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });
        setInterns(internsResp.data);

        const avancesMap = {};
        for (const intern of internsResp.data) {
          const avancesResp = await axios.get(
            `http://localhost:8080/api/progress/intern/${intern.id}`,
            {
              headers: { Authorization: `Bearer ${keycloak.token}` },
            }
          );
          avancesMap[intern.id] = avancesResp.data;
        }
        setAvancesByIntern(avancesMap);
      } catch (err) {
        setError(err.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keycloak]);

  const createPdfBlob = (intern) => {
    const doc = new jsPDF();
    const avances = avancesByIntern[intern.id] || [];

    doc.setFontSize(18);
    doc.text(`Resumen de Avances - ${intern.name}`, 14, 22);

    doc.setFontSize(12);
    doc.text(`Programa Académico: ${intern.academicProgram}`, 14, 32);
    doc.text(`Estado de la práctica: ${intern.practiceStatus}`, 14, 40);

    if (avances.length === 0) {
      doc.text("No hay avances registrados para este practicante.", 14, 60);
    } else {
      const tableColumn = ["#", "Descripción", "Fecha", "Feedback"];
      const tableRows = [];

      avances.forEach((av, index) => {
        tableRows.push([
          index + 1,
          av.description,
          av.registrationDate ? av.registrationDate.slice(0, 10) : "",
          av.feedback || "Sin feedback",
        ]);
      });

      doc.autoTable({
        startY: 60,
        head: [tableColumn],
        body: tableRows,
        styles: { fontSize: 10 },
      });
    }

    return doc.output("blob");
  };

  const handlePreview = (intern) => {
    const pdfBlob = createPdfBlob(intern);
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    setPdfFileName(`Resumen_Avances_${intern.name}.pdf`);
    setShowModal(true);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = pdfFileName;
    link.click();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // Filtrado de datos con ambos filtros combinados
  const filteredInterns = interns.filter((intern) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      intern.name.toLowerCase().includes(lowerSearch) ||
      intern.academicProgram.toLowerCase().includes(lowerSearch);

    const matchesStatus =
      practiceStatusFilter === "" || intern.practiceStatus === practiceStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="my-3">
        {error}
      </Alert>
    );

  if (interns.length === 0)
    return (
      <Alert variant="info" className="my-3">
        No hay practicantes registrados.
      </Alert>
    );

  return (
    <div>
      <h4>Resumen de Avances por Practicante</h4>

      {/* Filtros */}
      <Form className="mb-3">
        <Row>
          <Col md={6} sm={12} className="mb-2">
            <Form.Control
              type="text"
              placeholder="Buscar por Nombre o Programa Académico"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={4} sm={8} className="mb-2">
            <Form.Select
              value={practiceStatusFilter}
              onChange={(e) => setPracticeStatusFilter(e.target.value)}
            >
              <option value="">Filtrar por Estado de Práctica</option>
              {/* Opciones dinámicas con los estados que hay en los datos */}
              {[...new Set(interns.map((i) => i.practiceStatus))].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2} sm={4}>
            <Button variant="secondary" onClick={() => { setSearchTerm(""); setPracticeStatusFilter(""); }}>
              Limpiar filtros
            </Button>
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Programa Académico</th>
            <th>Estado Práctica</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredInterns.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center">
                No se encontraron practicantes que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            filteredInterns.map((intern) => (
              <tr key={intern.id}>
                <td>{intern.name}</td>
                <td>{intern.academicProgram}</td>
                <td>{intern.practiceStatus}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePreview(intern)}
                  >
                    Previsualizar PDF
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal para previsualizar PDF */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Previsualización PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Previsualización PDF"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <p>Cargando PDF...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
          <Button variant="success" onClick={handleDownload}>
            Descargar PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResumenPorPracticante;
