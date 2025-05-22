import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate, useParams } from 'react-router-dom';

const FormularioInternoEditar = () => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const { id } = useParams(); // Obtenemos el id del interno de la URL

  const [formData, setFormData] = useState({
    name: '',
    academicProgram: '',
    entryDate: '',
    practiceStatus: '',
    supervisorId: '',
  });

  const [errors, setErrors] = useState({});
  const [supervisors, setSupervisors] = useState([]);

  // Cargar supervisores para el select
  useEffect(() => {
    axios.get('http://localhost:8080/api/users/supervisors', {
      headers: { Authorization: `Bearer ${keycloak?.token}` }
    })
    .then(res => setSupervisors(res.data))
    .catch(err => console.error('Error cargando supervisores:', err));
  }, [keycloak]);

  // Cargar info del interno para precargar el formulario
  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:8080/api/interns/${id}`, {
      headers: { Authorization: `Bearer ${keycloak?.token}` }
    })
    .then(res => {
      const intern = res.data;
      setFormData({
        name: intern.name || '',
        academicProgram: intern.academicProgram || '',
        entryDate: intern.entryDate ? intern.entryDate.split('T')[0] : '', // Ajusta formato fecha si viene con timestamp
        practiceStatus: intern.practiceStatus || '',
        supervisorId: intern.supervisorId ? intern.supervisorId.toString() : '',
      });
    })
    .catch(err => console.error('Error cargando info del interno:', err));
  }, [id, keycloak]);

  const validate = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es obligatorio';
      valid = false;
    }
    if (!formData.academicProgram.trim()) {
      newErrors.academicProgram = 'El programa académico es obligatorio';
      valid = false;
    }
    if (!formData.entryDate) {
      newErrors.entryDate = 'La fecha de ingreso es obligatoria';
      valid = false;
    }
    if (!formData.practiceStatus) {
      newErrors.practiceStatus = 'Debe seleccionar un estado de práctica';
      valid = false;
    }
    if (!formData.supervisorId) {
      newErrors.supervisorId = 'Debe seleccionar un supervisor';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  // Función para regresar atrás
  const handleBack = () => {
    navigate(-1); // vuelve a la página anterior
    // o navigate('/usuarios'); // si prefieres ruta fija
  };

  // Aquí enviamos PUT para modificar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const internPayload = {
      name: formData.name,
      academicProgram: formData.academicProgram,
      entryDate: formData.entryDate,
      practiceStatus: formData.practiceStatus,
      supervisorId: parseInt(formData.supervisorId),
    };

    try {
      await axios.put(`http://localhost:8080/api/interns/${id}`, internPayload, {
        headers: { Authorization: `Bearer ${keycloak?.token}` }
      });
      alert('Practicante actualizado exitosamente');
      navigate('/usuarios'); // O donde quieras redirigir luego de actualizar
    } catch (error) {
      console.error('Error al actualizar practicante:', error);
      alert('Hubo un error al actualizar el practicante');
    }
  };

  return (
    <div className="container mt-4">
      <button 
        className="btn btn-secondary mb-3" 
        onClick={handleBack}
      >
        &laquo; Regresar
      </button>

      <h2>Editar Practicante</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Nombre completo</label>
          <input 
            type="text" 
            className="form-control" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
          />
          {errors.name && <div className="text-danger">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Programa Académico</label>
          <input 
            type="text" 
            className="form-control" 
            name="academicProgram" 
            value={formData.academicProgram} 
            onChange={handleChange} 
          />
          {errors.academicProgram && <div className="text-danger">{errors.academicProgram}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha de Ingreso</label>
          <input 
            type="date" 
            className="form-control" 
            name="entryDate" 
            value={formData.entryDate} 
            onChange={handleChange} 
          />
          {errors.entryDate && <div className="text-danger">{errors.entryDate}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Estado de Práctica</label>
          <select 
            className="form-select" 
            name="practiceStatus" 
            value={formData.practiceStatus} 
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            <option value="PENDING">En espera</option>
            <option value="ACTIVE">Activo</option>
            <option value="FINISHED">Finalizado</option>
          </select>
          {errors.practiceStatus && <div className="text-danger">{errors.practiceStatus}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Responsable de Seguimiento</label>
          <select 
            className="form-select" 
            name="supervisorId" 
            value={formData.supervisorId} 
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            {supervisors.map(s => (
              <option key={s.id} value={s.id}>{s.username}</option>
            ))}
          </select>
          {errors.supervisorId && <div className="text-danger">{errors.supervisorId}</div>}
        </div>

        <button type="submit" className="btn btn-primary">Actualizar Practicante</button>
      </form>
    </div>
  );
};

export default FormularioInternoEditar;
