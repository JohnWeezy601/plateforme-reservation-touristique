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
    FaCheckCircle
} from "react-icons/fa";

import api from "../api/api";
import "./Accueil.css";


function Accueil() {

    const [destinations, setDestinations] = useState([]);
    const [offres, setOffres] = useState([]);

    const [loadingDestinations, setLoadingDestinations] = useState(true);
    const [loadingOffres, setLoadingOffres] = useState(true);

    const [errorDestinations, setErrorDestinations] = useState("");
    const [errorOffres, setErrorOffres] = useState("");


    

const formatPrixEuro = (prix) => {

    if (prix === null || prix === undefined || prix === "") {
        return "Prix sur demande";
    }

    return `${Number(prix).toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} €`;

};

    /* =========================================================
       CONSTRUIRE URL IMAGE
    ========================================================= */

    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }

        // Si l'API renvoie déjà une URL complète
        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        // Si l'API renvoie /uploads/image.jpg
        if (image.startsWith("/uploads/")) {
            return `http://localhost:8081${image}`;
        }

        // Si l'API renvoie /image.jpg
        if (image.startsWith("/")) {
            return `http://localhost:8081${image}`;
        }

        // Si l'API renvoie seulement image.jpg
        return `http://localhost:8081/uploads/${image}`;
    };


    /* =========================================================
       CHARGER DESTINATIONS
    ========================================================= */

    useEffect(() => {

        const chargerDestinations = async () => {

            try {

                setLoadingDestinations(true);
                setErrorDestinations("");

                const response = await api.get("/destinations");

                console.log(
                    "Destinations récupérées :",
                    response.data
                );

                let data = response.data;

                // Si le backend retourne { destinations: [...] }
                if (
                    data &&
                    Array.isArray(data.destinations)
                ) {
                    data = data.destinations;
                }

                // Si le backend retourne { data: [...] }
                if (
                    data &&
                    Array.isArray(data.data)
                ) {
                    data = data.data;
                }

                if (Array.isArray(data)) {
                    setDestinations(data);
                } else {
                    setDestinations([]);
                }

            } catch (error) {

                console.error(
                    "Erreur chargement destinations :",
                    error
                );

                setErrorDestinations(
                    "Impossible de charger les destinations."
                );

                setDestinations([]);

            } finally {

                setLoadingDestinations(false);

            }

        };


        chargerDestinations();

    }, []);


    /* =========================================================
       CHARGER OFFRES
    ========================================================= */

    useEffect(() => {

        const chargerOffres = async () => {

            try {

                setLoadingOffres(true);
                setErrorOffres("");

                const response = await api.get("/offres");

                console.log(
                    "Offres récupérées :",
                    response.data
                );

                let data = response.data;

                // Si le backend retourne { offres: [...] }
                if (
                    data &&
                    Array.isArray(data.offres)
                ) {
                    data = data.offres;
                }

                // Si le backend retourne { data: [...] }
                if (
                    data &&
                    Array.isArray(data.data)
                ) {
                    data = data.data;
                }

                if (Array.isArray(data)) {
                    setOffres(data);
                } else {
                    setOffres([]);
                }

            } catch (error) {

                console.error(
                    "Erreur chargement offres :",
                    error
                );

                setErrorOffres(
                    "Impossible de charger les offres."
                );

                setOffres([]);

            } finally {

                setLoadingOffres(false);

            }

        };


        chargerOffres();

    }, []);


    /* =========================================================
       DONNEES DESTINATIONS
    ========================================================= */

    const destinationsAffichees = destinations.slice(0, 4);


    /* =========================================================
       DONNEES OFFRES
    ========================================================= */

    const offresAffichees = offres.slice(0, 6);


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

                        <Link to="/destinations-public">

                            <button
                                type="button"
                                className="hero-primary-btn"
                            >

                                Explorer les destinations

                                <span>
                                    <FaArrowRight />
                                </span>

                            </button>

                        </Link>


                        <Link to="/offres-public">

                            <button
                                type="button"
                                className="hero-secondary-btn"
                            >

                                Voir les offres

                            </button>

                        </Link>

                    </div>

                </div>

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

                                const image = getImageUrl(
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

                                                Madagascar

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

                                const image = getImageUrl(
                                    offre.image ||
                                    offre.photo ||
                                    offre.image_offre
                                );


                                const id =
                                    offre.id_offre ||
                                    offre.id;


                                return (

                                    <div
                                        className="offer-card"
                                        key={id || index}
                                    >


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
                                                onClick={(event) => {

                                                    event.preventDefault();

                                                }}
                                            >

                                                <FaHeart />

                                            </button>

                                        </div>



                                        <div className="offer-content">


                                            <span className="offer-location">

                                                <FaMapMarkerAlt />

                                                {
                                                    offre.destination ||
                                                    offre.nom_destination ||
                                                    "Madagascar"
                                                }

                                            </span>


                                            <h3>

                                                {
                                                    offre.titre ||
                                                    "Offre touristique"
                                                }

                                            </h3>


                                            <div className="offer-info">


                                                {offre.capacite && (

                                                    <span>

                                                        👥{" "}

                                                        {offre.capacite}
                                                        {" "}
                                                        personnes

                                                    </span>

                                                )}


                                                {offre.disponibilite !== undefined && (

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
                                                      {formatPrixEuro(offre.prix)}
                                                  </strong>

                                                 </div>

                                                <Link
                                                    to={`/detail-offre/${id}`}
                                                    className="offer-button"
                                                >

                                                    Voir l'offre

                                                    <FaArrowRight />

                                                </Link>

                                            </div>

                                        </div>

                                    </div>

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

                            <FaSearch />

                        </div>


                        <h3>
                            Recherchez
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


                 {/* ASSISTANT CHATBOT */}
                 <button
    type="button"
    className="contact-chatbot"
    onClick={() => {
        // Ouvre le chatbot flottant
        window.dispatchEvent(new Event("open-chatbot"));
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


        </div>

    );

}


export default Accueil;