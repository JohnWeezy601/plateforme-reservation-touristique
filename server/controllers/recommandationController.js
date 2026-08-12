const db = require("../db");

// =====================================================
// GENERER LES RECOMMANDATIONS PERSONNALISEES
// =====================================================

exports.genererRecommandation = async (req, res) => {

    try {

        // =================================================
        // 1. RECUPERER L'UTILISATEUR CONNECTE
        // =================================================

        const id_utilisateur = Number(req.params.id);

        console.log("========================================");
        console.log("GENERATION RECOMMANDATIONS IA");
        console.log("Utilisateur :", id_utilisateur);
        console.log("========================================");


        if (!id_utilisateur || Number.isNaN(id_utilisateur)) {

            return res.status(400).json({

                message: "ID utilisateur invalide"

            });

        }


        // =================================================
        // 2. VERIFIER QUE L'UTILISATEUR EXISTE
        // =================================================

        const [utilisateurs] = await db.query(

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


        if (utilisateurs.length === 0) {

            return res.status(404).json({

                message: "Utilisateur introuvable"

            });

        }


        const utilisateur = utilisateurs[0];


        console.log(
            "Utilisateur trouvé :",
            utilisateur.prenom,
            utilisateur.nom
        );


        // =================================================
        // 3. RECUPERER L'HISTORIQUE DES RESERVATIONS
        // =================================================
        //
        // On utilise uniquement les réservations
        // Confirmée ou Terminée.
        //
        // Ces réservations permettent de comprendre
        // les préférences du client.
        // =================================================

        const [historique] = await db.query(

            `
            SELECT

                r.id_reservation,
                r.id_offre,
                r.statut,
                r.nombre_personnes,
                r.montant_total,
                r.date_reservation,

                o.titre,
                o.prix,
                o.id_categorie,
                o.id_destination,

                c.nom AS categorie,

                d.nom AS destination,
                d.region,
                d.pays

            FROM reservation r

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            LEFT JOIN categorie c
                ON o.id_categorie = c.id_categorie

            LEFT JOIN destination d
                ON o.id_destination = d.id_destination

            WHERE r.id_utilisateur = ?

            AND r.statut IN (
                'Confirmée',
                'Terminée'
            )

            ORDER BY r.date_reservation DESC
            `,

            [id_utilisateur]

        );


        console.log(
            "Nombre de réservations utilisées :",
            historique.length
        );


        // =================================================
        // 4. CREER LA LISTE DES OFFRES DEJA RESERVEES
        // =================================================

        const offresDejaReservees = new Set(

            historique.map(

                reservation =>
                    Number(reservation.id_offre)

            )

        );


        console.log(
            "Offres déjà réservées :",
            [...offresDejaReservees]
        );


        // =================================================
        // 5. CAS UTILISATEUR AVEC HISTORIQUE
        // =================================================

        let categoriesPreferences = {};
        let destinationsPreferences = {};

        let prixMoyen = 0;


        if (historique.length > 0) {


            // =================================================
            // 5.1 COMPTER LES CATEGORIES
            // =================================================

            historique.forEach(

                reservation => {

                    const categorie =
                        Number(
                            reservation.id_categorie
                        );


                    if (!categoriesPreferences[categorie]) {

                        categoriesPreferences[categorie] = {

                            nombre: 0,
                            nom:
                                reservation.categorie

                        };

                    }


                    categoriesPreferences[categorie].nombre++;

                }

            );


            // =================================================
            // 5.2 COMPTER LES DESTINATIONS
            // =================================================

            historique.forEach(

                reservation => {

                    const destination =
                        Number(
                            reservation.id_destination
                        );


                    if (!destinationsPreferences[destination]) {

                        destinationsPreferences[destination] = {

                            nombre: 0,
                            nom:
                                reservation.destination

                        };

                    }


                    destinationsPreferences[destination].nombre++;

                }

            );


            // =================================================
            // 5.3 CALCULER LE PRIX MOYEN DES OFFRES
            // =================================================

            const totalPrix = historique.reduce(

                (total, reservation) => {

                    return total +
                        Number(
                            reservation.prix || 0
                        );

                },

                0

            );


            prixMoyen =
                totalPrix / historique.length;


        }


        console.log(
            "Préférences catégories :",
            categoriesPreferences
        );


        console.log(
            "Préférences destinations :",
            destinationsPreferences
        );


        console.log(
            "Prix moyen :",
            prixMoyen
        );


        // =================================================
        // 6. RECUPERER TOUTES LES OFFRES DISPONIBLES
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
                o.date_debut,
                o.date_fin,
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

            LEFT JOIN categorie c
                ON o.id_categorie = c.id_categorie

            LEFT JOIN destination d
                ON o.id_destination = d.id_destination

            WHERE o.disponibilite > 0

            ORDER BY o.id_offre DESC
            `

        );


        console.log(
            "Nombre total d'offres disponibles :",
            offres.length
        );


        if (offres.length === 0) {

            return res.json({

                message:
                    "Aucune offre disponible",

                historique:
                    historique.length,

                nombre: 0,

                recommandations: []

            });

        }


        // =================================================
        // 7. CALCULER LE SCORE DE CHAQUE OFFRE
        // =================================================

        const recommandations = offres

            // =================================================
            // EXCLURE LES OFFRES DEJA RESERVEES
            // =================================================

            .filter(

                offre =>
                    !offresDejaReservees.has(
                        Number(offre.id_offre)
                    )

            )

            .map(

                offre => {

                    let score = 0;

                    const raisons = [];


                    const idCategorie =
                        Number(
                            offre.id_categorie
                        );


                    const idDestination =
                        Number(
                            offre.id_destination
                        );


                    const prix =
                        Number(
                            offre.prix || 0
                        );


                    const nombreReservations =
                        Number(
                            offre.nombre_reservations || 0
                        );


                    const disponibilite =
                        Number(
                            offre.disponibilite || 0
                        );


                    // =================================================
                    // UTILISATEUR AVEC HISTORIQUE
                    // =================================================

                    if (historique.length > 0) {


                        // =================================================
                        // CATEGORIE PREFEREE
                        // =================================================

                        const preferenceCategorie =
                            categoriesPreferences[
                                idCategorie
                            ];


                        if (preferenceCategorie) {

                            const nombre =
                                preferenceCategorie.nombre;


                            if (nombre >= 3) {

                                score += 40;

                            }

                            else if (nombre === 2) {

                                score += 32;

                            }

                            else {

                                score += 25;

                            }


                            raisons.push(

                                `catégorie "${offre.categorie}" que vous avez déjà choisie`

                            );

                        }


                        // =================================================
                        // DESTINATION PREFEREE
                        // =================================================

                        const preferenceDestination =
                            destinationsPreferences[
                                idDestination
                            ];


                        if (preferenceDestination) {

                            const nombre =
                                preferenceDestination.nombre;


                            if (nombre >= 3) {

                                score += 30;

                            }

                            else if (nombre === 2) {

                                score += 25;

                            }

                            else {

                                score += 18;

                            }


                            raisons.push(

                                `destination "${offre.destination}" que vous avez déjà visitée`

                            );

                        }


                        // =================================================
                        // PRIX
                        // =================================================

                        if (prixMoyen > 0) {

                            const difference =
                                Math.abs(
                                    prix - prixMoyen
                                );


                            const pourcentage =
                                difference /
                                prixMoyen;


                            if (pourcentage <= 0.10) {

                                score += 20;

                                raisons.push(
                                    "prix très proche de votre budget habituel"
                                );

                            }

                            else if (pourcentage <= 0.20) {

                                score += 15;

                                raisons.push(
                                    "prix proche de votre budget habituel"
                                );

                            }

                            else if (pourcentage <= 0.35) {

                                score += 8;

                                raisons.push(
                                    "prix relativement proche de votre budget habituel"
                                );

                            }

                        }


                        // =================================================
                        // DISPONIBILITE
                        // =================================================

                        if (disponibilite >= 5) {

                            score += 5;

                        }

                        else if (disponibilite > 0) {

                            score += 3;

                        }


                        // =================================================
                        // POPULARITE
                        // =================================================

                        if (nombreReservations >= 10) {

                            score += 7;

                            raisons.push(
                                "offre très populaire auprès des voyageurs"
                            );

                        }

                        else if (nombreReservations >= 5) {

                            score += 5;

                            raisons.push(
                                "offre appréciée par les voyageurs"
                            );

                        }

                        else if (nombreReservations >= 2) {

                            score += 3;

                        }


                        // =================================================
                        // PETIT BONUS POUR UNE NOUVELLE EXPERIENCE
                        // =================================================

                        if (
                            !preferenceCategorie &&
                            !preferenceDestination
                        ) {

                            score += 3;

                            raisons.push(
                                "proposition pour découvrir une nouvelle expérience"
                            );

                        }


                    }


                    // =================================================
                    // NOUVEL UTILISATEUR
                    // =================================================

                    else {


                        // =================================================
                        // POPULARITE
                        // =================================================

                        if (nombreReservations >= 10) {

                            score += 35;

                            raisons.push(
                                "offre très populaire auprès des voyageurs"
                            );

                        }

                        else if (nombreReservations >= 5) {

                            score += 30;

                            raisons.push(
                                "offre appréciée par les voyageurs"
                            );

                        }

                        else if (nombreReservations >= 2) {

                            score += 20;

                            raisons.push(
                                "offre déjà choisie par plusieurs voyageurs"
                            );

                        }

                        else if (nombreReservations >= 1) {

                            score += 10;

                            raisons.push(
                                "offre déjà choisie par des voyageurs"
                            );

                        }


                        // =================================================
                        // DISPONIBILITE
                        // =================================================

                        if (disponibilite >= 5) {

                            score += 15;

                            raisons.push(
                                "bonne disponibilité"
                            );

                        }

                        else {

                            score += 8;

                        }


                        // =================================================
                        // PRIX
                        // =================================================

                        if (prix <= 250000) {

                            score += 25;

                            raisons.push(
                                "offre accessible"
                            );

                        }

                        else if (prix <= 500000) {

                            score += 20;

                            raisons.push(
                                "rapport prix intéressant"
                            );

                        }

                        else if (prix <= 1000000) {

                            score += 15;

                        }

                        else {

                            score += 8;

                        }


                        // =================================================
                        // DIVERSITE
                        // =================================================

                        score += 10;

                        raisons.push(
                            "sélectionnée pour vous faire découvrir une nouvelle expérience"
                        );

                    }


                    // =================================================
                    // LIMITE DU SCORE
                    // =================================================

                    if (score > 100) {

                        score = 100;

                    }


                    // =================================================
                    // RAISON FINALE
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
                            "Cette offre a été sélectionnée par notre système de recommandation.";

                    }


                    // =================================================
                    // RESULTAT
                    // =================================================

                    return {

                        id_offre:
                            Number(
                                offre.id_offre
                            ),

                        titre:
                            offre.titre,

                        description:
                            offre.description,

                        prix:
                            Number(
                                offre.prix || 0
                            ),

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
                            Number(
                                offre.disponibilite || 0
                            ),

                        nombre_reservations:
                            nombreReservations,

                        score:
                            Number(
                                score
                            ),

                        raison:
                            raison

                    };

                }

            );


        // =================================================
        // 8. TRI DES RECOMMANDATIONS
        // =================================================

        recommandations.sort(

            (a, b) => {

                if (
                    b.score !== a.score
                ) {

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
        // 9. PRENDRE LES 5 MEILLEURES
        // =================================================

        const topRecommandations =
            recommandations.slice(0, 5);


        console.log(
            "========================================"
        );

        console.log(
            "TOP RECOMMANDATIONS"
        );

        console.log(
            "========================================"
        );


        topRecommandations.forEach(

            recommandation => {

                console.log(

                    `${recommandation.titre} => ${recommandation.score}%`

                );

            }

        );


        // =================================================
        // 10. SUPPRIMER LES ANCIENNES RECOMMANDATIONS
        // =================================================

        await db.query(

            `
            DELETE FROM recommandation_ia
            WHERE id_utilisateur = ?
            `,

            [id_utilisateur]

        );


        // =================================================
        // 11. ENREGISTRER LES NOUVELLES RECOMMANDATIONS
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
        // 12. REPONSE
        // =================================================

        return res.json({

            message:
                "Recommandations personnalisées générées avec succès",

            utilisateur: {

                id_utilisateur:
                    utilisateur.id_utilisateur,

                nom:
                    utilisateur.nom,

                prenom:
                    utilisateur.prenom

            },

            historique:
                historique.length,

            offres_exclues:
                offresDejaReservees.size,

            nombre:
                topRecommandations.length,

            recommandations:
                topRecommandations

        });


    }

    catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "ERREUR GENERATION RECOMMANDATIONS IA"
        );

        console.error(
            error
        );

        console.error(
            "========================================"
        );


        return res.status(500).json({

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

exports.getRecommandations = async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (!id || Number.isNaN(id)) {

            return res.status(400).json({

                message:
                    "ID utilisateur invalide"

            });

        }


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
                    ON r.id_offre = o.id_offre

                LEFT JOIN categorie c
                    ON o.id_categorie = c.id_categorie

                LEFT JOIN destination d
                    ON o.id_destination = d.id_destination

                WHERE
                    r.id_utilisateur = ?

                AND
                    o.disponibilite > 0

                ORDER BY
                    r.score DESC,
                    r.date_recommandation DESC

                `,

                [id]

            );


        return res.json(result);


    }

    catch (error) {

        console.error(
            "ERREUR RECUPERATION RECOMMANDATIONS :",
            error
        );


        return res.status(500).json({

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

        const [offres_plus_recommandees] =
            await db.query(`

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


        // =================================================
        // 3. MEILLEURE OFFRE
        // =================================================

        const [meilleureOffre] =
            await db.query(`

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

        const [dernieres] =
            await db.query(`

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
                    ON r.id_utilisateur =
                       u.id_utilisateur

                ORDER BY

                    r.date_recommandation DESC

                LIMIT 10

            `);


        // =================================================
        // 5. REPONSE
        // =================================================

        return res.json({

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

            offres_plus_recommandees:
                offres_plus_recommandees,

            meilleure_offre:
                meilleureOffre.length > 0
                    ? meilleureOffre[0]
                    : null,

            dernieres_recommandations:
                dernieres

        });

    }

    catch (error) {

        console.error(
            "ERREUR STATISTIQUES RECOMMANDATIONS IA :",
            error
        );


        return res.status(500).json({

            message:
                "Erreur récupération statistiques recommandations",

            error:
                error.message

        });

    }

};

