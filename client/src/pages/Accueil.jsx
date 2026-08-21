
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaSearch,
    FaMapMarkerAlt,
    FaArrowRight,
    FaHotel,
    FaStar,
    FaShieldAlt,
    FaHeadset,
    FaCreditCard,
    FaRobot,
    FaHeart,
    FaGlobeAfrica,
    FaCheckCircle,
    FaPlay,
    FaCalendarAlt,
    FaUsers
} from "react-icons/fa";

import api from "../api/api";
import "./Accueil.css";


/* =========================================================
   FORMAT PRIX
========================================================= */

const formatPrixEuro = (prix) => {

    if (
        prix === null ||
        prix === undefined ||
        prix === ""
    ) {
        return "Prix sur demande";
    }

    const nombre = Number(prix);

    if (Number.isNaN(nombre)) {
        return prix;
    }

    return `${nombre.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} €`;
};


/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (date) => {

    if (!date) {
        return null;
    }

    const dateFormatee = new Date(date);

    if (Number.isNaN(dateFormatee.getTime())) {
        return date;
    }

    return dateFormatee.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};


/* =========================================================
   CONSTRUIRE URL IMAGE
========================================================= */

const getImageUrl = (image) => {

    if (!image) {
        return null;
    }

    /*
     * URL Cloudinary ou autre URL complète
     */
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    /*
     * Si l'API retourne déjà /uploads/...
     */
    if (image.startsWith("/uploads/")) {
        return `${import.meta.env.VITE_SERVER_URL}${image}`;
    }

    /*
     * Si l'API retourne /image.jpg
     */
    if (image.startsWith("/")) {
        return `${import.meta.env.VITE_SERVER_URL}${image}`;
    }

    /*
     * Si l'API retourne seulement image.jpg
     */
    return `${import.meta.env.VITE_SERVER_URL}/uploads/${image}`;
};


/* =========================================================
   VIDÉOS CINÉMATIQUES
========================================================= */

const videoItems = [

    {
        id: 1,

        src: "/videos-web/lemurien.mp4",

        category: "FAUNE",

        title: "À la rencontre des lémuriens",

        description:
            "Découvrez l'une des espèces les plus emblématiques de Madagascar."
    },

    {
        id: 2,

        src: "/videos-web/nature.mp4",

        category: "NATURE",

        title: "La nature de Madagascar",

        description:
            "Explorez des paysages naturels exceptionnels au cœur de Madagascar."
    },

    {
        id: 3,

        src: "/videos-web/ranomafana.mp4",

        category: "AVENTURE",

        title: "Ranomafana",

        description:
            "Découvrez les paysages luxuriants et la biodiversité exceptionnelle de Ranomafana."
    },

    {
        id: 4,

        src: "/videos-web/ville.mp4",

        category: "CULTURE",

        title: "Les villes de Madagascar",

        description:
            "Découvrez Madagascar à travers ses villes, ses rues et son quotidien."
    },

    {
        id: 5,

        src: "/videos-web/hotel.mp4",

        category: "ÉVASION",

        title: "Une expérience exceptionnelle",

        description:
            "Profitez d'un séjour confortable et découvrez une autre façon de voyager."
    }

];


/* =========================================================
   COMPOSANT ACCUEIL
========================================================= */

