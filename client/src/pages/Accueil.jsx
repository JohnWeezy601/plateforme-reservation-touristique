import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
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
    FaCheckCircle
} from "react-icons/fa";

import api from "../api/api";
import "./Accueil.css";


function Accueil() {

    /* =========================================================
       ETATS
    ========================================================= */

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

    const [videosDisponibles, setVideosDisponibles] =
        useState([]);

    const [videoPrincipale, setVideoPrincipale] =
        useState(null);


    /* =========================================================
       VIDEOS ACCUEIL
       
       IMPORTANT :
       Les fichiers sont dans :
       client/public/videos-web/
       
       Donc les URLs commencent par :
       /videos-web/
    ========================================================= */

    const videosAccueil = [

        {
            fichier: "/videos-web/lemurien.mp4",
            categorie: "Nature",
            titre: "La faune de Madagascar",
            description:
                "Découvrez la richesse exceptionnelle de la faune malgache."
        },

        {
            fichier: "/videos-web/ville.mp4",
            categorie: "Ville",
            titre: "Découvrez les villes",
            description:
                "Explorez les villes et l'ambiance des destinations malgaches."
        },

        {
            fichier: "/videos-web/ranomafana.mp4",
            categorie: "Destination",
            titre: "Ranomafana",
            description:
                "Découvrez les paysages et les merveilles naturelles de Ranomafana."
        },

        {
            fichier: "/videos-web/hotel.mp4",
            categorie: "Hébergement",
            titre: "Séjournez confortablement",
            description:
                "Découvrez les hébergements et les espaces conçus pour votre séjour."
        },

        {
            fichier: "/videos-web/nature.mp4",
            categorie: "Nature",
            titre: "Évasion et paysages",
            description:
                "Laissez-vous séduire par les paysages exceptionnels de Madagascar."
        }

    ];


    /* =========================================================
       PRIX
    ========================================================= */

    const formatPrixEuro = (prix) => {

        if (
            prix === null ||
            prix === undefined ||
            prix === ""
        ) {
            return "Prix sur demande";
        }

        const prixNumerique = Number(prix);

        if (Number.isNaN(prixNumerique)) {
            return "Prix sur demande";
        }

        return `${prixNumerique.toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )} €`;
    };


    /* =========================================================
       CONSTRUIRE URL IMAGE
    ========================================================= */

    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }

        const imageString = String(image).trim();

        if (!imageString) {
            return null;
        }


        /* URL Cloudinary ou URL complète */

        if (
            imageString.startsWith("http://") ||
            imageString.startsWith("https://")
        ) {
            return imageString;
        }


        const serverUrl =
            import.meta.env.VITE_SERVER_URL || "";


        /* Ancien système /uploads */

        if (imageString.startsWith("/uploads/")) {

            return `${serverUrl}${imageString}`;

        }


        /* Autre URL locale */

        if (imageString.startsWith("/")) {

            return `${serverUrl}${imageString}`;

        }


        /* Nom de fichier uniquement */

        return `${serverUrl}/uploads/${imageString}`;
    };


    /* =========================================================
       ERREUR IMAGE
    ========================================================= */

    const handleImageError = (event) => {

        if (!event.currentTarget) {
            return;
        }

        event.currentTarget.style.display = "none";

        const parent =
            event.currentTarget.parentElement;

        if (parent) {

            parent.classList.add(
                "image-load-error"
            );

        }
    };


    /* =========================================================
       VERIFIER LES VIDEOS DISPONIBLES
       
       On vérifie réellement chaque fichier.
       
       Les vidéos inexistantes sont ignorées.
       Les vidéos disponibles sont affichées dans le montage.
    ========================================================= */

    useEffect(() => {

        let actif = true;


        const verifierVideos = async () => {

            const resultats =
                await Promise.all(

                    videosAccueil.map(
                        (video) => {

                            return new Promise((resolve) => {

                                const videoElement =
                                    document.createElement("video");


                                let termine = false;


                                const terminer = (resultat) => {

                                    if (termine) {
                                        return;
                                    }

                                    termine = true;

                                    resolve(resultat);

                                };


                                videoElement.preload =
                                    "metadata";


                                videoElement.muted = true;


                                videoElement.onloadedmetadata =
                                    () => {

                                        terminer(video);

                                    };


                                videoElement.oncanplay =
                                    () => {

                                        terminer(video);

                                    };


                                videoElement.onerror =
                                    () => {

                                        terminer(null);

                                    };


                                videoElement.src =
                                    video.fichier;


                                videoElement.load();

                            });

                        }
                    )
                );


            if (!actif) {
                return;
            }


            const videosValides =
                resultats.filter(Boolean);


            setVideosDisponibles(
                videosValides
            );


            /*
             * Première vidéo = vidéo principale
             */

            if (videosValides.length > 0) {

                setVideoPrincipale(
                    videosValides[0]
                );

            }
            else {

                setVideoPrincipale(null);

            }

        };


        verifierVideos();


        return () => {

            actif = false;

        };

    }, []);


    /* =========================================================
       CHARGER DESTINATIONS
    ========================================================= */

    useEffect(() => {

        let actif = true;


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


                let data =
                    response.data;


                /* { destinations: [...] } */

                if (
                    data &&
                    Array.isArray(
                        data.destinations
                    )
                ) {

                    data =
                        data.destinations;

                }


                /* { data: [...] } */

                else if (
                    data &&
                    Array.isArray(
                        data.data
                    )
                ) {

                    data =
                        data.data;

                }


                if (actif) {

                    if (
                        Array.isArray(data)
                    ) {

                        setDestinations(data);

                    }
                    else {

                        setDestinations([]);

                    }

                }

            }
            catch (error) {

                console.error(
                    "Erreur chargement destinations :",
                    error
                );


                if (actif) {

                    setErrorDestinations(
                        "Impossible de charger les destinations."
                    );


                    setDestinations([]);

                }

            }
            finally {

                if (actif) {

                    setLoadingDestinations(
                        false
                    );

                }

            }

        };


        chargerDestinations();


        return () => {

            actif = false;

        };

    }, []);


    /* =========================================================
       CHARGER OFFRES
    ========================================================= */

    useEffect(() => {

        let actif = true;


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


                let data =
                    response.data;


                /* { offres: [...] } */

                if (
                    data &&
                    Array.isArray(
                        data.offres
                    )
                ) {

                    data =
                        data.offres;

                }


                /* { data: [...] } */

                else if (
                    data &&
                    Array.isArray(
                        data.data
                    )
                ) {

                    data =
                        data.data;

                }


                if (actif) {

                    if (
                        Array.isArray(data)
                    ) {

                        setOffres(data);

                    }
                    else {

                        setOffres([]);

                    }

                }

            }
            catch (error) {

                console.error(
                    "Erreur chargement offres :",
                    error
                );


                if (actif) {

                    setErrorOffres(
                        "Impossible de charger les offres."
                    );


                    setOffres([]);

                }

            }
            finally {

                if (actif) {

                    setLoadingOffres(
                        false
                    );

                }

            }

        };


        chargerOffres();


        return () => {

            actif = false;

        };

    }, []);


    /* =========================================================
       ELEMENTS A AFFICHER
    ========================================================= */

    const destinationsAffichees =
        destinations.slice(0, 3);


    const offresAffichees =
        offres.slice(0, 6);


    /*
     * Les vidéos secondaires :
     * toutes les vidéos sauf la principale.
     */

    const videosSecondaires =
        videosDisponibles.filter(
            (video) =>
                video.fichier !==
                videoPrincipale?.fichier
        );


    /* =========================================================
       RENDU
    ========================================================= */

    return (

        <div className="home-page">


            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="home-hero">

                <div className="hero-overlay"></div>


                <div className="hero-content">

                    <div className="hero-badge">

                        <FaGlobeAfrica />

                        <span>
                            Votre voyage commence ici
                        </span>

                    </div>


                    <h1>

                        Découvrez les plus belles

                        <span>
                            destinations touristiques
                        </span>

                    </h1>


                    <p>

                        Explorez Madagascar et ses merveilles,
                        découvrez nos offres touristiques et
                        réservez facilement votre prochain séjour.

                    </p>


                    <div className="hero-buttons">

                        <Link
                            to="/destinations-public"
                            className="hero-primary-btn"
                        >

                            <span>
                                Explorer les destinations
                            </span>

                            <span>
                                <FaArrowRight />
                            </span>

                        </Link>


                        <Link
                            to="/offres-public"
                            className="hero-secondary-btn"
                        >

                            Voir les offres

                        </Link>

                    </div>

                </div>

            </section>


            {/* =====================================================
                MONTAGE VIDEO
            ===================================================== */}

            <section className="videos-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            INSPIRATION
                        </span>


                        <h2>
                            Laissez-vous inspirer par le voyage
                        </h2>


                        <p>
                            Découvrez Madagascar à travers un
                            montage de paysages, de villes,
                            de nature et d'expériences.
                        </p>

                    </div>

                </div>


                {videosDisponibles.length === 0 ? (

                    /* =================================================
                       AUCUNE VIDEO
                    ================================================= */

                    <div className="video-empty-state">

                        <div className="video-empty-icon">

                            <FaGlobeAfrica />

                        </div>


                        <h3>
                            Découvrez bientôt nos vidéos
                        </h3>


                        <p>
                            Notre sélection de clips touristiques
                            sera bientôt disponible.
                        </p>

                    </div>

                ) : (

                    /* =================================================
                       MONTAGE
                    ================================================= */

                    <div className="video-montage">


                        {/* =============================================
                            VIDEO PRINCIPALE
                        ============================================= */}

                        {videoPrincipale && (

                            <div
                                className="video-montage-card video-montage-main"
                            >

                                <video
                                    src={
                                        videoPrincipale.fichier
                                    }
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                />


                                <div className="video-montage-overlay"></div>


                                <div className="video-montage-content">

                                    <span className="video-category">

                                        {videoPrincipale.categorie}

                                    </span>


                                    <h3>

                                        {videoPrincipale.titre}

                                    </h3>


                                    <p>

                                        {videoPrincipale.description}

                                    </p>

                                </div>

                            </div>

                        )}


                        {/* =============================================
                            VIDEOS SECONDAIRES
                        ============================================= */}

                        <div className="video-montage-side">

                            {videosSecondaires.map(
                                (video, index) => (

                                    <div
                                        className={`video-montage-card video-montage-small video-montage-small-${index + 1}`}
                                        key={`${video.fichier}-${index}`}
                                    >

                                        <video
                                            src={
                                                video.fichier
                                            }
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            preload="metadata"
                                        />


                                        <div className="video-montage-overlay"></div>


                                        <div className="video-montage-content">

                                            <span className="video-category">

                                                {video.categorie}

                                            </span>


                                            <h3>

                                                {video.titre}

                                            </h3>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}

            </section>


            {/* =====================================================
                DESTINATIONS
            ===================================================== */}

            <section className="destinations-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            DESTINATIONS
                        </span>


                        <h2>
                            Explorez Madagascar
                        </h2>


                        <p>
                            Découvrez les destinations les plus
                            remarquables proposées sur notre plateforme.
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


                                const nom =
                                    destination.nom ||
                                    destination.nom_destination ||
                                    "Destination";


                                const description =
                                    destination.description ||
                                    "Découvrez cette magnifique destination touristique.";


                                return (

                                    <Link
                                        to="/destinations-public"
                                        className="destination-card"
                                        key={id || index}
                                    >

                                        {image ? (

                                            <img
                                                src={image}
                                                alt={nom}
                                                className="destination-image"
                                                loading="lazy"
                                                onError={
                                                    handleImageError
                                                }
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

                                                Madagascar

                                            </span>


                                            <h3>
                                                {nom}
                                            </h3>


                                            <p>
                                                {description}
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


            {/* =====================================================
                OFFRES
            ===================================================== */}

            <section className="offers-section">

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            NOS OFFRES
                        </span>


                        <h2>
                            Des séjours pour tous les goûts
                        </h2>


                        <p>
                            Trouvez l'offre idéale pour votre prochain
                            voyage.
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


                                const titre =
                                    offre.titre ||
                                    "Offre touristique";


                                const destination =
                                    offre.destination ||
                                    offre.nom_destination ||
                                    "Madagascar";


                                return (

                                    <article
                                        className="offer-card"
                                        key={id || index}
                                    >

                                        <div className="offer-image">

                                            {image ? (

                                                <img
                                                    src={image}
                                                    alt={titre}
                                                    loading="lazy"
                                                    onError={
                                                        handleImageError
                                                    }
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


                                        <div className="offer-content">

                                            <span className="offer-location">

                                                <FaMapMarkerAlt />

                                                {destination}

                                            </span>


                                            <h3>
                                                {titre}
                                            </h3>


                                            <div className="offer-info">

                                                {offre.capacite !==
                                                    undefined &&
                                                    offre.capacite !==
                                                    null &&
                                                    offre.capacite !==
                                                    "" && (

                                                        <span>

                                                            👥{" "}

                                                            {offre.capacite}

                                                            {" "}
                                                            personnes

                                                        </span>

                                                    )}


                                                {offre.disponibilite !==
                                                    undefined && (

                                                        <span>

                                                            ✓ Disponible

                                                        </span>

                                                    )}


                                                {offre.date_debut && (

                                                    <span>

                                                        📅{" "}

                                                        {new Date(
                                                            offre.date_debut
                                                        ).toLocaleDateString(
                                                            "fr-FR"
                                                        )}

                                                    </span>

                                                )}

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


                                                {id ? (

                                                    <Link
                                                        to={`/detail-offre/${id}`}
                                                        className="offer-button"
                                                    >

                                                        Voir l'offre

                                                        <FaArrowRight />

                                                    </Link>

                                                ) : (

                                                    <Link
                                                        to="/offres-public"
                                                        className="offer-button"
                                                    >

                                                        Voir les offres

                                                        <FaArrowRight />

                                                    </Link>

                                                )}

                                            </div>

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


            {/* =====================================================
                AVANTAGES
            ===================================================== */}

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

                            Notre plateforme vous accompagne de la
                            recherche de votre destination jusqu'à
                            la réservation de votre séjour.

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
                                Notre équipe reste disponible pour
                                répondre à vos questions.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                COMMENT ÇA MARCHE
            ===================================================== */}

            <section className="steps-section">

                <div className="section-title-center">

                    <span className="section-label">
                        COMMENT ÇA MARCHE ?
                    </span>


                    <h2>
                        Réservez votre séjour en quelques étapes
                    </h2>


                    <p>
                        Un processus simple et rapide pour organiser
                        votre prochain voyage.
                    </p>

                </div>


                <div className="steps-grid">

                    <div className="step-card">

                        <span className="step-number">
                            01
                        </span>


                        <div className="step-icon">

                            <FaGlobeAfrica />

                        </div>


                        <h3>
                            Explorez
                        </h3>


                        <p>
                            Explorez les destinations et les offres
                            disponibles sur notre plateforme.
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
                            Sélectionnez l'offre touristique qui
                            correspond le mieux à vos besoins.
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
                            Effectuez votre réservation et préparez
                            votre prochain voyage.
                        </p>

                    </div>

                </div>

            </section>


            {/* =====================================================
                IA
            ===================================================== */}

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

                            Recevez des recommandations touristiques
                            personnalisées selon vos préférences.

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


            {/* =====================================================
                CONTACT
            ===================================================== */}

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

                        Une question concernant une destination,
                        une offre ou une réservation ?
                        Notre équipe est là pour vous accompagner.

                    </p>


                    <div className="contact-buttons">

                        <Link
                            to="/contact"
                            className="contact-primary"
                        >

                            Contactez-nous

                            <FaArrowRight />

                        </Link>


                        <button
                            type="button"
                            className="contact-chatbot"
                            onClick={() => {

                                window.dispatchEvent(
                                    new Event(
                                        "open-chatbot"
                                    )
                                );

                            }}
                        >

                            <FaRobot />

                            Assistant chatbot

                        </button>


                        <Link
                            to="/destinations-public"
                            className="contact-secondary"
                        >

                            Explorer

                        </Link>

                    </div>

                </div>

            </section>

        </div>

    );

}


export default Accueil;