import { useEffect, useState } from "react";
import api from "../../api/api";
import "./MonEtablissement.css";

function MonEtablissement() {

    const [etablissement, setEtablissement] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    useEffect(() => {
        chargerEtablissement();
    }, []);

    const chargerEtablissement = async () => {

        try {

            setChargement(true);
            setErreur("");
            setEtablissement(null);

            // Récupérer l'utilisateur connecté
            const utilisateurConnecte =
                localStorage.getItem("utilisateur");

            if (!utilisateurConnecte) {

                setErreur("Utilisateur non connecté.");
                return;

            }

            // Convertir les données JSON
            let utilisateur;

            try {

                utilisateur = JSON.parse(utilisateurConnecte);

            } catch (error) {

                console.error(
                    "Erreur lecture utilisateur :",
                    error
                );

                setErreur(
                    "Les informations de l'utilisateur sont invalides."
                );

                return;
            }

            console.log(
                "UTILISATEUR CONNECTÉ :",
                utilisateur
            );

            // IMPORTANT :
            // Le localStorage contient id_utilisateur
            const idUtilisateur =
                utilisateur.id_utilisateur;

            console.log(
                "ID UTILISATEUR :",
                idUtilisateur
            );

            // Vérifier que l'ID existe
            if (!idUtilisateur) {

                setErreur(
                    "Identifiant utilisateur introuvable."
                );

                return;
            }

            // Vérifier le rôle
            if (utilisateur.role !== "Prestataire") {

                setErreur(
                    "Cet espace est réservé aux prestataires."
                );

                return;
            }

            // Récupérer l'établissement
            const response = await api.get(
                `/prestataires/utilisateur/${idUtilisateur}`
            );

            console.log(
                "ÉTABLISSEMENT RÉCUPÉRÉ :",
                response.data
            );

            setEtablissement(response.data);

        } catch (error) {

            console.error(
                "Erreur récupération établissement :",
                error
            );

            if (error.response) {

                console.error(
                    "Statut erreur :",
                    error.response.status
                );

                console.error(
                    "Réponse serveur :",
                    error.response.data
                );
            }

            setErreur(
                error.response?.data?.message ||
                "Impossible de récupérer les informations de votre établissement."
            );

        } finally {

            setChargement(false);

        }
    };

    return (

        <div className="mon-etablissement">

            {/* =====================================================
                EN-TÊTE
            ===================================================== */}

            <div className="etablissement-header">

                <div>

                    <h1>
                        Mon établissement
                    </h1>

                    <p>
                        Consultez les informations de votre établissement.
                    </p>

                </div>

            </div>


            {/* =====================================================
                CHARGEMENT
            ===================================================== */}

            {chargement && (

                <div className="etablissement-message">

                    Chargement des informations...

                </div>

            )}


            {/* =====================================================
                ERREUR
            ===================================================== */}

            {!chargement && erreur && (

                <div className="etablissement-error">

                    <p>
                        {erreur}
                    </p>

                    <button
                        type="button"
                        onClick={chargerEtablissement}
                    >
                        Réessayer
                    </button>

                </div>

            )}


            {/* =====================================================
                INFORMATIONS DE L'ÉTABLISSEMENT
            ===================================================== */}

            {!chargement &&
             !erreur &&
             etablissement && (

                <div className="etablissement-card">

                    {/* =================================================
                        TITRE
                    ================================================= */}

                    <div className="etablissement-title">

                        <div className="etablissement-icon">
                            🏨
                        </div>

                        <div>

                            <h2>
                                {etablissement.nom_entreprise ||
                                "Mon établissement"}
                            </h2>

                            <span>
                                {etablissement.statut ||
                                "Statut non défini"}
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        INFORMATIONS
                    ================================================= */}

                    <div className="etablissement-grid">

                        {/* Nom entreprise */}

                        <div className="etablissement-field">

                            <label>
                                Nom de l'entreprise
                            </label>

                            <p>
                                {etablissement.nom_entreprise || "-"}
                            </p>

                        </div>


                        {/* Téléphone */}

                        <div className="etablissement-field">

                            <label>
                                Téléphone
                            </label>

                            <p>
                                {etablissement.telephone || "-"}
                            </p>

                        </div>


                        {/* Email */}

                        <div className="etablissement-field">

                            <label>
                                Email
                            </label>

                            <p>
                                {etablissement.email || "-"}
                            </p>

                        </div>


                        {/* Ville */}

                        <div className="etablissement-field">

                            <label>
                                Ville
                            </label>

                            <p>
                                {etablissement.ville || "-"}
                            </p>

                        </div>


                        {/* Adresse */}

                        <div className="etablissement-field full-width">

                            <label>
                                Adresse
                            </label>

                            <p>
                                {etablissement.adresse || "-"}
                            </p>

                        </div>


                        {/* Description */}

                        <div className="etablissement-field full-width">

                            <label>
                                Description
                            </label>

                            <p>
                                {etablissement.description ||
                                "Aucune description disponible."}
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        STATUT
                    ================================================= */}

                    <div className="etablissement-footer">

                        <span>
                            Statut :
                        </span>

                        <strong>
                            {etablissement.statut ||
                            "Non défini"}
                        </strong>

                    </div>

                </div>

            )}


            {/* =====================================================
                AUCUN ÉTABLISSEMENT
            ===================================================== */}

            {!chargement &&
             !erreur &&
             !etablissement && (

                <div className="etablissement-empty">

                    <div className="etablissement-empty-icon">
                        🏨
                    </div>

                    <h2>
                        Aucun établissement trouvé
                    </h2>

                    <p>
                        Les informations de votre établissement
                        ne sont pas encore disponibles.
                    </p>

                </div>

            )}

        </div>

    );
}

export default MonEtablissement;