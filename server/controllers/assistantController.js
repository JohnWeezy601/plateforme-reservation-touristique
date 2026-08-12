const db = require("../db");

const {
    testerIA
} = require("../services/iaservice");


// =====================================================
// ANALYSER LES DEMANDES SIMPLES SANS GEMINI
// =====================================================

function analyserDemandeSimple(message) {

    const texte = message
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .replace(/\s+/g, " ");


    // =================================================
    // 1. SALUTATIONS
    // =================================================

    const salutations = [
        "bonjour",
        "bonsoir",
        "salut",
        "hello",
        "coucou",
        "hey",
        "bjr",
        "bsr"
    ];


    if (
        salutations.includes(texte)
    ) {

        return {

            type_demande:
                "conversation",

            intention:
                "Salutation",

            reponse:
                "Bonjour 👋 Je suis votre assistant touristique. Je peux vous aider à découvrir Madagascar, rechercher une offre disponible ou vous expliquer comment utiliser la plateforme.",

            navigation: [
                "/Accueil",
                "/destinations-public",
                "/offres-public"
            ]

        };

    }


    // =================================================
    // 2. REMERCIEMENTS
    // =================================================

    const remerciements = [

        "merci",
        "merci beaucoup",
        "merci bien",
        "je vous remercie",
        "c'est gentil",
        "c est gentil",
        "merci pour votre aide",
        "merci pour l'aide"

    ];


    if (
        remerciements.includes(texte)
    ) {

        return {

            type_demande:
                "conversation",

            intention:
                "Remerciement",

            reponse:
                "Avec plaisir 😊 Je reste à votre disposition pour vous aider à préparer votre voyage à Madagascar.",

            navigation: []

        };

    }


    // =================================================
    // 3. PETITES CONVERSATIONS
    // =================================================

    const petitesConversations = [

        "ca va",
        "comment ca va",
        "comment vas tu",
        "comment allez vous",
        "comment allez-vous",
        "qui es tu",
        "qui es-tu",
        "qui etes vous",
        "qui êtes vous",
        "qui êtes-vous",
        "tu vas bien",
        "vous allez bien"

    ];


    if (
        petitesConversations.includes(texte)
    ) {

        return {

            type_demande:
                "conversation",

            intention:
                "Petite conversation",

            reponse:
                "Je vais très bien, merci 😊 Je suis votre assistant touristique et je peux vous aider avec les destinations, les offres et le fonctionnement de la plateforme.",

            navigation: [
                "/Accueil",
                "/destinations-public",
                "/offres-public"
            ]

        };

    }


    // =================================================
    // 4. AIDE GENERALE
    // =================================================

    const aideSimple = [

        "aide moi",
        "aidez moi",
        "aide-moi",
        "aidez-moi",
        "tu peux m'aider",
        "tu peux m'aider ?",
        "pouvez vous m'aider",
        "pouvez-vous m'aider",
        "je veux de l'aide",
        "j'ai besoin d'aide",
        "j ai besoin d aide"

    ];


    if (
        aideSimple.includes(texte)
    ) {

        return {

            type_demande:
                "conversation",

            intention:
                "Demande d'aide générale",

            reponse:
                "Bien sûr 😊 Je peux vous aider à découvrir les destinations, rechercher les offres disponibles ou vous expliquer comment utiliser la plateforme.",

            navigation: [
                "/Accueil",
                "/destinations-public",
                "/offres-public"
            ]

        };

    }


    // =================================================
    // 5. REPONSES TRES COURTES
    // =================================================

    const reponsesCourtes = [

        "ok",
        "okay",
        "d'accord",
        "d accord",
        "oui",
        "non",
        "tres bien",
        "très bien",
        "parfait",
        "super",
        "exact",
        "exactement",
        "compris",
        "c'est bon",
        "c est bon"

    ];


    if (
        reponsesCourtes.includes(texte)
    ) {

        return {

            type_demande:
                "conversation",

            intention:
                "Confirmation ou réponse courte",

            reponse:
                "Très bien 😊 Je reste à votre disposition si vous souhaitez rechercher une offre ou obtenir des informations sur la plateforme.",

            navigation: [
                "/offres-public",
                "/destinations-public"
            ]

        };

    }


    // =================================================
    // 6. CONNEXION
    // =================================================
    //
    // Ces demandes sont suffisamment simples pour
    // ne pas nécessiter Gemini.
    //
    // =================================================

    const connexionSimple =
        /^(comment|ou|où|je veux|je dois|comment faire).*(connecter|connexion|se connecter|mon compte)[!.?\s]*$/i;


    if (
        connexionSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Se connecter à la plateforme",

            reponse:
                "Pour vous connecter, rendez-vous sur la page de connexion, puis saisissez vos identifiants. Si vous n'avez pas encore de compte, vous devez d'abord vous inscrire.",

            navigation: [
                "/login-client"
            ]

        };

    }


    // =================================================
    // 7. INSCRIPTION
    // =================================================

    const inscriptionSimple =
        /^(comment|ou|où|je veux|je dois|comment faire).*(inscrire|inscription|creer un compte|créer un compte|compte)[!.?\s]*$/i;


    if (
        inscriptionSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Créer un compte",

            reponse:
                "Pour utiliser les fonctionnalités nécessitant un compte, vous devez d'abord créer un compte puis vous connecter à la plateforme.",

            navigation: [
                "/login-client"
            ]

        };

    }


    // =================================================
    // 8. MES RESERVATIONS
    // =================================================

    const mesReservations =
        /^(ou|où|comment|je veux).*(mes reservations|mes réservations|voir mes reservations|voir mes réservations)[!.?\s]*$/i;


    if (
        mesReservations.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Consulter mes réservations",

            reponse:
                "Vous pouvez consulter vos réservations depuis la page « Mes réservations ». Vous devez être connecté à votre compte.",

            navigation: [
                "/mes-reservations"
            ]

        };

    }


    // =================================================
    // 9. VOIR LES OFFRES
    // =================================================

    const voirOffres =
        /^(ou|où|comment|je veux|je peux).*(voir|consulter|trouver|afficher).*(offres?|catalogue)[!.?\s]*$/i;


    if (
        voirOffres.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Consulter les offres",

            reponse:
                "Vous pouvez consulter toutes les offres touristiques actuellement disponibles sur la page « Offres ».",

            navigation: [
                "/offres-public"
            ]

        };

    }


    // =================================================
    // 10. VOIR LES DESTINATIONS
    // =================================================

    const voirDestinations =
        /^(ou|où|comment|je veux|je peux).*(voir|consulter|decouvrir|découvrir).*(destinations?|regions?|régions?)[!.?\s]*$/i;


    if (
        voirDestinations.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Consulter les destinations",

            reponse:
                "Vous pouvez découvrir les destinations touristiques disponibles sur la page « Destinations » de la plateforme.",

            navigation: [
                "/destinations-public"
            ]

        };

    }


    // =================================================
    // 11. GUIDE SIMPLE DE RESERVATION
    // =================================================
    //
    // Attention :
    // Une phrase très simple comme :
    // "Comment réserver ?"
    // ne nécessite pas Gemini.
    //
    // Une demande complexe concernant une réservation
    // pourra toujours être envoyée à Gemini.
    //
    // =================================================

    const reservationSimple =
        /^(comment|ou|où|je veux|je dois|comment faire).*(reserver|réserver|reservation|réservation)[!.?\s]*$/i;


    if (
        reservationSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Comprendre comment effectuer une réservation",

            reponse:
                "Pour effectuer une réservation, commencez par vous connecter à votre compte. Consultez ensuite les destinations ou les offres, choisissez une offre et ouvrez son détail. Vous pourrez alors effectuer votre réservation. Après cela, consultez vos notifications pour suivre son état. Une fois la réservation confirmée, vous pourrez procéder au paiement et retrouver votre réservation dans « Mes réservations ».",

            navigation: [
                "/login-client",
                "/destinations-public",
                "/offres-public",
                "/mes-reservations"
            ]

        };

    }


    // =================================================
    // 12. PAIEMENT SIMPLE
    // =================================================

    const paiementSimple =
        /^(comment|ou|où|je veux|je dois|comment faire).*(payer|paiement)[!.?\s]*$/i;


    if (
        paiementSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Comprendre comment effectuer le paiement",

            reponse:
                "Le paiement intervient lorsque votre réservation a été confirmée. Vous pouvez ensuite procéder au paiement selon les options proposées par la plateforme et retrouver votre réservation dans « Mes réservations ».",

            navigation: [
                "/mes-reservations"
            ]

        };

    }


    // =================================================
    // 13. NOTIFICATIONS
    // =================================================

    const notificationSimple =
        /^(comment|ou|où|je veux|je peux).*(notification|notifications)[!.?\s]*$/i;


    if (
        notificationSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Consulter les notifications",

            reponse:
                "Les notifications vous permettent notamment de suivre l'état de votre réservation. Consultez-les après avoir effectué une réservation afin de suivre son évolution.",

            navigation: []

        };

    }


    // =================================================
    // 14. AVIS SIMPLE
    // =================================================

    const avisSimple =
        /^(comment|ou|où|je veux|je peux).*(laisser|donner|faire).*(avis|commentaire)[!.?\s]*$/i;


    if (
        avisSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Comprendre comment laisser un avis",

            reponse:
                "Après votre séjour, vous pourrez laisser un avis lorsque vous serez autorisé à le faire. Vous devez être connecté à votre compte.",

            navigation: [
                "/mes-reservations"
            ]

        };

    }


    // =================================================
    // AUCUNE REGLE LOCALE
    // =================================================
    //
    // La demande est probablement suffisamment complexe
    // pour nécessiter Gemini.
    //
    // =================================================

    return null;

}



