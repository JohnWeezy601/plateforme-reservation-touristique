const db = require("../db");
const cloudinary = require("../config/cloudinary");

// =======================================
// Ajouter plusieurs photos à un avis
// =======================================

exports.ajouterPhotosAvis = async (req, res) => {

    try {

        const { id_avis } = req.body;

        // ==============================
        // Vérification ID avis
        // ==============================

        if (!id_avis) {

            return res.status(400).json({
                message: "id_avis manquant"
            });

        }

        // ==============================
        // Vérifier que l'avis existe
        // ==============================

        const [avis] = await db.query(
            `
            SELECT id_avis
            FROM avis
            WHERE id_avis=?
            `,
            [id_avis]
        );

        if (avis.length === 0) {

            return res.status(404).json({
                message: "Avis introuvable",
                id_avis: id_avis
            });

        }

        // ==============================
        // Vérifier les fichiers
        // ==============================

        if (!req.files || req.files.length === 0) {

            return res.status(400).json({
                message: "Aucune photo envoyée"
            });

        }

        const photosAjoutees = [];

        // ==============================
        // Upload Cloudinary
        // ==============================

        for (const file of req.files) {

            const result = await new Promise(
                (resolve, reject) => {

                    const stream =
                        cloudinary.uploader.upload_stream(

                            {
                                folder:
                                "plateforme-reservation-touristique/avis"
                            },

                            (error, result) => {

                                if (error) {

                                    reject(error);

                                }
                                else {

                                    resolve(result);

                                }

                            }

                        );

                    stream.end(file.buffer);

                }
            );

            // ==============================
            // Enregistrer dans MySQL
            // ==============================

            await db.query(
                `
                INSERT INTO avis_photo
                (
                    id_avis,
                    photo,
                    public_id
                )
                VALUES(?,?,?)
                `,
                [
                    id_avis,
                    result.secure_url,
                    result.public_id
                ]
            );

            photosAjoutees.push({
                photo: result.secure_url,
                public_id: result.public_id
            });

        }

        // ==============================
        // Réponse
        // ==============================

        res.status(201).json({

            message: "Photos ajoutées avec succès",

            id_avis: Number(id_avis),

            photos: photosAjoutees

        });

    }
    catch (error) {

        console.log(
            "Erreur Cloudinary / ajout photos :",
            error
        );

        res.status(500).json({

            message: "Erreur ajout photos",

            error: error.message

        });

    }

};



// =======================================
// Récupérer les photos d'un avis
// =======================================

exports.getPhotosAvis = async (req, res) => {

    try {

        const id_avis = req.params.id;

        const [photos] = await db.query(
            `
            SELECT
                id_photo,
                id_avis,
                photo,
                public_id,
                date_ajout
            FROM avis_photo
            WHERE id_avis=?
            ORDER BY date_ajout ASC
            `,
            [id_avis]
        );

        res.json(photos);

    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            message: "Erreur récupération photos",

            error: error.message

        });

    }

};



// =======================================
// Supprimer une photo
// =======================================

exports.supprimerPhotoAvis = async (req, res) => {

    try {

        const id_photo = req.params.id;

        // ==============================
        // Récupérer la photo
        // ==============================

        const [photos] = await db.query(
            `
            SELECT
                id_photo,
                public_id
            FROM avis_photo
            WHERE id_photo=?
            `,
            [id_photo]
        );

        if (photos.length === 0) {

            return res.status(404).json({

                message: "Photo introuvable"

            });

        }

        const photo = photos[0];

        // ==============================
        // Supprimer Cloudinary
        // ==============================

        if (photo.public_id) {

            await cloudinary.uploader.destroy(
                photo.public_id
            );

        }

        // ==============================
        // Supprimer MySQL
        // ==============================

        await db.query(
            `
            DELETE FROM avis_photo
            WHERE id_photo=?
            `,
            [id_photo]
        );

        res.json({

            message: "Photo supprimée avec succès"

        });

    }
    catch (error) {

        console.log(
            "Erreur suppression photo :",
            error
        );

        res.status(500).json({

            message: "Erreur suppression photo",

            error: error.message

        });

    }

};