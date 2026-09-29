import { useEffect, useState } from "react";
import api from "../api/api";
import "./EspacePrestataire.css";

import {
    FaBuilding,
    FaHotel,
    FaCalendarCheck,
    FaClock,
    FaMoneyBillWave
} from "react-icons/fa";

function EspacePrestataire() {
    const [utilisateur, setUtilisateur] = useState(null);
    const [prestataire, setPrestataire] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    const [statistiques, setStatistiques] = useState({
        offres: 0,
        reservations: 0,
        reservationsEnAttente: 0,
        revenus: 0
    });

    // =====================================================
    // RÉCUPÉRER L'UTILISATEUR CONNECTÉ
    // =====================================================

    useEffect(() => {
        const utilisateurStocke =
            localStorage.getItem("utilisateur");

        if (!utilisateurStocke) {
            console.error(
                "Aucun utilisateur connecté"
            );

            setErreur(
                "Aucun utilisateur connecté."
            );

            setChargement(false);
            return;
        }

        try {
            const utilisateurData =
                JSON.parse(utilisateurStocke);

            console.log(
                "UTILISATEUR CONNECTÉ :",
                utilisateurData
            );

            setUtilisateur(utilisateurData);

            const idUtilisateur =
                utilisateurData.id ||
                utilisateurData.id_utilisateur;

            if (!idUtilisateur) {
                console.error(
                    "ID utilisateur introuvable"
                );

                setErreur(
                    "ID utilisateur introuvable."
                );

                setChargement(false);
                return;
            }

            console.log(
                "ID UTILISATEUR :",
                idUtilisateur
            );

            chargerPrestataire(idUtilisateur);

        } catch (error) {
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

    // =====================================================
    // CHARGER LE PRESTATAIRE ET SES STATISTIQUES
    // =====================================================

    const chargerPrestataire = async (
        idUtilisateur
    ) => {
        try {
            setErreur("");

            // ---------------------------------------------
            // Récupération du prestataire
            // ---------------------------------------------

            const res = await api.get(
                `/prestataires/utilisateur/${idUtilisateur}`
            );

            console.log(
                "PRESTATAIRE CONNECTÉ :",
                res.data
            );

            setPrestataire(res.data);

            const idPrestataire =
                res.data.id_prestataire;

            if (!idPrestataire) {
                throw new Error(
                    "ID prestataire introuvable"
                );
            }

            console.log(
                "ID PRESTATAIRE :",
                idPrestataire
            );

            // ---------------------------------------------
            // Récupération des statistiques
            // ---------------------------------------------

            const statistiquesRes =
                await api.get(
                    `/prestataires/${idPrestataire}/statistiques`
                );

            console.log(
                "STATISTIQUES PRESTATAIRE :",
                statistiquesRes.data
            );

            setStatistiques({
                offres: Number(
                    statistiquesRes.data.offres || 0
                ),

                reservations: Number(
                    statistiquesRes.data.reservations || 0
                ),

                reservationsEnAttente: Number(
                    statistiquesRes.data
                        .reservationsEnAttente || 0
                ),

                revenus: Number(
                    statistiquesRes.data.revenus || 0
                )
            });

        } catch (error) {
            console.error(
                "Erreur récupération prestataire/statistiques :",
                error
            );

            console.error(
                "Réponse serveur :",
                error.response?.data
            );

            console.error(
                "Code HTTP :",
                error.response?.status
            );

            setErreur(
                error.response?.data?.message ||
                "Impossible de récupérer les informations du prestataire."
            );

        } finally {
            setChargement(false);
        }
    };

    // =====================================================
    // CHARGEMENT
    // =====================================================

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

    // =====================================================
    // ERREUR
    // =====================================================

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

                </div>

            </div>
        );
    }

    // =====================================================
    // INTERFACE PRINCIPALE
    // =====================================================

    return (
        <div className="prestataire-page">

            {/* =================================================
                EN-TÊTE
            ================================================= */}

            <div className="prestataire-header">

                <div>

                    <h1>
                        Bonjour{" "}

                        <span>
                            {prestataire?.nom_entreprise ||
                                `${utilisateur?.prenom || ""} ${
                                    utilisateur?.nom || ""
                                }`}
                        </span>
                    </h1>

                    <p>
                        Bienvenue dans votre espace prestataire.
                    </p>

                </div>

                <div className="prestataire-status">

                    <span
                        className={
                            prestataire?.statut === "Validé"
                                ? "status-valid"
                                : prestataire?.statut === "Refusé"
                                ? "status-refused"
                                : "status-pending"
                        }
                    >
                        {prestataire?.statut ||
                            "En attente"}
                    </span>

                </div>

            </div>

            {/* =================================================
                MESSAGE D'ERREUR
            ================================================= */}

            {erreur && (
                <div className="prestataire-warning">
                    {erreur}
                </div>
            )}

            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="prestataire-statistiques">

                {/* MES OFFRES */}

                <div className="stat-card">

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

                    </div>

                </div>

                {/* RÉSERVATIONS */}

                <div className="stat-card">

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

                    </div>

                </div>

                {/* EN ATTENTE */}

                <div className="stat-card">

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

                    </div>

                </div>

                {/* REVENUS */}

                <div className="stat-card">

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
                            )}{" "}
                            €
                        </strong>

                    </div>

                </div>

            </div>

            {/* =================================================
                INFORMATIONS DE L'ENTREPRISE
            ================================================= */}

            <div className="prestataire-section">

                <div className="section-title">

                    <FaBuilding />

                    <h2>
                        Informations de mon entreprise
                    </h2>

                </div>

                <div className="prestataire-info-grid">

                    {/* NOM ENTREPRISE */}

                    <div className="info-item">

                        <span className="info-label">
                            Nom de l'entreprise
                        </span>

                        <strong>
                            {prestataire?.nom_entreprise ||
                                "Non renseigné"}
                        </strong>

                    </div>

                    {/* VILLE */}

                    <div className="info-item">

                        <span className="info-label">
                            Ville
                        </span>

                        <strong>
                            {prestataire?.ville ||
                                "Non renseignée"}
                        </strong>

                    </div>

                    {/* TÉLÉPHONE */}

                    <div className="info-item">

                        <span className="info-label">
                            Téléphone
                        </span>

                        <strong>
                            {prestataire?.telephone ||
                                "Non renseigné"}
                        </strong>

                    </div>

                    {/* EMAIL */}

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

                    {/* ADRESSE */}

                    <div className="info-item info-full">

                        <span className="info-label">
                            Adresse
                        </span>

                        <strong>
                            {prestataire?.adresse ||
                                "Non renseignée"}
                        </strong>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="info-item info-full">

                        <span className="info-label">
                            Description
                        </span>

                        <p>
                            {prestataire?.description ||
                                "Aucune description renseignée."}
                        </p>

                    </div>

                    {/* STATUT */}

                    <div className="info-item">

                        <span className="info-label">
                            Statut
                        </span>

                        <strong>
                            {prestataire?.statut ||
                                "En attente"}
                        </strong>

                    </div>

                </div>

            </div>

            {/* =================================================
                INFORMATIONS DU COMPTE
            ================================================= */}

            <div className="prestataire-section">

                <div className="section-title">

                    <FaBuilding />

                    <h2>
                        Informations du compte
                    </h2>

                </div>

                <div className="prestataire-info-grid">

                    {/* PRÉNOM */}

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

                    {/* NOM */}

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

                    {/* EMAIL COMPTE */}

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

                    {/* RÔLE */}

                    <div className="info-item">

                        <span className="info-label">
                            Rôle
                        </span>

                        <strong>
                            {utilisateur?.role ||
                                prestataire?.role ||
                                "Prestataire"}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default EspacePrestataire;