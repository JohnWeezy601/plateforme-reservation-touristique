const express = require("express");
const cors = require("cors");
require("dotenv").config();


const utilisateurRoutes = require("./routes/utilisateurRoutes");


const authMiddleware = require("./middleware/authMiddleware");


const destinationRoutes =
require("./routes/destinationRoutes");

const categorieRoutes =
require("./routes/categorieRoutes");


const prestataireRoutes =
require("./routes/prestataireRoutes");


const offreRoutes =
require("./routes/offreRoutes");


const reservationRoutes =
require("./routes/reservationRoutes");


const paiementRoutes =
require("./routes/paiementRoutes");


const avisRoutes =
require("./routes/avisRoutes");

const avisPhotoRoutes = 
require("./routes/avisPhotoRoutes");


const path = require("path");


const contactRoutes =
require("./routes/contactRoutes");


const reponseContactRoutes =
require("./routes/reponseContactRoutes");


const notificationRoutes =
require("./routes/notificationRoutes");


const recommandationRoutes =
require("./routes/recommandationRoutes");

const dashboardRoutes = 
require("./routes/dashboardRoutes");


const recuRoutes =
require("./routes/recuRoutes");

const verificationRecuRoutes = require(
    "./routes/verificationRecuRoutes"
);

const assistantRoutes =
 require("./routes/assistantRoutes");



const app = express();



app.use(cors());

app.use(express.json());




// =============================
// Utilisateurs
// =============================

app.use(
"/api/utilisateurs",
utilisateurRoutes
);



// =============================
// Images upload
// =============================

app.use(
"/uploads",
express.static(
path.join(__dirname,"uploads")
)
);




// =============================
// Destinations
// =============================

app.use(
"/api/destinations",
destinationRoutes
);




// =============================
// Categories
// =============================

app.use(
"/api/categories",
categorieRoutes
);




// =============================
// Prestataires
// =============================

app.use(
"/api/prestataires",
prestataireRoutes
);




// =============================
// Offres
// =============================

app.use(
"/api/offres",
offreRoutes
);




// =============================
// Réservations
// =============================

app.use(
"/api/reservations",
reservationRoutes
);




// =============================
// Paiements
// =============================

app.use(
"/api/paiements",
paiementRoutes
);




// =============================
// Avis
// =============================

app.use(
"/api/avis",
avisRoutes
);


app.use(
"/api/avis-photo", 
avisPhotoRoutes);




// =============================
// Contacts
// =============================

app.use(
"/api/contacts",
contactRoutes
);




// =============================
// Réponses contacts
// =============================

app.use(
"/api/reponses",
reponseContactRoutes
);




// =============================
// Notifications
// =============================

app.use(
"/api/notifications",
notificationRoutes
);


app.use(
"/api/recu",
recuRoutes
);

app.use(
    "/api/verification-recu",
    verificationRecuRoutes
);


// =============================
// Recommandations IA
// =============================

app.use(
"/api/recommandations",
recommandationRoutes
);


app.use(
    "/api/dashboard",
    dashboardRoutes
);


app.use(
    "/api/assistant-touristique",
    assistantRoutes
);

// =============================
// Test API
// =============================

app.get("/",(req,res)=>{


res.send(
"Plateforme touristique API fonctionne !"
);


});




// =============================
// Test token
// =============================

app.get(
"/api/profil",
authMiddleware,
(req,res)=>{


res.json({

message:"Accès autorisé",

utilisateur:req.user

});


});





const PORT = process.env.PORT || 8081;



app.listen(PORT,()=>{


console.log(
`Serveur lancé sur le port ${PORT}`
);


});