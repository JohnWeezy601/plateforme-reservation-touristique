require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");


// =====================================================
// CONFIGURATION GEMINI
// =====================================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// =====================================================
// MODELE GEMINI
// =====================================================

const GEMINI_MODEL = "gemini-3.5-flash-lite";


// =====================================================
// ROUTES AUTORISEES
// =====================================================

const ROUTES_AUTORISEES = [

    "/Accueil",

    "/destinations-public",

    "/offres-public",

    "/login-client",

    "/mes-reservations"

];


// =====================================================
// NORMALISER UN MESSAGE
// =====================================================

function normaliserTexte(texte) {

    return String(texte || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[!?.,;:()[\]{}"'`]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


// =====================================================
// RESULTAT LOCAL STANDARD
// =====================================================

function creerResultatLocal({

    type_demande = "conversation",

    besoin_offres = false,

    intention = "",

    reponse = "",

    offre_ids = [],

    navigation = [],

    budget = null,

    nombre_personnes = null,

    duree = null

}) {

    return {

        utiliseGemini: false,

        resultat: {

            type_demande,

            besoin_offres,

            intention,

            reponse,

            offre_ids,

            navigation,

            budget,

            nombre_personnes,

            duree

        }

    };

}


// =====================================================
// ANALYSER UNE DEMANDE LOCALE
// =====================================================
//
// Ces demandes ne nécessitent pas Gemini.
// Elles consomment donc 0 quota Gemini.
// =====================================================

function analyserDemandeLocale(message) {

    const texte = normaliserTexte(message);


    // =================================================
    // MESSAGE VIDE
    // =================================================

    if (!texte) {

        return creerResultatLocal({

            type_demande: "conversation",

            intention: "message_vide",

            reponse:
                "Veuillez saisir votre demande.",

            navigation: []

        });

    }


    // =================================================
    // 1. SALUTATIONS
    // =================================================

    const salutations = [

        "bonjour",
        "bonsoir",
        "bonne journee",
        "salut",
        "hello",
        "coucou",
        "hey",
        "bjr",
        "bsr"

    ];


    if (salutations.includes(texte)) {

        return creerResultatLocal({

            type_demande: "conversation",

            intention: "salutation",

            reponse:
                "Bonjour ! 👋 Je suis votre assistant touristique. Je peux vous aider à découvrir les destinations, rechercher une offre ou vous expliquer comment utiliser la plateforme.",

            navigation: [

                "/Accueil",

                "/destinations-public",

                "/offres-public"

            ]

        });

    }


    // =================================================
    // 2. REMERCIEMENTS
    // =================================================

    const remerciements = [

        "merci",
        "merci beaucoup",
        "merci bcp",
        "merci bien",
        "je vous remercie",
        "c est gentil",
        "cest gentil",
        "c est bon merci",
        "cest bon merci",
        "d accord merci",
        "daccord merci",
        "ok merci",
        "super merci",
        "tres bien merci"

    ];


    if (remerciements.includes(texte)) {

        return creerResultatLocal({

            type_demande: "conversation",

            intention: "remerciement",

            reponse:
                "Avec plaisir ! 😊 N'hésitez pas si vous avez besoin d'aide pour préparer votre voyage.",

            navigation: []

        });

    }


    // =================================================
    // 3. PETITES CONVERSATIONS
    // =================================================

    const conversations = [

        "ca va",
        "comment ca va",
        "comment vas tu",
        "comment tu vas",
        "comment allez vous",
        "qui es tu",
        "qui es tu",
        "tu es qui",
        "qui etes vous",
        "tu vas bien",
        "vous allez bien",

        "tu peux m aider",
        "tu peux maider",
        "pouvez vous m aider",
        "pouvez vous maider",
        "peux tu m aider",
        "peux tu maider",

        "j ai besoin d aide",
        "jai besoin d aide",
        "aide moi",
        "aidez moi"

    ];


    if (conversations.includes(texte)) {

        return creerResultatLocal({

            type_demande: "conversation",

            intention: "conversation_generale",

            reponse:
                "Bien sûr ! 😊 Je suis l'assistant touristique de la plateforme. Je peux vous aider à trouver une offre, découvrir une destination ou comprendre comment utiliser la plateforme.",

            navigation: [

                "/Accueil",

                "/destinations-public",

                "/offres-public"

            ]

        });

    }


    // =================================================
    // 4. REPONSES TRES COURTES
    // =================================================

    const simples = [

        "ok",
        "okay",
        "d accord",
        "daccord",
        "oui",
        "non",
        "tres bien",
        "parfait",
        "super",
        "bien",
        "exact",
        "exactement",
        "compris",
        "c est bon",
        "cest bon"

    ];


    if (simples.includes(texte)) {

        return creerResultatLocal({

            type_demande: "conversation",

            intention: "confirmation",

            reponse:
                "Très bien 😊 Je reste à votre disposition si vous souhaitez rechercher une offre ou obtenir des informations sur la plateforme.",

            navigation: [

                "/offres-public",

                "/destinations-public"

            ]

        });

    }


    // =================================================
    // 5. CONNEXION
    // =================================================

    if (

        texte === "connexion" ||

        texte === "login" ||

        texte.includes("comment me connecter") ||

        texte.includes("comment se connecter") ||

        texte.includes("comment connecter") ||

        texte.includes("ou me connecter") ||

        texte.includes("ou se connecter") ||

        texte.includes("je veux me connecter") ||

        texte.includes("je dois me connecter") ||

        texte.includes("comment acceder a mon compte") ||

        texte.includes("comment acceder a mon compte")

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "connexion",

            reponse:
                "Pour vous connecter, rendez-vous sur la page de connexion et saisissez vos identifiants. Si vous n'avez pas encore de compte, vous devez d'abord vous inscrire.",

            navigation: [

                "/login-client"

            ]

        });

    }


    // =================================================
    // 6. INSCRIPTION
    // =================================================

    if (

        texte === "inscription" ||

        texte === "inscrire" ||

        texte.includes("creer un compte") ||

        texte.includes("créer un compte") ||

        texte.includes("comment creer un compte") ||

        texte.includes("comment m inscrire") ||

        texte.includes("comment minscrire") ||

        texte.includes("ou creer un compte") ||

        texte.includes("je veux creer un compte")

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "inscription",

            reponse:
                "Pour créer un compte, rendez-vous sur la page de connexion puis utilisez l'option d'inscription. Après avoir créé votre compte, vous pourrez vous connecter et utiliser les fonctionnalités de réservation.",

            navigation: [

                "/login-client"

            ]

        });

    }


    // =================================================
    // 7. MES RESERVATIONS
    // =================================================

    if (

        texte.includes("mes reservations") ||

        texte.includes("voir mes reservations") ||

        texte.includes("ou sont mes reservations") ||

        texte.includes("ou trouver mes reservations") ||

        texte.includes("consulter mes reservations") ||

        texte.includes("afficher mes reservations") ||

        texte.includes("ma reservation") ||

        texte.includes("mes reservation")

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "consulter_reservations",

            reponse:
                "Vous pouvez consulter vos réservations dans la rubrique « Mes réservations ». Vous devez être connecté à votre compte pour y accéder.",

            navigation: [

                "/mes-reservations"

            ]

        });

    }


    // =================================================
    // 8. VOIR LES OFFRES
    // =================================================

    if (

        texte === "ou sont les offres" ||

        texte === "ou trouver les offres" ||

        texte === "voir les offres" ||

        texte === "consulter les offres" ||

        texte === "je veux voir les offres" ||

        texte === "je peux voir les offres" ||

        texte === "afficher les offres" ||

        texte === "catalogue" ||

        texte === "voir le catalogue" ||

        texte === "consulter le catalogue"

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "consulter_offres",

            reponse:
                "Vous pouvez consulter toutes les offres touristiques actuellement disponibles sur la plateforme.",

            navigation: [

                "/offres-public"

            ]

        });

    }


    // =================================================
    // 9. DESTINATIONS
    // =================================================

    if (

        texte === "voir les destinations" ||

        texte === "consulter les destinations" ||

        texte === "je veux voir les destinations" ||

        texte === "ou sont les destinations" ||

        texte === "ou trouver les destinations" ||

        texte === "decouvrir les destinations" ||

        texte === "voir les regions" ||

        texte === "voir les régions"

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "consulter_destinations",

            reponse:
                "Vous pouvez consulter les différentes destinations touristiques proposées par la plateforme.",

            navigation: [

                "/destinations-public"

            ]

        });

    }


    // =================================================
    // 10. COMMENT RESERVER
    // =================================================

    if (

        texte === "comment reserver" ||

        texte === "comment faire une reservation" ||

        texte === "comment effectuer une reservation" ||

        texte === "comment reserver une offre" ||

        texte === "comment ca marche pour reserver" ||

        texte === "je veux reserver" ||

        texte === "comment faire pour reserver" ||

        texte === "ou dois je aller pour reserver" ||

        texte === "comment reserver sur la plateforme"

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "effectuer_reservation",

            reponse:
                "Pour effectuer une réservation, commencez par vous connecter à votre compte. Ensuite, consultez les destinations ou les offres, choisissez l'offre qui vous intéresse, ouvrez son détail puis effectuez la réservation. Vous pourrez ensuite suivre votre réservation dans « Mes réservations » et consulter vos notifications. Lorsque la réservation est confirmée, vous pourrez procéder au paiement.",

            navigation: [

                "/login-client",

                "/destinations-public",

                "/offres-public",

                "/mes-reservations"

            ]

        });

    }


    // =================================================
    // 11. PAIEMENT
    // =================================================

    if (

        texte === "comment payer" ||

        texte.includes("comment payer ma reservation") ||

        texte.includes("comment payer ma réservation") ||

        texte.includes("comment effectuer le paiement") ||

        texte.includes("comment faire le paiement") ||

        texte.includes("ou payer ma reservation") ||

        texte.includes("ou payer ma réservation") ||

        texte.includes("quand payer ma reservation") ||

        texte.includes("quand payer ma réservation")

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "paiement",

            reponse:
                "Le paiement intervient lorsque votre réservation est confirmée. Vous pourrez alors procéder au paiement selon le mode de paiement disponible sur la plateforme. Vous pouvez ensuite retrouver votre réservation dans « Mes réservations ».",

            navigation: [

                "/mes-reservations"

            ]

        });

    }


    // =================================================
    // 12. NOTIFICATIONS
    // =================================================

    if (

        texte.includes("mes notifications") ||

        texte.includes("voir mes notifications") ||

        texte.includes("ou sont mes notifications") ||

        texte.includes("consulter mes notifications") ||

        texte.includes("afficher mes notifications") ||

        texte === "notifications"

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "notifications",

            reponse:
                "Les notifications vous permettent notamment de suivre les informations liées à vos réservations, notamment leur état et leur confirmation.",

            navigation: []

        });

    }


    // =================================================
    // 13. AVIS
    // =================================================

    if (

        texte.includes("comment laisser un avis") ||

        texte.includes("comment donner mon avis") ||

        texte.includes("comment laisser mon commentaire") ||

        texte.includes("ou laisser un avis") ||

        texte.includes("comment faire un avis") ||

        texte.includes("comment donner un commentaire") ||

        texte.includes("ou donner mon avis")

    ) {

        return creerResultatLocal({

            type_demande: "guide_plateforme",

            intention: "laisser_avis",

            reponse:
                "Après votre séjour, lorsque vous êtes autorisé à laisser un avis, vous pouvez donner votre note et votre commentaire concernant l'offre. Vous devez être connecté à votre compte pour utiliser cette fonctionnalité.",

            navigation: [

                "/mes-reservations"

            ]

        });

    }


    // =================================================
    // 14. CONTACT / AIDE
    // =================================================

    if (

        texte === "aide" ||

        texte === "aidez moi" ||

        texte === "aide moi" ||

        texte === "j ai besoin d aide" ||

        texte === "jai besoin daide"

    ) {

        return creerResultatLocal({

            type_demande: "conversation",

            intention: "demande_aide",

            reponse:
                "Bien sûr 😊 Je peux vous aider à découvrir les destinations, rechercher une offre disponible ou vous expliquer comment utiliser la plateforme.",

            navigation: [

                "/Accueil",

                "/destinations-public",

                "/offres-public"

            ]

        });

    }


    // =================================================
    // AUCUNE REPONSE LOCALE
    // =================================================

    return {

        utiliseGemini: true

    };

}


