const db = require("../db");


// ==================================
// Ajouter paiement avec preuve
// ==================================

exports.createPaiement = async (req, res) => {

    try {

        const {
            id_reservation,
            montant,
            mode_paiement
        } = req.body;


        console.log(
            "Données paiement reçues :",
            req.body
        );


        // ==================================
        // FICHIER PREUVE PAIEMENT
        // ==================================

        const preuve = req.file
            ? req.file.filename
            : null;


        // ==================================
        // VÉRIFICATION
        // ==================================

        if (
            !id_reservation ||
            !montant ||
            !mode_paiement
        ) {

            return res.status(400).json({

                message:
                    "Les champs obligatoires sont manquants"

            });

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


        console.log(
            "Paiement créé avec le statut En attente :",
            result.insertId
        );


        // IMPORTANT :
        // AUCUNE NOTIFICATION ICI.
        //
        // Le paiement vient juste d'être envoyé.
        // L'administrateur doit d'abord le vérifier.


        res.json({

            message:
                "Paiement envoyé avec succès",

            id_paiement:
                result.insertId,

            preuve:
                preuve

        });


    }

    catch (error) {

        console.log(
            "Erreur ajout paiement :",
            error
        );


        res.status(500).json({

            message:
                "Erreur ajout paiement",

            error:
                error.message

        });

    }

};




// ==================================
// Afficher paiements
// ==================================

exports.getPaiements = async (req, res) => {

    try {

        const [paiements] = await db.query(`

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
                ON p.id_reservation = r.id_reservation

            INNER JOIN utilisateur u
                ON r.id_utilisateur = u.id_utilisateur

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            INNER JOIN destination d
                ON o.id_destination = d.id_destination

            ORDER BY p.id_paiement DESC

        `);


        res.json(paiements);

    }

    catch (error) {

        console.log(
            "Erreur récupération paiements :",
            error
        );


        res.status(500).json({

            message:
                "Erreur récupération paiements",

            error:
                error.message

        });

    }

};




// ==================================
// Modifier paiement
// Validation / rejet admin
// ==================================

exports.updatePaiement = async (req, res) => {

    try {

        const id = req.params.id;

        const {
            statut
        } = req.body;


        console.log(
            "Modification paiement :",
            {
                id_paiement: id,
                nouveau_statut: statut
            }
        );


        // ==================================
        // VÉRIFICATION STATUT
        // ==================================

        if (!statut) {

            return res.status(400).json({

                message:
                    "Le statut du paiement est obligatoire"

            });

        }


        // ==================================
        // MODIFIER LE PAIEMENT
        // ==================================

        const sql = `

            UPDATE paiement

            SET statut = ?

            WHERE id_paiement = ?

        `;


        const [result] = await db.query(

            sql,

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
                    "Paiement introuvable"

            });

        }


        // ==================================
        // RÉCUPÉRER L'UTILISATEUR
        // ==================================

        const [paiement] = await db.query(

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
                    "Paiement ou réservation introuvable"

            });

        }


        const idUtilisateur =
            paiement[0].id_utilisateur;


        console.log(
            "Utilisateur concerné :",
            idUtilisateur
        );



        // ==================================
        // NORMALISER LE STATUT
        // ==================================

        const statutNormalise =
            String(statut || "")
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );



        // =====================================================
        // PAIEMENT VALIDÉ
        // =====================================================

        if (
            statutNormalise === "paye" ||
            statutNormalise === "valide"
        ) {


            console.log(
                "Paiement validé."
            );


            // ==================================
            // ÉVITER LES DOUBLONS
            // ==================================

            const [notificationExistante] =
                await db.query(

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


                console.log(
                    "Notification paiement validé créée."
                );

            }

        }



        // =====================================================
        // PAIEMENT NON VALIDÉ
        // =====================================================

        else if (

            statutNormalise === "non valide" ||

            statutNormalise === "non validee" ||

            statutNormalise === "non validee" ||

            statutNormalise === "non valide"

        ) {


            console.log(
                "Paiement non validé."
            );


            // ==================================
            // ÉVITER LES DOUBLONS
            // ==================================

            const [notificationExistante] =
                await db.query(

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


                console.log(
                    "Notification paiement non validé créée."
                );

            }

        }



        // =====================================================
        // PAIEMENT ÉCHOUÉ
        // =====================================================

        else if (

            statutNormalise === "echoue" ||

            statutNormalise === "echec"

        ) {


            console.log(
                "Paiement échoué."
            );


            // ==================================
            // ÉVITER LES DOUBLONS
            // ==================================

            const [notificationExistante] =
                await db.query(

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


                console.log(
                    "Notification paiement échoué créée."
                );

            }

        }



        // =====================================================
        // EN ATTENTE
        // =====================================================

        else if (

            statutNormalise === "en attente" ||

            statutNormalise === "attente"

        ) {


            // IMPORTANT :
            // aucune notification.
            //
            // L'admin n'a pas encore terminé
            // la vérification du paiement.

            console.log(
                "Paiement toujours en attente : aucune notification."
            );

        }



        // =====================================================
        // RÉPONSE
        // =====================================================

        res.json({

            message:
                "Statut paiement modifié avec succès",

            statut:
                statut

        });

    }

    catch (error) {

        console.log(
            "Erreur modification paiement :",
            error
        );


        res.status(500).json({

            message:
                "Erreur modification paiement",

            error:
                error.message

        });

    }

};




// ==================================
// Supprimer paiement
// ==================================

exports.deletePaiement = async (req, res) => {

    try {

        const id = req.params.id;


        const [result] = await db.query(

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
                    "Paiement introuvable"

            });

        }


        res.json({

            message:
                "Paiement supprimé avec succès"

        });

    }

    catch (error) {

        console.log(
            "Erreur suppression paiement :",
            error
        );


        res.status(500).json({

            message:
                "Erreur suppression paiement",

            error:
                error.message

        });

    }

};