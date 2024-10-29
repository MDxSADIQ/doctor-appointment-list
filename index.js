const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let patientList = [];

// Route for the doctor
app.get("/doctor", (req, res) => {
  res.render("doctor", { doctorName: "Dr. Smith", patientList });
});

// Route for the receptionist


// Route for the patient to enter their name
app.get("/patient", (req, res) => {
  res.render("patientName", { doctorName: "Dr. Smith" });
});

// Route to submit patient name and redirect to the list page

app.post("/patient/submit-name", (req, res) => {
  const patientName = req.body.patientName;
  
  // Check if the patient name is already in the list
  const existingPatient = patientList.find(patient => patient.name === patientName);
  
  if (!existingPatient && patientName) {
    patientList.push({ name: patientName });
     // Log the list after adding a patient
  }
  
  res.redirect(`/patient/list?name=${encodeURIComponent(patientName)}`);
});

  

// Route to show the patient list with anonymized names
app.get("/patient/list", (req, res) => {
  const patientName = req.query.name;
  res.render("patientList", { doctorName: "Dr. Smith", patientList, patientName });
});

// Route for the receptionist
app.get("/receptionist", (req, res) => {
  res.render("receptionist", { doctorName: "Dr. Smith", patientList }); // Pass patientList to the receptionist view
});

// Handling receptionist adding a patient
app.post("/receptionist/add", (req, res) => {
  const patientName = req.body.patientName;
  if (patientName) {
    patientList.push({ name: patientName });
    io.emit("updatePatientList", patientList);  // Emit the update to all clients
  }
  res.redirect("/receptionist");
});

// Socket.io connection for real-time updates
// Socket.io connection for real-time updates
io.on("connection", (socket) => {
    // Emit the current patient list to any newly connected client
     // Log the list
    socket.emit("updatePatientList", patientList);
  
    // Doctor removes a patient from the list
    socket.on("removePatient", () => {
      if (patientList.length > 0) {
        patientList.shift();
         // Log the updated list
        io.emit("updatePatientList", patientList); // Emit the updated list to all clients
      }
    });
  });
  

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
