import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    FaMapMarkerAlt,
    FaTag,
    FaMoneyBillWave,
    FaUsers,
    FaCalendarAlt,
    FaArrowLeft,
    FaChevronLeft,
    FaChevronRight,
    FaCheckCircle,
    FaClock,
    FaHotel
} from "react-icons/fa";

import api from "../api/api";
import "./DetailOffre.css";

function DetailOffre() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [offre, setOffre] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [photoActuelle, setPhotoActuelle] = useState(0);
    const [loading, setLoading] = useState(true);
    const [galerieOuverte, setGalerieOuverte] = useState(false);


    // =====================================================
    // CHARGEMENT DE L'OFFRE
    // =====================================================

    useEffect(() => {

        const chargerOffre = async () => {

            try {

                setLoading(true);

                const res = await api.get(`/offres/${id}`);

                const data = res.data;

                console.log(
                    "Offre récupérée :",
                    data
                );

                setOffre(data);

                const galerie = [];

                // =================================================
                // IMAGE PRINCIPALE
                // =================================================

                if (data.image) {

                    galerie.push({
                        id_photo: "principale",
                        chemin_photo: data.image
                    });

                }

                // =================================================
                // PHOTOS SUPPLÉMENTAIRES
                // =================================================

                if (Array.isArray(data.photos)) {

                    data.photos.forEach((photo, index) => {

                        if (photo.chemin_photo) {

                            galerie.push({
                                id_photo:
                                    photo.id_photo ||
                                    `photo-${index}`,

                                chemin_photo:
                                    photo.chemin_photo
                            });

                        }

                    });

                }

                console.log(
                    "Galerie récupérée :",
                    galerie
                );

                setPhotos(galerie);
                setPhotoActuelle(0);

            }
            catch (error) {

                console.error(
                    "Erreur chargement offre :",
                    error
                );

                setOffre(null);

            }
            finally {

                setLoading(false);

            }

        };

        chargerOffre();

    }, [id]);


    // =====================================================
    // URL PHOTO
    // =====================================================

    const obtenirUrlPhoto = (photo) => {

        // Aucun chemin
        if (!photo) {

            return "/image-default.jpg";

        }


        // =================================================
        // CLOUDINARY OU AUTRE URL DISTANTE
        // =================================================

        if (
            photo.startsWith("http://") ||
            photo.startsWith("https://")
        ) {

            return photo;

        }


        // =================================================
        // ANCIENNES IMAGES LOCALES
        // =================================================

        return `${import.meta.env.VITE_SERVER_URL}/uploads/${photo}`;

    };


    // =====================================================
    // IMAGE ACTUELLE
    // =====================================================

    const imageActuelle =
        photos.length > 0
            ? photos[photoActuelle]
            : null;


    const urlImageActuelle =
        imageActuelle
            ? obtenirUrlPhoto(
                imageActuelle.chemin_photo
            )
            : "/image-default.jpg";


    // =====================================================
    // PHOTO PRECEDENTE
    // =====================================================

    const photoPrecedente = () => {

        if (photos.length <= 1) return;

        setPhotoActuelle((ancienne) => {

            return ancienne === 0
                ? photos.length - 1
                : ancienne - 1;

        });

    };


    // =====================================================
    // PHOTO SUIVANTE
    // =====================================================

    const photoSuivante = () => {

        if (photos.length <= 1) return;

        setPhotoActuelle((ancienne) => {

            return ancienne >= photos.length - 1
                ? 0
                : ancienne + 1;

        });

    };


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (loading) {

        return (

            <div className="detail-offre-loading">

                <div className="detail-loading-spinner"></div>

                <p>
                    Chargement de l'offre...
                </p>

            </div>

        );

    }


    // =====================================================
    // OFFRE INTROUVABLE
    // =====================================================

    if (!offre) {

        return (

            <div className="detail-offre-error">

                <div className="detail-error-card">

                    <h2>
                        Offre introuvable
                    </h2>

                    <p>
                        Cette offre n'existe pas ou
                        n'est plus disponible.
                    </p>

                    <button
                        onClick={() => navigate(-1)}
                    >

                        <FaArrowLeft />

                        Retour

                    </button>

                </div>

            </div>

        );

    }


    return (

        <main className="detail-offre-page">

            <div className="detail-offre-container">


                {/* =================================================
                    RETOUR
                ================================================= */}

                <button
                    className="detail-back-button"
                    onClick={() => navigate(-1)}
                >

                    <FaArrowLeft />

                    <span>
                        Retour aux offres
                    </span>

                </button>


                {/* =================================================
                    HEADER
                ================================================= */}

                <section className="detail-offre-header">

                    <div className="detail-header-left">

                        <div className="detail-available-badge">

                            <FaCheckCircle />

                            Offre disponible

                        </div>


                        <h1>
                            {offre.titre}
                        </h1>


                        {/* PRESTATAIRE */}

                        <div className="detail-prestataire">

                            <FaHotel />

                            <span>

                                Proposé par :{" "}

                                <strong>

                                    {offre.prestataire ||
                                        "Prestataire non précisé"}

                                </strong>

                            </span>

                        </div>


                        <div className="detail-header-meta">

                            <span>

                                <FaMapMarkerAlt />

                                {offre.destination ||
                                    "Destination non précisée"}

                            </span>


                            <span>

                                <FaTag />

                                {offre.categorie ||
                                    "Catégorie non précisée"}

                            </span>


                            {offre.capacite && (

                                <span>

                                    <FaUsers />

                                    Jusqu'à {offre.capacite} personnes

                                </span>

                            )}

                        </div>

                    </div>

                </section>


                {/* =================================================
                    GALERIE
                ================================================= */}

                <section className="detail-gallery-section">

                    <div className="detail-gallery">


                        {/* =================================================
                            GRANDE PHOTO
                        ================================================= */}

                        <div
                            className="detail-gallery-main"
                            onClick={() =>
                                setGalerieOuverte(true)
                            }
                        >

                            <img
                                src={urlImageActuelle}
                                alt={offre.titre}
                                onError={(event) => {

                                    event.currentTarget.src =
                                        "/image-default.jpg";

                                }}
                            />


                            {photos.length > 1 && (

                                <>

                                    <button
                                        className="gallery-arrow gallery-arrow-left"
                                        onClick={(e) => {

                                            e.stopPropagation();

                                            photoPrecedente();

                                        }}
                                        aria-label="Photo précédente"
                                    >

                                        <FaChevronLeft />

                                    </button>


                                    <button
                                        className="gallery-arrow gallery-arrow-right"
                                        onClick={(e) => {

                                            e.stopPropagation();

                                            photoSuivante();

                                        }}
                                        aria-label="Photo suivante"
                                    >

                                        <FaChevronRight />

                                    </button>

                                </>

                            )}


                            <div className="gallery-photo-counter">

                                {photoActuelle + 1}

                                {" / "}

                                {photos.length || 1}

                            </div>

                        </div>


                        {/* =================================================
                            4 PETITES PHOTOS
                        ================================================= */}

                        {photos.length > 1 && (

                            <div className="detail-gallery-side">

                                {photos.slice(1, 5).map(
                                    (photo, index) => {

                                        const estDerniere =
                                            index === 3 &&
                                            photos.length > 5;

                                        return (

                                            <button
                                                key={photo.id_photo}
                                                className="gallery-side-photo"
                                                onClick={() => {

                                                    if (estDerniere) {

                                                        setGalerieOuverte(true);

                                                    }
                                                    else {

                                                        setPhotoActuelle(
                                                            index + 1
                                                        );

                                                    }

                                                }}
                                            >

                                                <img
                                                    src={obtenirUrlPhoto(
                                                        photo.chemin_photo
                                                    )}
                                                    alt={
                                                        `Photo ${index + 2}`
                                                    }
                                                    onError={(event) => {

                                                        event.currentTarget.src =
                                                            "/image-default.jpg";

                                                    }}
                                                />


                                                {estDerniere && (

                                                    <span className="gallery-more">

                                                        +{photos.length - 5}

                                                    </span>

                                                )}

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        MINIATURES
                    ================================================= */}

                    {photos.length > 1 && (

                        <div className="detail-thumbnails">

                            {photos.map(
                                (photo, index) => (

                                    <button
                                        key={photo.id_photo}
                                        className={
                                            photoActuelle === index
                                                ? "detail-thumbnail active"
                                                : "detail-thumbnail"
                                        }
                                        onClick={() =>
                                            setPhotoActuelle(index)
                                        }
                                        aria-label={
                                            `Afficher la photo ${index + 1}`
                                        }
                                    >

                                        <img
                                            src={obtenirUrlPhoto(
                                                photo.chemin_photo
                                            )}
                                            alt={
                                                `Aperçu ${index + 1}`
                                            }
                                            onError={(event) => {

                                                event.currentTarget.src =
                                                    "/image-default.jpg";

                                            }}
                                        />

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    CONTENU PRINCIPAL
                ================================================= */}

                <section className="detail-content-layout">


                    {/* =================================================
                        COLONNE GAUCHE
                    ================================================= */}

                    <div className="detail-content-left">


                        {/* PRESENTATION */}

                        <section className="detail-card">

                            <div className="detail-section-title">

                                <h2>
                                    Présentation
                                </h2>

                                <span></span>

                            </div>


                            <p className="detail-description">

                                {offre.description ||
                                    "Découvrez cette offre touristique et profitez d'une expérience exceptionnelle au cœur de Madagascar."}

                            </p>

                        </section>


                        {/* INFORMATIONS */}

                        <section className="detail-card">

                            <div className="detail-section-title">

                                <h2>
                                    Informations de l'offre
                                </h2>

                                <span></span>

                            </div>


                            <div className="detail-information-grid">


                                <div className="detail-information-item">

                                    <div className="information-icon">

                                        <FaMapMarkerAlt />

                                    </div>

                                    <div>

                                        <small>
                                            Destination
                                        </small>

                                        <strong>

                                            {offre.destination ||
                                                "Non précisée"}

                                        </strong>

                                    </div>

                                </div>


                                <div className="detail-information-item">

                                    <div className="information-icon">

                                        <FaTag />

                                    </div>

                                    <div>

                                        <small>
                                            Catégorie
                                        </small>

                                        <strong>

                                            {offre.categorie ||
                                                "Non précisée"}

                                        </strong>

                                    </div>

                                </div>


                                <div className="detail-information-item">

                                    <div className="information-icon">

                                        <FaUsers />

                                    </div>

                                    <div>

                                        <small>
                                            Capacité
                                        </small>

                                        <strong>

                                            {offre.capacite
                                                ? `${offre.capacite} personnes`
                                                : "Non précisée"}

                                        </strong>

                                    </div>

                                </div>


                                <div className="detail-information-item">

                                    <div className="information-icon">

                                        <FaClock />

                                    </div>

                                    <div>

                                        <small>
                                            Disponibilité
                                        </small>

                                        <strong>
                                            Offre disponible
                                        </strong>

                                    </div>

                                </div>


                                <div className="detail-information-item">

                                    <div className="information-icon">

                                        <FaCalendarAlt />

                                    </div>

                                    <div>

                                        <small>
                                            Date de début
                                        </small>

                                        <strong>

                                            {offre.date_debut
                                                ? new Date(
                                                    offre.date_debut
                                                ).toLocaleDateString(
                                                    "fr-FR"
                                                )
                                                : "Non précisée"}

                                        </strong>

                                    </div>

                                </div>


                                <div className="detail-information-item">

                                    <div className="information-icon">

                                        <FaCalendarAlt />

                                    </div>

                                    <div>

                                        <small>
                                            Date de fin
                                        </small>

                                        <strong>

                                            {offre.date_fin
                                                ? new Date(
                                                    offre.date_fin
                                                ).toLocaleDateString(
                                                    "fr-FR"
                                                )
                                                : "Non précisée"}

                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* DATES */}

                        <section className="detail-card">

                            <div className="detail-section-title">

                                <h2>
                                    Dates du séjour
                                </h2>

                                <span></span>

                            </div>


                            <div className="detail-dates-wrapper">


                                <div className="detail-date-box">

                                    <FaCalendarAlt />

                                    <div>

                                        <small>
                                            Début
                                        </small>

                                        <strong>

                                            {offre.date_debut
                                                ? new Date(
                                                    offre.date_debut
                                                ).toLocaleDateString(
                                                    "fr-FR",
                                                    {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric"
                                                    }
                                                )
                                                : "-"}

                                        </strong>

                                    </div>

                                </div>


                                <div className="detail-date-line"></div>


                                <div className="detail-date-box">

                                    <FaCalendarAlt />

                                    <div>

                                        <small>
                                            Fin
                                        </small>

                                        <strong>

                                            {offre.date_fin
                                                ? new Date(
                                                    offre.date_fin
                                                ).toLocaleDateString(
                                                    "fr-FR",
                                                    {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric"
                                                    }
                                                )
                                                : "-"}

                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </section>

                    </div>


                    {/* =================================================
                        RESERVATION
                    ================================================= */}

                    <aside className="detail-booking-column">

                        <div className="detail-booking-card">


                            <div className="booking-card-top">

                                <span>
                                    À partir de
                                </span>

                                <div className="booking-price">

                                    <div className="booking-price">

                                        {Number(
                                            offre.prix || 0
                                        ).toLocaleString(
                                            "fr-FR",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }
                                        )}

                                        <small> €</small>

                                    </div>

                                    <small>
                                        {" "}€
                                    </small>

                                </div>

                            </div>


                            <div className="booking-divider"></div>


                            <div className="booking-info">


                                <div>

                                    <FaUsers />

                                    <span>
                                        Capacité
                                    </span>

                                    <strong>
                                        {offre.capacite || 0}
                                    </strong>

                                </div>


                                <div>

                                    <FaCalendarAlt />

                                    <span>
                                        Disponibilité
                                    </span>

                                    <strong>
                                        Disponible
                                    </strong>

                                </div>


                            </div>


                            <button
                                className="detail-reservation-button"
                                onClick={() =>
                                    navigate(
                                        `/reservation-public/${offre.id_offre}`
                                    )
                                }
                            >

                                Réserver maintenant

                                <FaChevronRight />

                            </button>


                            <p className="booking-secure">

                                <FaCheckCircle />

                                Réservation simple et sécurisée

                            </p>

                        </div>


                        {/* AIDE */}

                        <div className="detail-help-card">

                            <div className="help-icon">

                                <FaHotel />

                            </div>

                            <div>

                                <strong>
                                    Une question ?
                                </strong>

                                <p>
                                    Consultez les informations
                                    de cette offre avant
                                    votre réservation.
                                </p>

                            </div>

                        </div>

                    </aside>

                </section>


                {/* =================================================
                    MODALE GALERIE
                ================================================= */}

                {galerieOuverte && (

                    <div
                        className="gallery-modal"
                        onClick={() =>
                            setGalerieOuverte(false)
                        }
                    >


                        <button
                            className="gallery-modal-close"
                            onClick={() =>
                                setGalerieOuverte(false)
                            }
                        >

                            ×

                        </button>


                        <button
                            className="gallery-modal-prev"
                            onClick={(e) => {

                                e.stopPropagation();

                                photoPrecedente();

                            }}
                        >

                            <FaChevronLeft />

                        </button>


                        <img
                            className="gallery-modal-image"
                            src={urlImageActuelle}
                            alt={offre.titre}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                            onError={(event) => {

                                event.currentTarget.src =
                                    "/image-default.jpg";

                            }}
                        />


                        <button
                            className="gallery-modal-next"
                            onClick={(e) => {

                                e.stopPropagation();

                                photoSuivante();

                            }}
                        >

                            <FaChevronRight />

                        </button>


                        <div className="gallery-modal-counter">

                            {photoActuelle + 1}

                            {" / "}

                            {photos.length}

                        </div>

                    </div>

                )}

            </div>

        </main>

    );

}

export default DetailOffre;