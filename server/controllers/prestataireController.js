const db = require("../db");

// =====================================
// AFFICHER LES PRESTATAIRES
// GET /api/prestataires
// =====================================
exports.getPrestataires = async (req, res) => {

    try {

        const [result] = await db.query(`
            SELECT
                p.id_prestataire,
                p.id_utilisateur,
                p.nom_entreprise,
                p.description,
                p.adresse,
                p.ville,
                p.telephone,
                p.email,
                p.statut,

                u.nom,
                u.prenom,
                u.email AS email_utilisateur,
                u.role

            FROM prestataire p

            LEFT JOIN utilisateur u
                ON p.id_utilisateur = u.id_utilisateur

            ORDER BY p.id_prestataire DESC
        `);

        res.json(result);

    } catch (error) {

        console.error(
            "ERREUR récupération prestataires :",
            error
        );

        res.status(500).json({
            message: "Erreur récupération prestataires",
            error: error.message
        });
    }
};


// =====================================
// AFFICHER LE PRESTATAIRE D'UN UTILISATEUR
// GET /api/prestataires/utilisateur/:id
// =====================================
exports.getPrestataireByUtilisateur = async (req, res) => {

    const idUtilisateur = req.params.id;

    try {

        const [result] = await db.query(`
            SELECT
                p.id_prestataire,
                p.id_utilisateur,
                p.nom_entreprise,
                p.description,
                p.adresse,
                p.ville,
                p.telephone,
                p.email,
                p.statut,

                u.nom,
                u.prenom,
                u.email AS email_utilisateur,
                u.role

            FROM prestataire p

            LEFT JOIN utilisateur u
                ON p.id_utilisateur = u.id_utilisateur

            WHERE p.id_utilisateur = ?

            LIMIT 1
        `, [idUtilisateur]);

        if (result.length === 0) {

            return res.status(404).json({
                message: "Prestataire introuvable"
            });
        }

        res.json(result[0]);

    } catch (error) {

        console.error(
            "ERREUR récupération prestataire utilisateur :",
            error
        );

        res.status(500).json({
            message: "Erreur récupération prestataire",
            error: error.message
        });
    }
};


// =====================================
// STATISTIQUES DU PRESTATAIRE
// GET /api/prestataires/:id/statistiques
// =====================================
exports.getStatistiquesPrestataire = async (req, res) => {

    const idPrestataire = Number(req.params.id);

    try {

        // =====================================
        // VÉRIFIER ID PRESTATAIRE
        // =====================================

        if (!idPrestataire) {

            return res.status(400).json({
                message: "ID prestataire invalide"
            });

        }


        // =====================================
        // VÉRIFIER QUE LE PRESTATAIRE EXISTE
        // =====================================

        const [prestataire] = await db.query(
            `
            SELECT
                id_prestataire,
                id_utilisateur,
                nom_entreprise
            FROM prestataire
            WHERE id_prestataire = ?
            `,
            [idPrestataire]
        );


        if (prestataire.length === 0) {

            return res.status(404).json({
                message: "Prestataire introuvable"
            });

        }


        // =====================================
        // NOMBRE D'OFFRES
        // =====================================

        const [offres] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM offre
            WHERE id_prestataire = ?
            `,
            [idPrestataire]
        );


        // =====================================
        // NOMBRE TOTAL DE RÉSERVATIONS
        // =====================================

        const [reservations] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM reservation r
            INNER JOIN offre o
                ON r.id_offre = o.id_offre
            WHERE o.id_prestataire = ?
            `,
            [idPrestataire]
        );


        // =====================================
        // RÉSERVATIONS EN ATTENTE
        // =====================================

        const [reservationsEnAttente] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM reservation r
            INNER JOIN offre o
                ON r.id_offre = o.id_offre
            WHERE o.id_prestataire = ?
            AND r.statut = 'En attente'
            `,
            [idPrestataire]
        );


        // =====================================
        // REVENUS
        // =====================================

        const [revenus] = await db.query(
            `
            SELECT
                COALESCE(SUM(p.montant), 0) AS total
            FROM paiement p
            INNER JOIN reservation r
                ON p.id_reservation = r.id_reservation
            INNER JOIN offre o
                ON r.id_offre = o.id_offre
            WHERE o.id_prestataire = ?
            AND p.statut = 'Paye'
            `,
            [idPrestataire]
        );


        // =====================================
        // RÉSULTAT FINAL
        // =====================================

        const statistiques = {

            offres: Number(offres[0]?.total || 0),

            reservations:
                Number(reservations[0]?.total || 0),

            reservationsEnAttente:
                Number(
                    reservationsEnAttente[0]?.total || 0
                ),

            revenus:
                Number(revenus[0]?.total || 0)

        };


        console.log(
            "📊 Statistiques prestataire",
            idPrestataire,
            statistiques
        );


        res.json(statistiques);

    }

    catch (error) {

        console.error(
            "❌ ERREUR STATISTIQUES PRESTATAIRE :",
            error
        );


        res.status(500).json({

            message:
                "Erreur récupération statistiques",

            error:
                error.message

        });

    }

};

// =====================================
// AJOUTER UN PRESTATAIRE
// POST /api/prestataires
// =====================================
exports.createPrestataire = async (req, res) => {

    const {
        id_utilisateur,
        nom_entreprise,
        description,
        adresse,
        ville,
        telephone,
        email,
        statut
    } = req.body;

    try {

        const [result] = await db.query(`
            INSERT INTO prestataire (
                id_utilisateur,
                nom_entreprise,
                description,
                adresse,
                ville,
                telephone,
                email,
                statut
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id_utilisateur,
            nom_entreprise,
            description,
            adresse,
            ville,
            telephone,
            email,
            statut || "En attente"
        ]);

        res.json({
            message: "Prestataire ajouté avec succès",
            id: result.insertId
        });

    } catch (error) {

        console.error(
            "ERREUR ajout prestataire :",
            error
        );

        res.status(500).json({
            message: "Erreur ajout prestataire",
            error: error.message
        });
    }
};


// =====================================
// MODIFIER PRESTATAIRE
// PUT /api/prestataires/:id
// =====================================
exports.updatePrestataire = async (req, res) => {

    const id = req.params.id;

    const {
        nom_entreprise,
        description,
        adresse,
        ville,
        telephone,
        email,
        statut
    } = req.body;

    try {

        const [result] = await db.query(`
            UPDATE prestataire

            SET
                nom_entreprise = ?,
                description = ?,
                adresse = ?,
                ville = ?,
                telephone = ?,
                email = ?,
                statut = ?

            WHERE id_prestataire = ?
        `, [
            nom_entreprise,
            description,
            adresse,
            ville,
            telephone,
            email,
            statut,
            id
        ]);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Prestataire introuvable"
            });
        }

        res.json({
            message: "Prestataire modifié avec succès"
        });

    } catch (error) {

        console.error(
            "ERREUR modification prestataire :",
            error
        );

        res.status(500).json({
            message: "Erreur modification prestataire",
            error: error.message
        });
    }
};


// =====================================
// SUPPRIMER PRESTATAIRE
// DELETE /api/prestataires/:id
// =====================================
exports.deletePrestataire = async (req, res) => {

    const id = req.params.id;

    try {

        const [result] = await db.query(`
            DELETE FROM prestataire

            WHERE id_prestataire = ?
        `, [id]);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Prestataire introuvable"
            });
        }

        res.json({
            message: "Prestataire supprimé avec succès"
        });

    } catch (error) {

        console.error(
            "ERREUR suppression prestataire :",
            error
        );

        res.status(500).json({
            message: "Erreur suppression prestataire",
            error: error.message
        });
    }
};