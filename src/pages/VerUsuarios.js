import React, { useEffect, useState, useRef } from "react"; 
import axios from "axios";
import keycloak from "../service/keycloak";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom"; // Importa useNavigate para navegación

const VerInternos = () => {
  const [internos, setInternos] = useState([]);
  const [filtroGeneral, setFiltroGeneral] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [internoSeleccionado, setInternoSeleccionado] = useState(null);
  const [idParaEliminar, setIdParaEliminar] = useState(null);
  const usuariosPorPagina = 10;

  const modalConfirmacionRef = useRef(null);
  const modalAlertaRef = useRef(null);
  const [mensajeModal, setMensajeModal] = useState("");
  const [tituloModal, setTituloModal] = useState("");
  const API_HOST = process.env.REACT_APP_API_HOST;

  const modalConfirmacionInstance = useRef(null);
  const modalAlertaInstance = useRef(null);

  const navigate = useNavigate(); // Hook para navegación

  const obtenerNombreSupervisor = async (id) => {
    if (!id) return "No registrado";
    try {
      const response = await axios.get(`${API_HOST}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      return response.data.username || "No registrado";
    } catch (error) {
      console.error("Error al obtener nombre del supervisor:", error);
      return "No registrado";
    }
  };

  useEffect(() => {
    const fetchInternosConSupervisores = async () => {
      try {
        await keycloak.updateToken(30);
        const response = await axios.get(`${API_HOST}/api/interns`, {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        });
        const internosData = response.data;

        const internosConNombreSupervisor = await Promise.all(
          internosData.map(async (intern) => {
            const supervisorName = await obtenerNombreSupervisor(intern.supervisorId);
            return { ...intern, supervisorName };
          })
        );

        setInternos(internosConNombreSupervisor);
      } catch (err) {
        console.error("Error al obtener internos:", err);
      }
    };

    fetchInternosConSupervisores();

    if (modalConfirmacionRef.current && !modalConfirmacionInstance.current) {
      modalConfirmacionInstance.current = new Modal(modalConfirmacionRef.current);
    }
    if (modalAlertaRef.current && !modalAlertaInstance.current) {
      modalAlertaInstance.current = new Modal(modalAlertaRef.current);
    }
  }, [API_HOST]);

  const internosFiltrados = internos.filter((intern) => {
    const texto = filtroGeneral.toLowerCase();
    const coincideTexto =
      intern.name?.toLowerCase().includes(texto) ||
      intern.academicProgram?.toLowerCase().includes(texto) ||
      intern.supervisorName?.toLowerCase().includes(texto);

    const coincideEstado =
      estadoFiltro === "Todos" || intern.practiceStatus === estadoFiltro;

    return coincideTexto && coincideEstado;
  });

  const indexInicio = (paginaActual - 1) * usuariosPorPagina;
  const internosPaginados = internosFiltrados.slice(indexInicio, indexInicio + usuariosPorPagina);
  const totalPaginas = Math.ceil(internosFiltrados.length / usuariosPorPagina);

  const mostrarModal = (titulo, mensaje) => {
    setTituloModal(titulo);
    setMensajeModal(mensaje);
    if (modalAlertaInstance.current) {
      modalAlertaInstance.current.show();
    }
  };

  const confirmarEliminacion = async () => {
    try {
      await keycloak.updateToken(30);
      const response = await axios.delete(`${API_HOST}/api/interns/${idParaEliminar}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });

      if (response.status >= 200 && response.status < 300) {
        setInternos((prev) => prev.filter((intern) => intern.id !== idParaEliminar));
        setInternoSeleccionado(null);
        mostrarModal("Éxito", "Interno eliminado correctamente.");
      } else {
        mostrarModal("Error", "No se pudo eliminar el interno.");
      }
    } catch (err) {
      console.error("Error al eliminar interno:", err);
      mostrarModal("Error", "No se pudo eliminar el interno.");
    } finally {
      modalConfirmacionInstance.current?.hide();
    }
  };

  const mostrarModalConfirmacion = (id) => {
    setIdParaEliminar(id);
    modalConfirmacionInstance.current?.show();
  };

  // Nueva función para navegar a editar
  const handleEditarInterno = () => {
    if (internoSeleccionado) {
      navigate(`/FormularioInternoEditar/${internoSeleccionado.id}`);
    }
  };

  return (
    <div className="container mt-4 bg-white p-4 border rounded shadow-sm">
      {internoSeleccionado ? (
        <div>
          <h5 className="fw-bold mb-4">Información del interno seleccionado</h5>
          <div className="p-3 bg-light border rounded shadow-sm">
            <p><strong>Nombre completo:</strong> {internoSeleccionado.name}</p>
            <p><strong>Programa académico:</strong> {internoSeleccionado.academicProgram}</p>
            <p><strong>Supervisor:</strong> {internoSeleccionado.supervisorName || "No registrado"}</p>
            <p><strong>Fecha de ingreso:</strong> {
              internoSeleccionado.entryDate
                ? new Intl.DateTimeFormat("es-CO").format(new Date(internoSeleccionado.entryDate))
                : "No registrada"
            }</p>
            <p><strong>Estado de práctica:</strong> {internoSeleccionado.practiceStatus}</p>

            <div className="mt-3 d-flex gap-3">
              <button
                className="btn btn-primary rounded-circle"
                title="Modificar"
                onClick={handleEditarInterno}
              >
                <i className="bi bi-pencil-fill"></i>
              </button>
              <button
                className="btn btn-danger rounded-circle"
                title="Eliminar"
                onClick={() => mostrarModalConfirmacion(internoSeleccionado.id)}
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            </div>
          </div>

          <button className="btn btn-outline-secondary mt-4" onClick={() => setInternoSeleccionado(null)}>
            ⬅ Regresar
          </button>
        </div>
      ) : (
        <>
          <h5 className="fw-bold mb-4 text-primary">Listado de practicantes registrados</h5>

          <div className="row mb-3">
            <div className="col-md-8 mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, programa o supervisor"
                value={filtroGeneral}
                onChange={(e) => {
                  setFiltroGeneral(e.target.value);
                  setPaginaActual(1);
                }}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={estadoFiltro}
                onChange={(e) => {
                  setEstadoFiltro(e.target.value);
                  setPaginaActual(1);
                }}
              >
                <option value="Todos">Todos los estados</option>
                <option value="ACTIVE">Activo</option>
                <option value="PENDING">Pendiente</option>
                <option value="FINISHED">Finalizado</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Programa académico</th>
                  <th>Supervisor</th>
                  <th>Fecha de ingreso</th>
                  <th>Estado de práctica</th>
                </tr>
              </thead>
              <tbody>
                {internosPaginados.length > 0 ? (
                  internosPaginados.map((intern) => (
                    <tr
                      key={intern.id}
                      onClick={() => setInternoSeleccionado(intern)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{intern.name}</td>
                      <td>{intern.academicProgram}</td>
                      <td>{intern.supervisorName || "No registrado"}</td>
                      <td>{intern.entryDate ? new Intl.DateTimeFormat("es-CO").format(new Date(intern.entryDate)) : ""}</td>
                      <td>{intern.practiceStatus}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-muted py-3">
                      No se encontraron internos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <nav className="d-flex justify-content-center mt-3">
              <ul className="pagination pagination-sm">
                <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    Anterior
                  </button>
                </li>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                  <li
                    key={num}
                    className={`page-item ${paginaActual === num ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPaginaActual(num)}
                    >
                      {num}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Modal confirmación eliminación */}
      <div
        className="modal fade"
        id="modalConfirmacion"
        tabIndex="-1"
        aria-labelledby="modalConfirmacionLabel"
        aria-hidden="true"
        ref={modalConfirmacionRef}
      >
        <div className="modal-dialog">
          <div className="modal-content border-danger">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title" id="modalConfirmacionLabel">
                Confirmar eliminación
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              ¿Está seguro que desea eliminar este interno?
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmarEliminacion}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal alerta */}
      <div
        className="modal fade"
        id="modalAlerta"
        tabIndex="-1"
        aria-labelledby="modalAlertaLabel"
        aria-hidden="true"
        ref={modalAlertaRef}
      >
        <div className="modal-dialog">
          <div className="modal-content border-info">
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title" id="modalAlertaLabel">{tituloModal}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">{mensajeModal}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-info"
                data-bs-dismiss="modal"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerInternos;
