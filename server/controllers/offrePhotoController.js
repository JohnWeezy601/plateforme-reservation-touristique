const db = require("../db");

const cloudinary = require("../config/cloudinary");


// ============================================================
// ENVOYER UNE IMAGE VERS CLOUDINARY
// ============================================================

const uploadImageCloudinary = async (file) => {

    if (!file || !file.buffer) {

        throw new Error(
            "Le fichier image est invalide."
        );

    }


    return new Promise((resolve, reject) => {

        const uploadStream =
            cloudinary.uploader.upload_stream(

                {
                    folder:
                        "plateforme-touristique/offres",

                    resource_type:
                        "image"
                },

                (error, result) => {

                    if (error) {

                        reject(error);

                    } else {

                        resolve(result);

                    }

                }

            );


        uploadStream.end(
            file.buffer
        );

    });

};


// ============================================================
// SUPPRIMER UNE IMAGE CLOUDINARY
// ============================================================

const deleteImageCloudinary = async (imageUrl) => {

    try {

        if (!imageUrl) {

            return;

        }


        // Si ce n'est pas une URL Cloudinary,
        // on ne fait rien.

        if (
            !imageUrl.includes(
                "res.cloudinary.com"
            )
        ) {

            return;

        }


        const url =
            new URL(imageUrl);


        const pathname =
            url.pathname;


        const uploadIndex =
            pathname.indexOf(
                "/upload/"
            );


        if (
            uploadIndex === -1
        ) {

            return;

        }


        let publicId =
            pathname.substring(
                uploadIndex +
                "/upload/".length
            );


        // Supprimer la version Cloudinary
        // Exemple :
        // v123456789/

        publicId =
            publicId.replace(
                /^v\d+\//,
                ""
            );


        // Supprimer l'extension
        // .jpg / .png / .webp

        publicId =
            publicId.replace(
                /\.[^/.]+$/,
                ""
            );


        await cloudinary.uploader.destroy(

            publicId,

            {
                resource_type:
                    "image"
            }

        );


        console.log(
            "Photo Cloudinary supprimée :",
            publicId
        );

    }

    catch (error) {

        console.error(
            "Erreur suppression Cloudinary :",
            error.message
        );

    }

};


// ============================================================
// AJOUTER DES PHOTOS À UNE OFFRE
// ============================================================

