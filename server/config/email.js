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

    tls: {
        rejectUnauthorized: false
    }

});

transporter.verify((error, success) => {

    if (error) {

        console.error("====================================");
        console.error("❌ ERREUR CONNEXION SMTP BREVO");
        console.error("Message :", error.message);
        console.error("Code :", error.code);
        console.error("Response :", error.response);
        console.error("====================================");

    } else {

        console.log("====================================");
        console.log("✅ CONNEXION SMTP BREVO RÉUSSIE");
        console.log("====================================");

    }

});

module.exports = transporter;