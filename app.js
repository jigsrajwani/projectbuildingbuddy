const express = require("express");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { PDFDocument } = require('pdf-lib');
const twilio = require('twilio');
const path = require('path'); // Asegúrate de importar path
const { User, Department, Visit, Delivery, Frequent, Parking, connectToMongo } = require("./mongo");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const PORT = process.env.PORT || 8000;
connectToMongo();

const JWT_SECRET = '1234'; // Simple secret key for this project
const accountSid = 'AC67444ea956f96df2af70ddc11ae55d61'; // Obtén esto de tu consola de Twilio
const authToken = 'd96c22ffdd7e3bcc66ddda48008a34c7'; // Obtén esto de tu consola de Twilio
const twilioClient = new twilio(accountSid, authToken);

// Create a user using POST "/api/auth/createUser", doesn't require authentication
app.post('/createuser', async (req, res) => {
    let success = false;
    try {
      let user = await User.findOne({ username: req.body.username });
      if (user) {
        return res.status(400).json({ success, error: "A user with this username already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        username: req.body.username,
        password: secPass,
        name: req.body.name,
        hour: req.body.hour,
        alert: req.body.alert
      });
      //send a token to user
      const data = { user: user._id };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });

// Endpoint for login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(`Received credentials: ${username} ${password}`);

    try {
        const user = await User.findOne({ username: username });
        console.log(`Found user: ${user}`);

        if (user) {
            const passwordIsValid = await bcrypt.compare(password, user.password);

            if (passwordIsValid) {
                const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
                res.json({ token });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(`Received token: ${token}`);
    if (!token) {
        console.log('No token provided');
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Invalid token');
            return res.status(403).json({ message: 'Invalid token' });
        }

        console.log(`Authenticated user: ${user.name}`);
        req.user = user;
        next();
    });
};

// Función para validar RUT
const validateRut = (rut) => {
    const rutRegex = /^[0-9]{7,8}-[0-9Kk]{1}$/;
    return rutRegex.test(rut);
};

// Obtener la configuración del administrador
app.get('/api/users/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      hour: user.hour,
      alert: user.alert
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Error fetching user settings' });
  }
});

// Protected routes
app.get('/api/departments/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        const userBuildingName = user.name;
        const regex = new RegExp(`^${userBuildingName}$`, 'i');
        const departments = await Department.find({ name: { $regex: regex } });

        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving departments' });
    }
});

app.get('/api/pdf/:id', authenticateToken, async (req, res) => {
    try {
        const doc = await generatePDF(req.params.id);
        const pdfBytes = await doc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBytes);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF' });
    }
});

app.get('/api/departments/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await collection.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userBuildingName = user.name;
        const regex = new RegExp(`^${userBuildingName}$`, 'i');
        const departments = await Department.find({ name: { $regex: regex } });

        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving departments' });
    }
});

app.get('/api/department/:number', authenticateToken, async (req, res) => {
    const { number } = req.params;
    try {
        const department = await Department.findOne({ Number: number });
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.send(department);
    } catch (error) {
        console.error('Error fetching department information:', error);
        res.status(500).send('Error fetching department information');
    }
});

app.post('/api/visitas', authenticateToken, async (req, res) => {
    try {
        const newVisit = new Visit({
            departamento: req.body.departamento,
            nombre: req.body.nombre,
            fecha: req.body.fecha,
            hora: req.body.hora,
            name: req.user.name
        });

        const savedVisit = await newVisit.save();
        res.status(201).json(savedVisit);
    } catch (error) {
        console.error('Error saving visit:', error);
        res.status(500).json({ message: 'Error registering visit' });
    }
});

app.post('/api/deliveries', authenticateToken, async (req, res) => {
    try {
        const { department, typeOfPackage, company, date, time } = req.body;
        console.log("here=====");

        // Obtener el nombre del edificio del departamento
        const departmentInfo = await Department.findOne({ Number: department });
        console.log(departmentInfo);
        if (!departmentInfo) {
          return res.status(404).json({ message: 'Department not found' });
        }
        
        const newDelivery = new Delivery({
            department,
            typeOfPackage,
            company,
            date,
            time,
            buildingName: departmentInfo.name // Guardar el nombre del edificio
        });

        const savedDelivery = await newDelivery.save();

        // Generar el contenido del PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        // Contenido del PDF
        page.drawText(`Department: ${savedDelivery.department}`, { x: 50, y: height - 100 });
        page.drawText(`Type of Package: ${savedDelivery.typeOfPackage}`, { x: 50, y: height - 120 });
        page.drawText(`Company: ${savedDelivery.company}`, { x: 50, y: height - 140 });
        page.drawText(`Date: ${savedDelivery.date.toDateString()}`, { x: 50, y: height - 160 });
        page.drawText(`Time: ${savedDelivery.time}`, { x: 50, y: height - 180 });

        // Serializar el PDF a bytes
        const pdfBytes = await pdfDoc.save();

        // Obtener el número de teléfono del departamento
        if (!departmentInfo.phone) {
          return res.status(400).json({ message: 'Phone number not found for department' });
        }

        // Enviar SMS utilizando Twilio
        const message = `Your package has arrived`;
        await twilioClient.messages.create({
            body: message,
            to: departmentInfo.phone,
            from: '+19123912063'
        });

        // Establecer los encabezados de la respuesta para indicar que se enviará un archivo PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=delivery.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error saving delivery:', error);
        res.status(500).json({ message: 'Error registering delivery' });
    }
});