exports.ajouterPhotos = async (req, res) => {

    try {

        console.log(
            "======================================"
        );

        console.log(
            "AJOUT PHOTOS OFFRE"
        );

        console.log(
            "======================================"
        );


        const id_offre =
            req.params.id;


        const fichiers =
            req.files;


        console.log(
            "ID offre :",
            id_offre
        );


        console.log(
            "Nombre de fichiers :",
            fichiers
                ? fichiers.length
                : 0
        );


        // ====================================================
        // VÉRIFIER LES FICHIERS
        // ====================================================

        if (
            !fichiers ||
            fichiers.length === 0
        ) {

            return res.status(400).json({

                message:
                    "Aucune photo sélectionnée"

            });

        }


        // ====================================================
        // VÉRIFIER QUE L'OFFRE EXISTE
        // ====================================================

        const [offres] =
            await db.query(

                `
                SELECT id_offre
                FROM offre
                WHERE id_offre = ?
                `,

                [id_offre]

            );


        if (
            offres.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Offre introuvable"

            });

        }


        // ====================================================
        // RÉCUPÉRER LE DERNIER ORDRE
        // ====================================================

        const [dernieresPhotos] =
            await db.query(

                `
                SELECT
                    MAX(ordre_affichage)
                    AS dernier_ordre

                FROM offre_photo

                WHERE id_offre = ?
                `,

                [id_offre]

            );


        let dernierOrdre =
            dernieresPhotos[0]
                .dernier_ordre || 0;


        // ====================================================
        // TABLEAU DES PHOTOS AJOUTÉES
        // ====================================================

        const photosAjoutees = [];


        // ====================================================
        // UPLOAD DES PHOTOS
        // ====================================================

        for (
            let i = 0;
            i < fichiers.length;
            i++
        ) {

            const fichier =
                fichiers[i];


            console.log(
                "Upload Cloudinary :",
                fichier.originalname
            );


            // -----------------------------------------------
            // ENVOYER VERS CLOUDINARY
            // -----------------------------------------------

            const cloudinaryResult =
                await uploadImageCloudinary(
                    fichier
                );


            const cheminPhoto =
                cloudinaryResult.secure_url;


            // -----------------------------------------------
            // ORDRE
            // -----------------------------------------------

            dernierOrdre++;


            // -----------------------------------------------
            // INSERTION MYSQL
            // -----------------------------------------------

            const [result] =
                await db.query(

                    `
                    INSERT INTO offre_photo

                    (
                        id_offre,
                        chemin_photo,
                        type_photo,
                        ordre_affichage
                    )

                    VALUES (?, ?, ?, ?)

                    `,

                    [

                        id_offre,

                        cheminPhoto,

                        null,

                        dernierOrdre

                    ]

                );


            // -----------------------------------------------
            // RÉPONSE
            // -----------------------------------------------

            photosAjoutees.push({

                id_photo:
                    result.insertId,

                id_offre:
                    id_offre,

                chemin_photo:
                    cheminPhoto,

                type_photo:
                    null,

                ordre_affichage:
                    dernierOrdre

            });


            console.log(
                "Photo ajoutée :",
                cheminPhoto
            );

        }


        // ====================================================
        // RÉPONSE
        // ====================================================

        return res.status(201).json({

            message:
                "Photos ajoutées avec succès",

            photos:
                photosAjoutees

        });

    }

    catch (error) {

        console.error(
            "Erreur ajout photos offre :",
            error
        );


        return res.status(500).json({

            message:
                "Erreur ajout photos",

            error:
                error.message

        });

    }

};


// ============================================================
// RÉCUPÉRER LES PHOTOS D'UNE OFFRE
// ============================================================

exports.getPhotos = async (req, res) => {

    try {

        const id_offre =
            req.params.id;


        const [photos] =
            await db.query(

                `

                SELECT

                    id_photo,

                    id_offre,

                    chemin_photo,

                    type_photo,

                    ordre_affichage

                FROM offre_photo

                WHERE id_offre = ?

                ORDER BY

                    ordre_affichage ASC,

                    id_photo ASC

                `,

                [id_offre]

            );


        return res.json(
            photos
        );

    }

    catch (error) {

        console.error(

            "Erreur récupération photos :",

            error

        );


        return res.status(500).json({

            message:
                "Erreur récupération photos",

            error:
                error.message

        });

    }

};


// ============================================================
// SUPPRIMER UNE PHOTO
// ============================================================

exports.supprimerPhoto = async (req, res) => {

    try {

        const id_photo =
            req.params.idPhoto;


        // ====================================================
        // RÉCUPÉRER LA PHOTO AVANT SUPPRESSION
        // ====================================================

        const [photos] =
            await db.query(

                `

                SELECT

                    id_photo,

                    chemin_photo

                FROM offre_photo

                WHERE id_photo = ?

                `,

                [id_photo]

            );


        if (
            photos.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Photo introuvable"

            });

        }


        const photo =
            photos[0];


        // ====================================================
        // SUPPRIMER DE MYSQL
        // ====================================================

        const [result] =
            await db.query(

                `

                DELETE FROM offre_photo

                WHERE id_photo = ?

                `,

                [id_photo]

            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Photo introuvable"

            });

        }


        // ====================================================
        // SUPPRIMER DE CLOUDINARY
        // ====================================================

        if (
            photo.chemin_photo
        ) {

            await deleteImageCloudinary(

                photo.chemin_photo

            );

        }


        // ====================================================
        // RÉPONSE
        // ====================================================

        return res.json({

            message:
                "Photo supprimée avec succès"

        });

    }

    catch (error) {

        console.error(

            "Erreur suppression photo :",

            error

        );


        return res.status(500).json({

            message:
                "Erreur suppression photo",

            error:
                error.message

        });

    }

};