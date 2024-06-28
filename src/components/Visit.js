import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import NavBar from './NavBar';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import './styles.css';

function Visit() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [view, setView] = useState(null);
  const [isRUTVerified, setIsRUTVerified] = useState(null);
  const [hasCar, setHasCar] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user || !user._id) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://projectbuildingbuddy.azurewebsites.net/api/departments/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDepartments(response.data);
      } catch (error) {
        setMessage(t('recoveringDptoError'));
        setMessageType('danger');
        console.error(t('consoleDptoError'), error);
      }
    };

    fetchDepartments();
  }, [t, user]);

  const validateRut = (rut) => {
    const rutRegex = /^[0-9]{7,8}-[0-9Kk]{1}$/;
    return rutRegex.test(rut);
  };

  const validateLicensePlate = (plate) => {
    const licensePlateRegex = /^[A-Za-z0-9]{6}$/;
    return licensePlateRegex.test(plate);
  };

  const handleRUTSubmit = async (e) => {
    e.preventDefault();
    if (!validateRut(rut)) {
      setMessage(t('ruterror'));
      setMessageType('danger');
      hideMessageAfterTimeout();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://projectbuildingbuddy.azurewebsites.net/api/frequent/rut/${rut}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setNombre(response.data.nombre);
        setSelectedDepartment(response.data.Number);
        setIsRUTVerified(true);
      } else {
        setMessage(t('RUTnoRegistred'));
        setMessageType('warning');
        setIsRUTVerified(false);
        setNombre('');
        setSelectedDepartment('');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage(t('RUTnoRegistred'));
        setMessageType('warning');
        setIsRUTVerified(false);
        setNombre('');
        setSelectedDepartment('');
      } else {
        setMessage(t('ErrorRUT'));
        setMessageType('danger');
        console.error('Error:', error);
      }
    }
    hideMessageAfterTimeout();
  };

  const handleFrequentSubmit = async (e) => {
    e.preventDefault();
    if (!validateRut(rut)) {
      setMessage(t('ruterror'));
      setMessageType('danger');
      hideMessageAfterTimeout();
      return;
    }
    if (hasCar && !validateLicensePlate(licensePlate)) {
      setMessage(t('platerror'));
      setMessageType('danger');
      hideMessageAfterTimeout();
      return;
    }
    try {
      const frequentVisit = {
        Number: selectedDepartment,
        nombre,
        rut,
        name: user.name,
        car: hasCar ? licensePlate : 'N/A'
      };
      const token = localStorage.getItem('token');
      const response = await axios.post('https://projectbuildingbuddy.azurewebsites.net/api/frequent', frequentVisit, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage(t('visitpass'));
      setMessageType('success');
      setSelectedDepartment('');
      setNombre('');
      setRut('');
      setHasCar(false);
      setLicensePlate('');
    } catch (error) {
      setMessage(t('visiterror'));
      setMessageType('danger');
      console.error('Error:', error);
    }
    hideMessageAfterTimeout();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const visita = {
        departamento: selectedDepartment,
        nombre,
        fecha,
        hora,
        name: user.name // Añade el campo name con el nombre del edificio
      };
      const token = localStorage.getItem('token');
      const response = await axios.post('https://projectbuildingbuddy.azurewebsites.net/api/visitas', visita, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage(t('visitpass1'));
      setMessageType('success');
      setSelectedDepartment('');
      setNombre('');
      setFecha('');
      setHora('');
      setIsRUTVerified(null); // Resetear el estado a null después de enviar el formulario
    } catch (error) {
      setMessage(t('visiterror'));
      setMessageType('danger');
      console.error('Error al enviar el formulario:', error);
    }
    hideMessageAfterTimeout();
  };

  const hideMessageAfterTimeout = () => {
    setTimeout(() => {
      setMessage(null);
      setMessageType('');
    }, 7000);
  };

  const renderButtons = () => (
    <div>
      <Button onClick={() => setView('frequent')} variant="lightColor" className="m-2 btn-lg">
        {t("RegisterFrequent")}
      </Button>
      <Button onClick={() => setView('building')} variant="lightColor" className="m-2 btn-lg">
        {t('registerVisitNoFrequent')}
      </Button>
    </div>
  );

  const renderRUTForm = () => (
    <Form onSubmit={handleRUTSubmit}>
      <Form.Group controlId="rutForm.Rut">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('rut')}</Form.Label>
        <Form.Control
          type="text"
          value={rut}
          onChange={e => setRut(e.target.value)}
          style={{ fontSize: '1.2rem' }}
        />
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button variant="primary" type="submit" className='my-4 btn-lg-2'>
          {t('verifyRUT')}
        </Button>
        <Button variant="secondary" onClick={() => setView(null)} className='my-4 btn-lg-2'>
          {t('return')}
        </Button>
      </div>
    </Form>
  );

  const renderFrequentForm = () => (
    <Form onSubmit={handleFrequentSubmit}>
      <Form.Group controlId="frequentForm.DepartmentSelect">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('department')}</Form.Label>
        <Form.Control as="select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ fontSize: '1.2rem' }}>
          <option value="">{t('selectDepartment')}</option>
          {departments.map((dept, index) => (
            <option key={index} value={dept.Number}>{dept.Number}</option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="frequentForm.Nombre">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('name')}</Form.Label>
        <Form.Control
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          style={{ fontSize: '1.2rem' }}
        />
      </Form.Group>

      <Form.Group controlId="frequentForm.Rut">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('rut')}</Form.Label>
        <Form.Control
          type="text"
          value={rut}
          onChange={e => setRut(e.target.value)}
          style={{ fontSize: '1.2rem' }}
        />
      </Form.Group>

      <Form.Group controlId="frequentForm.HasCar">
        <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('car')}</Form.Label>
        <div>
          <Form.Check
            type="radio"
            name="hasCar"
            checked={hasCar}
            onChange={() => setHasCar(true)}
            style={{ fontSize: '1.2rem' }}
            label={t('Yes')}
          />
          <Form.Check
            type="radio"
            name="hasCar"
            checked={!hasCar}
            onChange={() => setHasCar(false)}
            style={{ fontSize: '1.2rem' }}
            label={t('No')}
          />
        </div>
      </Form.Group>

      {hasCar && (
       
       <Form.Group controlId="frequentForm.Car">
       <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('plate')}</Form.Label>
       <Form.Control
         type="text"
         value={licensePlate}
         onChange={e => setLicensePlate(e.target.value)}
         style={{ fontSize: '1.2rem' }}
       />
     </Form.Group>
   )}

   <div className="d-flex justify-content-between">
     <Button variant="lightColor" type="submit" className='my-4 btn-lg-2'>
       {t('VisitFrequent')}
     </Button>
     <Button variant="secondary" onClick={() => setView(null)} className='my-4 btn-lg-2'>
       {t('return')}
     </Button>
   </div>
 </Form>
);

