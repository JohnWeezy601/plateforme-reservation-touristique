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
// REPONSES LOCALES
// =====================================================
//
// Ces demandes NE SONT PAS envoyées à Gemini.
// Elles consomment donc 0 quota.
// =====================================================

function analyserDemandeLocale(message) {

    const texte = normaliserTexte(message);

    // =================================================
    // MESSAGE VIDE
    // =================================================

    if (!texte) {

        return {
            utiliseGemini: false,

            resultat: {
                type_demande: "conversation",
                besoin_offres: false,
                intention: "",
                reponse: "Veuillez saisir votre demande.",
                offre_ids: [],
                navigation: [],
                budget: null,
                nombre_personnes: null,
                duree: null
            }
        };

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

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "conversation",

                besoin_offres: false,

                intention: "salutation",

                reponse:
                    "Bonjour ! 👋 Je suis votre assistant touristique. Je peux vous aider à découvrir les destinations, rechercher une offre ou vous expliquer comment utiliser la plateforme.",

                offre_ids: [],

                navigation: [
                    "/Accueil",
                    "/destinations-public",
                    "/offres-public"
                ],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 2. REMERCIEMENTS
    // =================================================

    const remerciements = [

        "merci",
        "merci beaucoup",
        "merci bcp",
        "c est bon merci",
        "cest bon merci",
        "d accord merci",
        "daccord merci",
        "ok merci",
        "super merci",
        "tres bien merci"

    ];


    if (remerciements.includes(texte)) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "conversation",

                besoin_offres: false,

                intention: "remerciement",

                reponse:
                    "Avec plaisir ! 😊 N'hésitez pas si vous avez besoin d'aide pour votre voyage.",

                offre_ids: [],

                navigation: [],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 3. PETITES CONVERSATIONS
    // =================================================

    const conversations = [

        "ca va",
        "comment vas tu",
        "comment tu vas",
        "qui es tu",
        "tu es qui",
        "tu peux m aider",
        "tu peux maider",
        "pouvez vous m aider",
        "pouvez vous maider",
        "peux tu m aider",
        "peux tu maider"

    ];


    if (conversations.includes(texte)) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "conversation",

                besoin_offres: false,

                intention: "conversation_generale",

                reponse:
                    "Bien sûr ! 😊 Je suis l'assistant touristique de la plateforme. Je peux vous aider à trouver une offre, découvrir une destination ou comprendre comment utiliser la plateforme.",

                offre_ids: [],

                navigation: [],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 4. MESSAGES TRES SIMPLES
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
        "compris"

    ];


    if (simples.includes(texte)) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "conversation",

                besoin_offres: false,

                intention: "confirmation",

                reponse:
                    "Très bien 😊. Je reste à votre disposition pour vous aider.",

                offre_ids: [],

                navigation: [],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 5. CONNEXION
    // =================================================

    if (

        texte.includes("comment me connecter") ||
        texte.includes("comment se connecter") ||
        texte.includes("comment connecter") ||
        texte.includes("ou me connecter") ||
        texte.includes("ou se connecter") ||
        texte === "connexion" ||
        texte === "login"

    ) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "guide_plateforme",

                besoin_offres: false,

                intention: "connexion",

                reponse:
                    "Pour vous connecter, rendez-vous sur la page de connexion. Si vous n'avez pas encore de compte, vous devez d'abord vous inscrire.",

                offre_ids: [],

                navigation: [
                    "/login-client"
                ],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 6. MES RESERVATIONS
    // =================================================

    if (

        texte.includes("mes reservations") ||
        texte.includes("voir mes reservations") ||
        texte.includes("ou sont mes reservations") ||
        texte.includes("ou trouver mes reservations") ||
        texte.includes("consulter mes reservations")

    ) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "guide_plateforme",

                besoin_offres: false,

                intention: "consulter_reservations",

                reponse:
                    "Vous pouvez consulter vos réservations dans la rubrique « Mes réservations ». Vous devez être connecté à votre compte pour y accéder.",

                offre_ids: [],

                navigation: [
                    "/mes-reservations"
                ],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 7. VOIR LES OFFRES
    // =================================================

    if (

        texte === "ou sont les offres" ||
        texte === "ou trouver les offres" ||
        texte === "voir les offres" ||
        texte === "consulter les offres" ||
        texte === "je veux voir les offres" ||
        texte === "afficher les offres"

    ) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "guide_plateforme",

                besoin_offres: false,

                intention: "consulter_offres",

                reponse:
                    "Vous pouvez consulter toutes les offres touristiques actuellement disponibles sur la plateforme.",

                offre_ids: [],

                navigation: [
                    "/offres-public"
                ],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 8. DESTINATIONS
    // =================================================

    if (

        texte === "voir les destinations" ||
        texte === "consulter les destinations" ||
        texte === "je veux voir les destinations" ||
        texte === "ou sont les destinations" ||
        texte === "ou trouver les destinations"

    ) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "guide_plateforme",

                besoin_offres: false,

                intention: "consulter_destinations",

                reponse:
                    "Vous pouvez consulter les différentes destinations touristiques proposées par la plateforme.",

                offre_ids: [],

                navigation: [
                    "/destinations-public"
                ],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 9. COMMENT RESERVER ?
    // =================================================

    if (

        texte === "comment reserver" ||
        texte === "comment faire une reservation" ||
        texte === "comment effectuer une reservation" ||
        texte === "comment reserver une offre" ||
        texte === "comment ca marche pour reserver" ||
        texte === "je veux reserver" ||
        texte === "comment faire pour reserver" ||
        texte === "ou dois je aller pour reserver"

    ) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "guide_plateforme",

                besoin_offres: false,

                intention: "effectuer_reservation",

                reponse:
                    "Pour effectuer une réservation, commencez par vous connecter à votre compte. Ensuite, consultez les destinations ou les offres, choisissez l'offre qui vous intéresse, ouvrez son détail puis effectuez la réservation. Vous pourrez ensuite suivre votre réservation dans « Mes réservations » et consulter vos notifications. Lorsque la réservation est confirmée, vous pourrez procéder au paiement.",

                offre_ids: [],

                navigation: [
                    "/destinations-public",
                    "/offres-public",
                    "/login-client",
                    "/mes-reservations"
                ],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 10. PAIEMENT
    // =================================================

    if (

        texte === "comment payer" ||
        texte.includes("comment payer ma reservation") ||
        texte.includes("comment effectuer le paiement") ||
        texte.includes("comment faire le paiement") ||
        texte.includes("ou payer ma reservation")

    ) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "guide_plateforme",

                besoin_offres: false,

                intention: "paiement",

                reponse:
                    "Le paiement intervient lorsque votre réservation est confirmée. Vous pourrez alors procéder au paiement selon le mode de paiement disponible sur la plateforme. Vous pouvez ensuite retrouver votre réservation dans « Mes réservations ».",

                offre_ids: [],

                navigation: [
                    "/mes-reservations"
                ],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 11. NOTIFICATIONS
    // =================================================

    if (

        texte.includes("mes notifications") ||
        texte.includes("voir mes notifications") ||
        texte.includes("ou sont mes notifications") ||
        texte.includes("consulter mes notifications")

    ) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "guide_plateforme",

                besoin_offres: false,

                intention: "notifications",

                reponse:
                    "Les notifications vous permettent de suivre les informations liées à vos réservations, notamment leur état et leur confirmation.",

                offre_ids: [],

                navigation: [],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 12. AVIS
    // =================================================

    if (

        texte.includes("comment laisser un avis") ||
        texte.includes("comment donner mon avis") ||
        texte.includes("comment laisser mon commentaire") ||
        texte.includes("ou laisser un avis") ||
        texte.includes("comment faire un avis")

    ) {

        return {
            utiliseGemini: false,

            resultat: {

                type_demande: "guide_plateforme",

                besoin_offres: false,

                intention: "laisser_avis",

                reponse:
                    "Après votre séjour, lorsque vous êtes autorisé à laisser un avis, vous pouvez donner votre note et votre commentaire concernant l'offre. Vous pourrez également utiliser les fonctionnalités disponibles pour partager votre expérience.",

                offre_ids: [],

                navigation: [
                    "/mes-reservations"
                ],

                budget: null,

                nombre_personnes: null,

                duree: null

            }

        };

    }


    // =================================================
    // 13. AUCUNE REPONSE LOCALE
    // =================================================
    //
    // On laisse Gemini traiter le message.
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

Ne te limite jamais à une recherche par mots-clés.

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

1. créer un compte / s'inscrire ;
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

Réponds naturellement en français.

Sois clair, utile et honnête.

Ne donne pas une réponse artificiellement longue.
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
            type: ["number", "null"]
        },

        nombre_personnes: {
            type: ["integer", "null"]
        },

        duree: {
            type: ["integer", "null"]
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

    if (
        texteJSON.startsWith("```json")
    ) {

        texteJSON =
            texteJSON
                .replace(/^```json\s*/i, "")
                .replace(/\s*```\s*$/i, "")
                .trim();

    }

    else if (
        texteJSON.startsWith("```")
    ) {

        texteJSON =
            texteJSON
                .replace(/^```\s*/i, "")
                .replace(/\s*```\s*$/i, "")
                .trim();

    }

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
// TESTER / ANALYSER UNE DEMANDE AVEC GEMINI
// =====================================================

async function testerIA(
    message,
    offres = [],
    historique = []
) {

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
    // PREPARER LE CATALOGUE
    // =================================================

    const catalogue =
        Array.isArray(offres)
            ? offres.map(offre => ({

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

            }))
            : [];


    // =================================================
    // HISTORIQUE
    // =================================================

    let historiqueTexte =
        "Aucun historique disponible.";


    if (
        Array.isArray(historique) &&
        historique.length > 0
    ) {

        historiqueTexte =
            historique
                .slice(-10)
                .map(item => {

                    if (
                        typeof item === "string"
                    ) {

                        return item;

                    }

                    const role =
                        item.role ||
                        "utilisateur";

                    const contenu =
                        item.message ||
                        item.content ||
                        "";

                    return `${role} : ${contenu}`;

                })
                .join("\n");

    }


    // =================================================
    // PROMPT
    // =================================================

    const prompt = `

${CONNAISSANCE_PLATEFORME}

Voici les offres actuellement disponibles :

${JSON.stringify(catalogue, null, 2)}

Historique :

${historiqueTexte}

Message actuel :

${message}

Analyse le sens du message.

Détermine :

1. le type de demande ;
2. si une recherche d'offre est réellement nécessaire ;
3. les offres réellement pertinentes ;
4. la réponse naturelle ;
5. les routes utiles ;
6. le budget ;
7. le nombre de personnes ;
8. la durée.

IMPORTANT :

Si la demande concerne le fonctionnement de la plateforme,
ne cherche pas d'offres.

Si la demande concerne une information touristique générale,
ne cherche pas d'offres.

Si la demande recherche réellement une offre,
utilise uniquement le catalogue.

Si aucune offre ne correspond,
offre_ids doit être [].

Ne sélectionne jamais une offre simplement parce qu'elle
est disponible ou moins chère.

Ne mélange jamais différentes destinations ou régions.

Retourne uniquement un objet JSON correspondant au schéma.
`;


    try {

        console.log("====================================");
        console.log("APPEL GEMINI");
        console.log("Modèle :", GEMINI_MODEL);
        console.log("====================================");


        const response =
            await ai.models.generateContent({

                model:
                    GEMINI_MODEL,

                contents:
                    prompt,

                config: {

                    responseFormat: {

                        text: {

                            mimeType:
                                "application/json",

                            schema:
                                schemaAssistant

                        }

                    }

                }

            });


        const texteReponse =
            response.text;


        console.log(
            "REPONSE GEMINI :",
            texteReponse
        );


        const texteJSON =
            nettoyerJSON(
                texteReponse
            );


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

            throw new Error(
                "La réponse de Gemini n'est pas un JSON valide."
            );

        }


        // =================================================
        // VALEURS PAR DEFAUT
        // =================================================

        if (!resultat.type_demande) {

            resultat.type_demande =
                "conversation";

        }

        if (
            typeof resultat.besoin_offres !==
            "boolean"
        ) {

            resultat.besoin_offres =
                false;

        }

        if (
            typeof resultat.intention !==
            "string"
        ) {

            resultat.intention =
                "";

        }

        if (
            typeof resultat.reponse !==
            "string"
        ) {

            resultat.reponse =
                "Je peux vous aider à préparer votre voyage à Madagascar.";

        }


        if (
            !Array.isArray(
                resultat.navigation
            )
        ) {

            resultat.navigation =
                [];

        }


        if (
            !Array.isArray(
                resultat.offre_ids
            )
        ) {

            resultat.offre_ids =
                [];

        }


        // =================================================
        // VERIFIER LES IDS
        // =================================================

        const idsDisponibles =
            new Set(

                catalogue.map(
                    offre =>
                        Number(
                            offre.id_offre
                        )
                )

            );


        resultat.offre_ids =
            resultat.offre_ids
                .map(id => Number(id))
                .filter(
                    id =>
                        Number.isInteger(id) &&
                        idsDisponibles.has(id)
                );


        // =================================================
        // SECURITE
        // =================================================

        if (
            resultat.type_demande !==
            "recherche_offre"
        ) {

            resultat.besoin_offres =
                false;

            resultat.offre_ids =
                [];

        }


        if (
            resultat.type_demande ===
            "recherche_offre"
        ) {

            resultat.besoin_offres =
                true;

        }


        // =================================================
        // ROUTES AUTORISEES
        // =================================================

        const routesAutorisees = [

            "/Accueil",
            "/destinations-public",
            "/offres-public",
            "/login-client",
            "/mes-reservations"

        ];


        resultat.navigation =
            resultat.navigation
                .filter(
                    route =>
                        typeof route ===
                        "string"
                )
                .filter(route => {

                    if (
                        routesAutorisees.includes(
                            route
                        )
                    ) {

                        return true;

                    }

                    if (
                        /^\/detail-offre\/\d+$/
                            .test(route)
                    ) {

                        return true;

                    }

                    if (
                        /^\/reservation-public\/\d+$/
                            .test(route)
                    ) {

                        return true;

                    }

                    return false;

                });


        // =================================================
        // AJOUT ROUTE DETAIL
        // =================================================

        if (
            resultat.offre_ids.length > 0
        ) {

            const premierId =
                resultat.offre_ids[0];

            const routeDetail =
                `/detail-offre/${premierId}`;

            if (
                !resultat.navigation.includes(
                    routeDetail
                )
            ) {

                resultat.navigation.push(
                    routeDetail
                );

            }

        }


        console.log(
            "RESULTAT IA :",
            JSON.stringify(
                resultat,
                null,
                2
            )
        );


        return resultat;

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


        const status =
            error?.status ||
            error?.code ||
            error?.response?.status ||
            null;


        // =================================================
        // 429
        // =================================================

        if (
            Number(status) === 429 ||
            error?.message?.includes("429") ||
            error?.message
                ?.toLowerCase()
                .includes("quota")
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
        // 503
        // =================================================

        if (
            Number(status) === 503 ||
            error?.message?.includes("503")
        ) {

            const erreur =
                new Error(
                    "Gemini est temporairement indisponible."
                );

            erreur.status =
                503;

            throw erreur;

        }


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