const db = require("../db");


// =====================================================
// GENERER LES RECOMMANDATIONS
// =====================================================

exports.genererRecommandation = async (req, res) => {

    try {

        const id_utilisateur = req.params.id;

        console.log(
            "========================================"
        );

        console.log(
            "GÉNÉRATION RECOMMANDATIONS IA"
        );

        console.log(
            "Utilisateur :",
            id_utilisateur
        );

        console.log(
            "========================================"
        );


        // =================================================
        // 1. VERIFIER UTILISATEUR
        // =================================================

        const [utilisateur] = await db.query(

            `
            SELECT
                id_utilisateur,
                nom,
                prenom
            FROM utilisateur
            WHERE id_utilisateur = ?
            `,

            [id_utilisateur]

        );


        if (utilisateur.length === 0) {

            return res.status(404).json({

                message: "Utilisateur introuvable"

            });

        }


        // =================================================
        // 2. HISTORIQUE DES RESERVATIONS
        // =================================================

        const [historique] = await db.query(

            `
            SELECT

                r.id_offre,

                o.id_categorie,

                o.id_destination,

                o.prix,

                r.statut

            FROM reservation r

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            WHERE r.id_utilisateur = ?

            AND r.statut IN (
                'Confirmée',
                'Terminée'
            )

            `,

            [id_utilisateur]

        );


        console.log(
            "Nombre de réservations utilisées :",
            historique.length
        );


        // =================================================
        // 3. PREFERENCES
        // =================================================

        const categories = historique.map(
            r => Number(r.id_categorie)
        );

        const destinations = historique.map(
            r => Number(r.id_destination)
        );


        // =================================================
        // 4. PRIX MOYEN
        // =================================================

        let prixMoyen = 0;


        if (historique.length > 0) {

            const totalPrix = historique.reduce(

                (total, r) => {

                    return total +
                        Number(r.prix || 0);

                },

                0

            );


            prixMoyen =
                totalPrix / historique.length;

        }


        console.log(
            "Prix moyen :",
            prixMoyen
        );


        // =================================================
        // 5. RECUPERER LES OFFRES
        // =================================================

        const [offres] = await db.query(

            `
            SELECT

                o.id_offre,

                o.titre,

                o.description,

                o.prix,

                o.capacite,

                o.disponibilite,

                o.image,

                o.id_categorie,

                o.id_destination,

                c.nom AS categorie,

                d.nom AS destination,

                d.region,

                d.pays,

                (
                    SELECT COUNT(*)
                    FROM reservation r2
                    WHERE r2.id_offre = o.id_offre
                    AND r2.statut IN (
                        'Confirmée',
                        'Terminée'
                    )
                ) AS nombre_reservations

            FROM offre o

            INNER JOIN categorie c
                ON o.id_categorie = c.id_categorie

            INNER JOIN destination d
                ON o.id_destination = d.id_destination

            WHERE o.disponibilite > 0

            `

        );


        if (offres.length === 0) {

            return res.json({

                message:
                    "Aucune offre disponible",

                nombre: 0,

                recommandations: []

            });

        }


        // =================================================
        // 6. CALCUL DES SCORES
        // =================================================

        const recommandations = offres.map(

            offre => {

                let score = 0;

                let raisons = [];


                // =================================================
                // CAS 1 : UTILISATEUR AVEC HISTORIQUE
                // =================================================

                if (historique.length > 0) {


                    // ---------------------------------------------
                    // MEME CATEGORIE
                    // ---------------------------------------------

                    if (
                        categories.includes(
                            Number(offre.id_categorie)
                        )
                    ) {

                        score += 40;

                        raisons.push(
                            `catégorie "${offre.categorie}" déjà appréciée`
                        );

                    }


                    // ---------------------------------------------
                    // MEME DESTINATION
                    // ---------------------------------------------

                    if (
                        destinations.includes(
                            Number(offre.id_destination)
                        )
                    ) {

                        score += 25;

                        raisons.push(
                            `destination "${offre.destination}" déjà visitée`
                        );

                    }


                    // ---------------------------------------------
                    // PRIX PROCHE
                    // ---------------------------------------------

                    if (prixMoyen > 0) {

                        const difference =
                            Math.abs(
                                Number(offre.prix || 0)
                                -
                                prixMoyen
                            );


                        const pourcentage =
                            difference / prixMoyen;


                        if (pourcentage <= 0.15) {

                            score += 20;

                            raisons.push(
                                "prix très proche de votre budget habituel"
                            );

                        }

                        else if (pourcentage <= 0.30) {

                            score += 10;

                            raisons.push(
                                "prix proche de votre budget habituel"
                            );

                        }

                    }


                    // ---------------------------------------------
                    // DISPONIBILITE
                    // ---------------------------------------------

                    if (
                        Number(offre.disponibilite) > 0
                    ) {

                        score += 10;

                    }


                    // ---------------------------------------------
                    // POPULARITE
                    // ---------------------------------------------

                    if (
                        Number(
                            offre.nombre_reservations
                        ) >= 5
                    ) {

                        score += 5;

                        raisons.push(
                            "offre très appréciée par les voyageurs"
                        );

                    }

                    else if (
                        Number(
                            offre.nombre_reservations
                        ) >= 2
                    ) {

                        score += 3;

                    }

                }


                // =================================================
                // CAS 2 : NOUVEAU UTILISATEUR
                // =================================================

                else {


                    // ---------------------------------------------
                    // POPULARITE
                    // ---------------------------------------------

                    const reservations =
                        Number(
                            offre.nombre_reservations || 0
                        );


                    if (reservations >= 5) {

                        score += 45;

                        raisons.push(
                            "offre très appréciée par les voyageurs"
                        );

                    }

                    else if (reservations >= 3) {

                        score += 35;

                        raisons.push(
                            "offre appréciée par les voyageurs"
                        );

                    }

                    else if (reservations >= 1) {

                        score += 25;

                        raisons.push(
                            "offre déjà choisie par des voyageurs"
                        );

                    }


                    // ---------------------------------------------
                    // DISPONIBILITE
                    // ---------------------------------------------

                    if (
                        Number(
                            offre.disponibilite
                        ) >= 5
                    ) {

                        score += 20;

                        raisons.push(
                            "bonne disponibilité"
                        );

                    }

                    else {

                        score += 10;

                    }


                    // ---------------------------------------------
                    // PRIX
                    // ---------------------------------------------

                    const prix =
                        Number(
                            offre.prix || 0
                        );


                    if (prix <= 250000) {

                        score += 20;

                        raisons.push(
                            "offre accessible"
                        );

                    }

                    else if (prix <= 500000) {

                        score += 15;

                    }

                    else if (prix <= 1000000) {

                        score += 10;

                    }

                    else {

                        score += 5;

                    }


                    // ---------------------------------------------
                    // PETIT BONUS POUR LA DIVERSITE
                    // ---------------------------------------------

                    score += 10;

                    raisons.push(
                        "sélectionnée pour découvrir une nouvelle expérience"
                    );

                }


                // =================================================
                // LIMITE SCORE
                // =================================================

                if (score > 100) {

                    score = 100;

                }


                // =================================================
                // RAISON
                // =================================================

                let raison;


                if (raisons.length > 0) {

                    raison =
                        "Cette offre vous est recommandée car elle correspond à "
                        +
                        raisons.join(", ")
                        +
                        ".";

                }

                else {

                    raison =
                        "Cette offre a été sélectionnée par notre système de recommandation IA.";

                }


                return {

                    id_offre:
                        offre.id_offre,

                    titre:
                        offre.titre,

                    description:
                        offre.description,

                    prix:
                        offre.prix,

                    image:
                        offre.image,

                    categorie:
                        offre.categorie,

                    destination:
                        offre.destination,

                    region:
                        offre.region,

                    pays:
                        offre.pays,

                    disponibilite:
                        offre.disponibilite,

                    nombre_reservations:
                        Number(
                            offre.nombre_reservations || 0
                        ),

                    score:
                        Number(score),

                    raison:
                        raison

                };

            }

        );


        // =================================================
        // 7. TRI
        // =================================================

        recommandations.sort(

            (a, b) => {

                if (b.score !== a.score) {

                    return b.score - a.score;

                }

                return (
                    b.nombre_reservations
                    -
                    a.nombre_reservations
                );

            }

        );


        // =================================================
        // 8. TOP 5
        // =================================================

        const topRecommandations =
            recommandations.slice(0, 5);


        console.log(
            "TOP RECOMMANDATIONS :"
        );


        topRecommandations.forEach(

            r => {

                console.log(
                    r.titre,
                    "=>",
                    r.score + "%"
                );

            }

        );


        // =================================================
        // 9. SUPPRIMER ANCIENNES
        // =================================================

        await db.query(

            `
            DELETE FROM recommandation_ia
            WHERE id_utilisateur = ?
            `,

            [id_utilisateur]

        );


        // =================================================
        // 10. ENREGISTRER
        // =================================================

        for (
            const recommandation
            of topRecommandations
        ) {

            await db.query(

                `
                INSERT INTO recommandation_ia
                (
                    id_utilisateur,
                    id_offre,
                    score,
                    raison,
                    type_recommandation
                )

                VALUES (?, ?, ?, ?, ?)

                `,

                [

                    id_utilisateur,

                    recommandation.id_offre,

                    recommandation.score,

                    recommandation.raison,

                    "Recommandation personnalisée IA"

                ]

            );

        }


        // =================================================
        // 11. REPONSE
        // =================================================

        res.json({

            message:
                "Recommandations personnalisées générées avec succès",

            historique:
                historique.length,

            nombre:
                topRecommandations.length,

            recommandations:
                topRecommandations

        });


    }

    catch (error) {

        console.log(
            "ERREUR RECOMMANDATION IA :",
            error
        );


        res.status(500).json({

            message:
                "Erreur génération recommandations",

            error:
                error.message

        });

    }

};


