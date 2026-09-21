const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();


// ==========================================
// Configuration SSL Aiven
// ==========================================

let sslConfig = undefined;


// ------------------------------------------
// En production : certificat fourni
// par une variable d'environnement
// ------------------------------------------

if (process.env.DB_SSL_CA_CONTENT) {

    sslConfig = {
        ca: process.env.DB_SSL_CA_CONTENT
    };

}


// ------------------------------------------
// En local : certificat .pem
// ------------------------------------------

else if (process.env.DB_SSL_CA) {

    if (fs.existsSync(process.env.DB_SSL_CA)) {

        sslConfig = {
            ca: fs.readFileSync(
                process.env.DB_SSL_CA
            )
        };

    }
    else {

        console.warn(
            "⚠️ Certificat CA introuvable :",
            process.env.DB_SSL_CA
        );

    }

}



console.log("========== DB CONFIG ==========");
console.log("DB_HOST :", process.env.DB_HOST);
console.log("DB_PORT :", process.env.DB_PORT);
console.log("DB_USER :", process.env.DB_USER);
console.log("DB_NAME :", process.env.DB_NAME);
console.log("DB_SSL_CA_CONTENT :", !!process.env.DB_SSL_CA_CONTENT);
console.log("===============================");


// ==========================================
// Création connexion MySQL
// ==========================================

const db = mysql.createPool({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    ssl: sslConfig,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    charset: "utf8mb4"

});


// ==========================================
// Test connexion
// ==========================================

db.getConnection()

    .then(connection => {

        console.log(
            "✅ Connexion MySQL Aiven réussie !"
        );

        connection.release();

    })

    .catch(error => {

        console.error(
            "❌ Erreur connexion MySQL Aiven :",
            error.message
        );

    });


// ==========================================
// Export
// ==========================================

module.exports = db;