// =====================================================
// CONNAISSANCE DE LA PLATEFORME
// =====================================================

const CONNAISSANCE_PLATEFORME = `

Tu es l'assistant touristique intelligent d'une plateforme
de réservation touristique à Madagascar.

Tu aides les utilisateurs à :

- comprendre les destinations touristiques ;
- rechercher des offres réellement disponibles ;
- choisir une offre adaptée ;
- comprendre le fonctionnement de la plateforme ;
- effectuer une réservation ;
- comprendre le paiement ;
- suivre une réservation ;
- consulter les notifications ;
- consulter leurs réservations ;
- comprendre comment laisser un avis.

Tu dois comprendre naturellement le sens du message.

Ne te limite jamais à une recherche exacte par mots-clés.

L'utilisateur peut écrire :

- correctement ou avec des fautes ;
- en français ;
- avec des abréviations ;
- avec des phrases courtes ;
- avec des phrases longues ;
- avec plusieurs informations dans une même phrase ;
- de manière vague ;
- de manière conversationnelle.

Tu dois interpréter son intention générale.

Tu dois également tenir compte de l'historique
de conversation fourni par le serveur.

La plateforme permet au client de :

1. créer un compte ;
2. se connecter ;
3. consulter les destinations ;
4. consulter les offres ;
5. consulter le détail d'une offre ;
6. effectuer une réservation ;
7. suivre l'état de sa réservation ;
8. consulter ses notifications ;
9. effectuer le paiement lorsque la réservation est confirmée ;
10. consulter ses réservations ;
11. laisser un avis lorsqu'il est autorisé.

Les principales pages publiques disponibles sont :

/Accueil

/destinations-public

/offres-public

/detail-offre/:id

/reservation-public/:id

/login-client

/mes-reservations

Utilise uniquement ces routes.

Le catalogue des offres envoyé avec la demande
provient directement de la base de données.

Tu dois utiliser uniquement ce catalogue.

Tu ne dois jamais inventer :

- une offre ;
- un prix ;
- une capacité ;
- une destination ;
- une disponibilité ;
- une région ;
- une catégorie.

Si aucune offre ne correspond :

- besoin_offres = true
- offre_ids = []

Explique honnêtement qu'aucune offre correspondante
n'est actuellement disponible.

Ne dis jamais que tu rencontres une erreur technique
simplement parce qu'aucune offre ne correspond.

Types possibles :

conversation
information_touristique
recherche_offre
guide_plateforme

Une conversation générale ne nécessite pas de recherche
dans les offres.

Une information touristique générale ne nécessite pas
de recherche dans les offres.

Une recherche réelle d'offre nécessite l'utilisation
du catalogue.

Une demande concernant le fonctionnement de la plateforme
ne nécessite pas de recherche d'offre.

Si l'utilisateur demande une information touristique
générale sur Madagascar, réponds avec des informations
générales et ne transforme pas automatiquement la
demande en recherche d'offre.

Ne présente jamais une information touristique inventée
comme provenant de la base de données.

Réponds naturellement en français.

Sois clair, utile et honnête.

Ne donne pas une réponse artificiellement longue.

Si l'utilisateur demande une offre, sélectionne uniquement
les offres réellement pertinentes.

Ne sélectionne pas une offre uniquement parce qu'elle
est disponible ou moins chère.

Le budget doit être interprété comme une contrainte
lorsqu'il est clairement exprimé.

Le nombre de personnes doit être pris en compte lorsqu'il
est exprimé.

La durée doit être prise en compte lorsqu'elle est exprimée.

Si plusieurs contraintes sont données, prends-les toutes
en compte.

Ne mélange pas différentes destinations ou régions
sans raison.

`;


