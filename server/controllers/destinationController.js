const db = require("../db");

// =========================================================
// Ajouter destination
// =========================================================

exports.createDestination = async (req, res) => {

    try {

        const {
            nom,
            region,
            pays,
            description,
            latitude,
            longitude
        } = req.body;

        // =====================================================
        // IMAGE
        // =====================================================

        const image = req.file
            ? req.file.path
            : null;

        // =====================================================
        // INSERT
        // =====================================================

        const sql = `

            INSERT INTO destination
            (
                nom,
                region,
                pays,
                description,
                image,
                latitude,
                longitude
            )

            VALUES (?, ?, ?, ?, ?, ?, ?)

        `;

        const [result] = await db.query(

            sql,

            [
                nom,
                region,
                pays,
                description,
                image,
                latitude || null,
                longitude || null
            ]

        );

        // =====================================================
        // RÉPONSE
        // =====================================================

        res.status(201).json({

            message:
                "Destination ajoutée avec succès",

            id:
                result.insertId

        });

    }

    catch (error) {

        console.log(
            "Erreur ajout destination :",
            error
        );

        res.status(500).json({

            message:
                "Erreur ajout destination",

            error:
                error.message

        });

    }

};



// =========================================================
// Afficher toutes les destinations
// =========================================================

exports.getDestinations = async (req, res) => {

    try {

        const [destinations] = await db.query(`

            SELECT *

            FROM destination

            ORDER BY id_destination DESC

        `);

        res.json(destinations);

    }

    catch (error) {

        console.log(
            "Erreur récupération destinations :",
            error
        );

        res.status(500).json({

            message:
                "Erreur récupération destinations"

        });

    }

};



// =========================================================
// Afficher une destination par ID
// =========================================================

exports.getDestinationById = async (req, res) => {

    try {

        const id = req.params.id;

        const [destination] = await db.query(

            `

            SELECT *

            FROM destination

            WHERE id_destination = ?

            `,

            [id]

        );

        if (destination.length === 0) {

            return res.status(404).json({

                message:
                    "Destination introuvable"

            });

        }

        res.json(
            destination[0]
        );

    }

    catch (error) {

        console.log(
            "Erreur détail destination :",
            error
        );

        res.status(500).json({

            message:
                "Erreur serveur"

        });

    }

};



// =========================================================
// Modifier destination
// =========================================================

exports.updateDestination = async (req, res) => {

    try {

        const id = req.params.id;

        const {
            nom,
            region,
            pays,
            description,
            oldImage,
            latitude,
            longitude
        } = req.body;

        // =====================================================
        // IMAGE
        // =====================================================
        //
        // Si une nouvelle image est envoyée :
        // req.file.path = URL Cloudinary
        //
        // Sinon :
        // on conserve l'ancienne image.
        //
        // =====================================================

        let image =
            oldImage || null;

        if (req.file) {

            image =
                req.file.path;

        }

        // =====================================================
        // UPDATE
        // =====================================================

        const [result] = await db.query(

            `

            UPDATE destination

            SET

                nom = ?,
                region = ?,
                pays = ?,
                description = ?,
                image = ?,
                latitude = ?,
                longitude = ?

            WHERE id_destination = ?

            `,

            [

                nom,

                region,

                pays,

                description,

                image,

                latitude || null,

                longitude || null,

                id

            ]

        );

        // =====================================================
        // DESTINATION INTROUVABLE
        // =====================================================

        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Destination introuvable"

            });

        }

        // =====================================================
        // RÉPONSE
        // =====================================================

        res.json({

            message:
                "Destination modifiée avec succès"

        });

    }

    catch (error) {

        console.log(
            "Erreur modification destination :",
            error
        );

        res.status(500).json({

            message:
                "Erreur modification destination",

            error:
                error.message

        });

    }

};



// =========================================================
// Supprimer destination
// =========================================================

exports.deleteDestination = async (req, res) => {

    try {

        const id = req.params.id;

        // =====================================================
        // RÉCUPÉRER L'IMAGE
        // =====================================================

        const [rows] = await db.query(

            `

            SELECT image

            FROM destination

            WHERE id_destination = ?

            `,

            [id]

        );

        if (
            rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Destination introuvable"

            });

        }

        const image =
            rows[0].image;

        // =====================================================
        // SUPPRIMER DESTINATION
        // =====================================================

        const [result] = await db.query(

            `

            DELETE FROM destination

            WHERE id_destination = ?

            `,

            [id]

        );

        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Suppression impossible"

            });

        }

        // =====================================================
        // CLOUDINARY
        // =====================================================
        //
        // IMPORTANT :
        // Avec Cloudinary, l'image ne doit plus être supprimée
        // avec fs.unlinkSync().
        //
        // Si ton middleware Cloudinary utilise un public_id,
        // on pourra supprimer également l'image Cloudinary.
        //
        // Pour l'instant on ne touche pas à la logique de
        // suppression de la destination.
        //
        // =====================================================

        res.json({

            message:
                "Destination supprimée avec succès"

        });

    }

    catch (error) {

        console.log(
            "Erreur suppression destination :",
            error
        );

        res.status(500).json({

            message:
                "Erreur suppression destination",

            error:
                error.message

        });

    }

};



// =========================================================
// Afficher les offres d'une destination
// =========================================================

exports.getOffresByDestination = async (req, res) => {

    const id =
        req.params.id;

    try {

        const [offres] = await db.query(`

            SELECT

                o.*,

                p.nom_entreprise AS prestataire,

                c.nom AS categorie

            FROM offre o

            LEFT JOIN prestataire p

                ON o.id_prestataire =
                   p.id_prestataire

            LEFT JOIN categorie c

                ON o.id_categorie =
                   c.id_categorie

            WHERE o.id_destination = ?

            ORDER BY o.date_debut ASC

        `, [id]);

        res.json(
            offres
        );

    }

    catch (error) {

        console.log(
            "Erreur récupération offres destination :",
            error
        );

        res.status(500).json({

            message:
                "Erreur récupération offres"

        });

    }

};