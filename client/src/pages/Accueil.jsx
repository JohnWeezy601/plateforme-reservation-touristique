import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaGlobeAfrica,
    FaMapMarkerAlt,
    FaHotel,
    FaStar,
    FaShieldAlt,
    FaHeadset,
    FaCreditCard,
    FaRobot,
    FaHeart,
    FaArrowRight,
    FaPlay,
    FaCheckCircle,
    FaCalendarAlt,
    FaUsers,
    FaSearch
} from "react-icons/fa";

import api from "../api/api";

import "./Accueil.css";


/* =========================================================
   URL IMAGE
========================================================= */

const getImageUrl = (image) => {

    if (!image) {
        return null;
    }

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    if (image.startsWith("/uploads/")) {
        return image;
    }

    if (image.startsWith("/")) {
        return image;
    }

    return `/uploads/${image}`;
};


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

    return `${nombre.toLocaleString("fr-FR")} €`;
};


/* =========================================================
   VIDÉOS CINÉMATIQUES
========================================================= */

const videoItems = [

    {
        id: 1,
        src: "/videos/lemurien.mp4",
        category: "FAUNE",
        title: "À la rencontre des lémuriens",
        description:
            "Découvrez l'une des espèces les plus emblématiques de Madagascar."
    },

    {
        id: 2,
        src: "/videos/baobab.mp4",
        category: "NATURE",
        title: "L'allée des Baobabs",
        description:
            "Un paysage mythique au cœur de Madagascar."
    },

    {
        id: 3,
        src: "/videos/plage.mp4",
        category: "OCÉAN",
        title: "Les plages paradisiaques",
        description:
            "Des eaux turquoise et des paysages tropicaux exceptionnels."
    },

    {
        id: 4,
        src: "/videos/tsingy.mp4",
        category: "AVENTURE",
        title: "Les Tsingy de Madagascar",
        description:
            "Explorez des formations rocheuses parmi les plus spectaculaires."
    },

    {
        id: 5,
        src: "/videos/ocean.mp4",
        category: "ÉVASION",
        title: "Madagascar côté océan",
        description:
            "Laissez-vous transporter par les paysages de l'océan Indien."
    }

];


/* =========================================================
   COMPOSANT ACCUEIL
========================================================= */

