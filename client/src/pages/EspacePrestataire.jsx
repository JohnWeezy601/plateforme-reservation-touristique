import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    FaUser,
    FaCheckCircle,
    FaEdit,
    FaClipboardList,
    FaSignOutAlt
} from "react-icons/fa";

function EspacePrestataire() {

    const navigate = useNavigate();

    const [utilisateur, setUtilisateur] = useState(null);
    const [prestataire, setPrestataire] = useState(null);
    const [offres, setOffres] = useState([]);

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    const [statistiques, setStatistiques] = useState({
        offres: 0,
        reservations: 0,
        reservationsEnAttente: 0,
        revenus: 0
    });

    useEffect(() => {

        const utilisateurStocke =
            localStorage.getItem("utilisateur");

        if (!utilisateurStocke) {

            setErreur("Aucun utilisateur connecté.");
            setChargement(false);

            return;
        }

        try {

            const utilisateurData =
                JSON.parse(utilisateurStocke);

            setUtilisateur(utilisateurData);

            const idUtilisateur =
                utilisateurData.id ||
                utilisateurData.id_utilisateur;

            if (!idUtilisateur) {

                setErreur(
                    "ID utilisateur introuvable."
                );

                setChargement(false);

                return;
            }

            chargerPrestataire(idUtilisateur);

        }
        catch (error) {

            console.error(
                "Erreur lecture utilisateur :",
                error
            );

            setErreur(
                "Impossible de récupérer les informations de l'utilisateur."
            );

            setChargement(false);

        }

    }, []);


    const chargerPrestataire = async (idUtilisateur) => {

        try {

            setErreur("");

            const res = await api.get(
                `/prestataires/utilisateur/${idUtilisateur}`
            );

            setPrestataire(res.data);

            const idPrestataire =
                res.data.id_prestataire;

            if (!idPrestataire) {

                throw new Error(
                    "ID prestataire introuvable"
                );

            }


            /*
             * ================================
             * STATISTIQUES
             * ================================
             */

            const statistiquesRes =
                await api.get(
                    `/prestataires/${idPrestataire}/statistiques`
                );

            setStatistiques({

                offres: Number(
                    statistiquesRes.data.offres || 0
                ),

                reservations: Number(
                    statistiquesRes.data.reservations || 0
                ),

                reservationsEnAttente: Number(
                    statistiquesRes.data.reservationsEnAttente || 0
                ),

                revenus: Number(
                    statistiquesRes.data.revenus || 0
                )

            });


            /*
             * ================================
             * OFFRES
             * ================================
             */

            try {

                const offresRes =
                    await api.get(
                        `/offres/prestataire/${idPrestataire}`
                    );

                if (Array.isArray(offresRes.data)) {

                    setOffres(
                        offresRes.data
                    );

                }
                else if (
                    Array.isArray(
                        offresRes.data?.offres
                    )
                ) {

                    setOffres(
                        offresRes.data.offres
                    );

                }
                else {

                    setOffres([]);

                }

            }
            catch (offresError) {

                console.warn(
                    "Impossible de récupérer les offres :",
                    offresError
                );

                setOffres([]);

            }

        }
        catch (error) {

            console.error(
                "Erreur récupération prestataire :",
                error
            );

            console.error(
                "Réponse serveur :",
                error.response?.data
            );

            setErreur(
                error.response?.data?.message ||
                "Impossible de récupérer les informations du prestataire."
            );

        }
        finally {

            setChargement(false);

        }

    };


    /*
     * ================================
     * DÉCONNEXION
     * ================================
     */

    const handleDeconnexion = () => {

        const confirmation =
            window.confirm(
                "Voulez-vous vraiment vous déconnecter ?"
            );

        if (!confirmation) {
            return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("utilisateur");

        navigate(
            "/login-client",
            {
                replace: true
            }
        );

    };


    /*
     * ================================
     * CHARGEMENT
     * ================================
     */

    if (chargement) {

        return (

            <div className="prestataire-page">

                <div className="prestataire-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Chargement de votre espace...
                    </p>

                </div>

            </div>

        );

    }


    /*
     * ================================
     * ERREUR
     * ================================
     */

    if (erreur && !prestataire) {

        return (

            <div className="prestataire-page">

                <div className="prestataire-error">

                    <FaBuilding />

                    <h2>
                        Impossible de charger votre espace
                    </h2>

                    <p>
                        {erreur}
                    </p>

                    <button
                        className="logout-button error-logout"
                        onClick={handleDeconnexion}
                    >
                        <FaSignOutAlt />
                        Déconnexion
                    </button>

                </div>

            </div>

        );

    }


    /*
     * ================================
     * VARIABLES
     * ================================
     */

    const nomEntreprise =
        prestataire?.nom_entreprise ||
        `${utilisateur?.prenom || ""} ${utilisateur?.nom || ""}`;

    const statut =
        prestataire?.statut || "En attente";

    const statutClasse =
        statut === "Validé"
            ? "status-valid"
            : statut === "Refusé"
            ? "status-refused"
            : "status-pending";


    return (

        <div className="prestataire-page">

            {/* =========================================
                BARRE SUPÉRIEURE
            ========================================= */}

            <header className="prestataire-topbar">

                <Link
                    to="/espace-prestataire"
                    className="prestataire-brand"
                >

                    <div className="brand-icon">
                        <FaBuilding />
                    </div>

                    <div className="brand-text">

                        <strong>
                             Reservation Touristique
                        </strong>

                        <span>
                            Espace prestataire
                        </span>

                    </div>

                </Link>


                <div className="topbar-right">

                    <div className="topbar-user">

                        <div className="topbar-avatar">
                            <FaUser />
                        </div>

                        <div className="topbar-user-info">

                            <strong>
                                {utilisateur?.prenom || ""}{" "}
                                {utilisateur?.nom || ""}
                            </strong>

                            <span>
                                Prestataire
                            </span>

                        </div>

                    </div>


                </div>

            </header>


            {/* =========================================
                EN-TÊTE
            ========================================= */}

            <div className="prestataire-header">

                <div className="header-content">

                    <div className="header-icon">
                        <FaBuilding />
                    </div>

                    <div>

                        <p className="header-small">
                            Tableau de bord
                        </p>

                        <h1>
                            Bonjour{" "}
                            <span>
                                {nomEntreprise}
                            </span>
                        </h1>

                        <p className="header-description">
                            Gérez votre établissement,
                            vos offres et vos réservations
                            depuis votre espace.
                        </p>

                    </div>

                </div>


                <div className="prestataire-status">

                    <FaCheckCircle />

                    <span className={statutClasse}>
                        {statut}
                    </span>

                </div>

            </div>


            {/* =========================================
                AVERTISSEMENT
            ========================================= */}

            {erreur && (

                <div className="prestataire-warning">
                    {erreur}
                </div>

            )}


            {/* =========================================
                STATISTIQUES
            ========================================= */}

            <div className="prestataire-statistiques">

                <Link
                    to="/prestataire/offres"
                    className="stat-card stat-offres"
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

                </Link>


                <Link
                    to="/prestataire/reservations"
                    className="stat-card stat-reservations"
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

                </Link>


                <Link
                    to="/prestataire/reservations"
                    className="stat-card stat-attente"
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

                </Link>


                <div className="stat-card stat-revenus">

                    <div className="stat-icon">
                        <FaMoneyBillWave />
                    </div>

                    <div className="stat-content">

                        <span className="stat-label">
                            Revenus
                        </span>

                        <strong className="stat-value">
                            {statistiques.revenus.toLocaleString(
                                "fr-FR"
                            )} €
                        </strong>

                        <span className="stat-description">
                            Paiements confirmés
                        </span>

                    </div>

                </div>

            </div>


            {/* =========================================
                ACTIONS RAPIDES
            ========================================= */}

            <section className="prestataire-section">

                <div className="section-heading">

                    <div className="section-title">

                        <div className="section-title-icon">
                            <FaClipboardList />
                        </div>

                        <div>

                            <h2>
                                Actions rapides
                            </h2>

                            <p>
                                Accédez rapidement aux principales fonctionnalités.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="actions-grid">

                    <Link
                        to="/prestataire/offres"
                        className="action-card"
                    >

                        <div className="action-icon">
                            <FaHotel />
                        </div>

                        <div className="action-content">

                            <strong>
                                Mes offres
                            </strong>

                            <span>
                                Gérer mes offres touristiques
                            </span>

                        </div>

                        <FaArrowRight className="action-arrow" />

                    </Link>


                    <Link
                        to="/prestataire/offres"
                        className="action-card action-primary"
                    >

                        <div className="action-icon">
                            <FaPlus />
                        </div>

                        <div className="action-content">

                            <strong>
                                Ajouter une offre
                            </strong>

                            <span>
                                Publier une nouvelle offre
                            </span>

                        </div>

                        <FaArrowRight className="action-arrow" />

                    </Link>


                    <Link
                        to="/prestataire/reservations"
                        className="action-card"
                    >

                        <div className="action-icon">
                            <FaCalendarCheck />
                        </div>

                        <div className="action-content">

                            <strong>
                                Mes réservations
                            </strong>

                            <span>
                                Consulter les réservations
                            </span>

                        </div>

                        <FaArrowRight className="action-arrow" />

                    </Link>


                    <Link
                        to="/prestataire/profil"
                        className="action-card"
                    >

                        <div className="action-icon">
                            <FaEdit />
                        </div>

                        <div className="action-content">

                            <strong>
                                Mon établissement
                            </strong>

                            <span>
                                Modifier mes informations
                            </span>

                        </div>

                        <FaArrowRight className="action-arrow" />

                    </Link>

                </div>

            </section>


            {/* =========================================
                MES OFFRES
            ========================================= */}

            <section className="prestataire-section">

                <div className="section-heading">

                    <div className="section-title">

                        <div className="section-title-icon">
                            <FaHotel />
                        </div>

                        <div>

                            <h2>
                                Mes offres
                            </h2>

                            <p>
                                Aperçu de vos offres touristiques.
                            </p>

                        </div>

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

                    <div className="offres-grid">

                        {offres.slice(0, 3).map(
                            (offre) => (

                                <div
                                    className="offre-card"
                                    key={offre.id_offre}
                                >

                                    <div className="offre-image">

                                        {offre.image ? (

                                            <img
                                                src={offre.image}
                                                alt={
                                                    offre.titre ||
                                                    "Offre touristique"
                                                }
                                            />

                                        ) : (

                                            <div className="offre-image-placeholder">
                                                <FaHotel />
                                            </div>

                                        )}

                                        <span className="offre-status">
                                            Disponible
                                        </span>

                                    </div>


                                    <div className="offre-content">

                                        <h3>
                                            {offre.titre ||
                                                "Offre sans titre"}
                                        </h3>

                                        <p className="offre-location">

                                            <FaMapMarkerAlt />

                                            {offre.ville ||
                                                offre.nom_destination ||
                                                offre.destination ||
                                                "Destination touristique"}

                                        </p>


                                        <div className="offre-footer">

                                            <strong>
                                                {Number(
                                                    offre.prix || 0
                                                ).toLocaleString(
                                                    "fr-FR"
                                                )} €
                                            </strong>

                                            <Link
                                                to={`/detail-offre/${offre.id_offre}`}
                                                className="offre-button"
                                            >
                                                Voir
                                                <FaArrowRight />
                                            </Link>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                ) : (

                    <div className="empty-state">

                        <div className="empty-icon">
                            <FaHotel />
                        </div>

                        <h3>
                            Aucune offre
                        </h3>

                        <p>
                            Vous n'avez pas encore publié
                            d'offre touristique.
                        </p>

                        <Link
                            to="/prestataire/offres"
                            className="empty-button"
                        >
                            <FaPlus />
                            Ajouter une offre
                        </Link>

                    </div>

                )}

            </section>


            {/* =========================================
                INFORMATIONS ÉTABLISSEMENT
            ========================================= */}

            <section className="prestataire-section">

                <div className="section-heading">

                    <div className="section-title">

                        <div className="section-title-icon">
                            <FaBuilding />
                        </div>

                        <div>

                            <h2>
                                Informations de mon établissement
                            </h2>

                            <p>
                                Informations publiques de votre établissement.
                            </p>

                        </div>

                    </div>


                    <Link
                        to="/prestataire/profil"
                        className="section-link"
                    >
                        Modifier
                        <FaEdit />
                    </Link>

                </div>


                <div className="prestataire-info-grid">

                    <div className="info-item">

                        <span className="info-label">
                            Nom de l'entreprise
                        </span>

                        <strong>
                            {prestataire?.nom_entreprise ||
                                "Non renseigné"}
                        </strong>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            Ville
                        </span>

                        <strong>
                            {prestataire?.ville ||
                                "Non renseignée"}
                        </strong>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            Téléphone
                        </span>

                        <strong>
                            {prestataire?.telephone ||
                                "Non renseigné"}
                        </strong>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            Email
                        </span>

                        <strong>
                            {prestataire?.email ||
                                prestataire?.email_utilisateur ||
                                "Non renseigné"}
                        </strong>

                    </div>


                    <div className="info-item info-full">

                        <span className="info-label">
                            Adresse
                        </span>

                        <strong>
                            {prestataire?.adresse ||
                                "Non renseignée"}
                        </strong>

                    </div>


                    <div className="info-item info-full">

                        <span className="info-label">
                            Description
                        </span>

                        <p>
                            {prestataire?.description ||
                                "Aucune description renseignée."}
                        </p>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            Statut
                        </span>

                        <div className="info-status">

                            <FaCheckCircle />

                            <strong>
                                {statut}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================
                INFORMATIONS COMPTE
            ========================================= */}

            <section className="prestataire-section">

                <div className="section-heading">

                    <div className="section-title">

                        <div className="section-title-icon">
                            <FaUser />
                        </div>

                        <div>

                            <h2>
                                Informations du compte
                            </h2>

                            <p>
                                Informations de votre compte utilisateur.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="prestataire-info-grid">

                    <div className="info-item">

                        <span className="info-label">
                            Prénom
                        </span>

                        <strong>
                            {utilisateur?.prenom ||
                                prestataire?.prenom ||
                                "Non renseigné"}
                        </strong>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            Nom
                        </span>

                        <strong>
                            {utilisateur?.nom ||
                                prestataire?.nom ||
                                "Non renseigné"}
                        </strong>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            Email du compte
                        </span>

                        <strong>
                            {utilisateur?.email ||
                                prestataire?.email_utilisateur ||
                                "Non renseigné"}
                        </strong>

                    </div>


                    <div className="info-item">

                        <span className="info-label">
                            Rôle
                        </span>

                        <strong className="role-badge">
                            {utilisateur?.role ||
                                prestataire?.role ||
                                "Prestataire"}
                        </strong>

                    </div>

                </div>

            </section>

        </div>

    );

}

export default EspacePrestataire;