const db = require("../db");

exports.getRecu = async (req, res) => {

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

        `;


        const [result] = await db.query(
            sql,
            [idPaiement]
        );


        if (result.length === 0) {

            return res.status(404).json({

                message: "Paiement introuvable"

            });

        }


        console.log(
            "Données reçu :",
            result[0]
        );


        res.json(result[0]);


    }
    catch (error) {

        console.log(
            "Erreur reçu :",
            error
        );


        res.status(500).json({

            message: "Erreur serveur"

        });

    }

};