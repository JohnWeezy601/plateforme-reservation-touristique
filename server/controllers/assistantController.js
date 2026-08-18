const db = require("../db");

const {
    testerIA
} = require("../services/iaService");

// =====================================================
// NORMALISER UN TEXTE
// =====================================================

function normaliserTexte(message) {

    return String(message || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();

}


// =====================================================
// ANALYSER LES DEMANDES SIMPLES SANS GEMINI
// =====================================================

function analyserDemandeSimple(message) {

    const texte = normaliserTexte(message);


    // =================================================
    // IMPORTANT
    // =================================================
    // Une recherche d'offre doit obligatoirement
    // continuer vers Gemini.
    // =================================================

    const demandeRechercheOffre =
        /(cherche|recherche|propose|proposer|trouve|trouver|recommande|recommander|offre|offres|activite|activité|voyage|sejour|séjour|randonnee|randonnée|plage|aventure|excursion|visiter|visite)/i;

    if (
        demandeRechercheOffre.test(texte)
    ) {

        return null;

    }


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

                "/",
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

                "/",
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

                "/",
                "/destinations-public",
                "/offres-public"

            ]

        };

    }


    // =================================================
    // 5. REPONSES COURTES
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
                "Pour vous connecter, rendez-vous sur la page de connexion, puis saisissez vos identifiants. Si vous n'avez pas encore de compte, vous devez d'abord créer un compte.",

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
        /^(ou|où|comment|je veux|je peux).*(mes reservations|mes réservations|voir mes reservations|voir mes réservations)[!.?\s]*$/i;


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
                "Vous pouvez découvrir les destinations touristiques disponibles sur la plateforme depuis la page « Destinations ».",

            navigation: [

                "/destinations-public"

            ]

        };

    }


    // =================================================
    // 11. RESERVATION
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
                "Pour effectuer une réservation, connectez-vous d'abord à votre compte. Consultez ensuite les destinations ou les offres disponibles. Choisissez une offre et ouvrez son détail, puis effectuez votre réservation. Après la réservation, consultez vos notifications pour vérifier le message de confirmation. Lorsque la réservation est confirmée, vous pouvez continuer avec le paiement. Vous pouvez ensuite suivre votre réservation depuis « Mes réservations ». Après votre séjour, pensez également à laisser un avis.",

            navigation: [

                "/login-client",
                "/destinations-public",
                "/offres-public",
                "/mes-reservations",
                "/notifications"

            ]

        };

    }


    // =================================================
    // 12. PAIEMENT
    // =================================================

    const paiementSimple =
        /^(comment|ou|où|je veux|je dois|comment faire).*(payer|paiement|paiment|payement)[!.?\s]*$/i;


    if (
        paiementSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Comprendre comment effectuer le paiement",

            reponse:
                "Après avoir effectué votre réservation, consultez vos notifications. Vous devez d'abord vérifier le message de confirmation de la réservation. Lorsque la réservation est confirmée, vous pouvez continuer vers le paiement. Après le paiement, vous pourrez retrouver les informations liées au paiement et votre reçu selon les fonctionnalités disponibles dans votre espace. Vous pouvez également suivre votre réservation depuis « Mes réservations ».",

            navigation: [

                "/notifications",
                "/mes-reservations",
                "/paiements"

            ]

        };

    }


    // =================================================
    // 13. RECUS
    // =================================================

    const recuSimple =
        /^(comment|ou|où|je veux|je peux|ou est|où est|comment faire).*(recu|reçu|justificatif|preuve).*(paiement|payer)?[!.?\s]*$/i;


    if (
        recuSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Trouver le reçu de paiement",

            reponse:
                "Après avoir effectué votre paiement, consultez les informations de paiement associées à votre réservation. Les notifications peuvent également vous permettre de vérifier la confirmation et les informations liées à votre paiement. Vous pouvez consulter votre réservation depuis « Mes réservations » et votre espace de paiement si celui-ci est disponible.",

            navigation: [

                "/notifications",
                "/paiements",
                "/mes-reservations"

            ]

        };

    }


    // =================================================
    // 14. NOTIFICATIONS
    // =================================================

    const notificationSimple =
        /^(comment|ou|où|je veux|je peux|ou est|où est).*(notification|notifications)[!.?\s]*$/i;


    if (
        notificationSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Consulter les notifications",

            reponse:
                "Les notifications vous permettent notamment de suivre l'évolution de votre réservation et de vérifier les messages de confirmation. Après avoir effectué une réservation, consultez régulièrement vos notifications. Lorsqu'un message confirme votre réservation, vous pouvez continuer avec le paiement.",

            navigation: [

                "/notifications"

            ]

        };

    }


    // =================================================
    // 15. AVIS
    // =================================================

    const avisSimple =
        /^(comment|ou|où|je veux|je peux|ou est|où est).*(laisser|donner|faire|ecrire|écrire).*(avis|commentaire)[!.?\s]*$/i;


    if (
        avisSimple.test(texte)
    ) {

        return {

            type_demande:
                "guide_plateforme",

            intention:
                "Comprendre comment laisser un avis",

            reponse:
                "Après votre séjour, vous pouvez laisser un avis sur votre expérience lorsque la fonctionnalité est disponible pour votre réservation. Connectez-vous à votre compte et consultez « Mes réservations ». Pensez à partager votre expérience afin d'aider les autres voyageurs.",

            navigation: [

                "/mes-reservations"

            ]

        };

    }


    // =================================================
    // 16. AUCUNE REGLE LOCALE
    // =================================================

    return null;

}


