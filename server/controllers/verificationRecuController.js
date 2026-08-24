const db = require("../db");

exports.verifierRecu = async (req, res) => {

    const idPaiement = req.params.id;

    try {

        const sql = `

            SELECT

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

            FROM paiement p

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


        // =========================================
        // REÇU INTROUVABLE
        // =========================================

        if (result.length === 0) {

            return res.status(404).json({

                valide: false,

                message:
                    "Ce reçu ne correspond à aucune réservation."

            });

        }


        const paiement = result[0];


        // =========================================
        // VÉRIFICATION DU PAIEMENT
        // =========================================

        if (paiement.statut_paiement !== "Paye") {

            return res.status(400).json({

                valide: false,

                message:
                    "Le paiement associé à ce reçu n'est pas confirmé."

            });

        }


        // =========================================
        // REÇU VALIDE
        // =========================================

        return res.json({

            valide: true,

            message:
                "Ce reçu est authentique et la réservation est confirmée.",

            reservation: paiement

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