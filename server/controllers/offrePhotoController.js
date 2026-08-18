const db = require("../db");


// =====================================
// AJOUTER DES PHOTOS À UNE OFFRE
// =====================================

exports.ajouterPhotos = async (req, res) => {

    try {

        const id_offre = req.params.id;

        const fichiers = req.files;


        // =====================================
        // Vérifier les fichiers
        // =====================================

        if (!fichiers || fichiers.length === 0) {

            return res.status(400).json({

                message: "Aucune photo sélectionnée"

            });

        }


        // =====================================
        // Vérifier que l'offre existe
        // =====================================

        const [offres] = await db.query(

            `
            SELECT id_offre
            FROM offre
            WHERE id_offre = ?
            `,

            [id_offre]

        );


        if (offres.length === 0) {

            return res.status(404).json({

                message: "Offre introuvable"

            });

        }


        // =====================================
        // Ajouter les photos
        // =====================================

        const photosAjoutees = [];


        for (let i = 0; i < fichiers.length; i++) {

            const fichier = fichiers[i];

            const ordre = i + 1;


            const [result] = await db.query(

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
                    fichier.filename,
                    null,
                    ordre
                ]

            );


            photosAjoutees.push({

                id_photo: result.insertId,

                id_offre: id_offre,

                chemin_photo: fichier.filename,

                type_photo: null,

                ordre_affichage: ordre

            });

        }


        // =====================================
        // Réponse
        // =====================================

        res.status(201).json({

            message: "Photos ajoutées avec succès",

            photos: photosAjoutees

        });

    }

    catch (error) {

        console.log(
            "Erreur ajout photos offre :",
            error
        );


        res.status(500).json({

            message: "Erreur ajout photos",

            error: error.message

        });

    }

};



// =====================================
// RÉCUPÉRER LES PHOTOS D'UNE OFFRE
// =====================================

exports.getPhotos = async (req, res) => {

    try {

        const id_offre = req.params.id;


        const [photos] = await db.query(

            `
            SELECT

                id_photo,

                id_offre,

                chemin_photo,

                type_photo,

                ordre_affichage

            FROM offre_photo

            WHERE id_offre = ?

            ORDER BY ordre_affichage ASC, id_photo ASC

            `,

            [id_offre]

        );


        res.json(photos);

    }

    catch (error) {

        console.log(
            "Erreur récupération photos :",
            error
        );


        res.status(500).json({

            message: "Erreur récupération photos",

            error: error.message

        });

    }

};



// =====================================
// SUPPRIMER UNE PHOTO
// =====================================

exports.supprimerPhoto = async (req, res) => {

    try {

        const id_photo = req.params.idPhoto;


        const [result] = await db.query(

            `
            DELETE FROM offre_photo
            WHERE id_photo = ?
            `,

            [id_photo]

        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message: "Photo introuvable"

            });

        }


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