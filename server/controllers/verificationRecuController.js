const db = require("../db");


// ======================================================
// VERIFIER UN RECU AVEC SON TOKEN
// ======================================================

exports.verifierRecu = async (req, res) => {

    const token = req.params.token;


    try {

        // =========================================
        // VERIFICATION DU TOKEN
        // =========================================

        if (!token) {

            return res.status(400).json({

                valide: false,

                utilise: false,

                message:
                    "Token de vérification manquant."

            });

        }


        // =========================================
        // RECHERCHE DU TOKEN
        // =========================================

        const sql = `

            SELECT

                vr.id_verification,
                vr.id_paiement,
                vr.token,
                vr.statut AS statut_verification,
                vr.date_verification,
                vr.date_creation,

                p.id_paiement,
                p.montant,
                p.mode_paiement,
                p.statut AS statut_paiement,
                p.date_paiement,

                r.id_reservation,
                r.date_reservation,
                r.date_debut_sejour,
                r.date_fin_sejour,
                r.nombre_personnes,

                u.id_utilisateur,
                u.nom,
                u.prenom,

                o.id_offre,
                o.titre,

                d.id_destination,
                d.nom AS nom_destination,

                pr.id_prestataire,
                pr.nom_entreprise AS nom_prestataire

            FROM verification_recu vr

            INNER JOIN paiement p
                ON vr.id_paiement = p.id_paiement

            INNER JOIN reservation r
                ON p.id_reservation = r.id_reservation

            INNER JOIN utilisateur u
                ON r.id_utilisateur = u.id_utilisateur

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            INNER JOIN destination d
                ON o.id_destination = d.id_destination

            INNER JOIN prestataire pr
                ON o.id_prestataire = pr.id_prestataire

            WHERE vr.token = ?

            LIMIT 1

        `;


        const [result] = await db.query(

            sql,

            [token]

        );


        // =========================================
        // TOKEN INTROUVABLE
        // =========================================

        if (result.length === 0) {

            return res.status(404).json({

                valide: false,

                utilise: false,

                message:
                    "Ce QR Code ne correspond à aucun reçu officiel."

            });

        }


        const verification = result[0];


        // =========================================
        // RECU DEJA UTILISE
        // =========================================

        if (
            verification.statut_verification ===
            "UTILISE"
        ) {

            return res.status(409).json({

                valide: false,

                utilise: true,

                message:
                    "Ce reçu a déjà été utilisé. L'arrivée du client a déjà été confirmée.",

                date_verification:
                    verification.date_verification

            });

        }


        // =========================================
        // VERIFICATION DU PAIEMENT
        // =========================================

        if (
            verification.statut_paiement !==
            "Paye"
        ) {

            return res.status(400).json({

                valide: false,

                utilise: false,

                message:
                    "Le paiement associé à ce reçu n'est pas confirmé."

            });

        }


        // =========================================
        // RECU VALIDE
        // IMPORTANT :
        // ON NE CHANGE PAS LE STATUT ICI
        // =========================================

        return res.status(200).json({

            valide: true,

            utilise: false,

            message:
                "Ce reçu est authentique. La réservation est confirmée. L'arrivée du client peut être validée.",

            reservation: verification

        });

    }


    catch (error) {

        console.error(
            "Erreur vérification reçu :",
            error
        );


        return res.status(500).json({

            valide: false,

            utilise: false,

            message:
                "Erreur lors de la vérification du reçu."

        });

    }

};




// ======================================================
// CONFIRMER L'ARRIVEE DU CLIENT
// ======================================================
//
// Cette fonction est appelée lorsque le réceptionniste
// clique sur :
//
// "Confirmer l'arrivée"
//
// C'est SEULEMENT ici que le reçu devient UTILISE.
//
// ======================================================

exports.utiliserRecu = async (req, res) => {

    const token = req.params.token;


    try {

        // =========================================
        // VERIFICATION DU TOKEN
        // =========================================

        if (!token) {

            return res.status(400).json({

                succes: false,

                utilise: false,

                message:
                    "Token de vérification manquant."

            });

        }


        // =========================================
        // VERIFIER QUE LE TOKEN EXISTE
        // =========================================

        const [result] = await db.query(

            `

            SELECT

                vr.id_verification,
                vr.id_paiement,
                vr.statut,

                p.statut AS statut_paiement

            FROM verification_recu vr

            INNER JOIN paiement p
                ON vr.id_paiement = p.id_paiement

            WHERE vr.token = ?

            LIMIT 1

            `,

            [token]

        );


        // =========================================
        // RECU INTROUVABLE
        // =========================================

        if (result.length === 0) {

            return res.status(404).json({

                succes: false,

                utilise: false,

                message:
                    "Ce reçu n'existe pas ou le QR Code est invalide."

            });

        }


        const verification = result[0];


        // =========================================
        // RECU DEJA UTILISE
        // =========================================

        if (
            verification.statut ===
            "UTILISE"
        ) {

            return res.status(409).json({

                succes: false,

                utilise: true,

                message:
                    "Ce reçu a déjà été utilisé. L'arrivée du client a déjà été confirmée."

            });

        }


        // =========================================
        // VERIFICATION DU PAIEMENT
        // =========================================

        if (
            verification.statut_paiement !==
            "Paye"
        ) {

            return res.status(400).json({

                succes: false,

                utilise: false,

                message:
                    "Impossible de confirmer l'arrivée : le paiement n'est pas confirmé."

            });

        }


        // =========================================
        // UTILISATION ATOMIQUE DU RECU
        // =========================================
        //
        // Très important :
        //
        // statut = VALIDE
        //
        // permet d'éviter qu'un même reçu soit
        // validé deux fois simultanément.
        //
        // =========================================

        const [updateResult] = await db.query(

            `

            UPDATE verification_recu

            SET

                statut = 'UTILISE',

                date_verification = NOW()

            WHERE

                token = ?

                AND statut = 'VALIDE'

            `,

            [token]

        );


        // =========================================
        // LE RECU A ETE UTILISE ENTRE-TEMPS
        // =========================================

        if (
            updateResult.affectedRows === 0
        ) {

            return res.status(409).json({

                succes: false,

                utilise: true,

                message:
                    "Ce reçu vient déjà d'être utilisé. L'arrivée du client a déjà été confirmée."

            });

        }


        // =========================================
        // CONFIRMATION REUSSIE
        // =========================================

        return res.status(200).json({

            succes: true,

            utilise: true,

            message:
                "L'arrivée du client a été confirmée avec succès. Le reçu est maintenant marqué comme utilisé.",

            date_verification:
                new Date()

        });

    }


    catch (error) {

        console.error(
            "Erreur confirmation arrivée :",
            error
        );


        return res.status(500).json({

            succes: false,

            utilise: false,

            message:
                "Erreur lors de la confirmation de l'arrivée du client."

        });

    }

};