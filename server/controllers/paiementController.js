const db = require("../db");
const cloudinary = require("cloudinary").v2;


// ==========================================
// CONFIGURATION CLOUDINARY
// ==========================================

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET

});


// ==========================================
// UPLOAD BUFFER VERS CLOUDINARY
// ==========================================

const uploadBufferToCloudinary = (
    buffer,
    originalName
) => {

    return new Promise((resolve, reject) => {

        const extension = originalName
            .split(".")
            .pop()
            .toLowerCase();


        // PDF
        const resourceType =
            extension === "pdf"
                ? "raw"
                : "image";


        const stream =
            cloudinary.uploader.upload_stream(

                {
                    folder: "plateforme-touristique/paiements",

                    resource_type: resourceType,

                    use_filename: true,

                    unique_filename: true,

                    type: "upload"
                },

                (error, result) => {

                    if (error) {

                        reject(error);

                    } else {

                        resolve(result);

                    }

                }

            );


        stream.end(buffer);

    });

};


// ==========================================
// AJOUTER PAIEMENT
// + PREUVE CLOUDINARY
// + NOTIFICATION ADMIN
// ==========================================

exports.createPaiement = async (req, res) => {

    try {

        const {

            id_reservation,

            montant,

            mode_paiement,

            operateur,

            numero_destinataire,

            nom_destinataire,

            banque,

            compte,

            nom_compte,

            iban_rib

        } = req.body;


        console.log(
            "=================================="
        );

        console.log(
            "DONNÉES PAIEMENT REÇUES"
        );

        console.log(
            "Body :",
            req.body
        );

        console.log(
            "Fichier :",
            req.file
                ? {
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                }
                : null
        );


        // ==================================
        // VALIDATION CHAMPS OBLIGATOIRES
        // ==================================

        if (
            !id_reservation ||
            !montant ||
            !mode_paiement
        ) {

            return res.status(400).json({

                message:
                    "Les champs obligatoires sont manquants."

            });

        }


        // ==================================
        // VALIDATION MONTANT
        // ==================================

        if (
            Number(montant) <= 0
        ) {

            return res.status(400).json({

                message:
                    "Le montant du paiement est invalide."

            });

        }


        // ==================================
        // PREUVE OBLIGATOIRE
        // MOBILE MONEY / VIREMENT
        // ==================================

        if (

            (
                mode_paiement === "Mobile Money" ||
                mode_paiement === "Virement"
            )

            &&

            !req.file

        ) {

            return res.status(400).json({

                message:
                    "Une preuve de paiement est obligatoire pour ce mode de paiement."

            });

        }


        // ==================================
        // VALIDATION MOBILE MONEY
        // ==================================

        if (
            mode_paiement === "Mobile Money"
        ) {

            if (!operateur) {

                return res.status(400).json({

                    message:
                        "L'opérateur Mobile Money est obligatoire."

                });

            }


            if (!numero_destinataire) {

                return res.status(400).json({

                    message:
                        "Le numéro destinataire est obligatoire."

                });

            }


            if (!nom_destinataire) {

                return res.status(400).json({

                    message:
                        "Le nom du bénéficiaire est obligatoire."

                });

            }

        }


        // ==================================
        // VALIDATION VIREMENT
        // ==================================

        if (
            mode_paiement === "Virement"
        ) {

            if (!banque) {

                return res.status(400).json({

                    message:
                        "La banque est obligatoire."

                });

            }


            if (!compte) {

                return res.status(400).json({

                    message:
                        "Le numéro de compte est obligatoire."

                });

            }


            if (!nom_compte) {

                return res.status(400).json({

                    message:
                        "Le titulaire du compte est obligatoire."

                });

            }

        }


        // ==================================
        // UPLOAD PREUVE CLOUDINARY
        // ==================================

        let preuve = null;

        let preuvePublicId = null;


        if (req.file) {

            console.log(
                "Upload de la preuve vers Cloudinary..."
            );


            const cloudinaryResult =
                await uploadBufferToCloudinary(

                    req.file.buffer,

                    req.file.originalname

                );


            preuve =
                cloudinaryResult.secure_url;


            preuvePublicId =
                cloudinaryResult.public_id;


            console.log(
                "Preuve Cloudinary :",
                preuve
            );

        }


        // ==================================
        // CRÉER PAIEMENT
        // ==================================

        const sql = `

            INSERT INTO paiement

            (
                id_reservation,
                montant,
                mode_paiement,
                statut,
                preuve
            )

            VALUES (?, ?, ?, ?, ?)

        `;


        const [result] = await db.query(

            sql,

            [

                id_reservation,

                montant,

                mode_paiement,

                "En attente",

                preuve

            ]

        );


        const idPaiement =
            result.insertId;


        console.log(
            "Paiement créé :",
            idPaiement
        );


        // ==================================
        // RÉCUPÉRER RÉSERVATION + CLIENT
        // ==================================

        const [reservation] =
            await db.query(

                `

                SELECT

                    r.id_reservation,

                    r.id_utilisateur,

                    u.nom,

                    u.prenom,

                    o.titre

                FROM reservation r

                INNER JOIN utilisateur u

                    ON r.id_utilisateur =
                       u.id_utilisateur

                INNER JOIN offre o

                    ON r.id_offre =
                       o.id_offre

                WHERE r.id_reservation = ?

                LIMIT 1

                `,

                [id_reservation]

            );


        // ==================================
        // NOTIFICATION ADMIN
        // ==================================

        if (
            reservation.length > 0
        ) {

            const client =
                reservation[0];


            const [administrateurs] =
                await db.query(

                    `

                    SELECT id_utilisateur

                    FROM utilisateur

                    WHERE role = 'Administrateur'

                    `

                );


            console.log(
                "Administrateurs trouvés :",
                administrateurs.length
            );


            for (
                const admin
                of administrateurs
            ) {

                await db.query(

                    `

                    INSERT INTO notification

                    (
                        id_utilisateur,
                        titre,
                        message,
                        type,
                        lien
                    )

                    VALUES (?, ?, ?, ?, ?)

                    `,

                    [

                        admin.id_utilisateur,

                        "Nouveau paiement",

                        `Le client ${client.prenom} ${client.nom} vient d'effectuer un paiement de ${Number(montant).toLocaleString("fr-FR")} Ar pour la réservation #${id_reservation}. Mode : ${mode_paiement}. Paiement en attente de validation.`,

                        "Paiement",

                        "/paiements"

                    ]

                );

            }


            console.log(
                "Notification(s) administrateur créée(s)."
            );

        }


        // ==================================
        // RÉPONSE
        // ==================================

        res.status(201).json({

            message:
                "Paiement envoyé avec succès.",

            id_paiement:
                idPaiement,

            preuve:
                preuve,

            preuve_public_id:
                preuvePublicId,

            statut:
                "En attente"

        });


    }

    catch (error) {

        console.error(
            "Erreur ajout paiement :",
            error
        );


        res.status(500).json({

            message:
                "Erreur ajout paiement.",

            error:
                error.message

        });

    }

};



