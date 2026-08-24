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

                p.id_paiement,
                p.montant,
                p.statut AS statut_paiement,

                r.id_reservation,
                r.date_reservation,
                r.date_debut_sejour,
                r.date_fin_sejour,
                r.nombre_personnes,

                u.nom,
                u.prenom,

                o.titre,

                d.nom AS nom_destination,

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
                    "Ce reçu a déjà été utilisé. Il ne peut plus être présenté comme un nouveau reçu."

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

                message:
                    "Le paiement associé à ce reçu n'est pas confirmé."

            });

        }


        // =========================================
        // RECU VALIDE
        // =========================================

        return res.json({

            valide: true,

            utilise: false,

            message:
                "Ce reçu est authentique et la réservation est confirmée.",

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

            message:
                "Erreur lors de la vérification du reçu."

        });

    }

};



// ======================================================
// UTILISER / VALIDER DEFINITIVEMENT LE RECU
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

                message:
                    "Token de vérification manquant."

            });

        }


        // =========================================
        // VERIFICATION DU RECU AVANT UTILISATION
        // =========================================

        const [result] = await db.query(

            `

            SELECT

                id_verification,
                id_paiement,
                statut

            FROM verification_recu

            WHERE token = ?

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

                message:
                    "Ce reçu n'existe pas."

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
                    "Ce reçu a déjà été utilisé."

            });

        }


        // =========================================
        // UTILISATION DU RECU
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
        // AUCUNE MODIFICATION
        // =========================================

        if (
            updateResult.affectedRows === 0
        ) {


            return res.status(409).json({

                succes: false,

                utilise: true,

                message:
                    "Ce reçu a déjà été utilisé."

            });

        }


        // =========================================
        // RECU UTILISE AVEC SUCCES
        // =========================================

        return res.json({

            succes: true,

            utilise: true,

            message:
                "L'arrivée du client a été confirmée. Le reçu est maintenant marqué comme utilisé."

        });


    }
    catch (error) {


        console.error(
            "Erreur utilisation reçu :",
            error
        );


        return res.status(500).json({

            succes: false,

            message:
                "Erreur lors de la validation du reçu."

        });

    }

};