// =====================================================
// AFFICHER LES RECOMMANDATIONS D'UN UTILISATEUR
// =====================================================

exports.getRecommandations = async (
    req,
    res
) => {

    try {

        const id =
            req.params.id;


        const [result] =
            await db.query(

                `

                SELECT

                    r.id_recommandation,

                    r.id_utilisateur,

                    r.id_offre,

                    r.score,

                    r.raison,

                    r.date_recommandation,

                    r.type_recommandation,

                    o.titre,

                    o.description,

                    o.prix,

                    o.image,

                    o.disponibilite,

                    c.nom AS categorie,

                    d.nom AS destination,

                    d.region,

                    d.pays

                FROM recommandation_ia r

                INNER JOIN offre o
                    ON r.id_offre =
                       o.id_offre

                INNER JOIN categorie c
                    ON o.id_categorie =
                       c.id_categorie

                INNER JOIN destination d
                    ON o.id_destination =
                       d.id_destination

                WHERE
                    r.id_utilisateur = ?

                ORDER BY
                    r.score DESC

                `,

                [id]

            );


        res.json(result);

    }

    catch (error) {

        console.log(
            "ERREUR RÉCUPÉRATION RECOMMANDATIONS :",
            error
        );


        res.status(500).json({

            message:
                "Erreur récupération recommandations",

            error:
                error.message

        });

    }

};


