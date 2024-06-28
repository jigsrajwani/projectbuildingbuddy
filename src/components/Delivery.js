import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";

function Delivery() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [typeOfPackage, setTypeOfPackage] = useState("");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const delivery = {
        department: selectedDepartment,
        typeOfPackage,
        company,
        date,
        time,
      };
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://projectbuildingbuddy.azurewebsites.net/api/deliveries",
        delivery,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Enviar SMS
      await sendSMS(phoneNumber);

      setMessage(t("deliveryRegisteredSuccessfully"));
      setSelectedDepartment("");
      setTypeOfPackage("");
      setCompany("");
      setDate("");
      setTime("");
    } catch (error) {
      setMessage(t("errorRegisteringDelivery"));
      console.error("Error submitting form:", error);
    }
  };

  const sendSMS = async (phone) => {
    try {
      await axios.post("https://projectbuildingbuddy.azurewebsites.net/api/send-sms", {
        phone,
        message: t("yourPackageArrived"),
      });
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user || !user._id) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://projectbuildingbuddy.azurewebsites.net/api/departments/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDepartments(response.data);
      } catch (error) {
        setMessage(t("recoveringDptoError"));
        console.error(t("consoleDptoError"), error);
      }
    };

    fetchDepartments();
  }, [t, user]);

  useEffect(() => {
    const fetchDepartmentPhone = async () => {
      if (selectedDepartment) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `https://projectbuildingbuddy.azurewebsites.net/api/department/${selectedDepartment}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setPhoneNumber(response.data.phone);
        } catch (error) {
          console.error("Error fetching department phone:", error);
        }
      }
    };

    fetchDepartmentPhone();
  }, [selectedDepartment]);

  if (!isAuthenticated) {
    return <div>{t("loading")}</div>;
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <NavBar />
      <Container>
        <Row className="justify-content-md-center">
          <Col lg={6}>
            {message && (
              <Alert
                variant={
                  message.startsWith(t("errorPrefix")) ? "danger" : "success"
                }
              >
                {message}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="deliveryForm.DepartmentSelect">
                <Form.Label style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
                  {t("department")}
                </Form.Label>
                <Form.Control as="select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ fontSize: '1.2rem' }}>
                  <option value="">{t('selectDepartment')}</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.Number}>{dept.Number}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="deliveryForm.TypeOfPackage">
                <Form.Label style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
                  {t("typeOfPackage")}
                </Form.Label>
                <Form.Control
                  type="text"
                  value={typeOfPackage}
                  onChange={(e) => setTypeOfPackage(e.target.value)}
                  style={{ fontSize: "1.2rem" }}
                />
              </Form.Group>

              <Form.Group controlId="deliveryForm.Company">
                <Form.Label style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
                  {t("company")}
                </Form.Label>
                <Form.Control
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{ fontSize: "1.2rem" }}
                />
              </Form.Group>

              <Form.Group controlId="deliveryForm.Date">
                <Form.Label style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
                  {t("date")}
                </Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ fontSize: "1.2rem" }}
                />
              </Form.Group>

              <Form.Group controlId="deliveryForm.Time">
                <Form.Label style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
                  {t("time")}
                </Form.Label>
                <Form.Control
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{ fontSize: "1.2rem" }}
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="my-4 btn-lg-2 w-100"
              >
                {t("registerDelivery")}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default Delivery;
