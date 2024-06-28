// mongo.js
const mongoose = require("mongoose");

const uri =
  "mongodb+srv://jigyasa:jigyasa123@proyect.t0wuu2a.mongodb.net/Proyect"
console.log(uri);

async function connectToMongo() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  hour: {
    type: Number,
    required: true,
  },
  alert: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("users", userSchema);

const departmentSchema = new mongoose.Schema({
  Number: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const Department = mongoose.model("departments", departmentSchema);

const visitSchema = new mongoose.Schema({
  departamento: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
  },
  hora: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Visit = mongoose.model("Visit", visitSchema);

const deliverySchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  typeOfPackage: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  buildingName: {
    type: String,
    required: false,
  },
});

const Delivery = mongoose.model("Delivery", deliverySchema);

const frequentSchema = new mongoose.Schema({
  Number: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  rut: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  car: {
    type: String,
    required: true,
  },
});

const Frequent = mongoose.model("frequent", frequentSchema, "frequent");

const parkingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  spaces: {
    type: Number,
    required: true,
  },
  occupiedSpaces: [
    {
      licensePlate: {
        type: String,
        required: true,
      },
      nombre: {
        type: String,
        required: true,
      },
      department: {
        type: String,
        required: true,
      },
      parkedAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
      spaceNumber: {
        type: String,
        required: true,
      },
    },
  ],
  availableSpaces: {
    type: [String],
    default: function () {
      return Array.from({ length: this.spaces }, (_, i) => `V${i + 1}`);
    },
  },
});

const Parking = mongoose.model("Parking", parkingSchema, "parking");

module.exports = {
  connectToMongo,
  User,
  Department,
  Visit,
  Delivery,
  Frequent,
  Parking,
};