// =====================================================
// ASSISTANT TOURISTIQUE INTELLIGENT
// =====================================================

exports.assisterTouriste = async (req, res) => {

    try {

        const {
            message,
            historique = []
        } = req.body;


        // =================================================
        // 1. VERIFICATION DU MESSAGE
        // =================================================

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {

            return res.status(400).json({

                message:
                    "Veuillez saisir une demande.",

                recommandations: [],

                navigation: []

            });

        }


        console.log(
            "===================================="
        );

        console.log(
            "ASSISTANT TOURISTIQUE"
        );

        console.log(
            "Message :",
            message
        );

        console.log(
            "===================================="
        );


        // =================================================
        // 2. ANALYSE LOCALE
        // =================================================
        //
        // IMPORTANT :
        //
        // Cette étape est exécutée AVANT :
        //
        // - la requête Gemini ;
        // - la récupération du catalogue ;
        // - l'utilisation du quota Gemini.
        //
        // =================================================

        const demandeSimple =
            analyserDemandeSimple(message);


        if (
            demandeSimple
        ) {

            console.log(
                "===================================="
            );

            console.log(
                "REPONSE LOCALE"
            );

            console.log(
                "Aucun appel Gemini nécessaire."
            );

            console.log(
                "===================================="
            );


            return res.json({

                message:
                    demandeSimple.reponse,

                analyse: {

                    type_demande:
                        demandeSimple.type_demande,

                    intention:
                        demandeSimple.intention,

                    besoin_offres:
                        false,

                    budget:
                        null,

                    nombrePersonnes:
                        null,

                    duree:
                        null

                },

                recommandations: [],

                navigation:
                    demandeSimple.navigation

            });

        }


        // =================================================
        // 3. RECUPERER LES OFFRES
        // =================================================
        //
        // Cette partie n'est exécutée que si Gemini
        // est réellement nécessaire.
        //
        // =================================================

        const [offres] =
            await db.query(`

                SELECT

                    o.id_offre,
                    o.titre,
                    o.description,
                    o.prix,
                    o.capacite,
                    o.disponibilite,
                    o.image,

                    o.id_destination,
                    o.id_categorie,

                    d.nom AS destination,
                    d.region,
                    d.pays,

                    c.nom AS categorie

                FROM offre o

                LEFT JOIN destination d
                    ON o.id_destination =
                       d.id_destination

                LEFT JOIN categorie c
                    ON o.id_categorie =
                       c.id_categorie

                WHERE o.disponibilite > 0

                ORDER BY o.prix ASC

            `);


        console.log(
            "Nombre total d'offres disponibles :",
            offres.length
        );


        // =================================================
        // 4. APPEL GEMINI
        // =================================================

        let analyseIA;


        try {

            console.log(
                "===================================="
            );

            console.log(
                "APPEL GEMINI NECESSAIRE"
            );

            console.log(
                "===================================="
            );


            analyseIA =
                await testerIA(

                    message,

                    offres,

                    historique

                );

        }
        catch (error) {

            console.error(
                "===================================="
            );

            console.error(
                "ERREUR GEMINI"
            );

            console.error(
                error
            );

            console.error(
                "===================================="
            );


            // =================================================
            // RECUPERER LE STATUT
            // =================================================

            const status =
                Number(
                    error?.status ||
                    error?.code ||
                    error?.response?.status ||
                    0
                );


            const messageErreur =
                String(
                    error?.message ||
                    ""
                ).toLowerCase();


            // =================================================
            // 429 = QUOTA / LIMITE
            // =================================================

            if (
                status === 429 ||
                messageErreur.includes("429") ||
                messageErreur.includes("quota") ||
                messageErreur.includes("rate limit")
            ) {

                return res.json({

                    message:
                        "L'assistant intelligent a temporairement atteint sa limite d'utilisation. Vous pouvez néanmoins consulter directement les offres et les destinations disponibles sur la plateforme.",

                    analyse: {

                        type_demande:
                            "information",

                        intention:
                            "Limite temporaire de l'assistant intelligent",

                        besoin_offres:
                            false,

                        budget:
                            null,

                        nombrePersonnes:
                            null,

                        duree:
                            null

                    },

                    recommandations: [],

                    navigation: [

                        "/offres-public",

                        "/destinations-public"

                    ]

                });

            }


            // =================================================
            // 503 = GEMINI INDISPONIBLE
            // =================================================

            if (
                status === 503 ||
                messageErreur.includes("503") ||
                messageErreur.includes("unavailable")
            ) {

                return res.json({

                    message:
                        "L'assistant intelligent est momentanément indisponible. Vous pouvez continuer à consulter les destinations et les offres disponibles sur la plateforme.",

                    analyse: {

                        type_demande:
                            "information",

                        intention:
                            "Service temporairement indisponible",

                        besoin_offres:
                            false,

                        budget:
                            null,

                        nombrePersonnes:
                            null,

                        duree:
                            null

                    },

                    recommandations: [],

                    navigation: [

                        "/destinations-public",

                        "/offres-public"

                    ]

                });

            }


            // =================================================
            // AUTRE ERREUR
            // =================================================

            return res.json({

                message:
                    "Vous pouvez continuer à découvrir les destinations et les offres disponibles sur notre plateforme.",

                analyse: {

                    type_demande:
                        "information",

                    intention:
                        "Analyse momentanément indisponible",

                    besoin_offres:
                        false,

                    budget:
                        null,

                    nombrePersonnes:
                        null,

                    duree:
                        null

                },

                recommandations: [],

                navigation: [

                    "/destinations-public",

                    "/offres-public"

                ]

            });

        }


        // =================================================
        // 5. SECURISER LES OFFRE_IDS
        // =================================================

        const offreIds =
            Array.isArray(
                analyseIA.offre_ids
            )
                ?
                analyseIA.offre_ids
                :
                [];


        // =================================================
        // 6. RECUPERER LES OFFRES SELECTIONNEES
        // =================================================

        let recommandations = [];


        if (
            analyseIA.besoin_offres === true &&
            offreIds.length > 0
        ) {

            recommandations =
                offreIds

                    .map(
                        id => {

                            return offres.find(

                                offre =>

                                    Number(
                                        offre.id_offre
                                    ) ===
                                    Number(id)

                            );

                        }
                    )

                    .filter(Boolean);

        }


        // =================================================
        // 7. NAVIGATION
        // =================================================

        let navigation =
            Array.isArray(
                analyseIA.navigation
            )
                ?
                [
                    ...analyseIA.navigation
                ]
                :
                [];


        // =================================================
        // 8. ROUTES AUTORISEES
        // =================================================

        const routesAutorisees = [

            "/Accueil",

            "/destinations-public",

            "/offres-public",

            "/login-client",

            "/mes-reservations"

        ];


        // =================================================
        // 9. NETTOYER LES ROUTES
        // =================================================

        navigation =
            navigation

                .filter(
                    route =>
                        typeof route ===
                        "string"
                )

                .filter(
                    route => {

                        // ---------------------------------
                        // Routes fixes
                        // ---------------------------------

                        if (
                            routesAutorisees.includes(
                                route
                            )
                        ) {

                            return true;

                        }


                        // ---------------------------------
                        // Détail d'une offre
                        // ---------------------------------

                        if (
                            /^\/detail-offre\/\d+$/
                                .test(route)
                        ) {

                            return true;

                        }


                        // ---------------------------------
                        // Réservation d'une offre
                        // ---------------------------------

                        if (
                            /^\/reservation-public\/\d+$/
                                .test(route)
                        ) {

                            return true;

                        }


                        return false;

                    }
                );


        // =================================================
        // 10. AJOUTER AUTOMATIQUEMENT LE DETAIL
        // =================================================

        if (
            recommandations.length > 0
        ) {

            recommandations.forEach(
                offre => {

                    const routeDetail =
                        `/detail-offre/${offre.id_offre}`;


                    if (
                        !navigation.includes(
                            routeDetail
                        )
                    ) {

                        navigation.push(
                            routeDetail
                        );

                    }

                }
            );

        }


        // =================================================
        // 11. AJOUTER LA ROUTE DE RESERVATION
        // =================================================
        //
        // On garde ta logique de réservation.
        //
        // =================================================

        if (
            recommandations.length > 0
        ) {

            recommandations.forEach(
                offre => {

                    const routeReservation =
                        `/reservation-public/${offre.id_offre}`;


                    if (
                        !navigation.includes(
                            routeReservation
                        )
                    ) {

                        navigation.push(
                            routeReservation
                        );

                    }

                }
            );

        }


        // =================================================
        // 12. REPONSE FINALE
        // =================================================

        return res.json({

            message:
                analyseIA.reponse,

            analyse: {

                type_demande:
                    analyseIA.type_demande,

                intention:
                    analyseIA.intention,

                besoin_offres:
                    analyseIA.besoin_offres,

                budget:
                    analyseIA.budget,

                nombrePersonnes:
                    analyseIA.nombre_personnes,

                duree:
                    analyseIA.duree

            },

            recommandations,

            navigation

        });

    }
    catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "ERREUR ASSISTANT TOURISTIQUE"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );


        return res.status(500).json({

            message:
                "Une erreur inattendue est survenue. Vous pouvez continuer à consulter les destinations et les offres disponibles.",

            recommandations: [],

            navigation: [

                "/destinations-public",

                "/offres-public"

            ]

        });

    }

};