function Accueil() {

    const [destinations, setDestinations] = useState([]);
    const [offres, setOffres] = useState([]);

    const [loadingDestinations, setLoadingDestinations] = useState(true);
    const [loadingOffres, setLoadingOffres] = useState(true);

    const [errorDestinations, setErrorDestinations] = useState("");
    const [errorOffres, setErrorOffres] = useState("");


    /* =====================================================
       CHARGEMENT DESTINATIONS
    ===================================================== */

    useEffect(() => {

        const fetchDestinations = async () => {

            try {

                setLoadingDestinations(true);
                setErrorDestinations("");

                const response = await api.get("/destinations");

                const data = response.data;

                if (Array.isArray(data)) {
                    setDestinations(data);
                }
                else if (Array.isArray(data?.destinations)) {
                    setDestinations(data.destinations);
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

            }
            finally {

                setLoadingDestinations(false);

            }

        };


        fetchDestinations();

    }, []);


    /* =====================================================
       CHARGEMENT OFFRES
    ===================================================== */

    useEffect(() => {

        const fetchOffres = async () => {

            try {

                setLoadingOffres(true);
                setErrorOffres("");

                const response = await api.get("/offres");

                const data = response.data;

                if (Array.isArray(data)) {
                    setOffres(data);
                }
                else if (Array.isArray(data?.offres)) {
                    setOffres(data.offres);
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

            }
            finally {

                setLoadingOffres(false);

            }

        };


        fetchOffres();

    }, []);


    /* =====================================================
       DESTINATIONS LIMITÉES
    ===================================================== */

    const displayedDestinations =
        destinations.slice(0, 6);


    /* =====================================================
       OFFRES LIMITÉES
    ===================================================== */

    const displayedOffers =
        offres.slice(0, 6);


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
                            Madagascar autrement
                        </span>

                    </h1>


                    <p>

                        Explorez les plus belles destinations,
                        trouvez les meilleures offres touristiques
                        et réservez votre prochaine aventure
                        en toute simplicité.

                    </p>


                    <div className="hero-buttons">

                        <Link
                            to="/destinations"
                            className="hero-primary-btn"
                        >

                            <span>
                                Explorer Madagascar
                            </span>

                            <FaArrowRight />

                        </Link>


                        <Link
                            to="/offres"
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


                    {/* ================================
                        TEXTE GAUCHE
                    ================================= */}

                    <div className="videos-cinematic-intro">

                        <span className="section-label">

                            EXPLOREZ MADAGASCAR

                        </span>


                        <h2>

                            Découvrez Madagascar

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
                            to="/destinations"
                            className="cinematic-discover-button"
                        >

                            Découvrir les destinations

                            <FaArrowRight />

                        </Link>

                    </div>


                    {/* ================================
                        MUR VIDÉO
                    ================================= */}

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
                                pour créer une boucle continue */}

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
                            Des lieux qui font rêver
                        </h2>

                        <p>
                            Découvrez les destinations
                            incontournables de Madagascar.
                        </p>

                    </div>


                    <Link
                        to="/destinations"
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

                        <span>⚠️</span>

                        <p>
                            {errorDestinations}
                        </p>

                    </div>

                ) : displayedDestinations.length === 0 ? (

                    <div className="empty-container">

                        <span>🌍</span>

                        <p>
                            Aucune destination disponible.
                        </p>

                    </div>

                ) : (

                    <div className="destination-grid">

                        {displayedDestinations.map(
                            (destination) => {

                                const image =
                                    getImageUrl(
                                        destination.image ||
                                        destination.photo ||
                                        destination.image_destination
                                    );


                                return (

                                    <Link
                                        key={
                                            destination.id_destination ||
                                            destination.id
                                        }
                                        to={`/destinations/${
                                            destination.id_destination ||
                                            destination.id
                                        }`}
                                        className="destination-card"
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
                                            />

                                        ) : (

                                            <div className="destination-no-image">

                                                <FaGlobeAfrica />

                                            </div>

                                        )}


                                        <div className="destination-overlay"></div>


                                        <div className="destination-content">

                                            <div className="destination-location">

                                                <FaMapMarkerAlt />

                                                <span>
                                                    Madagascar
                                                </span>

                                            </div>


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


                                            <div className="destination-link">

                                                Découvrir

                                                <FaArrowRight />

                                            </div>

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

                        <h2>
                            Préparez votre prochaine aventure
                        </h2>

                        <p>
                            Des expériences sélectionnées
                            pour rendre votre séjour inoubliable.
                        </p>

                    </div>


                    <Link
                        to="/offres"
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

                        <span>⚠️</span>

                        <p>
                            {errorOffres}
                        </p>

                    </div>

                ) : displayedOffers.length === 0 ? (

                    <div className="empty-container">

                        <span>🏨</span>

                        <p>
                            Aucune offre disponible.
                        </p>

                    </div>

                ) : (

                    <div className="offers-grid">

                        {displayedOffers.map((offre) => {

                            const image =
                                getImageUrl(
                                    offre.image ||
                                    offre.photo ||
                                    offre.image_offre
                                );


                            return (

                                <article
                                    key={
                                        offre.id_offre ||
                                        offre.id
                                    }
                                    className="offer-card"
                                >


                                    <div className="offer-image">

                                        {image ? (

                                            <img
                                                src={image}
                                                alt={
                                                    offre.titre ||
                                                    offre.nom ||
                                                    "Offre touristique"
                                                }
                                            />

                                        ) : (

                                            <div className="offer-no-image">

                                                <FaHotel />

                                            </div>

                                        )}


                                        <span className="offer-badge">

                                            {
                                                offre.categorie ||
                                                "OFFRE TOURISTIQUE"
                                            }

                                        </span>


                                        <button
                                            type="button"
                                            className="favorite-button"
                                            aria-label="Ajouter aux favoris"
                                        >

                                            <FaHeart />

                                        </button>

                                    </div>


                                    <div className="offer-content">


                                        <div className="offer-location">

                                            <FaMapMarkerAlt />

                                            <span>

                                                {
                                                    offre.destination ||
                                                    offre.nom_destination ||
                                                    "Madagascar"
                                                }

                                            </span>

                                        </div>


                                        <h3>

                                            {
                                                offre.titre ||
                                                offre.nom ||
                                                "Offre touristique"
                                            }

                                        </h3>


                                        <div className="offer-info">

                                            <span>
                                                <FaCalendarAlt />
                                                Séjour touristique
                                            </span>

                                            <span>
                                                <FaUsers />
                                                Disponible
                                            </span>

                                        </div>


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


                                            <Link
                                                to={`/offres/${
                                                    offre.id_offre ||
                                                    offre.id
                                                }`}
                                                className="offer-button"
                                            >

                                                Voir l'offre

                                                <FaArrowRight />

                                            </Link>

                                        </div>

                                    </div>

                                </article>

                            );

                        })}

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
                            POURQUOI NOUS ?
                        </span>


                        <h2>

                            Voyagez

                            <span>
                                en toute confiance.
                            </span>

                        </h2>


                        <p>

                            Notre plateforme vous accompagne
                            à chaque étape pour rendre votre
                            expérience touristique simple,
                            sécurisée et agréable.

                        </p>


                        <Link
                            to="/contact"
                            className="advantages-button"
                        >

                            Besoin d'aide ?

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
                                Vos réservations et vos données
                                sont protégées.
                            </p>

                        </div>


                        <div className="advantage-card">

                            <div className="advantage-icon">

                                <FaCreditCard />

                            </div>

                            <h3>
                                Paiement sécurisé
                            </h3>

                            <p>
                                Effectuez vos paiements en toute
                                tranquillité.
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
                                Une équipe disponible pour vous
                                accompagner.
                            </p>

                        </div>


                        <div className="advantage-card">

                            <div className="advantage-icon">

                                <FaStar />

                            </div>

                            <h3>
                                Expériences sélectionnées
                            </h3>

                            <p>
                                Des offres et destinations choisies
                                pour leur qualité.
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
                        SIMPLE ET RAPIDE
                    </span>

                    <h2>
                        Comment ça marche ?
                    </h2>

                    <p>
                        Quelques étapes suffisent pour préparer
                        votre prochaine aventure.
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
                            Explorez les destinations et offres
                            disponibles.
                        </p>

                    </div>


                    <div className="step-card">

                        <span className="step-number">
                            02
                        </span>

                        <div className="step-icon">

                            <FaCalendarAlt />

                        </div>

                        <h3>
                            Choisissez
                        </h3>

                        <p>
                            Sélectionnez l'expérience qui vous
                            correspond.
                        </p>

                    </div>


                    <div className="step-card">

                        <span className="step-number">
                            03
                        </span>

                        <div className="step-icon">

                            <FaCheckCircle />

                        </div>

                        <h3>
                            Réservez
                        </h3>

                        <p>
                            Confirmez votre réservation simplement
                            et rapidement.
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
                            Obtenez des recommandations adaptées
                            à vos envies pour trouver votre
                            prochaine destination.
                        </p>

                    </div>


                    <Link
                        to="/recommandation"
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
                        PRÊT À PARTIR ?
                    </span>


                    <h2>

                        Votre prochaine aventure

                        <span>
                            commence ici.
                        </span>

                    </h2>


                    <p>

                        Explorez Madagascar, choisissez
                        votre destination et préparez-vous
                        à vivre une expérience inoubliable.

                    </p>


                    <div className="contact-buttons">

                        <Link
                            to="/offres"
                            className="contact-primary"
                        >

                            Explorer les offres

                            <FaArrowRight />

                        </Link>


                        <Link
                            to="/contact"
                            className="contact-secondary"
                        >

                            Nous contacter

                        </Link>


                        <button
                            type="button"
                            className="contact-chatbot"
                        >

                            <FaRobot />

                            Assistant IA

                        </button>

                    </div>

                </div>

            </section>


        </main>
    );
}


export default Accueil;