import { useEffect, useState } from "react";
import api from "../../api/api";
import "./MonEtablissement.css";


function MonEtablissement() {

    const [etablissement, setEtablissement] =
        useState(null);

    const [chargement, setChargement] =
        useState(true);

    const [erreur, setErreur] =
        useState("");


    useEffect(() => {

        chargerEtablissement();

    }, []);


    const chargerEtablissement = async () => {

        try {

            setChargement(true);

            setErreur("");


            const utilisateurConnecte =
                localStorage.getItem("utilisateur");


            if (!utilisateurConnecte) {

                setErreur(
                    "Utilisateur non connecté."
                );

                return;

            }


            const utilisateur =
                JSON.parse(
                    utilisateurConnecte
                );


            const idUtilisateur =
                utilisateur.id;


            const response =
                await api.get(

                    `/prestataires/utilisateur/${idUtilisateur}`

                );


            setEtablissement(
                response.data
            );

        }

        catch (error) {

            console.error(
                "Erreur récupération établissement :",
                error
            );


            setErreur(

                error.response?.data?.message ||

                "Impossible de récupérer les informations de votre établissement."

            );

        }

        finally {

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

                    {erreur}

                    <button
                        type="button"
                        onClick={chargerEtablissement}
                    >
                        Réessayer
                    </button>

                </div>

            )}


            {/* =====================================================
                INFORMATIONS
            ===================================================== */}

            {!chargement &&
             !erreur &&
             etablissement && (

                <div className="etablissement-card">


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


                    <div className="etablissement-grid">


                        <div className="etablissement-field">

                            <label>
                                Nom de l'entreprise
                            </label>

                            <p>
                                {etablissement.nom_entreprise ||
                                "-"}
                            </p>

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Téléphone
                            </label>

                            <p>
                                {etablissement.telephone ||
                                "-"}
                            </p>

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Email
                            </label>

                            <p>
                                {etablissement.email ||
                                "-"}
                            </p>

                        </div>


                        <div className="etablissement-field">

                            <label>
                                Ville
                            </label>

                            <p>
                                {etablissement.ville ||
                                "-"}
                            </p>

                        </div>


                        <div className="etablissement-field full-width">

                            <label>
                                Adresse
                            </label>

                            <p>
                                {etablissement.adresse ||
                                "-"}
                            </p>

                        </div>


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

                    <div>
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