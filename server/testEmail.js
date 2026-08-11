require("dotenv").config();

const transporter = require("./config/email");


transporter.sendMail({

    from: process.env.EMAIL_FROM,

    to: "tohasoajohnbienaime@gmail.com",

    subject: "Test réponse plateforme touristique",

    text: "Bonjour, ceci est un test d'envoi avec Brevo depuis la plateforme touristique."

})

.then(()=>{

    console.log("Email envoyé avec succès");

})

.catch((error)=>{

    console.log("Erreur envoi email :", error);

});