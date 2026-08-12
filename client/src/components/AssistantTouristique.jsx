import { useState, useRef, useEffect } from "react";

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
    FaHome
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import api from "../api/api";

import "./AssistantTouristique.css";


function AssistantTouristique() {

    // =====================================================
    // NAVIGATION
    // =====================================================

    const navigate = useNavigate();


    // =====================================================
    // REFERENCES
    // =====================================================

    const messagesRef = useRef(null);


    // =====================================================
    // ETATS
    // =====================================================

    const [ouvert, setOuvert] = useState(false);

    const [message, setMessage] = useState("");

    const [chargement, setChargement] = useState(false);


    const [messages, setMessages] = useState([

        {
            id: 1,

            type: "assistant",

            texte:
                "Bonjour 👋 Je suis votre assistant touristique intelligent. Je peux vous aider à trouver une offre adaptée à votre voyage.",

            navigation: [],

            offres: []

        },

        {
            id: 2,

            type: "assistant",

            texte:
                "Dites-moi simplement ce que vous recherchez. Par exemple : « Je veux visiter Madagascar pendant 5 jours avec un budget de 1 000 000 Ar pour 2 personnes. »",

            navigation: [],

            offres: []

        }

    ]);


    const [preferences, setPreferences] = useState({

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

        if (messagesRef.current) {

            messagesRef.current.scrollTop =
                messagesRef.current.scrollHeight;

        }

    }, [messages, chargement]);


    // =====================================================
    // AJOUTER UN MESSAGE
    // =====================================================

    const ajouterMessage = (
        type,
        texte,
        offres = [],
        navigation = []
    ) => {

        setMessages((anciensMessages) => [

            ...anciensMessages,

            {

                id:
                    Date.now() +
                    Math.random(),

                type,

                texte,

                offres,

                navigation

            }

        ]);

    };


    // =====================================================
    // ANALYSER LES PREFERENCES POUR L'AFFICHAGE
    // =====================================================

    const analyserPreferencesLocalement = (texte) => {

        const texteNormalise =
            texte
                .toLowerCase()
                .replace(/\s+/g, " ")
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
            "tuléar",
            "fort-dauphin",
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


        if (destinationTrouvee) {

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


        if (budgetMatch) {

            const budgetTexte =
                budgetMatch[1]
                    .replace(/\s/g, "")
                    .replace(/\./g, "");


            const budget =
                Number(budgetTexte);


            if (
                !isNaN(budget) &&
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


        if (personnesMatch) {

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


        if (dureeMatch) {

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
        // TYPE DE VOYAGE
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
            "détente",
            "randonnée",
            "affaires"

        ];


        const typeTrouve =
            typesVoyage.find(
                type =>
                    texteNormalise.includes(
                        type
                    )
            );


        if (typeTrouve) {

            nouvellePreference.typeVoyage =
                typeTrouve;

        }


        setPreferences(
            nouvellePreference
        );


        return nouvellePreference;

    };


    // =====================================================
    // NOM DE LA ROUTE
    // =====================================================

    const obtenirNomNavigation = (route) => {

        if (route === "/Accueil") {

            return "Accueil";

        }


        if (route === "/login-client") {

            return "Se connecter";

        }


        if (route === "/destinations-public") {

            return "Voir les destinations";

        }


        if (route === "/offres-public") {

            return "Voir les offres";

        }


        if (route === "/mes-reservations") {

            return "Mes réservations";

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
    // ICONE DE NAVIGATION
    // =====================================================

    const obtenirIconeNavigation = (route) => {

        if (route === "/Accueil") {

            return <FaHome />;

        }


        if (route === "/login-client") {

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
    // VERIFIER ROUTE AUTORISEE
    // =====================================================

    const routeAutorisee = (route) => {

        if (
            typeof route !== "string"
        ) {

            return false;

        }


        const routesFixes = [

            "/Accueil",
            "/destinations-public",
            "/offres-public",
            "/login-client",
            "/mes-reservations"

        ];


        if (
            routesFixes.includes(route)
        ) {

            return true;

        }


        if (
            /^\/detail-offre\/\d+$/.test(
                route
            )
        ) {

            return true;

        }


        if (
            /^\/reservation-public\/\d+$/.test(
                route
            )
        ) {

            return true;

        }


        return false;

    };


    // =====================================================
    // NAVIGATION CLIQUABLE
    // =====================================================

    const afficherNavigation = (navigation) => {

        if (
            !Array.isArray(navigation) ||
            navigation.length === 0
        ) {

            return null;

        }


        const routes =
            navigation.filter(
                route =>
                    routeAutorisee(route)
            );


        if (routes.length === 0) {

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
                                    navigate(route)
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
    // ENVOYER LA DEMANDE AU BACKEND
    // =====================================================

    const rechercherAvecAssistant = async (texte) => {

        try {

            setChargement(true);


            const res =
                await api.post(
                    "/assistant-touristique",
                    {
                        message: texte
                    }
                );


            console.log(
                "Réponse assistant touristique :",
                res.data
            );


            const donnees =
                res.data || {};


            // =================================================
            // METTRE A JOUR LES PREFERENCES
            // =================================================

            if (
                donnees.analyse
            ) {

                setPreferences(
                    anciennes => ({

                        ...anciennes,

                        budget:
                            donnees.analyse.budget ??
                            anciennes.budget,

                        personnes:
                            donnees.analyse.nombrePersonnes ??
                            anciennes.personnes,

                        duree:
                            donnees.analyse.duree ??
                            anciennes.duree

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
            // MESSAGE DE L'ASSISTANT
            // =================================================

            ajouterMessage(

                "assistant",

                donnees.message ||
                "Je n'ai pas pu générer une réponse.",

                [],

                navigation

            );


            // =================================================
            // RECOMMANDATIONS
            // =================================================

            if (
                Array.isArray(
                    donnees.recommandations
                ) &&
                donnees.recommandations.length > 0
            ) {

                ajouterMessage(

                    "assistant",

                    "",

                    donnees.recommandations,

                    []

                );

            }


        }

        catch (error) {

            console.error(
                "Erreur assistant touristique :",
                error.response?.data ||
                error.message
            );


            // =================================================
            // MESSAGE D'ERREUR
            // =================================================

            ajouterMessage(

                "assistant",

                "Je ne peux pas traiter votre demande pour le moment. Veuillez réessayer dans quelques instants."

            );

        }

        finally {

            setChargement(false);

        }

    };


    // =====================================================
    // ENVOYER MESSAGE
    // =====================================================

    const envoyerMessage = async () => {

        const texte =
            message.trim();


        if (
            !texte ||
            chargement
        ) {

            return;

        }


        // =================================================
        // MESSAGE DU TOURISTE
        // =================================================

        ajouterMessage(
            "user",
            texte
        );


        setMessage("");


        // =================================================
        // ANALYSE LOCALE POUR AFFICHAGE
        // =================================================

        analyserPreferencesLocalement(
            texte
        );


        // =================================================
        // BACKEND
        // =================================================

        await rechercherAvecAssistant(
            texte
        );

    };


    // =====================================================
    // TOUCHE ENTREE
    // =====================================================

    const gererToucheClavier = (e) => {

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

    const basculerAssistant = () => {

        setOuvert(
            ancien =>
                !ancien
        );

    };


    // =====================================================
    // FORMAT MESSAGE
    // =====================================================

    const formaterMessage = (texte) => {

        if (!texte) {

            return null;

        }


        const lignes =
            texte.split("\n");


        return lignes.map(
            (
                ligne,
                index
            ) => (

                <span key={index}>

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
    // AFFICHAGE
    // =====================================================

    return (

        <>

            {/* =================================================
                BOUTON FLOTTANT
            ================================================= */}

            <button
                className="assistant-floating-button"
                onClick={basculerAssistant}
                aria-label="Ouvrir l'assistant touristique"
            >

                {
                    ouvert
                        ?
                        <FaTimes />
                        :
                        <FaRobot />
                }

            </button>


            {/* =================================================
                FENETRE
            ================================================= */}

            {
                ouvert &&

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
                                Recommandations de voyages
                            </span>

                        </div>


                        <button
                            className="assistant-close"
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
                        ) &&

                        <div className="assistant-preferences">

                            {
                                preferences.destination &&

                                <span>

                                    <FaMapMarkerAlt />

                                    {
                                        preferences.destination
                                    }

                                </span>

                            }


                            {
                                preferences.budget &&

                                <span>

                                    <FaMoneyBillWave />

                                    {
                                        preferences.budget
                                            .toLocaleString(
                                                "fr-FR"
                                            )
                                    }{" "}
                                    Ar

                                </span>

                            }


                            {
                                preferences.personnes &&

                                <span>

                                    <FaUsers />

                                    {
                                        preferences.personnes
                                    }{" "}
                                    personne(s)

                                </span>

                            }


                            {
                                preferences.duree &&

                                <span>

                                    <FaCalendarAlt />

                                    {
                                        preferences.duree
                                    }{" "}
                                    jour(s)

                                </span>

                            }


                            {
                                preferences.typeVoyage &&

                                <span>

                                    <FaSuitcase />

                                    {
                                        preferences.typeVoyage
                                    }

                                </span>

                            }

                        </div>

                    }


                    {/* =================================================
                        MESSAGES
                    ================================================= */}

                    <div
                        className="assistant-messages"
                        ref={messagesRef}
                    >

                        {
                            messages.map(
                                (msg) => (

                                    <div
                                        key={msg.id}
                                        className={
                                            msg.type === "user"
                                                ?
                                                "assistant-message user-message"
                                                :
                                                "assistant-message bot-message"
                                        }
                                    >


                                        {
                                            msg.type === "assistant" &&

                                            <div className="message-avatar">

                                                <FaRobot />

                                            </div>

                                        }


                                        <div className="message-content">

                                            {
                                                formaterMessage(
                                                    msg.texte
                                                )
                                            }


                                            {/* =================================================
                                                NAVIGATION
                                            ================================================= */}

                                            {
                                                msg.type === "assistant" &&

                                                afficherNavigation(
                                                    msg.navigation
                                                )
                                            }


                                            {/* =================================================
                                                CARTES DES OFFRES
                                            ================================================= */}

                                            {
                                                msg.offres &&
                                                msg.offres.length > 0 &&

                                                <div className="assistant-offers">

                                                    {
                                                        msg.offres.map(
                                                            (offre) => (

                                                                <div
                                                                    className="assistant-offer-card"
                                                                    key={
                                                                        offre.id_offre
                                                                    }
                                                                >

                                                                    {
                                                                        offre.image &&

                                                                        <img
                                                                            src={
                                                                                offre.image.startsWith(
                                                                                    "http"
                                                                                )
                                                                                    ?
                                                                                    offre.image
                                                                                    :
                                                                                    `http://localhost:8081/uploads/${offre.image}`
                                                                            }
                                                                            alt={
                                                                                offre.titre ||
                                                                                "Offre touristique"
                                                                            }
                                                                        />

                                                                    }


                                                                    <div className="assistant-offer-content">

                                                                        <strong>

                                                                            {
                                                                                offre.titre ||
                                                                                "Offre touristique"
                                                                            }

                                                                        </strong>


                                                                        <span>

                                                                            <FaMapMarkerAlt />

                                                                            {
                                                                                offre.destination ||
                                                                                "Destination inconnue"
                                                                            }

                                                                        </span>


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


                                                                        {
                                                                            offre.capacite &&

                                                                            <span>

                                                                                <FaUsers />

                                                                                Capacité :
                                                                                {" "}
                                                                                {
                                                                                    offre.capacite
                                                                                }

                                                                            </span>

                                                                        }


                                                                        <button
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

                                                                    </div>

                                                                </div>

                                                            )
                                                        )
                                                    }

                                                </div>

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
                            chargement &&

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

                        }

                    </div>


                    {/* =================================================
                        SAISIE
                    ================================================= */}

                    <div className="assistant-input-container">

                        <textarea
                            value={message}
                            onChange={(e) =>
                                setMessage(
                                    e.target.value
                                )
                            }
                            onKeyDown={
                                gererToucheClavier
                            }
                            placeholder="Ex : Madagascar, 5 jours, 1 000 000 Ar..."
                            rows={1}
                            disabled={chargement}
                        />


                        <button
                            className="assistant-send-button"
                            onClick={
                                envoyerMessage
                            }
                            disabled={
                                !message.trim() ||
                                chargement
                            }
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

            }

        </>

    );

}


export default AssistantTouristique;