const db = require("../db");


// ============================================================
// AJOUTER UNE OFFRE
// ============================================================

exports.createOffre = async (req, res) => {

    try {

        console.log("======================================");
        console.log("REQUÊTE AJOUT OFFRE");
        console.log("======================================");

        console.log("Body :", req.body);
        console.log("Fichier image :", req.file);


        const {
            id_prestataire,
            id_destination,
            id_categorie,
            titre,
            description,
            prix,
            capacite,
            disponibilite,
            date_debut,
            date_fin
        } = req.body;


        // ====================================================
        // VALIDATION
        // ====================================================

        if (
            !id_prestataire ||
            !id_destination ||
            !id_categorie ||
            !titre ||
            !description ||
            prix === undefined ||
            prix === "" ||
            capacite === undefined ||
            capacite === "" ||
            disponibilite === undefined ||
            disponibilite === "" ||
            !date_debut ||
            !date_fin
        ) {

            return res.status(400).json({

                message: "Tous les champs obligatoires doivent être remplis."

            });

        }


        // ====================================================
        // CONVERSION DES VALEURS NUMERIQUES
        // ====================================================

        const prixNombre = Number(prix);
        const capaciteNombre = Number(capacite);
        const disponibiliteNombre = Number(disponibilite);


        if (
            isNaN(prixNombre) ||
            prixNombre <= 0
        ) {

            return res.status(400).json({

                message: "Le prix doit être supérieur à 0."

            });

        }


        if (
            isNaN(capaciteNombre) ||
            capaciteNombre <= 0 ||
            !Number.isInteger(capaciteNombre)
        ) {

            return res.status(400).json({

                message: "La capacité doit être un entier supérieur à 0."

            });

        }


        if (
            isNaN(disponibiliteNombre) ||
            disponibiliteNombre < 0 ||
            !Number.isInteger(disponibiliteNombre)
        ) {

            return res.status(400).json({

                message:
                    "La disponibilité doit être un entier positif ou égal à 0."

            });

        }


        if (
            disponibiliteNombre >
            capaciteNombre
        ) {

            return res.status(400).json({

                message:
                    "La disponibilité ne peut pas dépasser la capacité."

            });

        }


        // ====================================================
        // VALIDATION DES DATES
        // ====================================================

        if (
            new Date(date_fin) <
            new Date(date_debut)
        ) {

            return res.status(400).json({

                message:
                    "La date de fin doit être après ou égale à la date de début."

            });

        }


        // ====================================================
        // IMAGE PRINCIPALE
        // ====================================================

        const image = req.file
            ? req.file.filename
            : null;


        console.log(
            "Image principale :",
            image
        );


        // ====================================================
        // VERIFIER PRESTATAIRE
        // ====================================================

        const [prestataires] = await db.query(

            `
            SELECT id_prestataire
            FROM prestataire
            WHERE id_prestataire = ?
            `,

            [id_prestataire]

        );


        if (prestataires.length === 0) {

            return res.status(400).json({

                message: "Prestataire introuvable."

            });

        }


        // ====================================================
        // VERIFIER DESTINATION
        // ====================================================

        const [destinations] = await db.query(

            `
            SELECT id_destination
            FROM destination
            WHERE id_destination = ?
            `,

            [id_destination]

        );


        if (destinations.length === 0) {

            return res.status(400).json({

                message: "Destination introuvable."

            });

        }


        // ====================================================
        // VERIFIER CATEGORIE
        // ====================================================

        const [categories] = await db.query(

            `
            SELECT id_categorie
            FROM categorie
            WHERE id_categorie = ?
            `,

            [id_categorie]

        );


        if (categories.length === 0) {

            return res.status(400).json({

                message: "Catégorie introuvable."

            });

        }


        // ====================================================
        // INSERTION OFFRE
        // ====================================================

        const sql = `

            INSERT INTO offre

            (
                id_prestataire,
                id_destination,
                id_categorie,
                titre,
                description,
                prix,
                capacite,
                disponibilite,
                date_debut,
                date_fin,
                image
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `;


        const [result] = await db.query(

            sql,

            [

                id_prestataire,
                id_destination,
                id_categorie,
                titre.trim(),
                description.trim(),
                prixNombre,
                capaciteNombre,
                disponibiliteNombre,
                date_debut,
                date_fin,
                image

            ]

        );


        console.log(
            "Offre créée avec ID :",
            result.insertId
        );


        // ====================================================
        // REPONSE
        // ====================================================

        return res.status(201).json({

            message: "Offre ajoutée avec succès",

            id_offre: result.insertId,

            image: image

        });


    }

    catch (error) {

        console.error(
            "Erreur ajout offre :",
            error
        );


        return res.status(500).json({

            message: "Erreur ajout offre",

            error: error.message

        });

    }

};



