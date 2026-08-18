import {
    useState,
    useRef,
    useEffect
} from "react";

import {

    FaRobot,
    FaTimes,
    FaPaperPlane,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaUsers,
    FaCalendarAlt,
    FaSuitcase,
    FaExternalLinkAlt,
    FaSignInAlt,
    FaGlobe,
    FaList,
    FaClipboardList,
    FaHome,
    FaCreditCard,
    FaBell,
    FaStar

} from "react-icons/fa";

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import api from "../api/api";

import "./AssistantTouristique.css";


function AssistantTouristique() {


    // =====================================================
    // NAVIGATION
    // =====================================================

    const navigate =
        useNavigate();

    const location =
        useLocation();


    // =====================================================
    // REFERENCES
    // =====================================================

    const messagesRef =
        useRef(null);


    // =====================================================
    // ETATS
    // =====================================================

    const [ouvert, setOuvert] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [chargement, setChargement] =
        useState(false);


    // =====================================================
    // MESSAGES
    // =====================================================

    const [messages, setMessages] =
        useState([

            {

                id: 1,

                type: "assistant",

                texte:
                    "Bonjour 👋 Je suis votre assistant touristique intelligent. Je peux vous aider à trouver une offre, préparer votre voyage ou vous expliquer comment utiliser la plateforme.",

                navigation: [],

                offres: []

            },

            {

                id: 2,

                type: "assistant",

                texte:
                    "Vous pouvez par exemple demander : « Je cherche une randonnée à Madagascar pour 2 personnes pendant 5 jours avec un budget de 500 000 Ar. »",

                navigation: [],

                offres: []

            }

        ]);


    // =====================================================
    // PREFERENCES
    // =====================================================

    const [preferences, setPreferences] =
        useState({

            destination: "",

            budget: null,

            personnes: null,

            duree: null,

            typeVoyage: ""

        });


    // =====================================================
    // SCROLL AUTOMATIQUE
    // =====================================================

    useEffect(() => {

        if (
            messagesRef.current
        ) {

            messagesRef.current.scrollTop =
                messagesRef.current.scrollHeight;

        }

    }, [
        messages,
        chargement
    ]);


    // =====================================================
// OUVERTURE DEPUIS UN AUTRE COMPOSANT
// =====================================================

useEffect(() => {

    const ouvrirChatbot = () => {

        setOuvert(true);

    };

    window.addEventListener(
        "open-chatbot",
        ouvrirChatbot
    );

    return () => {

        window.removeEventListener(
            "open-chatbot",
            ouvrirChatbot
        );

    };

}, []);


    // =====================================================
    // AJOUTER MESSAGE
    // =====================================================

    const ajouterMessage = (

        type,

        texte,

        offres = [],

        navigation = []

    ) => {

        setMessages(
            anciensMessages => [

                ...anciensMessages,

                {

                    id:
                        Date.now() +
                        Math.random(),

                    type,

                    texte,

                    offres:
                        Array.isArray(offres)
                            ? offres
                            : [],

                    navigation:
                        Array.isArray(navigation)
                            ? navigation
                            : []

                }

            ]
        );

    };


    // =====================================================
    // ANALYSER LES PREFERENCES LOCALEMENT
    // =====================================================

    const analyserPreferencesLocalement =
        (texte) => {


            const texteNormalise =
                String(texte || "")
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


            const nouvellePreference = {

                ...preferences

            };


            // =================================================
            // DESTINATION
            // =================================================

            const destinationsConnues = [

                "madagascar",
                "antananarivo",
                "antsiranana",
                "diego",
                "nosy be",
                "nosy-bé",
                "toamasina",
                "tamatave",
                "mahajanga",
                "morondava",
                "fianarantsoa",
                "ranomafana",
                "sainte marie",
                "sainte-marie",
                "toliara",
                "tulear",
                "fort dauphin",
                "taolagnaro",
                "isalo"

            ];


            const destinationTrouvee =
                destinationsConnues.find(

                    destination =>

                        texteNormalise.includes(
                            destination
                        )

                );


            if (
                destinationTrouvee
            ) {

                nouvellePreference.destination =
                    destinationTrouvee;

            }


            // =================================================
            // BUDGET
            // =================================================

            const budgetMatch =
                texteNormalise.match(

                    /(\d[\d\s.]*)\s*(ar|ariary|€|eur|euros|euro)?/

                );


            if (
                budgetMatch
            ) {

                const budgetTexte =
                    budgetMatch[1]
                        .replace(/\s/g, "")
                        .replace(/\./g, "");


                const budget =
                    Number(
                        budgetTexte
                    );


                if (
                    Number.isFinite(budget) &&
                    budget > 0
                ) {

                    nouvellePreference.budget =
                        budget;

                }

            }


            // =================================================
            // PERSONNES
            // =================================================

            const personnesMatch =
                texteNormalise.match(

                    /(\d+)\s*(personne|personnes|voyageur|voyageurs)/

                );


            if (
                personnesMatch
            ) {

                nouvellePreference.personnes =
                    Number(
                        personnesMatch[1]
                    );

            }


            // =================================================
            // DUREE
            // =================================================

            const dureeMatch =
                texteNormalise.match(

                    /(\d+)\s*(jour|jours|semaine|semaines)/

                );


            if (
                dureeMatch
            ) {

                let duree =
                    Number(
                        dureeMatch[1]
                    );


                if (

                    dureeMatch[2] === "semaine" ||

                    dureeMatch[2] === "semaines"

                ) {

                    duree *= 7;

                }


                nouvellePreference.duree =
                    duree;

            }


            // =================================================
            // TYPE VOYAGE
            // =================================================

            const typesVoyage = [

                "plage",
                "aventure",
                "famille",
                "romantique",
                "culture",
                "culturel",
                "nature",
                "luxe",
                "detente",
                "randonnée",
                "randonnee",
                "affaires"

            ];


            const typeTrouve =
                typesVoyage.find(

                    type =>
                        texteNormalise.includes(
                            type
                        )

                );


            if (
                typeTrouve
            ) {

                nouvellePreference.typeVoyage =
                    typeTrouve;

            }


            setPreferences(
                nouvellePreference
            );


            return nouvellePreference;

        };


    // =====================================================
    // NOM NAVIGATION
    // =====================================================

    const obtenirNomNavigation =
        (route) => {


            if (
                route === "/"
            ) {

                return "Accueil";

            }


            if (
                route === "/login-client"
            ) {

                return "Se connecter";

            }


            if (
                route === "/destinations-public"
            ) {

                return "Voir les destinations";

            }


            if (
                route === "/offres-public"
            ) {

                return "Voir les offres";

            }


            if (
                route === "/mes-reservations"
            ) {

                return "Mes réservations";

            }


            if (
                route === "/notifications"
            ) {

                return "Voir les notifications";

            }


            if (
                route === "/paiements"
            ) {

                return "Voir les paiements";

            }


            if (
                route.startsWith(
                    "/detail-offre/"
                )
            ) {

                return "Voir le détail de l'offre";

            }


            if (
                route.startsWith(
                    "/reservation-public/"
                )
            ) {

                return "Réserver cette offre";

            }


            return "Ouvrir la page";

        };


    // =====================================================
    // ICONE NAVIGATION
    // =====================================================

    const obtenirIconeNavigation =
        (route) => {


            if (
                route === "/"
            ) {

                return <FaHome />;

            }


            if (
                route === "/login-client"
            ) {

                return <FaSignInAlt />;

            }


            if (
                route === "/destinations-public"
            ) {

                return <FaMapMarkerAlt />;

            }


            if (
                route === "/offres-public"
            ) {

                return <FaList />;

            }


            if (
                route === "/mes-reservations"
            ) {

                return <FaClipboardList />;

            }


            if (
                route === "/notifications"
            ) {

                return <FaBell />;

            }


            if (
                route === "/paiements"
            ) {

                return <FaCreditCard />;

            }


            if (
                route.startsWith(
                    "/detail-offre/"
                )
            ) {

                return <FaExternalLinkAlt />;

            }


            if (
                route.startsWith(
                    "/reservation-public/"
                )
            ) {

                return <FaClipboardList />;

            }


            return <FaGlobe />;

        };


    // =====================================================
    // ROUTE AUTORISEE
    // =====================================================

    const routeAutorisee =
        (route) => {


            if (
                typeof route !==
                "string"
            ) {

                return false;

            }


            const routesFixes = [

                "/",

                "/destinations-public",

                "/offres-public",

                "/login-client",

                "/mes-reservations",

                "/notifications",

                "/paiements"

            ];


            if (
                routesFixes.includes(
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

        };


    // =====================================================
    // AFFICHER NAVIGATION
    // =====================================================

    const afficherNavigation =
        (navigation) => {


            if (
                !Array.isArray(navigation) ||
                navigation.length === 0
            ) {

                return null;

            }


            const routes =
                navigation

                    .filter(
                        route =>
                            routeAutorisee(
                                route
                            )
                    )

                    .filter(
                        (
                            route,
                            index,
                            tableau
                        ) =>
                            tableau.indexOf(
                                route
                            ) === index
                    );


            if (
                routes.length === 0
            ) {

                return null;

            }


            return (

                <div className="assistant-navigation">

                    {
                        routes.map(
                            (
                                route,
                                index
                            ) => (

                                <button
                                    key={
                                        `${route}-${index}`
                                    }
                                    type="button"
                                    className="assistant-navigation-button"
                                    onClick={() =>
                                        navigate(
                                            route
                                        )
                                    }
                                >

                                    <span className="assistant-navigation-icon">

                                        {
                                            obtenirIconeNavigation(
                                                route
                                            )
                                        }

                                    </span>


                                    <span>

                                        {
                                            obtenirNomNavigation(
                                                route
                                            )
                                        }

                                    </span>

                                </button>

                            )
                        )
                    }

                </div>

            );

        };


    // =====================================================
    // HISTORIQUE GEMINI
    // =====================================================

    const obtenirHistorique =
        () => {


            return messages

                .slice(-10)

                .map(
                    msg => ({

                        role:
                            msg.type ===
                            "user"

                                ? "utilisateur"

                                : "assistant",

                        message:
                            msg.texte ||
                            "",

                        offres:
                            Array.isArray(
                                msg.offres
                            )

                                ? msg.offres.map(
                                    offre => ({

                                        id_offre:
                                            offre.id_offre,

                                        titre:
                                            offre.titre,

                                        destination:
                                            offre.destination,

                                        prix:
                                            offre.prix

                                    })
                                )

                                : []

                    })
                );

        };


    // =====================================================
    // ENVOYER AU BACKEND
    // =====================================================

    const rechercherAvecAssistant =
        async (

            texte,

            preferencesActuelles

        ) => {


            try {

                setChargement(true);


                const res =
                    await api.post(

                        "/assistant-touristique",

                        {

                            message:
                                texte,

                            historique:
                                obtenirHistorique(),

                            pageActuelle:
                                location.pathname,

                            preferences:
                                preferencesActuelles

                        }

                    );


                console.log(
                    "Réponse assistant touristique :",
                    res.data
                );


                const donnees =
                    res.data || {};


                // =================================================
                // PREFERENCES
                // =================================================

                if (
                    donnees.analyse
                ) {

                    setPreferences(
                        anciennes => ({

                            ...anciennes,

                            destination:
                                donnees.analyse.destination ||
                                anciennes.destination,

                            budget:
                                donnees.analyse.budget ??
                                anciennes.budget,

                            personnes:
                                donnees.analyse.nombrePersonnes ??
                                anciennes.personnes,

                            duree:
                                donnees.analyse.duree ??
                                anciennes.duree,

                            typeVoyage:
                                donnees.analyse.typeVoyage ||
                                anciennes.typeVoyage

                        })
                    );

                }


                // =================================================
                // NAVIGATION
                // =================================================

                const navigation =
                    Array.isArray(
                        donnees.navigation
                    )

                        ? donnees.navigation

                        : [];


                // =================================================
                // RECOMMANDATIONS
                // =================================================

                const recommandations =
                    Array.isArray(
                        donnees.recommandations
                    )

                        ? donnees.recommandations

                        : [];


                // =================================================
                // MESSAGE
                // =================================================

                ajouterMessage(

                    "assistant",

                    donnees.message ||
                    "Je n'ai pas pu générer une réponse.",

                    recommandations,

                    navigation

                );

            }
            catch (error) {

                console.error(
                    "Erreur assistant touristique :",
                    error.response?.data ||
                    error.message
                );


                ajouterMessage(

                    "assistant",

                    "Je ne peux pas traiter votre demande pour le moment. Vous pouvez toutefois consulter les offres et les destinations disponibles.",

                    [],

                    [

                        "/destinations-public",

                        "/offres-public"

                    ]

                );

            }
            finally {

                setChargement(false);

            }

        };


    // =====================================================
    // ENVOYER MESSAGE
    // =====================================================

    const envoyerMessage =
        async () => {


            const texte =
                message.trim();


            if (
                !texte ||
                chargement
            ) {

                return;

            }


            // =================================================
            // MESSAGE UTILISATEUR
            // =================================================

            ajouterMessage(

                "user",

                texte

            );


            setMessage("");


            // =================================================
            // PREFERENCES
            // =================================================

            const nouvellesPreferences =
                analyserPreferencesLocalement(
                    texte
                );


            // =================================================
            // BACKEND
            // =================================================

            await rechercherAvecAssistant(

                texte,

                nouvellesPreferences

            );

        };


    // =====================================================
    // TOUCHE ENTREE
    // =====================================================

    const gererToucheClavier =
        (e) => {


            if (

                e.key === "Enter" &&

                !e.shiftKey

            ) {

                e.preventDefault();

                envoyerMessage();

            }

        };


    // =====================================================
    // OUVRIR / FERMER
    // =====================================================

    const basculerAssistant =
        () => {

            setOuvert(
                ancien =>
                    !ancien
            );

        };


    // =====================================================
    // FORMAT MESSAGE
    // =====================================================

    const formaterMessage =
        (texte) => {


            if (
                !texte
            ) {

                return null;

            }


            const lignes =
                String(
                    texte
                ).split(
                    "\n"
                );


            return lignes.map(
                (
                    ligne,
                    index
                ) => (

                    <span
                        key={index}
                    >

                        {ligne}

                        {
                            index <
                            lignes.length - 1 &&
                            <br />
                        }

                    </span>

                )
            );

        };


    // =====================================================
    // URL IMAGE
    // =====================================================

    const obtenirUrlImage =
        (image) => {


            if (
                !image
            ) {

                return null;

            }


            if (
                String(image)
                    .startsWith("http")
            ) {

                return image;

            }


            return `http://localhost:8081/uploads/${image}`;

        };


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <>

            {/* =================================================
                BOUTON FLOTTANT
            ================================================= */}

            <button

                className="assistant-floating-button"

                onClick={
                    basculerAssistant
                }

                aria-label="Ouvrir l'assistant touristique"

            >

                {

                    ouvert

                        ? <FaTimes />

                        : <FaRobot />

                }

            </button>


            {/* =================================================
                FENETRE
            ================================================= */}

            {

                ouvert && (

                    <div className="assistant-touristique">


                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div className="assistant-header">

                            <div className="assistant-header-icon">

                                <FaRobot />

                            </div>


                            <div className="assistant-header-text">

                                <strong>

                                    Assistant touristique

                                </strong>


                                <span>

                                    Votre assistant de voyage

                                </span>

                            </div>


                            <button

                                className="assistant-close"

                                type="button"

                                onClick={() =>
                                    setOuvert(false)
                                }

                            >

                                <FaTimes />

                            </button>

                        </div>


                        {/* =================================================
                            PREFERENCES
                        ================================================= */}

                        {

                            (

                                preferences.destination ||

                                preferences.budget ||

                                preferences.personnes ||

                                preferences.duree ||

                                preferences.typeVoyage

                            ) && (

                                <div className="assistant-preferences">


                                    {
                                        preferences.destination && (

                                            <span>

                                                <FaMapMarkerAlt />

                                                {
                                                    preferences.destination
                                                }

                                            </span>

                                        )
                                    }


                                    {
                                        preferences.budget && (

                                            <span>

                                                <FaMoneyBillWave />

                                                {

                                                    Number(
                                                        preferences.budget
                                                    ).toLocaleString(
                                                        "fr-FR"
                                                    )

                                                }{" "}
                                                Ar

                                            </span>

                                        )
                                    }


                                    {
                                        preferences.personnes && (

                                            <span>

                                                <FaUsers />

                                                {
                                                    preferences.personnes
                                                }{" "}
                                                personne(s)

                                            </span>

                                        )
                                    }


                                    {
                                        preferences.duree && (

                                            <span>

                                                <FaCalendarAlt />

                                                {
                                                    preferences.duree
                                                }{" "}
                                                jour(s)

                                            </span>

                                        )
                                    }


                                    {
                                        preferences.typeVoyage && (

                                            <span>

                                                <FaSuitcase />

                                                {
                                                    preferences.typeVoyage
                                                }

                                            </span>

                                        )
                                    }

                                </div>

                            )
                        }


                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        <div

                            className="assistant-messages"

                            ref={
                                messagesRef
                            }

                        >

                            {

                                messages.map(
                                    msg => (

                                        <div

                                            key={
                                                msg.id
                                            }

                                            className={

                                                msg.type ===
                                                "user"

                                                    ? "assistant-message user-message"

                                                    : "assistant-message bot-message"

                                            }

                                        >

                                            {

                                                msg.type ===
                                                "assistant" && (

                                                    <div className="message-avatar">

                                                        <FaRobot />

                                                    </div>

                                                )

                                            }


                                            <div className="message-content">


                                                {/* ==========================================
                                                    TEXTE
                                                ========================================== */}

                                                {

                                                    formaterMessage(
                                                        msg.texte
                                                    )

                                                }


                                                {/* ==========================================
                                                    NAVIGATION
                                                ========================================== */}

                                                {

                                                    msg.type ===
                                                    "assistant" &&

                                                    afficherNavigation(
                                                        msg.navigation
                                                    )

                                                }


                                                {/* ==========================================
                                                    OFFRES
                                                ========================================== */}

                                                {

                                                    Array.isArray(
                                                        msg.offres
                                                    ) &&

                                                    msg.offres.length >
                                                    0 && (

                                                        <div className="assistant-offers">

                                                            {

                                                                msg.offres.map(
                                                                    offre => (

                                                                        <div

                                                                            className="assistant-offer-card"

                                                                            key={
                                                                                offre.id_offre
                                                                            }

                                                                        >


                                                                            {/* ==========================
                                                                                IMAGE
                                                                            ========================== */}

                                                                            {

                                                                                obtenirUrlImage(
                                                                                    offre.image
                                                                                ) && (

                                                                                    <img

                                                                                        src={
                                                                                            obtenirUrlImage(
                                                                                                offre.image
                                                                                            )
                                                                                        }

                                                                                        alt={
                                                                                            offre.titre ||
                                                                                            "Offre touristique"
                                                                                        }

                                                                                    />

                                                                                )

                                                                            }


                                                                            <div className="assistant-offer-content">


                                                                                {/* ==========================
                                                                                    TITRE
                                                                                ========================== */}

                                                                                <strong>

                                                                                    {
                                                                                        offre.titre ||
                                                                                        "Offre touristique"
                                                                                    }

                                                                                </strong>


                                                                                {/* ==========================
                                                                                    DESTINATION
                                                                                ========================== */}

                                                                                <span>

                                                                                    <FaMapMarkerAlt />

                                                                                    {
                                                                                        offre.destination ||
                                                                                        "Destination inconnue"
                                                                                    }

                                                                                </span>


                                                                                {/* ==========================
                                                                                    REGION / PAYS
                                                                                ========================== */}

                                                                                {

                                                                                    (
                                                                                        offre.region ||
                                                                                        offre.pays
                                                                                    ) && (

                                                                                        <span>

                                                                                            <FaGlobe />

                                                                                            {

                                                                                                [
                                                                                                    offre.region,
                                                                                                    offre.pays
                                                                                                ]
                                                                                                    .filter(Boolean)
                                                                                                    .join(
                                                                                                        " - "
                                                                                                    )

                                                                                            }

                                                                                        </span>

                                                                                    )

                                                                                }


                                                                                {/* ==========================
                                                                                    CATEGORIE
                                                                                ========================== */}

                                                                                {

                                                                                    offre.categorie && (

                                                                                        <span>

                                                                                            <FaSuitcase />

                                                                                            {
                                                                                                offre.categorie
                                                                                            }

                                                                                        </span>

                                                                                    )

                                                                                }


                                                                                {/* ==========================
                                                                                    PRIX
                                                                                ========================== */}

                                                                                <span>

                                                                                    <FaMoneyBillWave />

                                                                                    {

                                                                                        Number(
                                                                                            offre.prix ||
                                                                                            0
                                                                                        ).toLocaleString(
                                                                                            "fr-FR"
                                                                                        )

                                                                                    }{" "}
                                                                                    Ar

                                                                                </span>


                                                                                {/* ==========================
                                                                                    CAPACITE
                                                                                ========================== */}

                                                                                {

                                                                                    offre.capacite && (

                                                                                        <span>

                                                                                            <FaUsers />

                                                                                            Capacité :
                                                                                            {" "}

                                                                                            {
                                                                                                offre.capacite
                                                                                            }

                                                                                        </span>

                                                                                    )

                                                                                }


                                                                                {/* ==========================
                                                                                    BOUTONS
                                                                                ========================== */}

                                                                                <div className="assistant-offer-actions">


                                                                                    {/* ======================
                                                                                        VOIR
                                                                                    ====================== */}

                                                                                    <button

                                                                                        type="button"

                                                                                        className="assistant-offer-button"

                                                                                        onClick={() =>
                                                                                            navigate(
                                                                                                `/detail-offre/${offre.id_offre}`
                                                                                            )
                                                                                        }

                                                                                    >

                                                                                        Voir l'offre

                                                                                        <FaExternalLinkAlt />

                                                                                    </button>


                                                                                    {/* ======================
                                                                                        RESERVER
                                                                                    ====================== */}

                                                                                    <button

                                                                                        type="button"

                                                                                        className="assistant-offer-button"

                                                                                        onClick={() =>
                                                                                            navigate(
                                                                                                `/reservation-public/${offre.id_offre}`
                                                                                            )
                                                                                        }

                                                                                    >

                                                                                        Réserver

                                                                                        <FaClipboardList />

                                                                                    </button>

                                                                                </div>

                                                                            </div>

                                                                        </div>

                                                                    )

                                                                )

                                                            }

                                                        </div>

                                                    )

                                                }

                                            </div>

                                        </div>

                                    )

                                )

                            }


                            {/* =================================================
                                CHARGEMENT
                            ================================================= */}

                            {

                                chargement && (

                                    <div className="assistant-message bot-message">

                                        <div className="message-avatar">

                                            <FaRobot />

                                        </div>


                                        <div className="message-content assistant-typing">

                                            <span></span>

                                            <span></span>

                                            <span></span>

                                        </div>

                                    </div>

                                )

                            }

                        </div>


                        {/* =================================================
                            SAISIE
                        ================================================= */}

                        <div className="assistant-input-container">

                            <textarea

                                value={
                                    message
                                }

                                onChange={
                                    e =>
                                        setMessage(
                                            e.target.value
                                        )
                                }

                                onKeyDown={
                                    gererToucheClavier
                                }

                                placeholder="Ex : Je cherche une randonnée à Madagascar pour 2 personnes..."

                                rows={1}

                                disabled={
                                    chargement
                                }

                            />


                            <button

                                type="button"

                                className="assistant-send-button"

                                onClick={
                                    envoyerMessage
                                }

                                disabled={

                                    !message.trim() ||

                                    chargement

                                }

                                aria-label="Envoyer"

                            >

                                <FaPaperPlane />

                            </button>

                        </div>


                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="assistant-footer">

                            🤖 Assistant touristique intelligent

                        </div>

                    </div>

                )

            }

        </>

    );

}


export default AssistantTouristique;