function Accueil() {

    const [destinations, setDestinations] = useState([]);

    const [offres, setOffres] = useState([]);

    const [loadingDestinations, setLoadingDestinations] =
        useState(true);

    const [loadingOffres, setLoadingOffres] =
        useState(true);

    const [errorDestinations, setErrorDestinations] =
        useState("");

    const [errorOffres, setErrorOffres] =
        useState("");


    /* =====================================================
       CHARGER DESTINATIONS
    ===================================================== */

    useEffect(() => {

        const chargerDestinations = async () => {

            try {

                setLoadingDestinations(true);

                setErrorDestinations("");

                const response =
                    await api.get("/destinations");

                console.log(
                    "Destinations récupérées :",
                    response.data
                );

                let data = response.data;


                /*
                 * { destinations: [...] }
                 */

                if (
                    data &&
                    Array.isArray(data.destinations)
                ) {

                    data = data.destinations;

                }


                /*
                 * { data: [...] }
                 */

                if (
                    data &&
                    Array.isArray(data.data)
                ) {

                    data = data.data;

                }


                if (Array.isArray(data)) {

                    setDestinations(data);

                }
                else {

                    setDestinations([]);

                }

            }
            catch (error) {

                console.error(
                    "Erreur chargement destinations :",
                    error
                );

                setErrorDestinations(
                    "Impossible de charger les destinations."
                );

                setDestinations([]);

            }
            finally {

                setLoadingDestinations(false);

            }

        };


        chargerDestinations();

    }, []);


    /* =====================================================
       CHARGER OFFRES
    ===================================================== */

    useEffect(() => {

        const chargerOffres = async () => {

            try {

                setLoadingOffres(true);

                setErrorOffres("");

                const response =
                    await api.get("/offres");

                console.log(
                    "Offres récupérées :",
                    response.data
                );

                let data = response.data;


                /*
                 * { offres: [...] }
                 */

                if (
                    data &&
                    Array.isArray(data.offres)
                ) {

                    data = data.offres;

                }


                /*
                 * { data: [...] }
                 */

                if (
                    data &&
                    Array.isArray(data.data)
                ) {

                    data = data.data;

                }


                if (Array.isArray(data)) {

                    setOffres(data);

                }
                else {

                    setOffres([]);

                }

            }
            catch (error) {

                console.error(
                    "Erreur chargement offres :",
                    error
                );

                setErrorOffres(
                    "Impossible de charger les offres."
                );

                setOffres([]);

            }
            finally {

                setLoadingOffres(false);

            }

        };


        chargerOffres();

    }, []);


    /* =====================================================
       DONNÉES AFFICHÉES
    ===================================================== */

    /*
     * Seulement 3 destinations sur l'accueil
     */

    const destinationsAffichees =
        destinations.slice(0, 3);


    /*
     * 6 offres sur l'accueil
     */

    const offresAffichees =
        offres.slice(0, 6);


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <main className="home-page">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="home-hero">

                <div className="hero-overlay"></div>


                <div className="hero-content">


                    <div className="hero-badge">

                        <FaGlobeAfrica />

                        <span>
                            VOTRE VOYAGE COMMENCE ICI
                        </span>

                    </div>


                    <h1>

                        Découvrez

                        <span>
                            le monde autrement
                        </span>

                    </h1>


                    <p>

                        Explorez les plus belles destinations,
                        découvrez des expériences uniques,
                        trouvez les meilleures offres touristiques
                        et préparez votre prochaine aventure
                        en toute simplicité.

                    </p>


                    <div className="hero-buttons">


                        <Link
                            to="/destinations-public"
                            className="hero-primary-btn"
                        >

                            <span>
                                Explorer les destinations
                            </span>

                            <FaArrowRight />

                        </Link>


                        <Link
                            to="/offres-public"
                            className="hero-secondary-btn"
                        >

                            <FaPlay />

                            <span>
                                Voir les offres
                            </span>

                        </Link>


                    </div>

                </div>

            </section>



            {/* =================================================
                VIDÉOS CINÉMATIQUES
            ================================================= */}

            <section className="videos-section">


                <div className="videos-cinematic">


                    {/* =================================================
                        INTRODUCTION
                    ================================================= */}

                    <div className="videos-cinematic-intro">


                        <span className="section-label">

                            EXPLOREZ LE MONDE

                        </span>


                        <h2>

                            Explorez. Voyagez. Vivez

                            <span>
                                autrement.
                            </span>

                        </h2>


                        <p>

                            Des paysages uniques, une faune
                            exceptionnelle et des expériences
                            inoubliables. Faites défiler notre
                            sélection et laissez-vous inspirer.

                        </p>


                        <Link
                            to="/destinations-public"
                            className="cinematic-discover-button"
                        >

                            Découvrir les destinations

                            <FaArrowRight />

                        </Link>

                    </div>



                    {/* =================================================
                        MUR VIDÉO CINÉMATIQUE
                    ================================================= */}

                    <div className="cinematic-video-window">


                        <div className="cinematic-video-track">


                            {/* PREMIÈRE SÉRIE */}

                            {videoItems.map((video) => (

                                <article
                                    className="cinematic-video-card"
                                    key={`first-${video.id}`}
                                >


                                    <video
                                        src={video.src}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                    />


                                    <div className="cinematic-video-overlay"></div>


                                    <div className="cinematic-video-content">


                                        <span>
                                            {video.category}
                                        </span>


                                        <h3>
                                            {video.title}
                                        </h3>


                                        <p>
                                            {video.description}
                                        </p>


                                    </div>

                                </article>

                            ))}



                            {/* DEUXIÈME SÉRIE
                                Pour créer une boucle continue */}

                            {videoItems.map((video) => (

                                <article
                                    className="cinematic-video-card"
                                    key={`second-${video.id}`}
                                    aria-hidden="true"
                                >


                                    <video
                                        src={video.src}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                    />


                                    <div className="cinematic-video-overlay"></div>


                                    <div className="cinematic-video-content">


                                        <span>
                                            {video.category}
                                        </span>


                                        <h3>
                                            {video.title}
                                        </h3>


                                        <p>
                                            {video.description}
                                        </p>


                                    </div>

                                </article>

                            ))}


                        </div>


                        <div className="cinematic-top-fade"></div>

                        <div className="cinematic-bottom-fade"></div>


                    </div>

                </div>

            </section>



            {/* =================================================
                DESTINATIONS
            ================================================= */}

            <section className="destinations-section">


                <div className="section-heading">


                    <div>


                        <span className="section-label">
                            DESTINATIONS
                        </span>


                        <h2>
                            Explorez de nouveaux horizons
                        </h2>


                        <p>

                            Découvrez des destinations
                            remarquables et préparez votre
                            prochaine aventure.

                        </p>


                    </div>


                    <Link
                        to="/destinations-public"
                        className="see-all-link"
                    >

                        Voir toutes les destinations

                        <FaArrowRight />

                    </Link>


                </div>



                {loadingDestinations ? (

                    <div className="loading-container">

                        <div className="loading-spinner"></div>

                        <p>
                            Chargement des destinations...
                        </p>

                    </div>

                ) : errorDestinations ? (

                    <div className="error-container">

                        <span>
                            ⚠️
                        </span>

                        <p>
                            {errorDestinations}
                        </p>

                    </div>

                ) : destinationsAffichees.length === 0 ? (

                    <div className="empty-container">

                        <span>
                            🌍
                        </span>

                        <p>
                            Aucune destination disponible pour le moment.
                        </p>

                    </div>

                ) : (

                    <div className="destination-grid">


                        {destinationsAffichees.map(
                            (destination, index) => {


                                const image =
                                    getImageUrl(
                                        destination.image ||
                                        destination.photo ||
                                        destination.image_destination
                                    );


                                const id =
                                    destination.id_destination ||
                                    destination.id;


                                return (

                                    <Link
                                        to="/destinations-public"
                                        className="destination-card"
                                        key={id || index}
                                    >


                                        {image ? (

                                            <img
                                                src={image}
                                                alt={
                                                    destination.nom ||
                                                    destination.nom_destination ||
                                                    "Destination"
                                                }
                                                className="destination-image"

                                                onError={(event) => {

                                                    console.error(
                                                        "Image destination introuvable :",
                                                        image
                                                    );

                                                    event.currentTarget.style.display =
                                                        "none";

                                                }}
                                            />

                                        ) : (

                                            <div className="destination-no-image">

                                                <FaGlobeAfrica />

                                            </div>

                                        )}


                                        <div className="destination-overlay"></div>


                                        <div className="destination-content">


                                            <span className="destination-location">

                                                <FaMapMarkerAlt />

                                                {destination.pays ||
                                                 destination.country ||
                                                 "Destination"}

                                            </span>


                                            <h3>

                                                {
                                                    destination.nom ||
                                                    destination.nom_destination ||
                                                    "Destination"
                                                }

                                            </h3>


                                            <p>

                                                {
                                                    destination.description ||
                                                    "Découvrez cette magnifique destination touristique."
                                                }

                                            </p>


                                            <span className="destination-link">

                                                Découvrir

                                                <FaArrowRight />

                                            </span>


                                        </div>

                                    </Link>

                                );

                            }
                        )}

                    </div>

                )}

            </section>



            {/* =================================================
                OFFRES
            ================================================= */}

            <section className="offers-section">


                <div className="section-heading">


                    <div>


                        <span className="section-label">
                            NOS OFFRES
                        </span>


                        <h1>
                            Des séjours pour tous les goûts
                        </h1>


                        <p>

                            Trouvez l'offre idéale pour votre
                            prochain voyage et profitez d'une
                            expérience adaptée à vos envies.

                        </p>


                    </div>


                    <Link
                        to="/offres-public"
                        className="see-all-link"
                    >

                        Voir toutes les offres

                        <FaArrowRight />

                    </Link>


                </div>



                {loadingOffres ? (

                    <div className="loading-container">

                        <div className="loading-spinner"></div>

                        <p>
                            Chargement des offres...
                        </p>

                    </div>

                ) : errorOffres ? (

                    <div className="error-container">

                        <span>
                            ⚠️
                        </span>

                        <p>
                            {errorOffres}
                        </p>

                    </div>

                ) : offresAffichees.length === 0 ? (

                    <div className="empty-container">

                        <span>
                            🏨
                        </span>

                        <p>
                            Aucune offre disponible pour le moment.
                        </p>

                    </div>

                ) : (

                    <div className="offers-grid">


                        {offresAffichees.map(
                            (offre, index) => {


                                const image =
                                    getImageUrl(
                                        offre.image ||
                                        offre.photo ||
                                        offre.image_offre
                                    );


                                const id =
                                    offre.id_offre ||
                                    offre.id;


                                return (

                                    <article
                                        className="offer-card"
                                        key={id || index}
                                    >


                                        {/* IMAGE */}

                                        <div className="offer-image">


                                            {image ? (

                                                <img
                                                    src={image}
                                                    alt={
                                                        offre.titre ||
                                                        "Offre touristique"
                                                    }

                                                    onError={(event) => {

                                                        console.error(
                                                            "Image offre introuvable :",
                                                            image
                                                        );

                                                        event.currentTarget.style.display =
                                                            "none";

                                                    }}
                                                />

                                            ) : (

                                                <div className="offer-no-image">

                                                    <FaHotel />

                                                </div>

                                            )}



                                            {offre.categorie && (

                                                <span className="offer-badge">

                                                    {offre.categorie}

                                                </span>

                                            )}



                                            <button
                                                type="button"
                                                className="favorite-button"

                                                aria-label="Ajouter aux favoris"

                                                onClick={(event) => {

                                                    event.preventDefault();
                                                    event.stopPropagation();

                                                }}
                                            >

                                                <FaHeart />

                                            </button>


                                        </div>



                                        {/* CONTENU */}

                                        <div className="offer-content">


                                            {/* DESTINATION */}

                                            <span className="offer-location">

                                                <FaMapMarkerAlt />

                                                {
                                                    offre.destination ||
                                                    offre.nom_destination ||
                                                    "Destination"
                                                }

                                            </span>



                                            {/* TITRE */}

                                            <h3>

                                                {
                                                    offre.titre ||
                                                    offre.nom ||
                                                    "Offre touristique"
                                                }

                                            </h3>



                                            {/* DESCRIPTION */}

                                            <p className="offer-description">

                                                {
                                                    offre.description ||
                                                    offre.description_offre ||
                                                    "Découvrez cette expérience touristique et profitez d'un séjour inoubliable."
                                                }

                                            </p>



                                            {/* INFORMATIONS */}

                                            <div className="offer-info">


                                                {/* CAPACITÉ */}

                                                {(
                                                    offre.capacite !==
                                                    null &&
                                                    offre.capacite !==
                                                    undefined &&
                                                    offre.capacite !== ""
                                                ) && (

                                                    <span>

                                                        <FaUsers />

                                                        {offre.capacite}
                                                        {" "}
                                                        {Number(offre.capacite) > 1
                                                            ? "personnes"
                                                            : "personne"}

                                                    </span>

                                                )}



                                                {/* DATE */}

                                                {offre.date_debut && (

                                                    <span>

                                                        <FaCalendarAlt />

                                                        {formatDate(
                                                            offre.date_debut
                                                        )}

                                                    </span>

                                                )}



                                                {/* DISPONIBILITÉ */}

                                                {offre.disponibilite !==
                                                    undefined && (

                                                    <span>

                                                        <FaCheckCircle />

                                                        Disponible

                                                    </span>

                                                )}


                                            </div>



                                            {/* PRIX + BOUTON */}

                                            <div className="offer-bottom">


                                                <div className="offer-price">

                                                    <small>
                                                        À partir de
                                                    </small>

                                                    <strong>

                                                        {formatPrixEuro(
                                                            offre.prix
                                                        )}

                                                    </strong>

                                                </div>



                                                {/* IMPORTANT :
                                                    route exacte du détail */}

                                                <Link
                                                    to={`/detail-offre/${id}`}
                                                    className="offer-button"
                                                >

                                                    Voir l'offre

                                                    <FaArrowRight />

                                                </Link>


                                            </div>


                                        </div>


                                    </article>

                                );

                            }
                        )}

                    </div>

                )}

            </section>



            {/* =================================================
                AVANTAGES
            ================================================= */}

            <section className="advantages-section">


                <div className="advantages-container">


                    <div className="advantages-intro">


                        <span className="section-label">
                            POURQUOI NOUS CHOISIR ?
                        </span>


                        <h2>

                            Voyagez en toute

                            <span>
                                simplicité.
                            </span>

                        </h2>


                        <p>

                            Notre plateforme vous accompagne
                            de la recherche de votre destination
                            jusqu'à la réservation de votre séjour.

                        </p>


                        <Link
                            to="/destinations-public"
                            className="advantages-button"
                        >

                            Commencer maintenant

                            <FaArrowRight />

                        </Link>


                    </div>



                    <div className="advantages-grid">


                        <div className="advantage-card">


                            <div className="advantage-icon">

                                <FaShieldAlt />

                            </div>


                            <h3>
                                Réservation sécurisée
                            </h3>


                            <p>

                                Vos réservations sont traitées
                                de manière fiable et sécurisée.

                            </p>


                        </div>



                        <div className="advantage-card">


                            <div className="advantage-icon">

                                <FaCreditCard />

                            </div>


                            <h3>
                                Paiement simple
                            </h3>


                            <p>

                                Profitez d'un processus de paiement
                                simple et pratique.

                            </p>


                        </div>



                        <div className="advantage-card">


                            <div className="advantage-icon">

                                <FaStar />

                            </div>


                            <h3>
                                Offres sélectionnées
                            </h3>


                            <p>

                                Découvrez des offres touristiques
                                adaptées à vos besoins.

                            </p>


                        </div>



                        <div className="advantage-card">


                            <div className="advantage-icon">

                                <FaHeadset />

                            </div>


                            <h3>
                                Assistance
                            </h3>


                            <p>

                                Notre équipe reste disponible
                                pour répondre à vos questions.

                            </p>


                        </div>


                    </div>

                </div>

            </section>



            {/* =================================================
                COMMENT ÇA MARCHE
            ================================================= */}

            <section className="steps-section">


                <div className="section-title-center">


                    <span className="section-label">
                        COMMENT ÇA MARCHE ?
                    </span>


                    <h2>
                        Réservez votre séjour en quelques étapes
                    </h2>


                    <p>

                        Un processus simple et rapide pour
                        organiser votre prochain voyage.

                    </p>


                </div>



                <div className="steps-grid">


                    <div className="step-card">


                        <span className="step-number">
                            01
                        </span>


                        <div className="step-icon">

                            <FaSearch />

                        </div>


                        <h3>
                            Recherchez
                        </h3>


                        <p>

                            Explorez les destinations et les
                            offres disponibles sur notre plateforme.

                        </p>


                    </div>



                    <div className="step-card">


                        <span className="step-number">
                            02
                        </span>


                        <div className="step-icon">

                            <FaCheckCircle />

                        </div>


                        <h3>
                            Choisissez
                        </h3>


                        <p>

                            Sélectionnez l'offre touristique
                            qui correspond le mieux à vos besoins.

                        </p>


                    </div>



                    <div className="step-card">


                        <span className="step-number">
                            03
                        </span>


                        <div className="step-icon">

                            <FaCreditCard />

                        </div>


                        <h3>
                            Réservez
                        </h3>


                        <p>

                            Effectuez votre réservation et
                            préparez votre prochain voyage.

                        </p>


                    </div>


                </div>

            </section>



            {/* =================================================
                RECOMMANDATION IA
            ================================================= */}

            <section className="ia-section">


                <div className="ia-content">


                    <div className="ia-icon">

                        <FaRobot />

                    </div>


                    <div>


                        <span className="section-label">
                            RECOMMANDATION INTELLIGENTE
                        </span>


                        <h2>
                            Laissez notre IA vous guider
                        </h2>


                        <p>

                            Recevez des recommandations
                            touristiques personnalisées selon
                            vos préférences.

                        </p>


                    </div>


                    <Link
                        to="/recommandations"
                        className="ia-button"
                    >

                        Découvrir

                        <FaArrowRight />

                    </Link>


                </div>

            </section>



            {/* =================================================
                CONTACT
            ================================================= */}

            <section className="home-contact">


                <div className="contact-overlay"></div>


                <div className="contact-content">


                    <span className="contact-label">
                        BESOIN D'AIDE ?
                    </span>


                    <h2>

                        Préparez votre prochain

                        <span>
                            voyage avec nous.
                        </span>

                    </h2>


                    <p>

                        Explorez de nouvelles destinations,
                        découvrez des expériences uniques et
                        préparez-vous à vivre un voyage inoubliable.

                    </p>



                    <div className="contact-buttons">


                        {/* CONTACT */}

                        <Link to="/contact">

                            <button
                                type="button"
                                className="contact-primary"
                            >

                                Contactez-nous

                                <FaArrowRight />

                            </button>

                        </Link>



                        {/* ASSISTANT CHATBOT FLOTTANT */}

                        <button
                            type="button"
                            className="contact-chatbot"

                            onClick={() => {

                                window.dispatchEvent(
                                    new Event("open-chatbot")
                                );

                            }}
                        >

                            <FaRobot />

                            Assistant chatbot

                        </button>



                        {/* EXPLORER */}

                        <Link to="/destinations-public">

                            <button
                                type="button"
                                className="contact-secondary"
                            >

                                Explorer

                            </button>

                        </Link>


                    </div>

                </div>

            </section>


        </main>

    );

}


export default Accueil;