// =====================================================
// SCHEMA JSON
// =====================================================

const schemaAssistant = {

    type: "object",

    properties: {

        type_demande: {

            type: "string",

            enum: [

                "conversation",

                "information_touristique",

                "recherche_offre",

                "guide_plateforme"

            ]

        },

        besoin_offres: {

            type: "boolean"

        },

        intention: {

            type: "string"

        },

        reponse: {

            type: "string"

        },

        offre_ids: {

            type: "array",

            items: {

                type: "integer"

            }

        },

        navigation: {

            type: "array",

            items: {

                type: "string"

            }

        },

        budget: {

            type: [

                "number",

                "null"

            ]

        },

        nombre_personnes: {

            type: [

                "integer",

                "null"

            ]

        },

        duree: {

            type: [

                "integer",

                "null"

            ]

        }

    },

    required: [

        "type_demande",

        "besoin_offres",

        "intention",

        "reponse",

        "offre_ids",

        "navigation",

        "budget",

        "nombre_personnes",

        "duree"

    ],

    additionalProperties: false

};


// =====================================================
// NETTOYER JSON
// =====================================================

function nettoyerJSON(texte) {

    if (!texte) {

        throw new Error(
            "Gemini n'a retourné aucune réponse."
        );

    }


    let texteJSON =
        String(texte).trim();


    // Retirer ```json
    if (
        texteJSON.startsWith("```json")
    ) {

        texteJSON =
            texteJSON
                .replace(/^```json\s*/i, "")
                .replace(/\s*```\s*$/i, "")
                .trim();

    }

    // Retirer ```
    else if (
        texteJSON.startsWith("```")
    ) {

        texteJSON =
            texteJSON
                .replace(/^```\s*/i, "")
                .replace(/\s*```\s*$/i, "")
                .trim();

    }


    // Chercher le premier objet JSON
    const debut =
        texteJSON.indexOf("{");


    const fin =
        texteJSON.lastIndexOf("}");


    if (

        debut !== -1 &&

        fin !== -1 &&

        fin > debut

    ) {

        texteJSON =
            texteJSON.substring(
                debut,
                fin + 1
            );

    }


    return texteJSON;

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


    return navigation

        .filter(
            route =>
                typeof route === "string"
        )

        .map(
            route =>
                route.trim()
        )

        .filter(
            route => {

                // -------------------------------------
                // Routes fixes
                // -------------------------------------

                if (
                    ROUTES_AUTORISEES.includes(route)
                ) {

                    return true;

                }


                // -------------------------------------
                // Détail offre
                // -------------------------------------

                if (
                    /^\/detail-offre\/\d+$/
                        .test(route)
                ) {

                    return true;

                }


                // -------------------------------------
                // Réservation
                // -------------------------------------

                if (
                    /^\/reservation-public\/\d+$/
                        .test(route)
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
// PREPARER LE CATALOGUE
// =====================================================

function preparerCatalogue(offres) {

    if (
        !Array.isArray(offres)
    ) {

        return [];

    }


    return offres.map(

        offre => ({

            id_offre:
                Number(offre.id_offre),

            titre:
                offre.titre || "",

            description:
                offre.description || "",

            prix:
                Number(offre.prix || 0),

            capacite:
                Number(offre.capacite || 0),

            disponibilite:
                Number(offre.disponibilite || 0),

            destination:
                offre.destination || "",

            region:
                offre.region || "",

            pays:
                offre.pays || "",

            categorie:
                offre.categorie || ""

        })

    );

}


// =====================================================
// PREPARER L'HISTORIQUE
// =====================================================

function preparerHistorique(historique) {

    if (

        !Array.isArray(historique) ||

        historique.length === 0

    ) {

        return "Aucun historique disponible.";

    }


    return historique

        .slice(-10)

        .map(

            item => {

                if (
                    typeof item === "string"
                ) {

                    return item;

                }


                const role =
                    item?.role ||
                    "utilisateur";


                const contenu =
                    item?.message ||
                    item?.content ||
                    "";


                return `${role} : ${contenu}`;

            }

        )

        .join("\n");

}


// =====================================================
// VALIDER LES IDS D'OFFRES
// =====================================================

function validerOffreIds(

    offreIds,

    catalogue

) {

    if (
        !Array.isArray(offreIds)
    ) {

        return [];

    }


    const idsDisponibles =
        new Set(

            catalogue.map(

                offre =>
                    Number(
                        offre.id_offre
                    )

            )

        );


    return offreIds

        .map(
            id =>
                Number(id)
        )

        .filter(

            id =>

                Number.isInteger(id) &&

                idsDisponibles.has(id)

        )

        .filter(

            (id, index, tableau) =>
                tableau.indexOf(id) === index

        );

}


// =====================================================
// NORMALISER RESULTAT GEMINI
// =====================================================

function normaliserResultatGemini(

    resultat,

    catalogue

) {

    const resultatFinal = {

        type_demande:
            resultat?.type_demande ||
            "conversation",

        besoin_offres:
            resultat?.besoin_offres === true,

        intention:
            typeof resultat?.intention === "string"
                ? resultat.intention
                : "",

        reponse:
            typeof resultat?.reponse === "string"
                ? resultat.reponse
                : "Je peux vous aider à préparer votre voyage à Madagascar.",

        offre_ids:
            validerOffreIds(
                resultat?.offre_ids,
                catalogue
            ),

        navigation:
            nettoyerNavigation(
                resultat?.navigation
            ),

        budget:
            resultat?.budget === null ||
            resultat?.budget === undefined
                ? null
                : Number(resultat.budget),

        nombre_personnes:
            resultat?.nombre_personnes === null ||
            resultat?.nombre_personnes === undefined
                ? null
                : Number(resultat.nombre_personnes),

        duree:
            resultat?.duree === null ||
            resultat?.duree === undefined
                ? null
                : Number(resultat.duree)

    };


    // =================================================
    // SECURITE DU TYPE DE DEMANDE
    // =================================================

    const typesAutorises = [

        "conversation",

        "information_touristique",

        "recherche_offre",

        "guide_plateforme"

    ];


    if (
        !typesAutorises.includes(
            resultatFinal.type_demande
        )
    ) {

        resultatFinal.type_demande =
            "conversation";

    }


    // =================================================
    // SI RECHERCHE D'OFFRE
    // =================================================

    if (
        resultatFinal.type_demande ===
        "recherche_offre"
    ) {

        resultatFinal.besoin_offres =
            true;

    }


    // =================================================
    // SI PAS RECHERCHE D'OFFRE
    // =================================================

    if (
        resultatFinal.type_demande !==
        "recherche_offre"
    ) {

        resultatFinal.besoin_offres =
            false;

        resultatFinal.offre_ids =
            [];

    }


    // =================================================
    // SECURITE NOMBRES
    // =================================================

    if (
        !Number.isFinite(
            resultatFinal.budget
        )
    ) {

        resultatFinal.budget =
            null;

    }


    if (
        !Number.isInteger(
            resultatFinal.nombre_personnes
        ) ||

        resultatFinal.nombre_personnes <= 0

    ) {

        resultatFinal.nombre_personnes =
            null;

    }


    if (
        !Number.isInteger(
            resultatFinal.duree
        ) ||

        resultatFinal.duree <= 0

    ) {

        resultatFinal.duree =
            null;

    }


    // =================================================
    // AJOUTER DETAIL OFFRE
    // =================================================

    if (
        resultatFinal.offre_ids.length > 0
    ) {

        const premierId =
            resultatFinal.offre_ids[0];


        const routeDetail =
            `/detail-offre/${premierId}`;


        if (
            !resultatFinal.navigation.includes(
                routeDetail
            )
        ) {

            resultatFinal.navigation.push(
                routeDetail
            );

        }

    }


    return resultatFinal;

}


// =====================================================
// TESTER / ANALYSER UNE DEMANDE AVEC GEMINI
// =====================================================

async function testerIA(

    message,

    offres = [],

    historique = []

) {

    // =================================================
    // VERIFICATION
    // =================================================

    if (

        !message ||

        typeof message !== "string" ||

        !message.trim()

    ) {

        throw new Error(
            "Le message envoyé à Gemini est vide."
        );

    }


    // =================================================
    // ANALYSE LOCALE
    // =================================================

    const analyseLocale =
        analyserDemandeLocale(
            message
        );


    if (
        analyseLocale &&
        analyseLocale.utiliseGemini === false
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


        return analyseLocale.resultat;

    }


    // =================================================
    // CATALOGUE
    // =================================================

    const catalogue =
        preparerCatalogue(
            offres
        );


    console.log(
        "Nombre d'offres envoyées à Gemini :",
        catalogue.length
    );


    // =================================================
    // HISTORIQUE
    // =================================================

    const historiqueTexte =
        preparerHistorique(
            historique
        );


    // =================================================
    // VERIFICATION CLE API
    // =================================================

    if (
        !process.env.GEMINI_API_KEY
    ) {

        const erreur =
            new Error(
                "GEMINI_API_KEY est absente du fichier .env."
            );

        erreur.status =
            500;

        throw erreur;

    }


    // =================================================
    // PROMPT
    // =================================================

    const prompt = `

${CONNAISSANCE_PLATEFORME}

========================================
CATALOGUE DES OFFRES DISPONIBLES
========================================

${JSON.stringify(
    catalogue,
    null,
    2
)}

========================================
HISTORIQUE DE CONVERSATION
========================================

${historiqueTexte}

========================================
MESSAGE ACTUEL
========================================

${message}

========================================
INSTRUCTIONS
========================================

Analyse le sens réel du message.

Détermine :

1. le type de demande ;
2. l'intention ;
3. si une recherche d'offre est réellement nécessaire ;
4. les offres pertinentes ;
5. une réponse naturelle ;
6. les routes utiles ;
7. le budget ;
8. le nombre de personnes ;
9. la durée.

IMPORTANT :

Si la demande concerne le fonctionnement de la plateforme,
ne cherche pas d'offres.

Si la demande concerne une information touristique générale,
ne cherche pas d'offres.

Si la demande recherche réellement une offre,
utilise uniquement le catalogue fourni.

Si aucune offre ne correspond,
offre_ids doit être [].

Ne sélectionne jamais une offre uniquement parce qu'elle
est disponible ou moins chère.

Une offre doit être pertinente par rapport à la demande.

Ne fabrique jamais d'identifiant d'offre.

Ne fabrique jamais de prix.

Ne fabrique jamais de destination.

Ne fabrique jamais de disponibilité.

Ne fabrique jamais de capacité.

Ne fabrique jamais de région.

Ne fabrique jamais de catégorie.

Les routes doivent être choisies uniquement parmi
les routes autorisées par la connaissance de la plateforme.

Retourne uniquement un objet JSON correspondant au schéma.
`;


    // =================================================
    // APPEL GEMINI
    // =================================================

    try {

        console.log(
            "===================================="
        );

        console.log(
            "APPEL GEMINI"
        );

        console.log(
            "Modèle :",
            GEMINI_MODEL
        );

        console.log(
            "===================================="
        );


        const response =
            await ai.models.generateContent({

                model:
                    GEMINI_MODEL,

                contents:
                    prompt,

                config: {

                    responseMimeType:
                        "application/json",

                    responseSchema:
                        schemaAssistant

                }

            });


        const texteReponse =
            response?.text;


        console.log(
            "REPONSE GEMINI :",
            texteReponse
        );


        // =================================================
        // NETTOYER JSON
        // =================================================

        const texteJSON =
            nettoyerJSON(
                texteReponse
            );


        // =================================================
        // PARSER JSON
        // =================================================

        let resultat;


        try {

            resultat =
                JSON.parse(
                    texteJSON
                );

        }

        catch (jsonError) {

            console.error(
                "Réponse Gemini non JSON :",
                texteReponse
            );


            const erreur =
                new Error(
                    "La réponse de Gemini n'est pas un JSON valide."
                );


            erreur.cause =
                jsonError;


            throw erreur;

        }


        // =================================================
        // NORMALISATION
        // =================================================

        const resultatFinal =
            normaliserResultatGemini(

                resultat,

                catalogue

            );


        console.log(
            "===================================="
        );

        console.log(
            "RESULTAT IA"
        );

        console.log(
            JSON.stringify(
                resultatFinal,
                null,
                2
            )
        );

        console.log(
            "===================================="
        );


        return resultatFinal;

    }

    catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "ERREUR IA SERVICE"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );


        // =================================================
        // RECUPERER LE STATUS
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
                error?.message || ""
            ).toLowerCase();


        // =================================================
        // 429 : QUOTA / RATE LIMIT
        // =================================================

        if (

            status === 429 ||

            messageErreur.includes("429") ||

            messageErreur.includes("quota") ||

            messageErreur.includes("rate limit") ||

            messageErreur.includes("resource exhausted")

        ) {

            const erreur =
                new Error(
                    "Quota Gemini dépassé temporairement."
                );


            erreur.status =
                429;


            throw erreur;

        }


        // =================================================
        // 503 : SERVICE INDISPONIBLE
        // =================================================

        if (

            status === 503 ||

            messageErreur.includes("503") ||

            messageErreur.includes("unavailable") ||

            messageErreur.includes("service unavailable")

        ) {

            const erreur =
                new Error(
                    "Gemini est temporairement indisponible."
                );


            erreur.status =
                503;


            throw erreur;

        }


        // =================================================
        // 401 / 403 : CLE API
        // =================================================

        if (

            status === 401 ||

            status === 403 ||

            messageErreur.includes("api key") ||

            messageErreur.includes("unauthorized") ||

            messageErreur.includes("permission denied")

        ) {

            const erreur =
                new Error(
                    "La clé API Gemini est invalide ou non autorisée."
                );


            erreur.status =
                status || 401;


            throw erreur;

        }


        // =================================================
        // AUTRE ERREUR
        // =================================================

        throw error;

    }

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    testerIA,

    analyserDemandeLocale

};