// ============================================================
// MODIFIER UNE OFFRE
// ============================================================

exports.updateOffre = async (req, res) => {

    try {

        console.log("======================================");
        console.log("REQUÊTE MODIFICATION OFFRE");
        console.log("======================================");

        console.log("ID :", req.params.id);
        console.log("Body :", req.body);
        console.log("Fichier :", req.file);


        const id = req.params.id;


        const {
            id_prestataire,
            id_destination,
            id_categorie,
            titre,
            description,
            prix,
            capacite,
            disponibilite,
            date_debut,
            date_fin
        } = req.body;


        // ====================================================
        // VERIFIER OFFRE
        // ====================================================

        const [offres] = await db.query(

            `
            SELECT *
            FROM offre
            WHERE id_offre = ?
            `,

            [id]

        );


        if (offres.length === 0) {

            return res.status(404).json({

                message: "Offre introuvable"

            });

        }


        const ancienneOffre = offres[0];


        // ====================================================
        // VALIDATION
        // ====================================================

        if (
            !id_prestataire ||
            !id_destination ||
            !id_categorie ||
            !titre ||
            !description ||
            prix === undefined ||
            prix === "" ||
            capacite === undefined ||
            capacite === "" ||
            disponibilite === undefined ||
            disponibilite === "" ||
            !date_debut ||
            !date_fin
        ) {

            return res.status(400).json({

                message:
                    "Tous les champs obligatoires doivent être remplis."

            });

        }


        const prixNombre = Number(prix);
        const capaciteNombre = Number(capacite);
        const disponibiliteNombre = Number(disponibilite);


        if (
            isNaN(prixNombre) ||
            prixNombre <= 0
        ) {

            return res.status(400).json({

                message:
                    "Le prix doit être supérieur à 0."

            });

        }


        if (
            isNaN(capaciteNombre) ||
            capaciteNombre <= 0 ||
            !Number.isInteger(capaciteNombre)
        ) {

            return res.status(400).json({

                message:
                    "La capacité doit être un entier supérieur à 0."

            });

        }


        if (
            isNaN(disponibiliteNombre) ||
            disponibiliteNombre < 0 ||
            !Number.isInteger(disponibiliteNombre)
        ) {

            return res.status(400).json({

                message:
                    "La disponibilité doit être un entier positif ou égal à 0."

            });

        }


        if (
            disponibiliteNombre >
            capaciteNombre
        ) {

            return res.status(400).json({

                message:
                    "La disponibilité ne peut pas dépasser la capacité."

            });

        }


        // ====================================================
        // VALIDATION DATES
        // ====================================================

        if (
            new Date(date_fin) <
            new Date(date_debut)
        ) {

            return res.status(400).json({

                message:
                    "La date de fin doit être après ou égale à la date de début."

            });

        }


        // ====================================================
        // IMAGE
        // ====================================================

        let image = ancienneOffre.image;


        if (req.file) {

            image = req.file.filename;

        }


        console.log(
            "Image conservée/nouvelle :",
            image
        );


        // ====================================================
        // UPDATE
        // ====================================================

        const sql = `

            UPDATE offre

            SET

                id_prestataire = ?,

                id_destination = ?,

                id_categorie = ?,

                titre = ?,

                description = ?,

                prix = ?,

                capacite = ?,

                disponibilite = ?,

                date_debut = ?,

                date_fin = ?,

                image = ?

            WHERE id_offre = ?

        `;


        const [result] = await db.query(

            sql,

            [

                id_prestataire,
                id_destination,
                id_categorie,
                titre.trim(),
                description.trim(),
                prixNombre,
                capaciteNombre,
                disponibiliteNombre,
                date_debut,
                date_fin,
                image,
                id

            ]

        );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Aucune modification effectuée."

            });

        }


        console.log(
            "Offre modifiée :",
            id
        );


        return res.json({

            message:
                "Offre modifiée avec succès",

            id_offre:
                id,

            image:
                image

        });


    }

    catch (error) {

        console.error(

            "Erreur modification offre :",

            error

        );


        return res.status(500).json({

            message:
                "Erreur modification offre",

            error:
                error.message

        });

    }

};