const renderFullForm = () => (
 <Form onSubmit={handleSubmit}>
   <Form.Group controlId="visitasForm.Nombre">
     <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('name')}</Form.Label>
     <Form.Control
       type="text"
       value={nombre}
       onChange={e => setNombre(e.target.value)}
       style={{ fontSize: '1.2rem' }}
     />
   </Form.Group>
   <Form.Group controlId="visitasForm.DepartmentSelect">
     <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('department')}</Form.Label>
     <Form.Control as="select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ fontSize: '1.2rem' }}>
       <option value="">{t('selectDepartment')}</option>
       {departments.map((dept, index) => (
         <option key={index} value={dept.Number}>{dept.Number}</option>
       ))}
     </Form.Control>
   </Form.Group>

   <Form.Group controlId="visitasForm.Fecha">
     <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('date')}</Form.Label>
     <Form.Control
       type="date"
       value={fecha}
       onChange={e => setFecha(e.target.value)}
       style={{ fontSize: '1.2rem' }}
     />
   </Form.Group>

   <Form.Group controlId="visitasForm.Hora">
     <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('time')}</Form.Label>
     <Form.Control
       type="time"
       value={hora}
       onChange={e => setHora(e.target.value)}
       style={{ fontSize: '1.2rem' }}
     />
   </Form.Group>

   <div className="d-flex justify-content-between">
     <Button variant="lightColor" type="submit" className='my-4 btn-lg-2'>
       {t('registerVisit')}
     </Button>
     <Button variant="secondary" onClick={() => { setView(null); setIsRUTVerified(null); }} className='my-4 btn-lg-2'>
       {t('return')}
     </Button>
   </div>
 </Form>
);

const renderPartialForm = () => (
 <Form onSubmit={handleSubmit}>
   <Form.Group controlId="visitasForm.Nombre">
     <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('name')}</Form.Label>
     <Form.Control
       type="text"
       value={nombre}
       readOnly
       style={{ fontSize: '1.2rem' }}
     />
   </Form.Group>

   <Form.Group controlId="visitasForm.DepartmentSelect">
     <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('department')}</Form.Label>
     <Form.Control
       type="text"
       value={selectedDepartment}
       readOnly
       style={{ fontSize: '1.2rem' }}
     />
   </Form.Group>

   <Form.Group controlId="visitasForm.Fecha">
     <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('date')}</Form.Label>
     <Form.Control
       type="date"
       value={fecha}
       onChange={e => setFecha(e.target.value)}
       style={{ fontSize: '1.2rem' }}
     />
   </Form.Group>

   <Form.Group controlId="visitasForm.Hora">
     <Form.Label style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>{t('time')}</Form.Label>
     <Form.Control
       type="time"
       value={hora}
       onChange={e => setHora(e.target.value)}
       style={{ fontSize: '1.2rem' }}
     />
   </Form.Group>

   <div className="d-flex justify-content-between">
     <Button variant="lightColor" type="submit" className='my-4 btn-lg-2'>
       {t('registerVisit')}
     </Button>
     <Button variant="secondary" onClick={() => { setView(null); setIsRUTVerified(null); }} className='my-4 btn-lg-2'>
       {t('return')}
     </Button>
   </div>
 </Form>
);

if (!isAuthenticated) {
 return <div>{t('loading')}</div>;
}

return (
 <div className="min-vh-100" >
   <NavBar />
   <Container>
     <Row className="justify-content-md-center">
       <Col lg={6}>
         {message && <Alert variant={messageType}>{message}</Alert>}
         {view === 'frequent' ? renderFrequentForm() : view === 'building' ? (
           isRUTVerified === null ? renderRUTForm() : isRUTVerified ? renderPartialForm() : renderFullForm()
         ) : renderButtons()}
       </Col>
     </Row>
   </Container>
   <Footer />
 </div>
);
}

export default Visit;
