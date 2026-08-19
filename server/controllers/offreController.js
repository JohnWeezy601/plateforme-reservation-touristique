const db = require("../db");

const cloudinary = require("../config/cloudinary");


// ============================================================
// FONCTION : ENVOYER UNE IMAGE VERS CLOUDINARY
// ============================================================

const uploadImageCloudinary = async (file) => {

    if (!file || !file.buffer) {

        return null;

    }


    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(

            {
                folder: "plateforme-touristique/offres",

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


        uploadStream.end(file.buffer);

    });

};


// ============================================================
// FONCTION : SUPPRIMER UNE IMAGE CLOUDINARY
// ============================================================

const deleteImageCloudinary = async (imageUrl) => {

    try {

        if (!imageUrl) {

            return;

        }


        if (!imageUrl.includes("res.cloudinary.com")) {

            return;

        }


        const url = new URL(imageUrl);

        const pathname = url.pathname;


        const uploadIndex = pathname.indexOf("/upload/");


        if (uploadIndex === -1) {

            return;

        }


        let publicId = pathname.substring(

            uploadIndex + "/upload/".length

        );


        publicId = publicId.replace(

            /^v\d+\//,

            ""

        );


        publicId = publicId.replace(

            /\.[^/.]+$/,

            ""

        );


        await cloudinary.uploader.destroy(

            publicId,

            {

                resource_type: "image"

            }

        );


        console.log(

            "Image Cloudinary supprimée :",

            publicId

        );

    }

    catch (error) {

        console.error(

            "Erreur suppression image Cloudinary :",

            error.message

        );

    }

};


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

                message:
                    "Tous les champs obligatoires doivent être remplis."

            });

        }


        // ====================================================
        // CONVERSION VALEURS NUMÉRIQUES
        // ====================================================

        const prixNombre = Number(prix);

        const capaciteNombre = Number(capacite);

        const disponibiliteNombre =
            Number(disponibilite);


        // ====================================================
        // VALIDATION PRIX
        // ====================================================

        if (

            isNaN(prixNombre) ||

            prixNombre <= 0

        ) {

            return res.status(400).json({

                message:
                    "Le prix doit être supérieur à 0."

            });

        }


        // ====================================================
        // VALIDATION CAPACITÉ
        // ====================================================

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


        // ====================================================
        // VALIDATION DISPONIBILITÉ
        // ====================================================

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

        const dateDebut = new Date(date_debut);

        const dateFin = new Date(date_fin);


        if (

            isNaN(dateDebut.getTime()) ||

            isNaN(dateFin.getTime())

        ) {

            return res.status(400).json({

                message:
                    "Les dates fournies sont invalides."

            });

        }


        if (dateFin < dateDebut) {

            return res.status(400).json({

                message:
                    "La date de fin doit être après ou égale à la date de début."

            });

        }


        // ====================================================
        // VÉRIFIER PRESTATAIRE
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

                message:
                    "Prestataire introuvable."

            });

        }


        // ====================================================
        // VÉRIFIER DESTINATION
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

                message:
                    "Destination introuvable."

            });

        }


        // ====================================================
        // VÉRIFIER CATÉGORIE
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

                message:
                    "Catégorie introuvable."

            });

        }


        // ====================================================
        // UPLOAD IMAGE CLOUDINARY
        // ====================================================

        let image = null;


        if (req.file) {

            console.log(
                "Upload image vers Cloudinary..."
            );


            const result =
                await uploadImageCloudinary(
                    req.file
                );


            image = result.secure_url;


            console.log(
                "Image Cloudinary :",
                image
            );

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


        return res.status(201).json({

            message:
                "Offre ajoutée avec succès",

            id_offre:
                result.insertId,

            image:
                image

        });

    }

    catch (error) {

        console.error(
            "Erreur ajout offre :",
            error
        );


        return res.status(500).json({

            message:
                "Erreur ajout offre",

            error:
                error.message

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

        console.log(
            "ID :",
            req.params.id
        );

        console.log(
            "Body :",
            req.body
        );

        console.log(
            "Fichier :",
            req.file
        );


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
        // VÉRIFIER OFFRE
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

                message:
                    "Offre introuvable"

            });

        }


        const ancienneOffre =
            offres[0];


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


        const prixNombre =
            Number(prix);

        const capaciteNombre =
            Number(capacite);

        const disponibiliteNombre =
            Number(disponibilite);


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


        const dateDebut =
            new Date(date_debut);

        const dateFin =
            new Date(date_fin);


        if (

            isNaN(dateDebut.getTime()) ||

            isNaN(dateFin.getTime())

        ) {

            return res.status(400).json({

                message:
                    "Les dates fournies sont invalides."

            });

        }


        if (dateFin < dateDebut) {

            return res.status(400).json({

                message:
                    "La date de fin doit être après ou égale à la date de début."

            });

        }


        // ====================================================
        // IMAGE
        // ====================================================

        let image =
            ancienneOffre.image;


        let nouvelleImage = null;


        if (req.file) {

            console.log(
                "Nouvelle image détectée."
            );


            const result =
                await uploadImageCloudinary(
                    req.file
                );


            nouvelleImage =
                result.secure_url;


            image =
                nouvelleImage;


            console.log(
                "Nouvelle image Cloudinary :",
                image
            );

        }


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


        const [result] =
            await db.query(

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


        // ====================================================
        // SUPPRIMER ANCIENNE IMAGE
        // ====================================================

        if (

            req.file &&

            ancienneOffre.image &&

            ancienneOffre.image !== image

        ) {

            await deleteImageCloudinary(
                ancienneOffre.image
            );

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

        const id =
            req.params.id;


        console.log(
            "Suppression offre :",
            id
        );


        const [offres] =
            await db.query(

                `
                SELECT *
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


        const offre =
            offres[0];


        await db.query(

            `
            DELETE FROM offre_photo
            WHERE id_offre = ?
            `,

            [id]

        );


        const [result] =
            await db.query(

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


        if (offre.image) {

            await deleteImageCloudinary(
                offre.image
            );

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

        const [offres] =
            await db.query(

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


        // ====================================================
        // RÉCUPÉRATION DES IMAGES
        // ====================================================
        // IMPORTANT :
        // o.image contient déjà l'URL Cloudinary complète.
        // On la renvoie directement sans /uploads/.
        // ====================================================

        const offresAvecImages =
            offres.map((offre) => ({

                ...offre,

                image:
                    offre.image || null

            }));


        return res.json(
            offresAvecImages
        );

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
// AVEC SES PHOTOS DÉTAILLÉES
// ============================================================

exports.getOffreById = async (req, res) => {

    try {

        const id =
            req.params.id;


        // ====================================================
        // OFFRE
        // ====================================================

        const [offres] =
            await db.query(

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


        if (offres.length === 0) {

            return res.status(404).json({

                message:
                    "Offre introuvable"

            });

        }


        const offre =
            offres[0];


        // ====================================================
        // PHOTOS DÉTAILLÉES
        // ====================================================

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

                [id]

            );


        // ====================================================
        // RÉCUPÉRATION DES URLS DES PHOTOS
        // ====================================================
        // chemin_photo contient déjà l'URL Cloudinary.
        // On ne rajoute donc jamais /uploads/.
        // ====================================================

        offre.image =
            offre.image || null;


        offre.photos =
            photos.map((photo) => ({

                ...photo,

                chemin_photo:
                    photo.chemin_photo || null

            }));


        // ====================================================
        // RÉPONSE
        // ====================================================

        return res.json(
            offre
        );

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