// ============================================================
// SUPPRIMER UNE OFFRE
// ============================================================

exports.deleteOffre = async (req, res) => {

    try {

        const id = req.params.id;


        console.log(
            "Suppression offre :",
            id
        );


        // ====================================================
        // VERIFIER OFFRE
        // ====================================================

        const [offres] = await db.query(

            `
            SELECT id_offre
            FROM offre
            WHERE id_offre = ?
            `,

            [id]

        );


        if (offres.length === 0) {

            return res.status(404).json({

                message:
                    "Offre introuvable"

            });

        }


        // ====================================================
        // SUPPRIMER PHOTOS DETAILS
        // ====================================================

        await db.query(

            `
            DELETE FROM offre_photo
            WHERE id_offre = ?
            `,

            [id]

        );


        // ====================================================
        // SUPPRIMER OFFRE
        // ====================================================

        const [result] = await db.query(

            `
            DELETE FROM offre
            WHERE id_offre = ?
            `,

            [id]

        );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Offre introuvable"

            });

        }


        return res.json({

            message:
                "Offre supprimée avec succès"

        });


    }

    catch (error) {

        console.error(

            "Erreur suppression offre :",

            error

        );


        return res.status(500).json({

            message:
                "Erreur suppression offre",

            error:
                error.message

        });

    }

};



// ============================================================
// AFFICHER TOUTES LES OFFRES
// ============================================================

exports.getOffres = async (req, res) => {

    try {

        const [offres] = await db.query(

            `

            SELECT

                o.*,

                d.nom AS destination,

                c.nom AS categorie,

                p.nom_entreprise AS prestataire

            FROM offre o

            LEFT JOIN destination d

                ON o.id_destination =
                   d.id_destination

            LEFT JOIN categorie c

                ON o.id_categorie =
                   c.id_categorie

            LEFT JOIN prestataire p

                ON o.id_prestataire =
                   p.id_prestataire

            ORDER BY
                o.id_offre DESC

            `

        );


        return res.json(offres);

    }

    catch (error) {

        console.error(

            "Erreur récupération offres :",

            error

        );


        return res.status(500).json({

            message:
                "Erreur récupération offres",

            error:
                error.message

        });

    }

};



// ============================================================
// AFFICHER UNE OFFRE PAR ID
// AVEC SES PHOTOS DETAILLEES
// ============================================================

exports.getOffreById = async (req, res) => {

    try {

        const id = req.params.id;


        // ====================================================
        // OFFRE
        // ====================================================

        const [offres] = await db.query(

            `

            SELECT

                o.*,

                d.nom AS destination,

                c.nom AS categorie,

                p.nom_entreprise AS prestataire

            FROM offre o

            LEFT JOIN destination d

                ON o.id_destination =
                   d.id_destination

            LEFT JOIN categorie c

                ON o.id_categorie =
                   c.id_categorie

            LEFT JOIN prestataire p

                ON o.id_prestataire =
                   p.id_prestataire

            WHERE o.id_offre = ?

            `,

            [id]

        );


        // ====================================================
        // OFFRE INTROUVABLE
        // ====================================================

        if (
            offres.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Offre introuvable"

            });

        }


        const offre = offres[0];


        // ====================================================
        // PHOTOS DETAILLEES
        // ====================================================

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

            ORDER BY

                ordre_affichage ASC,

                id_photo ASC

            `,

            [id]

        );


        // ====================================================
        // AJOUTER PHOTOS À L'OBJET OFFRE
        // ====================================================

        offre.photos = photos;


        // ====================================================
        // REPONSE
        // ====================================================

        return res.json(offre);

    }

    catch (error) {

        console.error(

            "Erreur détail offre :",

            error

        );


        return res.status(500).json({

            message:
                "Erreur récupération offre",

            error:
                error.message

        });

    }

};