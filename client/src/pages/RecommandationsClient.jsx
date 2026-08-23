import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
FaRobot,
FaMapMarkerAlt,
FaTag,
FaMoneyBillWave,
FaStar,
FaArrowRight,
FaSyncAlt,
FaLightbulb,
FaExclamationTriangle
} from "react-icons/fa";

import api from "../api/api";

import "./RecommandationsClient.css";

function RecommandationsClient() {

const navigate = useNavigate();


// =====================================================
// ETATS
// =====================================================

const [utilisateur, setUtilisateur] = useState(null);

const [recommandations, setRecommandations] = useState([]);

const [chargement, setChargement] = useState(true);

const [erreur, setErreur] = useState(null);

const [actualisation, setActualisation] = useState(false);


// =====================================================
// RECUPERER UTILISATEUR
// =====================================================

useEffect(() => {

    const data =
        JSON.parse(
            localStorage.getItem("utilisateur")
        );

    const user =
        data?.utilisateur
            ? data.utilisateur
            : data;

    setUtilisateur(user || null);

}, []);


// =====================================================
// CHARGER RECOMMANDATIONS
// =====================================================

useEffect(() => {

    if (!utilisateur?.id_utilisateur) {

        return;

    }


    chargerRecommandations();


}, [utilisateur]);


// =====================================================
// GENERER + RECUPERER
// =====================================================

const chargerRecommandations = async (
    afficherChargement = true
) => {

    if (!utilisateur?.id_utilisateur) {

        return;

    }


    const id =
        utilisateur.id_utilisateur;


    try {

        if (afficherChargement) {

            setChargement(true);

        }

        setErreur(null);


        // =================================================
        // 1. GENERER LES RECOMMANDATIONS
        // =================================================

        console.log(
            "Génération recommandations pour utilisateur :",
            id
        );


        const generation =
            await api.post(
                `/recommandations/generer/${id}`
            );


        console.log(
            "Génération IA :",
            generation.data
        );


        // =================================================
        // 2. RECUPERER LES RECOMMANDATIONS
        // =================================================

        const res =
            await api.get(
                `/recommandations/${id}`
            );


        console.log(
            "Recommandations reçues :",
            res.data
        );


        setRecommandations(
            Array.isArray(res.data)
                ? res.data
                : []
        );


    }
    catch (error) {

        console.error(
            "Erreur recommandations :",
            error
        );


        console.error(
            "Réponse serveur :",
            error.response?.data
        );


        setErreur(
            error.response?.data?.message
            ||
            "Impossible de charger les recommandations."
        );


    }
    finally {

        setChargement(false);

        setActualisation(false);

    }

};


// =====================================================
// ACTUALISER
// =====================================================

const actualiser = async () => {

    setActualisation(true);

    await chargerRecommandations(false);

};


// =====================================================
// VOIR UNE OFFRE
// =====================================================

const voirOffre = (id) => {

    navigate(
        `/detail-offre/${id}`
    );

};


// =====================================================
// FORMAT PRIX EN EURO
// =====================================================

const formaterPrix = (prix) => {

    return Number(
        prix || 0
    ).toLocaleString(
        "fr-FR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

};


// =====================================================
// SCORE
// =====================================================

const obtenirClasseScore = (score) => {

    const valeur =
        Number(score || 0);


    if (valeur >= 80) {

        return "score-excellent";

    }


    if (valeur >= 60) {

        return "score-bon";

    }


    return "score-faible";

};


// =====================================================
// UTILISATEUR NON CONNECTE
// =====================================================

if (!utilisateur) {

    return (

        <div className="recommandations-client-page">

            <div className="recommandations-login-card">

                <div className="login-icon">

                    <FaRobot />

                </div>


                <h2>
                    Recommandations personnalisées
                </h2>


                <p>
                    Connectez-vous pour découvrir
                    les offres sélectionnées spécialement
                    pour vous.
                </p>


                <button
                    onClick={() =>
                        navigate("/login-client")
                    }
                >

                    Se connecter

                    <FaArrowRight />

                </button>

            </div>

        </div>

    );

}


// =====================================================
// CHARGEMENT
// =====================================================

if (chargement) {

    return (

        <div className="recommandations-client-page">

            <div className="recommandations-loading">

                <div className="loading-robot">

                    <FaRobot />

                </div>


                <h2>
                    Analyse de vos préférences...
                </h2>


                <p>
                    Notre système IA recherche les
                    meilleures offres pour vous.
                </p>


                <div className="loading-spinner"></div>

            </div>

        </div>

    );

}


// =====================================================
// ERREUR
// =====================================================

if (erreur) {

    return (

        <div className="recommandations-client-page">

            <div className="recommandations-error">

                <div className="error-icon">

                    <FaExclamationTriangle />

                </div>


                <h2>
                    Impossible de charger
                    les recommandations
                </h2>


                <p>
                    {erreur}
                </p>


                <button
                    onClick={() =>
                        chargerRecommandations()
                    }
                >

                    <FaSyncAlt />

                    Réessayer

                </button>

            </div>

        </div>

    );

}


// =====================================================
// AFFICHAGE
// =====================================================

return (

    <div className="recommandations-client-page">


        {/* =================================================
            HERO
        ================================================= */}

        <section className="recommandations-hero">

            <div className="hero-content">

                <div className="hero-badge">

                    <FaRobot />

                    Recommandation IA

                </div>


               <h1>
    Bonjour{" "}
    <span>
        {utilisateur.prenom}
    </span>{" "}
                    👋
</h1>


                <p>

                    Découvrez des offres sélectionnées
                    spécialement pour vous grâce à notre
                    système intelligent de recommandation.

                </p>


                <div className="hero-info">

                    <div>

                        <FaLightbulb />

                        <span>
                            Analyse intelligente
                        </span>

                    </div>


                    <div>

                        <FaStar />

                        <span>
                            Offres personnalisées
                        </span>

                    </div>

                </div>

            </div>


            <div className="hero-robot">

                <div className="robot-circle">

                    <FaRobot />

                </div>

            </div>

        </section>


        {/* =================================================
            TITRE
        ================================================= */}

        <div className="recommendations-heading">

            <div>

                <span className="heading-small">
                    💡 POUR VOUS
                </span>


                <h2>
                    Nos suggestions personnalisées
                </h2>


                <p>
                    Voici les offres qui correspondent
                    le mieux à vos préférences.
                </p>

            </div>


            <button
                className="refresh-button"
                onClick={actualiser}
                disabled={actualisation}
            >

                <FaSyncAlt
                    className={
                        actualisation
                            ? "rotate-icon"
                            : ""
                    }
                />

                Actualiser

            </button>

        </div>


        {/* =================================================
            AUCUNE RECOMMANDATION
        ================================================= */}

        {recommandations.length === 0 ? (

            <div className="no-recommendations">

                <div className="no-icon">

                    <FaRobot />

                </div>


                <h2>
                    Aucune recommandation disponible
                </h2>


                <p>

                    Nous n'avons pas encore suffisamment
                    d'informations sur vos préférences.

                    <br />

                    Consultez quelques offres ou effectuez
                    une réservation afin que notre système
                    puisse mieux vous proposer des activités.

                </p>


                <button
                    onClick={() =>
                        navigate("/offres-public")
                    }
                >

                    Dàcouvrir les offres

                    <FaArrowRight />

                </button>

            </div>

        ) : (

            <>

                {/* =================================================
                    CARTES
                ================================================= */}

                <div className="recommendations-grid">

                    {
                        recommandations.map(
                            (recommandation, index) => {

                                const score =
                                    Number(
                                        recommandation.score || 0
                                    );


                               const image =
                                recommandation.image
                                 ? recommandation.image
                                  : null;


                                return (

                                    <article
                                        className="recommendation-card"
                                        key={
                                            recommandation.id_recommandation
                                            ||
                                            recommandation.id_offre
                                            ||
                                            index
                                        }
                                    >


                                        {/* IMAGE */}

                                        <div className="recommendation-image">

                                            {
                                                image ? (

                                                    <img
                                                        src={image}
                                                        alt={
                                                            recommandation.titre
                                                        }
                                                    />

                                                ) : (

                                                    <div className="image-placeholder">

                                                        <FaRobot />

                                                    </div>

                                                )
                                            }


                                            {/* BADGE IA */}

                                            <div className="ia-card-badge">

                                                <FaRobot />

                                                IA

                                            </div>


                                            {/* SCORE */}

                                            <div
                                                className={
                                                    `score-badge ${obtenirClasseScore(score)}`
                                                }
                                            >

                                                <FaStar />

                                                {score.toFixed(0)}%

                                            </div>

                                        </div>


                                        {/* CONTENU */}

                                        <div className="recommendation-content">


                                            <h3>
                                                {
                                                    recommandation.titre
                                                }
                                            </h3>


                                            <p className="recommendation-description">

                                                {
                                                    recommandation.description
                                                }

                                            </p>


                                            {/* DESTINATION */}

                                            <div className="recommendation-detail">

                                                <FaMapMarkerAlt />

                                                <span>

                                                    {
                                                        recommandation.destination
                                                    }

                                                    {
                                                        recommandation.region
                                                            ?
                                                            `, ${recommandation.region}`
                                                            :
                                                            ""
                                                    }

                                                </span>

                                            </div>


                                            {/* CATEGORIE */}

                                            <div className="recommendation-detail">

                                                <FaTag />

                                                <span>

                                                    {
                                                        recommandation.categorie
                                                    }

                                                </span>

                                            </div>


                                            {/* PRIX */}

                                            <div className="recommendation-price">

                                                <div>

                                                    <span>
                                                        À partir de
                                                    </span>

                                                    <strong>

                                                       {
                                                      formaterPrix(
                                                      recommandation.prix
                                                              )
                                                       }

                                                        {" "}€

                                                    </strong>

                                                </div>

                                            </div>


                                            {/* RAISON */}

                                            <div className="recommendation-reason">

                                                <div className="reason-title">

                                                    <FaRobot />

                                                    Pourquoi cette offre ?

                                                </div>


                                                <p>

                                                    {
                                                        recommandation.raison
                                                    }

                                                </p>

                                            </div>


                                            {/* BOUTON */}

                                            <button
                                                className="view-offer-button"
                                                onClick={() =>
                                                    voirOffre(
                                                        recommandation.id_offre
                                                    )
                                                }
                                            >

                                                Voir l'offre

                                                <FaArrowRight />

                                            </button>


                                        </div>

                                    </article>

                                );

                            }
                        )
                    }

                </div>

            </>

        )}

    </div>

);


}

export default RecommandationsClient;
