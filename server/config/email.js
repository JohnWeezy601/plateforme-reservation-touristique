const nodemailer = require("nodemailer");

console.log("========== CONFIGURATION EMAIL ==========");
console.log("EMAIL_HOST :", process.env.EMAIL_HOST);
console.log("EMAIL_PORT :", process.env.EMAIL_PORT);
console.log("EMAIL_USER :", process.env.EMAIL_USER);
console.log("EMAIL_FROM :", process.env.EMAIL_FROM);
console.log("EMAIL_PASS présent :", !!process.env.EMAIL_PASS);
console.log("=========================================");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),

    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    requireTLS: true,

    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
});

// Vérification de la connexion
transporter.verify()
    .then(() => {
        console.log("✅ CONNEXION SMTP BREVO RÉUSSIE");
    })
    .catch((error) => {
        console.error("❌ ERREUR SMTP :", error.message);
        console.error("CODE :", error.code);
        console.error("RESPONSE :", error.response);
    });

module.exports = transporter;