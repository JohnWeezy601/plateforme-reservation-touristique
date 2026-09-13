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

    const idPrestataire = req.params.id;

    try {

        // ==============================
        // NOMBRE D'OFFRES
        // ==============================

        const [offres] = await db.query(`
            SELECT COUNT(*) AS total

            FROM offre

            WHERE id_prestataire = ?
        `, [idPrestataire]);


        // ==============================
        // NOMBRE DE RESERVATIONS
        // ==============================

        const [reservations] = await db.query(`
            SELECT COUNT(*) AS total

            FROM reservation r

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            WHERE o.id_prestataire = ?
        `, [idPrestataire]);


        // ==============================
        // RESERVATIONS EN ATTENTE
        // ==============================

        const [reservationsAttente] = await db.query(`
            SELECT COUNT(*) AS total

            FROM reservation r

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            WHERE o.id_prestataire = ?

            AND r.statut = 'En attente'
        `, [idPrestataire]);


        // ==============================
        // REVENUS
        // ==============================

        const [revenus] = await db.query(`
            SELECT COALESCE(SUM(p.montant), 0) AS total

            FROM paiement p

            INNER JOIN reservation r
                ON p.id_reservation = r.id_reservation

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            WHERE o.id_prestataire = ?

            AND p.statut = 'Paye'
        `, [idPrestataire]);


        res.json({
            offres: Number(offres[0].total),
            reservations: Number(reservations[0].total),
            reservationsEnAttente: Number(
                reservationsAttente[0].total
            ),
            revenus: Number(revenus[0].total)
        });

    } catch (error) {

        console.error(
            "ERREUR STATISTIQUES PRESTATAIRE :",
            error
        );

        res.status(500).json({
            message: "Erreur récupération statistiques",
            error: error.message
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