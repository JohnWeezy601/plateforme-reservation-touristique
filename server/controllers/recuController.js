const db = require("../db");
const crypto = require("crypto");


// ======================================================
// RECUPERER UN RECU
// ======================================================

exports.getRecu = async (req, res) => {

    const idPaiement = req.params.id;

    try {

        // ==================================================
        // 1. VERIFIER QUE LE PAIEMENT EXISTE
        // ==================================================

        const [paiementResult] = await db.query(
            `
            SELECT
                id_paiement,
                statut
            FROM paiement
            WHERE id_paiement = ?
            LIMIT 1
            `,
            [idPaiement]
        );


        if (paiementResult.length === 0) {

            return res.status(404).json({

                message: "Paiement introuvable"

            });

        }


        const paiement = paiementResult[0];


        // ==================================================
        // 2. VERIFIER QUE LE PAIEMENT EST PAYE
        // ==================================================

        if (paiement.statut !== "Paye") {

            return res.status(400).json({

                message:
                    "Le reçu ne peut pas être généré car le paiement n'est pas confirmé."

            });

        }


        // ==================================================
        // 3. VERIFIER SI UN TOKEN EXISTE DEJA
        // ==================================================

        const [verificationResult] = await db.query(
            `
            SELECT
                id_verification,
                token,
                statut
            FROM verification_recu
            WHERE id_paiement = ?
            LIMIT 1
            `,
            [idPaiement]
        );


        // ==================================================
        // 4. CREER AUTOMATIQUEMENT LE TOKEN S'IL N'EXISTE PAS
        // ==================================================

        if (verificationResult.length === 0) {

            const token = crypto.randomBytes(32).toString("hex");


            await db.query(
                `
                INSERT INTO verification_recu
                (
                    id_paiement,
                    token,
                    statut
                )
                VALUES
                (
                    ?,
                    ?,
                    'VALIDE'
                )
                `,
                [
                    idPaiement,
                    token
                ]
            );


            console.log(
                "Token reçu créé automatiquement pour le paiement :",
                idPaiement
            );

        }


        // ==================================================
        // 5. RECUPERER LES INFORMATIONS COMPLETES DU RECU
        // ==================================================

        const sql = `

        SELECT

        p.id_paiement,
        p.montant,
        p.statut AS statut_paiement,

        /* ==========================================
           TOKEN DE VERIFICATION SECURISE
        ========================================== */

        vr.token AS token_verification,

        vr.statut AS statut_verification,

        r.id_reservation,
        r.date_reservation,
        r.date_debut_sejour,
        r.date_fin_sejour,
        r.nombre_personnes,

        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.photo,

        o.titre,

        d.nom AS nom_destination,

        /* ==========================================
           INFORMATIONS PRESTATAIRE
        ========================================== */

        pr.id_prestataire,
        pr.nom_entreprise AS nom_prestataire,
        pr.adresse AS adresse_prestataire,
        pr.ville AS ville_prestataire,
        pr.telephone AS telephone_prestataire,
        pr.email AS email_prestataire

        FROM paiement p

        /* ==========================================
           LIEN AVEC LE TOKEN DE VERIFICATION
        ========================================== */

        INNER JOIN verification_recu vr
            ON p.id_paiement = vr.id_paiement

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

        WHERE p.id_paiement = ?

        LIMIT 1

        `;


        const [result] = await db.query(
            sql,
            [idPaiement]
        );


        // ==================================================
        // 6. RECU INTROUVABLE
        // ==================================================

        if (result.length === 0) {

            return res.status(404).json({

                message:
                    "Impossible de récupérer les informations du reçu."

            });

        }


        console.log(
            "Données reçu :",
            result[0]
        );


        // ==================================================
        // 7. REPONSE
        // ==================================================

        return res.json(result[0]);

    }

    catch (error) {

        console.error(
            "Erreur reçu :",
            error
        );


        return res.status(500).json({

            message: "Erreur serveur"

        });

    }

};