// =====================================================
// NETTOYER LES ROUTES
// =====================================================

function nettoyerNavigation(navigation) {

    if (
        !Array.isArray(navigation)
    ) {

        return [];

    }


    const routesAutorisees = [

        "/",
        "/destinations-public",
        "/offres-public",
        "/login-client",
        "/mes-reservations",
        "/notifications",
        "/paiements"

    ];


    return navigation

        .filter(
            route =>
                typeof route === "string"
        )

        .filter(
            route => {

                if (
                    routesAutorisees.includes(route)
                ) {

                    return true;

                }


                if (
                    /^\/detail-offre\/\d+$/.test(route)
                ) {

                    return true;

                }


                if (
                    /^\/reservation-public\/\d+$/.test(route)
                ) {

                    return true;

                }


                return false;

            }
        )

        .filter(
            (route, index, tableau) =>
                tableau.indexOf(route) === index
        );

}


// =====================================================
// ASSISTANT TOURISTIQUE
// =====================================================

exports.assisterTouriste = async (req, res) => {

    try {

        const {

            message,

            historique = [],

            preferences = {},

            pageActuelle = "/"

        } = req.body;


        // =================================================
        // VERIFICATION
        // =================================================

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {

            return res.status(400).json({

                message:
                    "Veuillez saisir une demande.",

                analyse: {},

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
            "Page actuelle :",
            pageActuelle
        );

        console.log(
            "===================================="
        );


        // =================================================
        // 1. ANALYSE LOCALE
        // =================================================

        const demandeSimple =
            analyserDemandeSimple(message);


        if (
            demandeSimple
        ) {

            console.log(
                "REPONSE LOCALE - GEMINI NON UTILISE"
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

                    destination:
                        preferences.destination ||
                        "",

                    budget:
                        null,

                    nombrePersonnes:
                        null,

                    duree:
                        null,

                    typeVoyage:
                        preferences.typeVoyage ||
                        ""

                },

                recommandations: [],

                navigation:
                    nettoyerNavigation(
                        demandeSimple.navigation
                    )

            });

        }


        // =================================================
        // 2. RECUPERER LES OFFRES DISPONIBLES
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

                WHERE
                    o.disponibilite > 0

                ORDER BY
                    o.prix ASC

            `);


        console.log(
            "Nombre d'offres disponibles :",
            offres.length
        );


        // =================================================
        // 3. CATALOGUE POUR GEMINI
        // =================================================

        const catalogueGemini =
            offres.map(
                offre => ({

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

                    capacite:
                        offre.capacite,

                    disponibilite:
                        offre.disponibilite,

                    destination:
                        offre.destination,

                    region:
                        offre.region,

                    pays:
                        offre.pays,

                    categorie:
                        offre.categorie

                })
            );


        // =================================================
        // 4. APPEL GEMINI
        // =================================================

        let analyseIA;


        try {

            console.log(
                "APPEL GEMINI"
            );


            analyseIA =
                await testerIA(

                    message,

                    catalogueGemini,

                    historique

                );


            console.log(
                "REPONSE GEMINI :",
                analyseIA
            );

        }
        catch (error) {

            console.error(
                "ERREUR GEMINI :",
                error
            );


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
            // QUOTA
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

                        destination:
                            "",

                        budget:
                            null,

                        nombrePersonnes:
                            null,

                        duree:
                            null,

                        typeVoyage:
                            ""

                    },

                    recommandations: [],

                    navigation: [

                        "/offres-public",

                        "/destinations-public"

                    ]

                });

            }


            // =================================================
            // SERVICE INDISPONIBLE
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

                        destination:
                            "",

                        budget:
                            null,

                        nombrePersonnes:
                            null,

                        duree:
                            null,

                        typeVoyage:
                            ""

                    },

                    recommandations: [],

                    navigation: [

                        "/destinations-public",

                        "/offres-public"

                    ]

                });

            }


            return res.json({

                message:
                    "Je rencontre momentanément un problème pour analyser votre demande. Vous pouvez continuer à consulter les offres et les destinations disponibles.",

                analyse: {

                    type_demande:
                        "information",

                    intention:
                        "Analyse momentanément indisponible",

                    besoin_offres:
                        false,

                    destination:
                        "",

                    budget:
                        null,

                    nombrePersonnes:
                        null,

                    duree:
                        null,

                    typeVoyage:
                        ""

                },

                recommandations: [],

                navigation: [

                    "/offres-public",

                    "/destinations-public"

                ]

            });

        }


        // =================================================
        // 5. SECURISER LA REPONSE GEMINI
        // =================================================

        if (
            !analyseIA ||
            typeof analyseIA !== "object"
        ) {

            analyseIA = {

                reponse:
                    "Je n'ai pas pu analyser correctement votre demande.",

                besoin_offres:
                    false,

                offre_ids: [],

                navigation: []

            };

        }


        // =================================================
        // 6. OFFRE IDS
        // =================================================

        const offreIds =
            Array.isArray(
                analyseIA.offre_ids
            )
                ? analyseIA.offre_ids
                    .map(id => Number(id))
                    .filter(
                        id =>
                            Number.isInteger(id)
                    )
                : [];


        // =================================================
        // 7. RECUPERER LES VRAIES OFFRES
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
                                    ) === id

                            );

                        }
                    )

                    .filter(Boolean);

        }


        // =================================================
        // 8. SI GEMINI A CHOISI DES IDS INVALIDES
        // =================================================

        if (
            analyseIA.besoin_offres === true &&
            recommandations.length === 0
        ) {

            console.log(
                "Aucune offre correspondant aux IDs Gemini."
            );

        }


        // =================================================
        // 9. NAVIGATION GEMINI
        // =================================================

        let navigation =
            nettoyerNavigation(
                analyseIA.navigation
            );


        // =================================================
        // 10. AJOUTER LES LIENS DES OFFRES
        // =================================================

        recommandations.forEach(
            offre => {

                const routeDetail =
                    `/detail-offre/${offre.id_offre}`;


                const routeReservation =
                    `/reservation-public/${offre.id_offre}`;


                if (
                    !navigation.includes(
                        routeDetail
                    )
                ) {

                    navigation.push(
                        routeDetail
                    );

                }


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


        // =================================================
        // 11. REPONSE FINALE
        // =================================================

        return res.json({

            message:
                analyseIA.reponse ||
                "Voici les informations correspondant à votre demande.",

            analyse: {

                type_demande:
                    analyseIA.type_demande ||
                    "information",

                intention:
                    analyseIA.intention ||
                    "",

                besoin_offres:
                    analyseIA.besoin_offres === true,

                destination:
                    analyseIA.destination ||
                    preferences.destination ||
                    "",

                budget:
                    analyseIA.budget ??
                    preferences.budget ??
                    null,

                nombrePersonnes:
                    analyseIA.nombre_personnes ??
                    preferences.personnes ??
                    null,

                duree:
                    analyseIA.duree ??
                    preferences.duree ??
                    null,

                typeVoyage:
                    analyseIA.typeVoyage ||
                    preferences.typeVoyage ||
                    ""

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

            analyse: {},

            recommandations: [],

            navigation: [

                "/destinations-public",

                "/offres-public"

            ]

        });

    }

};