// =====================================================
// STATISTIQUES RECOMMANDATIONS POUR ADMIN
// =====================================================

exports.getStatistiquesAdmin = async (req, res) => {

    try {

        // =================================================
        // 1. STATISTIQUES GENERALES
        // =================================================

        const [statistiques] = await db.query(`

            SELECT

                COUNT(*) AS nombre_recommandations,

                COUNT(DISTINCT id_utilisateur)
                AS nombre_utilisateurs,

                COALESCE(
                    ROUND(AVG(score), 2),
                    0
                ) AS score_moyen

            FROM recommandation_ia

        `);


        // =================================================
        // 2. OFFRES LES PLUS RECOMMANDEES
        // =================================================

        const [offres_plus_recommandees] = await db.query(`

            SELECT

                r.id_offre,

                o.titre,

                o.prix,

                o.image,

                d.nom AS destination,

                c.nom AS categorie,

                COUNT(r.id_recommandation)
                    AS nombre_recommandations,

                ROUND(
                    AVG(r.score),
                    2
                ) AS score_moyen

            FROM recommandation_ia r

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            LEFT JOIN destination d
                ON o.id_destination = d.id_destination

            LEFT JOIN categorie c
                ON o.id_categorie = c.id_categorie

            GROUP BY

                r.id_offre,
                o.titre,
                o.prix,
                o.image,
                d.nom,
                c.nom

            ORDER BY

                nombre_recommandations DESC,
                score_moyen DESC

            LIMIT 5

        `);


        console.log(
            "===== OFFRES PLUS RECOMMANDEES ====="
        );

        console.log(
            offres_plus_recommandees
        );


        // =================================================
        // 3. MEILLEURE OFFRE
        // =================================================

        const [meilleureOffre] = await db.query(`

            SELECT

                r.id_offre,

                o.titre,

                o.image,

                d.nom AS destination,

                COUNT(r.id_recommandation)
                    AS nombre_recommandations,

                ROUND(
                    AVG(r.score),
                    2
                ) AS score_moyen

            FROM recommandation_ia r

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            LEFT JOIN destination d
                ON o.id_destination = d.id_destination

            GROUP BY

                r.id_offre,
                o.titre,
                o.image,
                d.nom

            ORDER BY

                score_moyen DESC,
                nombre_recommandations DESC

            LIMIT 1

        `);


        // =================================================
        // 4. DERNIERES RECOMMANDATIONS
        // =================================================

        const [dernieres] = await db.query(`

            SELECT

                r.id_recommandation,

                r.id_utilisateur,

                r.id_offre,

                r.score,

                r.raison,

                r.date_recommandation,

                r.type_recommandation,

                o.titre AS offre,

                u.nom,

                u.prenom

            FROM recommandation_ia r

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            INNER JOIN utilisateur u
                ON r.id_utilisateur = u.id_utilisateur

            ORDER BY

                r.date_recommandation DESC

            LIMIT 10

        `);


        // =================================================
        // 5. REPONSE
        // =================================================

        res.json({

            statistiques: {

                nombre_utilisateurs:
                    Number(
                        statistiques[0]
                            ?.nombre_utilisateurs || 0
                    ),

                nombre_recommandations:
                    Number(
                        statistiques[0]
                            ?.nombre_recommandations || 0
                    ),

                score_moyen:
                    Number(
                        statistiques[0]
                            ?.score_moyen || 0
                    )

            },


            // =============================================
            // NOUVELLE LISTE
            // =============================================

            offres_plus_recommandees:
                offres_plus_recommandees,


            // =============================================
            // MEILLEURE OFFRE
            // =============================================

            meilleure_offre:
                meilleureOffre.length > 0
                    ? meilleureOffre[0]
                    : null,


            // =============================================
            // DERNIERES RECOMMANDATIONS
            // =============================================

            dernieres_recommandations:
                dernieres

        });


    }
    catch (error) {

        console.log(
            "ERREUR STATISTIQUES RECOMMANDATIONS IA :",
            error
        );


        res.status(500).json({

            message:
                "Erreur récupération statistiques recommandations",

            error:
                error.message

        });

    }

};