// ==========================================
// AFFICHER PAIEMENTS
// ==========================================

exports.getPaiements = async (req, res) => {

    try {

        const [paiements] =
            await db.query(`

                SELECT

                    p.*,

                    r.id_reservation,

                    r.date_reservation,

                    r.date_debut_sejour,

                    r.date_fin_sejour,

                    r.nombre_personnes,

                    r.montant_total,

                    r.statut AS statut_reservation,

                    u.id_utilisateur,

                    u.nom,

                    u.prenom,

                    u.email,

                    o.id_offre,

                    o.titre,

                    o.prix,

                    o.image,

                    d.nom AS destination

                FROM paiement p

                INNER JOIN reservation r

                    ON p.id_reservation =
                       r.id_reservation

                INNER JOIN utilisateur u

                    ON r.id_utilisateur =
                       u.id_utilisateur

                INNER JOIN offre o

                    ON r.id_offre =
                       o.id_offre

                INNER JOIN destination d

                    ON o.id_destination =
                       d.id_destination

                ORDER BY
                    p.id_paiement DESC

            `);


        res.json(paiements);

    }

    catch (error) {

        console.error(
            "Erreur récupération paiements :",
            error
        );


        res.status(500).json({

            message:
                "Erreur récupération paiements.",

            error:
                error.message

        });

    }

};



// ==========================================
// MODIFIER PAIEMENT
// ==========================================

