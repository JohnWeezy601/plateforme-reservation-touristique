require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const cloudinary = require("./config/cloudinary");

// ======================================================
// CONFIGURATION
// ======================================================

const UPLOADS_DIR = path.join(__dirname, "uploads");

const FOLDERS = {
    avis: "plateforme-touristique/avis",
    utilisateurs: "plateforme-touristique/utilisateurs",
    paiements: "plateforme-touristique/paiements"
};

// ======================================================
// CONNEXION MYSQL
// ======================================================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 5
});

// ======================================================
// UTILITAIRES
// ======================================================

function estUrlCloudinary(value) {
    return (
        typeof value === "string" &&
        value.includes("res.cloudinary.com")
    );
}

function trouverFichierLocal(nomFichier, sousDossier = "") {

    if (!nomFichier) {
        return null;
    }

    // Si c'est déjà une URL Cloudinary
    if (estUrlCloudinary(nomFichier)) {
        return null;
    }

    const cheminsPossibles = [];

    // --------------------------------------------------
    // 1. uploads/nom-fichier
    // --------------------------------------------------

    cheminsPossibles.push(
        path.join(UPLOADS_DIR, nomFichier)
    );

    // --------------------------------------------------
    // 2. uploads/sous-dossier/nom-fichier
    // --------------------------------------------------

    if (sousDossier) {

        cheminsPossibles.push(
            path.join(
                UPLOADS_DIR,
                sousDossier,
                nomFichier
            )
        );
    }

    // --------------------------------------------------
    // Chercher
    // --------------------------------------------------

    for (const chemin of cheminsPossibles) {

        if (fs.existsSync(chemin)) {
            return chemin;
        }
    }

    return null;
}

// ======================================================
// UPLOAD CLOUDINARY
// ======================================================

function uploadVersCloudinary(filePath, folder) {

    return new Promise((resolve, reject) => {

        const uploadStream =
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "auto"
                },

                (error, result) => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(result);
                }
            );

        fs.createReadStream(filePath)
            .pipe(uploadStream);
    });
}

// ======================================================
// MIGRATION AVIS_PHOTO
// ======================================================

async function migrerAvisPhotos() {

    console.log("\n");
    console.log("==============================================");
    console.log("📸 MIGRATION AVIS_PHOTO");
    console.log("==============================================");

    const [rows] = await db.query(`
        SELECT
            id_photo,
            id_avis,
            photo,
            public_id
        FROM avis_photo
        WHERE photo IS NOT NULL
          AND photo NOT LIKE 'http%'
        ORDER BY id_photo
    `);

    console.log(
        `📊 ${rows.length} photo(s) d'avis à migrer`
    );

    let succes = 0;
    let erreurs = 0;
    let absents = 0;

    for (const row of rows) {

        console.log("\n----------------------------------------------");
        console.log("ID photo :", row.id_photo);
        console.log("Fichier  :", row.photo);

        // --------------------------------------------------
        // Vérifier fichier local
        // --------------------------------------------------

        const filePath = trouverFichierLocal(
            row.photo,
            "avis"
        );

        if (!filePath) {

            console.log(
                "⚠️ Fichier local introuvable"
            );

            absents++;
            continue;
        }

        try {

            console.log(
                "📤 Upload vers Cloudinary..."
            );

            const result =
                await uploadVersCloudinary(
                    filePath,
                    FOLDERS.avis
                );

            console.log(
                "✅ Upload réussi"
            );

            console.log(
                "URL :",
                result.secure_url
            );

            console.log(
                "Public ID :",
                result.public_id
            );

            // --------------------------------------------------
            // Mise à jour MySQL
            // --------------------------------------------------

            await db.query(
                `
                UPDATE avis_photo
                SET
                    photo = ?,
                    public_id = ?
                WHERE id_photo = ?
                `,
                [
                    result.secure_url,
                    result.public_id,
                    row.id_photo
                ]
            );

            console.log(
                "✅ Base de données mise à jour"
            );

            succes++;

        } catch (error) {

            console.error(
                "❌ Erreur migration :",
                error.message
            );

            erreurs++;
        }
    }

    console.log("\n");
    console.log("📊 RÉSULTAT AVIS_PHOTO");
    console.log("   ✅ Réussies :", succes);
    console.log("   ⚠️ Absentes :", absents);
    console.log("   ❌ Erreurs  :", erreurs);
}

// ======================================================
// MIGRATION UTILISATEUR
// ======================================================

