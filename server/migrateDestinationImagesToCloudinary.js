
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const db = require("./db");
const cloudinary = require("./config/cloudinary");


// ============================================================
// CONFIGURATION
// ============================================================

const UPLOADS_DIR = path.join(__dirname, "uploads");

const CLOUDINARY_FOLDER =
    "plateforme-touristique/destinations";


// ============================================================
// UPLOAD CLOUDINARY
// ============================================================

const uploadToCloudinary = async (filePath) => {

    return new Promise((resolve, reject) => {

        cloudinary.uploader.upload(

            filePath,

            {
                folder: CLOUDINARY_FOLDER,
                resource_type: "image"
            },

            (error, result) => {

                if (error) {

                    reject(error);

                } else {

                    resolve(result);

                }

            }

        );

    });

};


// ============================================================
// VÉRIFIER SI C'EST DÉJÀ UNE URL CLOUDINARY
// ============================================================

const isCloudinaryUrl = (value) => {

    return (
        typeof value === "string" &&
        value.includes("res.cloudinary.com")
    );

};


// ============================================================
// MIGRATION DES IMAGES DES DESTINATIONS
// ============================================================

const migrateDestinationImages = async () => {

    console.log("");
    console.log("================================================");
    console.log(" MIGRATION DES IMAGES DES DESTINATIONS");
    console.log("================================================");
    console.log("");


    // ----------------------------------------------------------
    // RÉCUPÉRER LES DESTINATIONS
    // ----------------------------------------------------------

    const [destinations] = await db.query(`

        SELECT
            id_destination,
            nom,
            image

        FROM destination

        WHERE image IS NOT NULL
        AND image <> ''

        ORDER BY id_destination ASC

    `);


    console.log(
        `Nombre de destinations à vérifier : ${destinations.length}`
    );


    let success = 0;
    let skipped = 0;
    let errors = 0;


    // ----------------------------------------------------------
    // TRAITER CHAQUE DESTINATION
    // ----------------------------------------------------------

    for (const destination of destinations) {

        try {

            console.log("");
            console.log(
                `➡️ Destination ${destination.id_destination} : ${destination.nom}`
            );

            console.log(
                "Image :",
                destination.image
            );


            // ==================================================
            // DÉJÀ CLOUDINARY
            // ==================================================

            if (
                isCloudinaryUrl(destination.image)
            ) {

                console.log(
                    "⏭️ Déjà sur Cloudinary"
                );

                skipped++;

                continue;

            }


            // ==================================================
            // CHEMIN DU FICHIER LOCAL
            // ==================================================

            const filePath =
                path.join(
                    UPLOADS_DIR,
                    destination.image
                );


            console.log(
                "Fichier recherché :",
                filePath
            );


            // ==================================================
            // VÉRIFIER QUE LE FICHIER EXISTE
            // ==================================================

            if (
                !fs.existsSync(filePath)
            ) {

                console.error(
                    "❌ Fichier introuvable :",
                    filePath
                );

                errors++;

                continue;

            }


            // ==================================================
            // UPLOAD CLOUDINARY
            // ==================================================

            console.log(
                "☁️ Upload vers Cloudinary..."
            );


            const result =
                await uploadToCloudinary(
                    filePath
                );


            const cloudinaryUrl =
                result.secure_url;


            console.log(
                "✅ Cloudinary :",
                cloudinaryUrl
            );


            // ==================================================
            // METTRE À JOUR MYSQL
            // ==================================================

            await db.query(

                `

                UPDATE destination

                SET image = ?

                WHERE id_destination = ?

                `,

                [
                    cloudinaryUrl,
                    destination.id_destination
                ]

            );


            console.log(
                "✅ MySQL mis à jour"
            );


            success++;

        }

        catch (error) {

            console.error(
                `❌ Erreur destination ${destination.id_destination} :`,
                error.message
            );

            errors++;

        }

    }


    // ========================================================
    // RÉSULTAT
    // ========================================================

    console.log("");
    console.log("------------------------------------------------");
    console.log("RÉSULTAT MIGRATION DESTINATIONS");
    console.log("------------------------------------------------");

    console.log(
        "✅ Migrées :",
        success
    );

    console.log(
        "⏭️ Déjà Cloudinary :",
        skipped
    );

    console.log(
        "❌ Erreurs :",
        errors
    );

};


// ============================================================
// MAIN
// ============================================================

const main = async () => {

    try {

        console.log("");
        console.log("================================================");
        console.log("   MIGRATION DESTINATIONS VERS CLOUDINARY");
        console.log("================================================");
        console.log("");


        console.log(
            "Dossier uploads :",
            UPLOADS_DIR
        );

        console.log(
            "Dossier Cloudinary :",
            CLOUDINARY_FOLDER
        );


        // ====================================================
        // VÉRIFIER DOSSIER UPLOADS
        // ====================================================

        if (
            !fs.existsSync(UPLOADS_DIR)
        ) {

            throw new Error(
                `Dossier uploads introuvable : ${UPLOADS_DIR}`
            );

        }


        // ====================================================
        // VÉRIFIER VARIABLES CLOUDINARY
        // ====================================================

        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {

            throw new Error(
                "Variables Cloudinary manquantes dans .env"
            );

        }


        // ====================================================
        // LANCER LA MIGRATION
        // ====================================================

        await migrateDestinationImages();


        console.log("");
        console.log("================================================");
        console.log("       MIGRATION TERMINÉE");
        console.log("================================================");
        console.log("");

    }

    catch (error) {

        console.error("");
        console.error(
            "❌ ERREUR GÉNÉRALE :",
            error.message
        );
        console.error("");

    }

    finally {

        await db.end();

        console.log(
            "Connexion MySQL fermée."
        );

    }

};


// ============================================================
// LANCEMENT
// ============================================================

main();