exports.updatePaiement = async (req, res) => {

    try {

        const id =
            req.params.id;


        const {
            statut
        } = req.body;


        if (!statut) {

            return res.status(400).json({

                message:
                    "Le statut du paiement est obligatoire."

            });

        }


        // ==================================
        // MODIFIER STATUT
        // ==================================

        const [result] =
            await db.query(

                `

                UPDATE paiement

                SET statut = ?

                WHERE id_paiement = ?

                `,

                [

                    statut,

                    id

                ]

            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Paiement introuvable."

            });

        }


        // ==================================
        // RÉCUPÉRER CLIENT
        // ==================================

        const [paiement] =
            await db.query(

                `

                SELECT

                    p.id_paiement,

                    p.statut,

                    r.id_reservation,

                    r.id_utilisateur

                FROM paiement p

                INNER JOIN reservation r

                    ON p.id_reservation =
                       r.id_reservation

                WHERE p.id_paiement = ?

                `,

                [id]

            );


        if (
            paiement.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Paiement ou réservation introuvable."

            });

        }


        const idUtilisateur =
            paiement[0].id_utilisateur;


        // ==================================
        // NORMALISATION
        // ==================================

        const statutNormalise =
            String(statut)
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );


        // ==================================
        // PAIEMENT VALIDÉ
        // ==================================

        if (

            statutNormalise === "paye" ||

            statutNormalise === "valide"

        ) {

            const [
                notificationExistante
            ] = await db.query(

                `

                SELECT id_notification

                FROM notification

                WHERE id_utilisateur = ?

                AND type = 'Paiement'

                AND titre = 'Paiement validé'

                AND message LIKE ?

                LIMIT 1

                `,

                [

                    idUtilisateur,

                    `%#${id}%`

                ]

            );


            if (
                notificationExistante.length === 0
            ) {

                await db.query(

                    `

                    INSERT INTO notification

                    (
                        id_utilisateur,
                        titre,
                        message,
                        type,
                        lien
                    )

                    VALUES (?, ?, ?, ?, ?)

                    `,

                    [

                        idUtilisateur,

                        "Paiement validé",

                        `Votre paiement #${id} est confirmé. Téléchargez votre reçu.`,

                        "Paiement",

                        "/api/recu/" + id

                    ]

                );

            }

        }


        // ==================================
        // PAIEMENT NON VALIDÉ
        // ==================================

        else if (

            statutNormalise === "non valide" ||

            statutNormalise === "non validee"

        ) {

            const [
                notificationExistante
            ] = await db.query(

                `

                SELECT id_notification

                FROM notification

                WHERE id_utilisateur = ?

                AND type = 'Paiement'

                AND titre = 'Paiement non validé'

                AND message LIKE ?

                LIMIT 1

                `,

                [

                    idUtilisateur,

                    `%#${id}%`

                ]

            );


            if (
                notificationExistante.length === 0
            ) {

                await db.query(

                    `

                    INSERT INTO notification

                    (
                        id_utilisateur,
                        titre,
                        message,
                        type,
                        lien
                    )

                    VALUES (?, ?, ?, ?, ?)

                    `,

                    [

                        idUtilisateur,

                        "Paiement non validé",

                        `Votre paiement #${id} n'a pas été validé. Veuillez vérifier votre paiement et effectuer une nouvelle tentative.`,

                        "Paiement",

                        "/mes-reservations"

                    ]

                );

            }

        }


        // ==================================
        // PAIEMENT ÉCHOUÉ
        // ==================================

        else if (

            statutNormalise === "echoue" ||

            statutNormalise === "echec"

        ) {

            const [
                notificationExistante
            ] = await db.query(

                `

                SELECT id_notification

                FROM notification

                WHERE id_utilisateur = ?

                AND type = 'Paiement'

                AND titre = 'Paiement échoué'

                AND message LIKE ?

                LIMIT 1

                `,

                [

                    idUtilisateur,

                    `%#${id}%`

                ]

            );


            if (
                notificationExistante.length === 0
            ) {

                await db.query(

                    `

                    INSERT INTO notification

                    (
                        id_utilisateur,
                        titre,
                        message,
                        type,
                        lien
                    )

                    VALUES (?, ?, ?, ?, ?)

                    `,

                    [

                        idUtilisateur,

                        "Paiement échoué",

                        `Votre paiement #${id} a échoué. Veuillez réessayer le paiement.`,

                        "Paiement",

                        "/mes-reservations"

                    ]

                );

            }

        }


        // ==================================
        // EN ATTENTE
        // ==================================

        else if (

            statutNormalise === "en attente" ||

            statutNormalise === "attente"

        ) {

            console.log(
                "Paiement toujours en attente."
            );

        }


        res.json({

            message:
                "Statut paiement modifié avec succès.",

            statut:
                statut

        });

    }

    catch (error) {

        console.error(
            "Erreur modification paiement :",
            error
        );


        res.status(500).json({

            message:
                "Erreur modification paiement.",

            error:
                error.message

        });

    }

};



// ==========================================
// SUPPRIMER PAIEMENT
// ==========================================

exports.deletePaiement = async (req, res) => {

    try {

        const id =
            req.params.id;


        const [result] =
            await db.query(

                `

                DELETE FROM paiement

                WHERE id_paiement = ?

                `,

                [id]

            );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                message:
                    "Paiement introuvable."

            });

        }


        res.json({

            message:
                "Paiement supprimé avec succès."

        });

    }

    catch (error) {

        console.error(
            "Erreur suppression paiement :",
            error
        );


        res.status(500).json({

            message:
                "Erreur suppression paiement.",

            error:
                error.message

        });

    }

};