app.get('/api/frequent', authenticateToken, async (req, res) => {
    try {
        const frequents = await Frequent.find();
        res.json(frequents);
    } catch (error) {
        console.error('Error retrieving frequents:', error);
        res.status(500).json({ message: 'Error retrieving frequents' });
    }
});

app.post('/api/frequent', authenticateToken, async (req, res) => {
    try {
        const { Number, nombre, rut, car } = req.body;

        if (!validateRut(rut)) {
            return res.status(400).json({ message: 'El RUT ingresado no es válido. Debe tener el formato xxxxxxxx-x.' });
        }

        const newFrequent = new Frequent({
            Number,
            nombre,
            rut,
            name: req.user.name,
            car: car || 'N/A'
        });

        const savedFrequent = await newFrequent.save();
        res.status(201).json(savedFrequent);
    } catch (error) {
        console.error('Error saving frequent:', error);
        res.status(500).json({ message: 'Error registering frequent' });
    }
});

app.get('/api/frequent/rut/:rut', authenticateToken, async (req, res) => {
    try {
        const rut = req.params.rut;
        const frequentUser = await Frequent.findOne({ rut });

        if (frequentUser) {
            res.json(frequentUser);
        } else {
            res.status(404).json({ message: 'RUT not found in frequent collection' });
        }
    } catch (error) {
        console.error('Error retrieving RUT from frequent:', error);
        res.status(500).json({ message: 'Error retrieving RUT' });
    }
});

app.get('/api/frequent/car/:licensePlate', authenticateToken, async (req, res) => {
    try {
        const licensePlate = req.params.licensePlate.toUpperCase(); // Convierte a mayúsculas la patente recibida
        const frequentUser = await Frequent.findOne({ car: { $regex: new RegExp(`^${licensePlate}$`, 'i') }, name: req.user.name });

        if (frequentUser) {
            res.json(frequentUser);
        } else {
            res.status(404).json({ message: 'License plate not found in frequent collection' });
        }
    } catch (error) {
        console.error('Error retrieving license plate from frequent:', error);
        res.status(500).json({ message: 'Error retrieving license plate' });
    }
});

// Rutas de estacionamiento

// Obtener el estado del estacionamiento
app.get('/api/parking/:name', authenticateToken, async (req, res) => {
    console.log(`Fetching parking data for ${req.params.name}`);
    try {
      const parking = await Parking.findOne({ name: req.params.name });
      if (!parking) {
        console.log(`Parking not found for ${req.params.name}`);
        return res.status(404).json({ message: 'Parking not found' });
      }
      console.log(`Parking data: ${parking}`);
      res.json(parking);
    } catch (error) {
      console.error('Error fetching parking data:', error);
      res.status(500).json({ message: 'Error fetching parking data' });
    }
  });
  
  // Registrar la entrada de un vehículo
  app.post('/api/parking/:name/enter', authenticateToken, async (req, res) => {
    console.log(`Registering vehicle with license plate ${req.body.licensePlate} for ${req.params.name}`);
    try {
      const { licensePlate, nombre, department, spaceNumber } = req.body;
      const parking = await Parking.findOne({ name: req.params.name });
      if (!parking) {
        console.log(`Parking not found for ${req.params.name}`);
        return res.status(404).json({ message: 'Parking not found' });
      }
  
      if (parking.occupiedSpaces.length >= parking.spaces) {
        console.log(`No available spaces for ${req.params.name}`);
        return res.status(400).json({ message: 'No available spaces' });
      }
  
      const user = await User.findById(req.user.id);
      const maxHours = user.hour;
      const notificationMinutes = user.alert;
  
      parking.occupiedSpaces.push({ licensePlate, nombre, department, spaceNumber, parkedAt: new Date(), maxHours, notificationMinutes });
      parking.availableSpaces = parking.availableSpaces.filter(space => space !== spaceNumber);
      await parking.save();
      console.log(`Vehicle registered: ${licensePlate}`);
      res.json(parking);
    } catch (error) {
      console.error('Error registering vehicle:', error);
      res.status(500).json({ message: 'Error registering vehicle' });
    }
  });
  
  // Registrar la salida de un vehículo
  app.post('/api/parking/:name/exit', authenticateToken, async (req, res) => {
    console.log(`Removing vehicle with license plate ${req.body.licensePlate} for ${req.params.name}`);
    try {
      const { licensePlate } = req.body;
      const parking = await Parking.findOne({ name: req.params.name });
      if (!parking) {
        console.log(`Parking not found for ${req.params.name}`);
        return res.status(404).json({ message: 'Parking not found' });
      }
  
      const spaceIndex = parking.occupiedSpaces.findIndex(space => space.licensePlate === licensePlate);
      const removedSpace = parking.occupiedSpaces[spaceIndex];
      parking.occupiedSpaces.splice(spaceIndex, 1);
      parking.availableSpaces.push(removedSpace.spaceNumber);
      await parking.save();
      console.log(`Vehicle removed: ${licensePlate}`);
      res.json(parking);
    } catch (error) {
      console.error('Error removing vehicle:', error);
      res.status(500).json({ message: 'Error removing vehicle' });
    }
  });

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'build')));

// Ruta para manejar cualquier otra petición y devolver `index.html`
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});