import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import "./EspacePrestataire.css";

import {
    FaBuilding,
    FaHotel,
    FaCalendarCheck,
    FaClock,
    FaMoneyBillWave,
    FaPlus,
    FaArrowRight,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaCheckCircle,
    FaEdit,
    FaList,
    FaClipboardList
} from "react-icons/fa";

const EspacePrestataire = () => {
    const [utilisateur, setUtilisateur] = useState(null);
    const [prestataire, setPrestataire] = useState(null);
    const [statistiques, setStatistiques] = useState({
        offres: 0,
        reservations: 0,
        reservationsEnAttente: 0,
        revenus: 0
    });
    const [offres, setOffres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const utilisateurData = localStorage.getItem("utilisateur");

        if (!utilisateurData) {
            setError("Utilisateur non connecté.");
            setLoading(false);
            return;
        }

        try {
            const user = JSON.parse(utilisateurData);
            setUtilisateur(user);

            const idUtilisateur =
                user.id || user.id_utilisateur;

            if (!idUtilisateur) {
                setError("Identifiant utilisateur introuvable.");
                setLoading(false);
                return;
            }

            chargerDonnees(idUtilisateur);
        } catch (err) {
            console.error("Erreur lecture utilisateur :", err);
            setError("Impossible de récupérer les informations utilisateur.");
            setLoading(false);
        }
    }, []);

    const chargerDonnees = async (idUtilisateur) => {
        try {
            setLoading(true);
            setError("");

            // =====================================================
            // 1. RÉCUPÉRER LE PRESTATAIRE
            // =====================================================

            const prestataireResponse = await api.get(
                `/prestataires/utilisateur/${idUtilisateur}`
            );

            const prestataireData = prestataireResponse.data;

            if (!prestataireData) {
                setError("Informations du prestataire introuvables.");
                setLoading(false);
                return;
            }

            setPrestataire(prestataireData);

            const idPrestataire =
                prestataireData.id_prestataire;

            if (!idPrestataire) {
                setError("Identifiant prestataire introuvable.");
                setLoading(false);
                return;
            }

            // =====================================================
            // 2. RÉCUPÉRER LES STATISTIQUES
            // =====================================================

            try {
                const statistiquesResponse = await api.get(
                    `/prestataires/${idPrestataire}/statistiques`
                );

                setStatistiques({
                    offres: Number(
                        statistiquesResponse.data?.offres || 0
                    ),
                    reservations: Number(
                        statistiquesResponse.data?.reservations || 0
                    ),
                    reservationsEnAttente: Number(
                        statistiquesResponse.data?.reservationsEnAttente || 0
                    ),
                    revenus: Number(
                        statistiquesResponse.data?.revenus || 0
                    )
                });
            } catch (statError) {
                console.error(
                    "Erreur récupération statistiques :",
                    statError
                );
            }

            // =====================================================
            // 3. RÉCUPÉRER LES OFFRES DU PRESTATAIRE
            // =====================================================

            try {
                const offresResponse = await api.get(
                    `/offres/prestataire/${idPrestataire}`
                );

                const offresData = Array.isArray(
                    offresResponse.data
                )
                    ? offresResponse.data
                    : [];

                setOffres(offresData);
            } catch (offreError) {
                console.error(
                    "Erreur récupération offres :",
                    offreError
                );

                setOffres([]);
            }

            setLoading(false);
        } catch (err) {
            console.error(
                "Erreur chargement espace prestataire :",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Impossible de charger les informations du prestataire."
            );

            setLoading(false);
        }
    };

    // =====================================================
    // FORMATAGE DU PRIX
    // =====================================================

    const formatPrix = (prix) => {
        const montant = Number(prix || 0);

        return new Intl.NumberFormat("fr-FR").format(montant) + " Ar";
    };

    // =====================================================
    // FORMATAGE DES DATES
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "Non définie";

        const dateObj = new Date(date);

        if (Number.isNaN(dateObj.getTime())) {
            return "Date invalide";
        }

        return dateObj.toLocaleDateString("fr-FR");
    };

    // =====================================================
    // STATUT OFFRE
    // =====================================================

    const getStatutOffre = (offre) => {
        const aujourdHui = new Date();

        if (offre.date_fin) {
            const dateFin = new Date(offre.date_fin);

            if (dateFin < aujourdHui) {
                return {
                    texte: "Expirée",
                    classe: "expired"
                };
            }
        }

        if (
            offre.disponibilite === 0 ||
            offre.disponibilite === "0"
        ) {
            return {
                texte: "Indisponible",
                classe: "unavailable"
            };
        }

        return {
            texte: "Disponible",
            classe: "available"
        };
    };

    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (loading) {
        return (
            <div className="prestataire-loading">
                <div className="loading-spinner"></div>

                <p>
                    Chargement de votre espace prestataire...
                </p>
            </div>
        );
    }

    // =====================================================
    // ERREUR
    // =====================================================

    if (error && !prestataire) {
        return (
            <div className="prestataire-error">
                <div className="error-icon">
                    !
                </div>

                <h2>Une erreur est survenue</h2>

                <p>{error}</p>

                <Link
                    to="/login-client"
                    className="btn-primary"
                >
                    Se connecter
                </Link>
            </div>
        );
    }

    return (
        <div className="espace-prestataire">

            {/* =====================================================
                EN-TÊTE
            ===================================================== */}

            <section className="prestataire-header">

                <div className="header-left">

                    <div className="company-icon">
                        <FaBuilding />
                    </div>

                    <div className="header-info">

                        <div className="header-title">

                            <h1>
                                Bienvenue,{" "}
                                {utilisateur?.prenom ||
                                    utilisateur?.nom ||
                                    "Prestataire"}
                            </h1>

                            {prestataire?.statut === "Validé" && (
                                <span className="verified-badge">
                                    <FaCheckCircle />
                                    Prestataire vérifié
                                </span>
                            )}

                        </div>

                        <p className="company-name">
                            {prestataire?.nom_entreprise?.trim() ||
                                "Mon établissement"}
                        </p>

                        <div className="company-location">

                            {prestataire?.ville && (
                                <span>
                                    <FaMapMarkerAlt />
                                    {prestataire.ville}
                                </span>
                            )}

                            {prestataire?.telephone && (
                                <span>
                                    <FaPhone />
                                    {prestataire.telephone}
                                </span>
                            )}

                        </div>

                    </div>

                </div>

                <div className="header-actions">

                    <Link
                        to="/prestataire/profil"
                        className="btn-outline"
                    >
                        <FaEdit />
                        Modifier mon établissement
                    </Link>

                </div>

            </section>

            {/* =====================================================
                MESSAGE D'ERREUR PARTIELLE
            ===================================================== */}

            {error && (
                <div className="alert alert-warning">
                    {error}
                </div>
            )}

            {/* =====================================================
                STATISTIQUES
            ===================================================== */}

            <section className="statistics-section">

                <div className="section-heading">

                    <div>
                        <h2>Vue d'ensemble</h2>

                        <p>
                            Suivez l'activité de votre établissement.
                        </p>
                    </div>

                </div>

                <div className="statistics-grid">

                    {/* =================================================
                        MES OFFRES
                    ================================================= */}

                    <Link
                        to="/prestataire/offres"
                        className="stat-card stat-offres stat-card-link"
                    >

                        <div className="stat-icon">
                            <FaHotel />
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Mes offres
                            </span>

                            <strong className="stat-value">
                                {statistiques.offres}
                            </strong>

                            <span className="stat-description">
                                Offre(s) publiée(s)
                            </span>

                        </div>

                        <FaArrowRight className="stat-arrow" />

                    </Link>

                    {/* =================================================
                        RÉSERVATIONS
                    ================================================= */}

                    <Link
                        to="/prestataire/reservations"
                        className="stat-card stat-reservations stat-card-link"
                    >

                        <div className="stat-icon">
                            <FaCalendarCheck />
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Réservations
                            </span>

                            <strong className="stat-value">
                                {statistiques.reservations}
                            </strong>

                            <span className="stat-description">
                                Réservation(s) reçue(s)
                            </span>

                        </div>

                        <FaArrowRight className="stat-arrow" />

                    </Link>

                    {/* =================================================
                        EN ATTENTE
                    ================================================= */}

                    <Link
                        to="/prestataire/reservations"
                        className="stat-card stat-attente stat-card-link"
                    >

                        <div className="stat-icon">
                            <FaClock />
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                En attente
                            </span>

                            <strong className="stat-value">
                                {statistiques.reservationsEnAttente}
                            </strong>

                            <span className="stat-description">
                                À traiter
                            </span>

                        </div>

                        <FaArrowRight className="stat-arrow" />

                    </Link>

                    {/* =================================================
                        REVENUS
                    ================================================= */}

                    <div className="stat-card stat-revenus">

                        <div className="stat-icon">
                            <FaMoneyBillWave />
                        </div>

                        <div className="stat-content">

                            <span className="stat-label">
                                Revenus
                            </span>

                            <strong className="stat-value">
                                {formatPrix(statistiques.revenus)}
                            </strong>

                            <span className="stat-description">
                                Paiements reçus
                            </span>

                        </div>

                    </div>

                </div>

            </section>

            {/* =====================================================
                ACTIONS RAPIDES
            ===================================================== */}

            <section className="quick-actions-section">

                <div className="section-heading">

                    <div>
                        <h2>Actions rapides</h2>

                        <p>
                            Gérez facilement votre activité.
                        </p>
                    </div>

                </div>

                <div className="quick-actions-grid">

                    {/* MES OFFRES */}

                    <Link
                        to="/prestataire/offres"
                        className="action-card"
                    >

                        <div className="action-icon">
                            <FaList />
                        </div>

                        <div className="action-content">

                            <h3>
                                Mes offres
                            </h3>

                            <p>
                                Consulter et gérer vos offres
                                touristiques.
                            </p>

                        </div>

                        <FaArrowRight className="action-arrow" />

                    </Link>

                    {/* AJOUTER UNE OFFRE */}

                    <Link
                        to="/prestataire/offres"
                        className="action-card action-primary"
                    >

                        <div className="action-icon">
                            <FaPlus />
                        </div>

                        <div className="action-content">

                            <h3>
                                Ajouter une offre
                            </h3>

                            <p>
                                Publier une nouvelle offre
                                touristique.
                            </p>

                        </div>

                        <FaArrowRight className="action-arrow" />

                    </Link>

                    {/* RÉSERVATIONS */}

                    <Link
                        to="/prestataire/reservations"
                        className="action-card"
                    >

                        <div className="action-icon">
                            <FaClipboardList />
                        </div>

                        <div className="action-content">

                            <h3>
                                Mes réservations
                            </h3>

                            <p>
                                Consulter les réservations
                                de vos offres.
                            </p>

                        </div>

                        <FaArrowRight className="action-arrow" />

                    </Link>

                    {/* PROFIL */}

                    <Link
                        to="/prestataire/profil"
                        className="action-card"
                    >

                        <div className="action-icon">
                            <FaBuilding />
                        </div>

                        <div className="action-content">

                            <h3>
                                Mon établissement
                            </h3>

                            <p>
                                Gérer les informations de votre
                                établissement.
                            </p>

                        </div>

                        <FaArrowRight className="action-arrow" />

                    </Link>

                </div>

            </section>

            {/* =====================================================
                APERÇU DES OFFRES
            ===================================================== */}

            <section className="offers-preview-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Mes offres
                        </h2>

                        <p>
                            Aperçu de vos dernières offres
                            touristiques.
                        </p>

                    </div>

                    <Link
                        to="/prestataire/offres"
                        className="section-link"
                    >
                        Voir toutes
                        <FaArrowRight />
                    </Link>

                </div>

                {offres.length > 0 ? (

                    <div className="offers-preview-grid">

                        {offres.slice(0, 3).map((offre) => {

                            const statut = getStatutOffre(offre);

                            return (
                                <article
                                    className="offer-preview-card"
                                    key={offre.id_offre}
                                >

                                    {/* IMAGE */}

                                    <div className="offer-image-container">

                                        {offre.image ? (

                                            <img
                                                src={offre.image}
                                                alt={
                                                    offre.titre ||
                                                    "Offre touristique"
                                                }
                                                className="offer-image"
                                            />

                                        ) : (

                                            <div className="offer-image-placeholder">
                                                <FaHotel />
                                            </div>

                                        )}

                                        <span
                                            className={`offer-status ${statut.classe}`}
                                        >
                                            {statut.texte}
                                        </span>

                                    </div>

                                    {/* CONTENU */}

                                    <div className="offer-preview-content">

                                        <h3>
                                            {offre.titre ||
                                                "Offre sans titre"}
                                        </h3>

                                        <div className="offer-location">

                                            <FaMapMarkerAlt />

                                            <span>
                                                {offre.destination ||
                                                    offre.ville ||
                                                    "Destination non définie"}
                                            </span>

                                        </div>

                                        {offre.description && (

                                            <p className="offer-description">
                                                {offre.description.length > 100
                                                    ? `${offre.description.substring(
                                                          0,
                                                          100
                                                      )}...`
                                                    : offre.description}
                                            </p>

                                        )}

                                        <div className="offer-details">

                                            <div className="offer-price">

                                                <strong>
                                                    {formatPrix(
                                                        offre.prix
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="offer-capacity">

                                                <FaUser />

                                                <span>
                                                    {offre.capacite ||
                                                        0}{" "}
                                                    place(s)
                                                </span>

                                            </div>

                                        </div>

                                        <div className="offer-dates">

                                            <span>
                                                Du{" "}
                                                {formatDate(
                                                    offre.date_debut
                                                )}
                                            </span>

                                            <span>
                                                au{" "}
                                                {formatDate(
                                                    offre.date_fin
                                                )}
                                            </span>

                                        </div>

                                        <Link
                                            to={`/detail-offre/${offre.id_offre}`}
                                            className="offer-view-button"
                                        >
                                            Voir l'offre
                                            <FaArrowRight />
                                        </Link>

                                    </div>

                                </article>
                            );
                        })}

                    </div>

                ) : (

                    <div className="empty-offers">

                        <div className="empty-icon">
                            <FaHotel />
                        </div>

                        <h3>
                            Aucune offre pour le moment
                        </h3>

                        <p>
                            Vous n'avez pas encore publié
                            d'offre touristique.
                        </p>

                        <Link
                            to="/prestataire/offres"
                            className="btn-primary"
                        >
                            <FaPlus />
                            Ajouter une offre
                        </Link>

                    </div>

                )}

            </section>

            {/* =====================================================
                INFORMATIONS ÉTABLISSEMENT
            ===================================================== */}

            <section className="information-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Informations de mon établissement
                        </h2>

                        <p>
                            Informations enregistrées sur la
                            plateforme.
                        </p>

                    </div>

                    <Link
                        to="/prestataire/profil"
                        className="section-link"
                    >
                        Modifier
                        <FaEdit />
                    </Link>

                </div>

                <div className="information-card">

                    <div className="information-header">

                        <div className="information-company-icon">
                            <FaBuilding />
                        </div>

                        <div>

                            <h3>
                                {prestataire?.nom_entreprise?.trim() ||
                                    "Nom de l'établissement"}
                            </h3>

                            {prestataire?.statut === "Validé" && (
                                <span className="validated-text">
                                    <FaCheckCircle />
                                    Établissement validé
                                </span>
                            )}

                        </div>

                    </div>

                    <div className="information-grid">

                        <div className="information-item">

                            <span className="information-label">
                                <FaMapMarkerAlt />
                                Adresse
                            </span>

                            <strong>
                                {prestataire?.adresse ||
                                    "Non renseignée"}
                            </strong>

                        </div>

                        <div className="information-item">

                            <span className="information-label">
                                <FaMapMarkerAlt />
                                Ville
                            </span>

                            <strong>
                                {prestataire?.ville ||
                                    "Non renseignée"}
                            </strong>

                        </div>

                        <div className="information-item">

                            <span className="information-label">
                                <FaPhone />
                                Téléphone
                            </span>

                            <strong>
                                {prestataire?.telephone ||
                                    "Non renseigné"}
                            </strong>

                        </div>

                        <div className="information-item">

                            <span className="information-label">
                                <FaEnvelope />
                                Email
                            </span>

                            <strong>
                                {prestataire?.email ||
                                    prestataire?.email_utilisateur ||
                                    "Non renseigné"}
                            </strong>

                        </div>

                    </div>

                    {prestataire?.description && (

                        <div className="company-description">

                            <span className="information-label">
                                Description
                            </span>

                            <p>
                                {prestataire.description}
                            </p>

                        </div>

                    )}

                </div>

            </section>

            {/* =====================================================
                INFORMATIONS COMPTE
            ===================================================== */}

            <section className="account-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Mon compte
                        </h2>

                        <p>
                            Informations relatives à votre
                            compte utilisateur.
                        </p>

                    </div>

                </div>

                <div className="account-card">

                    <div className="account-avatar">

                        {utilisateur?.photo ? (

                            <img
                                src={utilisateur.photo}
                                alt="Photo de profil"
                            />

                        ) : (

                            <FaUser />

                        )}

                    </div>

                    <div className="account-info">

                        <h3>
                            {utilisateur?.prenom || ""}{" "}
                            {utilisateur?.nom || ""}
                        </h3>

                        <p>
                            {utilisateur?.email ||
                                prestataire?.email_utilisateur ||
                                "Email non renseigné"}
                        </p>

                        <span className="account-role">
                            Prestataire
                        </span>

                    </div>

                    <Link
                        to="/prestataire/profil"
                        className="btn-outline"
                    >
                        <FaEdit />
                        Modifier
                    </Link>

                </div>

            </section>

        </div>
    );
};

export default EspacePrestataire;