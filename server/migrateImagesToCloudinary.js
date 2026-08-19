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
    "plateforme-touristique/offres";


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
// MIGRATION IMAGE PRINCIPALE DES OFFRES
// ============================================================

const migrateOfferImages = async () => {

    console.log("");
    console.log("==============================================");
    console.log(" MIGRATION DES IMAGES PRINCIPALES DES OFFRES");
    console.log("==============================================");
    console.log("");


    const [offres] = await db.query(`

        SELECT
            id_offre,
            image

        FROM offre

        WHERE image IS NOT NULL
        AND image <> ''

    `);


    console.log(
        `Nombre d'offres à vérifier : ${offres.length}`
    );


    let success = 0;
    let skipped = 0;
    let errors = 0;


    for (const offre of offres) {

        try {

            console.log("");
            console.log(
                `➡️ Offre ${offre.id_offre}`
            );

            console.log(
                "Image :",
                offre.image
            );


            // ------------------------------------------------
            // DÉJÀ CLOUDINARY
            // ------------------------------------------------

            if (
                isCloudinaryUrl(offre.image)
            ) {

                console.log(
                    "⏭️ Déjà sur Cloudinary"
                );

                skipped++;

                continue;

            }


            // ------------------------------------------------
            // CHEMIN LOCAL
            // ------------------------------------------------

            const filePath =
                path.join(
                    UPLOADS_DIR,
                    offre.image
                );


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


            // ------------------------------------------------
            // UPLOAD
            // ------------------------------------------------

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


            // ------------------------------------------------
            // UPDATE MYSQL
            // ------------------------------------------------

            await db.query(

                `

                UPDATE offre

                SET image = ?

                WHERE id_offre = ?

                `,

                [
                    cloudinaryUrl,
                    offre.id_offre
                ]

            );


            console.log(
                "✅ MySQL mis à jour"
            );


            success++;

        }

        catch (error) {

            console.error(
                `❌ Erreur offre ${offre.id_offre} :`,
                error.message
            );

            errors++;

        }

    }


    console.log("");
    console.log("----------------------------------------------");
    console.log("RÉSULTAT IMAGES PRINCIPALES");
    console.log("----------------------------------------------");

    console.log(
        "✅ Migrées :",
        success
    );

    console.log(
        "⏭️ Ignorées :",
        skipped
    );

    console.log(
        "❌ Erreurs :",
        errors
    );

};


// ============================================================
// MIGRATION PHOTOS DÉTAILLÉES
// ============================================================

const migrateOfferPhotos = async () => {

    console.log("");
    console.log("==============================================");
    console.log(" MIGRATION DES PHOTOS DÉTAILLÉES DES OFFRES");
    console.log("==============================================");
    console.log("");


    const [photos] = await db.query(`

        SELECT

            id_photo,
            id_offre,
            chemin_photo

        FROM offre_photo

        WHERE chemin_photo IS NOT NULL
        AND chemin_photo <> ''

        ORDER BY id_photo ASC

    `);


    console.log(
        `Nombre de photos à vérifier : ${photos.length}`
    );


    let success = 0;
    let skipped = 0;
    let errors = 0;


    for (const photo of photos) {

        try {

            console.log("");
            console.log(
                `➡️ Photo ${photo.id_photo}`
            );

            console.log(
                "Fichier :",
                photo.chemin_photo
            );


            // ------------------------------------------------
            // DÉJÀ CLOUDINARY
            // ------------------------------------------------

            if (
                isCloudinaryUrl(
                    photo.chemin_photo
                )
            ) {

                console.log(
                    "⏭️ Déjà sur Cloudinary"
                );

                skipped++;

                continue;

            }


            // ------------------------------------------------
            // CHEMIN LOCAL
            // ------------------------------------------------

            const filePath =
                path.join(
                    UPLOADS_DIR,
                    photo.chemin_photo
                );


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


            // ------------------------------------------------
            // UPLOAD
            // ------------------------------------------------

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


            // ------------------------------------------------
            // UPDATE MYSQL
            // ------------------------------------------------

            await db.query(

                `

                UPDATE offre_photo

                SET chemin_photo = ?

                WHERE id_photo = ?

                `,

                [
                    cloudinaryUrl,
                    photo.id_photo
                ]

            );


            console.log(
                "✅ MySQL mis à jour"
            );


            success++;

        }

        catch (error) {

            console.error(
                `❌ Erreur photo ${photo.id_photo} :`,
                error.message
            );

            errors++;

        }

    }


    console.log("");
    console.log("----------------------------------------------");
    console.log("RÉSULTAT PHOTOS DÉTAILLÉES");
    console.log("----------------------------------------------");

    console.log(
        "✅ Migrées :",
        success
    );

    console.log(
        "⏭️ Ignorées :",
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
        console.log("      MIGRATION DES IMAGES VERS CLOUDINARY");
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


        // Vérifier le dossier uploads

        if (
            !fs.existsSync(UPLOADS_DIR)
        ) {

            throw new Error(
                `Dossier uploads introuvable : ${UPLOADS_DIR}`
            );

        }


        // Vérifier Cloudinary

        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {

            throw new Error(
                "Variables Cloudinary manquantes dans .env"
            );

        }


        // ------------------------------------------------
        // MIGRATION
        // ------------------------------------------------

        await migrateOfferImages();

        await migrateOfferPhotos();


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