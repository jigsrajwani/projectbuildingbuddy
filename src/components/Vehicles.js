import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NavBar from './NavBar';
import Footer from './Footer';
import { Container, Row, Col, Button, Form, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from './AuthContext';

const validateLicensePlate = (plate) => {
  const licensePlateRegex = /^[A-Za-z0-9]{6}$/;
  return licensePlateRegex.test(plate);
};

function Vehicles() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [parking, setParking] = useState(null);
  const [licensePlate, setLicensePlate] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [spaceNumber, setSpaceNumber] = useState('');
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [maxHours, setMaxHours] = useState(1); 
  const [notificationMinutes, setNotificationMinutes] = useState(15); 
  const [showNotification, setShowNotification] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState({ licensePlate: '', timeRemaining: 0 });

  const convertToMinutes = (hours) => {
    return hours * 60;
  };

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await axios.get(`https://projectbuildingbuddy.azurewebsites.net/api/parking/${user.name}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParking(response.data);
      } catch (error) {
        setMessage(t('errorgeneral'));
        setTimeout(() => setMessage(null), 4000);
      }
    };

    fetchParking();
  }, [user.name, token]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await axios.get(`https://projectbuildingbuddy.azurewebsites.net/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = response.data;
        setMaxHours(userData.hour);
        setNotificationMinutes(userData.alert);
      } catch (error) {
        setMessage(t('errorgeneral'));
        setTimeout(() => setMessage(null), 4000);
      }
    };

    fetchUserSettings();
  }, [user._id, token]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (parking) {
        const maxTimeInMinutes = convertToMinutes(maxHours);
        parking.occupiedSpaces.forEach(space => {
          const currentTime = new Date();
          const parkedTime = new Date(space.parkedAt);
          const elapsedTime = (currentTime - parkedTime) / 60000; 
          const timeRemaining = maxTimeInMinutes - elapsedTime;

          if (timeRemaining <= notificationMinutes && timeRemaining > 0 && !showNotification) {
            setNotificationDetails({ licensePlate: space.licensePlate, timeRemaining: timeRemaining.toFixed(2) });
            setShowNotification(true);
          }
        });
      }
    }, 60000); 

    return () => clearInterval(timer);
  }, [parking, maxHours, notificationMinutes, showNotification]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`https://projectbuildingbuddy.azurewebsites.net/api/departments/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      setMessage(t('errorgeneral'));
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleEnter = async (e) => {
    e.preventDefault();
    if (!validateLicensePlate(licensePlate)) {
      setMessage(t('platerror'));
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    try {
      const response = await axios.get(`https://projectbuildingbuddy.azurewebsites.net/api/frequent/car/${licensePlate.toUpperCase()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.name.toLowerCase() === user.name.toLowerCase()) {
        const frequentUser = response.data;
        const { nombre, Number: department } = frequentUser; 

        const postResponse = await axios.post(
          `https://projectbuildingbuddy.azurewebsites.net/api/parking/${user.name}/enter`,
          { licensePlate: licensePlate.toUpperCase(), nombre, department, parkedAt: new Date(), spaceNumber },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setParking(postResponse.data);
        setLicensePlate('');
        setName('');
        setDepartment('');
        setSpaceNumber('');
        setShowManualForm(false);
      } else {
        setMessage(t('platerror'));
        setShowManualForm(true);
        fetchDepartments();
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage(t('notcar'));
        setShowManualForm(true);
        fetchDepartments();
        setName('');
        setDepartment('');
        setSpaceNumber('');
      } else {
        setMessage(t('visiterror'));
      }
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!validateLicensePlate(licensePlate)) {
      setMessage(t('platerror'));
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    try {
      const response = await axios.post(
        `https://projectbuildingbuddy.azurewebsites.net/api/parking/${user.name}/enter`,
        { licensePlate: licensePlate.toUpperCase(), nombre: name, department, parkedAt: new Date(), spaceNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParking(response.data);
      setLicensePlate('');
      setName('');
      setDepartment('');
      setSpaceNumber('');
      setShowManualForm(false);
    } catch (error) {
      setMessage(t('visiterror'));
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleExit = async (plate) => {
    try {
      const response = await axios.post(
        `https://projectbuildingbuddy.azurewebsites.net/api/parking/${user.name}/exit`,
        { licensePlate: plate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParking(response.data);
    } catch (error) {
      setMessage(t("errorgeneral"));
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const sortSpaces = (spaces) => {
    return spaces.sort((a, b) => {
      const numA = parseInt(a.slice(1), 10);
      const numB = parseInt(b.slice(1), 10);
      return numA - numB;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />
      <Container fluid style={{ flex: "1" }}>
        <h1 className="my-5 text-center">{t('vehicles')}</h1>
        {message && <Alert variant="danger">{message}</Alert>}
        {parking && (
          <>
            <h2 className='my-3 '>{t('totalSpaces')}: {parking.spaces}</h2>
            <h2 className='mt-3 mb-5'>{t('occupiedSpaces')}: {parking.occupiedSpaces.length}</h2>
            <Row>
  {sortSpaces(parking.availableSpaces.filter(space => !parking.occupiedSpaces.find(s => s.spaceNumber === space))).map((space, i) => (
    <Col key={i} className="mb-3 text-center"> {/* Añadido 'text-center' para centrar horizontalmente */}
      <div className="p-3 border bg-light">
        <p>{t('available')}</p>
        <p>{space}</p>
      </div>
    </Col>
  ))}
</Row>

            {parking.occupiedSpaces.map((space, i) => (
              <Row key={i}>
                <Col className="mb-3">
                  <div className="p-3 border bg-light">
                    <p>{t('licensePlate')}: {space.licensePlate}</p>
                    <p>{t('name')}: {space.nombre}</p>
                    <p>{t('department')}: {space.department}</p>
                    <p>{t('spaceNumber')}: {space.spaceNumber}</p>
                    <p>{t('timeRemaining')}: {Math.max(0, (convertToMinutes(maxHours) - ((new Date() - new Date(space.parkedAt)) / 60000)).toFixed(2))} min</p>
                    <Button variant="danger" onClick={() => handleExit(space.licensePlate)}>
                      {t('exit')}
                    </Button>
                  </div>
                </Col>
              </Row>
            ))}
            <Form className="text-center" onSubmit={handleEnter}>
              <Form.Group controlId="formLicensePlate">
                <Form.Label className='my-3'>{t('enterLicensePlate')}</Form.Label>
                <Form.Control
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formSpaceNumber">
                <Form.Label className='my-3'>{t('selectSpaceNumber')}</Form.Label>
                <Form.Control
                  as="select"
                  value={spaceNumber}
                  onChange={(e) => setSpaceNumber(e.target.value)}
                >
                  <option value="">{t('selectSpaceNumber')}</option>
                  {sortSpaces(parking.availableSpaces.filter(space => !parking.occupiedSpaces.find(s => s.spaceNumber === space))).map((space, index) => (
                    <option key={index} value={space}>{space}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              {!showManualForm && (
                <Button className="mt-3 w-100 btn-lg-2" type="submit">{t('enter')}</Button>
              )}
            </Form>
            {showManualForm && (
              <Form onSubmit={handleManualSubmit} className="text-center mt-3">
                <Form.Group controlId="formName">
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formDepartment">
                  <Form.Label>{t('department')}</Form.Label>
                  <Form.Control
                    as="select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">{t('selectDepartment')}</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept.Number}>{dept.Number}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formSpaceNumber">
                  <Form.Label>{t('selectSpaceNumber')}</Form.Label>
                  <Form.Control
                    as="select"
                    value={spaceNumber}
                    onChange={(e) => setSpaceNumber(e.target.value)}
                  >
                    <option value="">{t('selectSpaceNumber')}</option>
                    {sortSpaces(parking.availableSpaces.filter(space => !parking.occupiedSpaces.find(s => s.spaceNumber === space))).map((space, index) => (
                      <option key={index} value={space}>{space}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Button type="submit" className="mt-3">{t('enter')}</Button>
              </Form>
            )}
          </>
        )}
      </Container>
      <Footer />
      <Modal show={showNotification} onHide={() => setShowNotification(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('notification')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{`${t('timeAlmostUp')} ${notificationDetails.licensePlate} ${t('in')} ${notificationDetails.timeRemaining} ${t('minutes')}`}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowNotification(false)}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Vehicles;
