import { useKeycloak } from '@react-keycloak/web';
import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const FormularioInterno = () => {
  const { keycloak } = useKeycloak();

  const [formData, setFormData] = useState({
    name: '',
    academicProgram: '',
    entryDate: '',
    practiceStatus: '',
    supervisorId: '',
  });

  const [errors, setErrors] = useState({});
  const [supervisors, setSupervisors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/api/users/supervisors', {
      headers: { Authorization: `Bearer ${keycloak?.token}` }
    })
    .then(res => setSupervisors(res.data))
    .catch(err => console.error('Error cargando supervisores:', err));
  }, [keycloak]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const internPayload = {
      name: formData.name,
      academicProgram: formData.academicProgram,
      entryDate: formData.entryDate,
      practiceStatus: formData.practiceStatus, // ENUM: 'ACTIVE', 'FINISHED', 'PENDING'
      supervisorId: parseInt(formData.supervisorId),
    };

    try {
      await axios.post('http://localhost:8080/api/interns', internPayload, {
        headers: { Authorization: `Bearer ${keycloak?.token}` }
      });
      alert('Practicante registrado exitosamente');
      navigate('/usuarios');
    } catch (error) {
      console.error('Error al registrar practicante:', error);
      alert('Hubo un error al registrar el practicante');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Registro de Practicante</h2>
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

        <button type="submit" className="btn btn-primary">Registrar Practicante</button>
      </form>
    </div>
  );
};

export default FormularioInterno;