async function migrerUtilisateurs() {

    console.log("\n");
    console.log("==============================================");
    console.log("👤 MIGRATION UTILISATEUR");
    console.log("==============================================");

    const [rows] = await db.query(`
        SELECT
            id_utilisateur,
            nom,
            prenom,
            photo
        FROM utilisateur
        WHERE photo IS NOT NULL
          AND photo NOT LIKE 'http%'
        ORDER BY id_utilisateur
    `);

    console.log(
        `📊 ${rows.length} photo(s) utilisateur à migrer`
    );

    let succes = 0;
    let erreurs = 0;
    let absents = 0;

    for (const row of rows) {

        console.log("\n----------------------------------------------");

        console.log(
            "Utilisateur :",
            row.id_utilisateur,
            `${row.nom} ${row.prenom}`
        );

        console.log(
            "Fichier :",
            row.photo
        );

        // --------------------------------------------------
        // Chercher dans uploads/
        // --------------------------------------------------

        const filePath = trouverFichierLocal(
            row.photo
        );

        if (!filePath) {

            console.log(
                "⚠️ Fichier local introuvable"
            );

            absents++;
            continue;
        }

        try {

            console.log(
                "📤 Upload vers Cloudinary..."
            );

            const result =
                await uploadVersCloudinary(
                    filePath,
                    FOLDERS.utilisateurs
                );

            console.log(
                "✅ Upload réussi"
            );

            console.log(
                "URL :",
                result.secure_url
            );

            console.log(
                "Public ID :",
                result.public_id
            );

            // --------------------------------------------------
            // Mise à jour MySQL
            // --------------------------------------------------

            await db.query(
                `
                UPDATE utilisateur
                SET photo = ?
                WHERE id_utilisateur = ?
                `,
                [
                    result.secure_url,
                    row.id_utilisateur
                ]
            );

            console.log(
                "✅ Base de données mise à jour"
            );

            succes++;

        } catch (error) {

            console.error(
                "❌ Erreur migration :",
                error.message
            );

            erreurs++;
        }
    }

    console.log("\n");
    console.log("📊 RÉSULTAT UTILISATEUR");
    console.log("   ✅ Réussies :", succes);
    console.log("   ⚠️ Absentes :", absents);
    console.log("   ❌ Erreurs  :", erreurs);
}

// ======================================================
// MIGRATION PAIEMENT
// ======================================================

async function migrerPaiements() {

    console.log("\n");
    console.log("==============================================");
    console.log("💳 MIGRATION PAIEMENT");
    console.log("==============================================");

    const [rows] = await db.query(`
        SELECT
            id_paiement,
            id_reservation,
            preuve
        FROM paiement
        WHERE preuve IS NOT NULL
          AND preuve NOT LIKE 'http%'
        ORDER BY id_paiement
    `);

    console.log(
        `📊 ${rows.length} preuve(s) de paiement à migrer`
    );

    let succes = 0;
    let erreurs = 0;
    let absents = 0;

    for (const row of rows) {

        console.log("\n----------------------------------------------");

        console.log(
            "Paiement :",
            row.id_paiement
        );

        console.log(
            "Réservation :",
            row.id_reservation
        );

        console.log(
            "Fichier :",
            row.preuve
        );

        // --------------------------------------------------
        // Chercher dans uploads/
        // --------------------------------------------------

        const filePath = trouverFichierLocal(
            row.preuve
        );

        if (!filePath) {

            console.log(
                "⚠️ Fichier local introuvable"
            );

            absents++;
            continue;
        }

        try {

            console.log(
                "📤 Upload vers Cloudinary..."
            );

            const result =
                await uploadVersCloudinary(
                    filePath,
                    FOLDERS.paiements
                );

            console.log(
                "✅ Upload réussi"
            );

            console.log(
                "URL :",
                result.secure_url
            );

            console.log(
                "Public ID :",
                result.public_id
            );

            // --------------------------------------------------
            // Mise à jour MySQL
            // --------------------------------------------------

            await db.query(
                `
                UPDATE paiement
                SET preuve = ?
                WHERE id_paiement = ?
                `,
                [
                    result.secure_url,
                    row.id_paiement
                ]
            );

            console.log(
                "✅ Base de données mise à jour"
            );

            succes++;

        } catch (error) {

            console.error(
                "❌ Erreur migration :",
                error.message
            );

            erreurs++;
        }
    }

    console.log("\n");
    console.log("📊 RÉSULTAT PAIEMENT");
    console.log("   ✅ Réussies :", succes);
    console.log("   ⚠️ Absentes :", absents);
    console.log("   ❌ Erreurs  :", erreurs);
}

// ======================================================
// PROGRAMME PRINCIPAL
// ======================================================

async function main() {

    console.log("\n");
    console.log("====================================================");
    console.log("      MIGRATION DES FICHIERS VERS CLOUDINARY");
    console.log("====================================================");

    try {

        // --------------------------------------------------
        // Vérification connexion MySQL
        // --------------------------------------------------

        console.log("\n🔌 Connexion MySQL...");

        const connection = await db.getConnection();

        console.log(
            "✅ Connexion MySQL réussie !"
        );

        connection.release();

        // --------------------------------------------------
        // Vérification Cloudinary
        // --------------------------------------------------

        console.log("\n☁️ Vérification Cloudinary...");

        const result =
            await cloudinary.api.ping();

        console.log(
            "✅ Cloudinary accessible :",
            result.status
        );

        // --------------------------------------------------
        // Migrations
        // --------------------------------------------------

        await migrerAvisPhotos();

        await migrerUtilisateurs();

        await migrerPaiements();

        // --------------------------------------------------
        // FIN
        // --------------------------------------------------

        console.log("\n");
        console.log("====================================================");
        console.log("          ✅ MIGRATION TERMINÉE");
        console.log("====================================================");

        console.log("\n📌 Les fichiers locaux n'ont PAS été supprimés.");

    } catch (error) {

        console.error("\n");
        console.error(
            "❌ ERREUR GÉNÉRALE"
        );

        console.error(
            error
        );

    } finally {

        await db.end();

        console.log(
            "\n🔌 Connexion MySQL fermée."
        );
    }
}

// ======================================================
// LANCEMENT
// ======================================================

main();