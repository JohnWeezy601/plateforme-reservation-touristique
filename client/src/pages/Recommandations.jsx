
import { useEffect, useState } from "react";

import {
    FaRobot,
    FaUsers,
    FaBullseye,
    FaChartLine,
    FaStar,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaArrowUp,
    FaArrowDown,
    FaBrain,
    FaTrophy
} from "react-icons/fa";

import api from "../api/api";

import "./Recommandations.css";


function Recommandations() {

    // =====================================================
    // ETATS
    // =====================================================

    const [statistiques, setStatistiques] = useState({
        nombre_utilisateurs: 0,
        nombre_recommandations: 0,
        score_moyen: 0
    });

    const [meilleureOffre, setMeilleureOffre] = useState(null);

    const [dernieresRecommandations, setDernieresRecommandations] =
        useState([]);

    const [topOffres, setTopOffres] = useState([]);

    const [chargement, setChargement] = useState(true);

    const [erreur, setErreur] = useState(null);


    // =====================================================
    // CHARGER LES DONNEES
    // =====================================================

    useEffect(() => {

        const chargerDonnees = async () => {

            try {

                setChargement(true);
                setErreur(null);

                const res = await api.get(
                    "/recommandations/admin"
                );

                console.log(
                    "Données recommandations IA :",
                    res.data
                );


                setStatistiques(
                    res.data.statistiques || {
                        nombre_utilisateurs: 0,
                        nombre_recommandations: 0,
                        score_moyen: 0
                    }
                );


                setMeilleureOffre(
                    res.data.meilleure_offre || null
                );


                setDernieresRecommandations(
                    res.data.dernieres_recommandations || []
                );

setTopOffres(
    res.data.offres_plus_recommandees ||
    res.data.top_offres ||
    []
);

            }
            catch (error) {

                console.error(
                    "Erreur recommandations admin :",
                    error.response?.data ||
                    error.message
                );

                setErreur(
                    "Impossible de charger les données du système IA."
                );

            }
            finally {

                setChargement(false);

            }

        };


        chargerDonnees();

    }, []);


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formaterDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    };


    // =====================================================
    // SCORE
    // =====================================================

    const getScoreClass = (score) => {

        const valeur = Number(score || 0);

        if (valeur >= 80) {
            return "score-high";
        }

        if (valeur >= 60) {
            return "score-medium";
        }

        return "score-low";

    };


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (chargement) {

        return (

            <div className="recommandations-page">

                <div className="ia-loading">

                    <div className="loading-circle">

                        <FaRobot />

                    </div>

                    <h2>
                        Analyse du système IA...
                    </h2>

                    <p>
                        Chargement des recommandations
                        et des statistiques.
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // ERREUR
    // =====================================================

    if (erreur) {

        return (

            <div className="recommandations-page">

                <div className="ia-error">

                    <FaRobot />

                    <h2>
                        Une erreur est survenue
                    </h2>

                    <p>
                        {erreur}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                    >
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

        <div className="recommandations-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="ia-header">

                <div className="ia-header-left">

                    <div className="ia-main-icon">

                        <FaBrain />

                    </div>


                    <div>

                        <h1>
                            Recommandations IA
                        </h1>

                        <p>
                            Analyse et supervision du système
                            intelligent de recommandation
                        </p>

                    </div>

                </div>


                <div className="ia-status">

                    <span className="status-dot"></span>

                    Système actif

                </div>

            </div>



            {/* =================================================
                KPI
            ================================================= */}

            <div className="ia-stats">


                {/* UTILISATEURS */}

                <div className="ia-stat-card">

                    <div className="stat-top">

                        <div className="stat-icon users">

                            <FaUsers />

                        </div>

                        <span className="stat-trend positive">

                            <FaArrowUp />

                            Actif

                        </span>

                    </div>


                    <span className="stat-label">
                        Utilisateurs analysés
                    </span>

                    <strong className="stat-value">

                        {
                            statistiques
                                .nombre_utilisateurs || 0
                        }

                    </strong>

                    <span className="stat-description">
                        utilisateurs concernés
                    </span>

                </div>



                {/* RECOMMANDATIONS */}

                <div className="ia-stat-card">

                    <div className="stat-top">

                        <div className="stat-icon recommendations">

                            <FaBullseye />

                        </div>

                        <span className="stat-trend positive">

                            <FaArrowUp />

                            IA

                        </span>

                    </div>


                    <span className="stat-label">
                        Recommandations générées
                    </span>

                    <strong className="stat-value">

                        {
                            statistiques
                                .nombre_recommandations || 0
                        }

                    </strong>

                    <span className="stat-description">
                        recommandations enregistrées
                    </span>

                </div>



                {/* SCORE */}

                <div className="ia-stat-card">

                    <div className="stat-top">

                        <div className="stat-icon score">

                            <FaChartLine />

                        </div>

                        <span className="stat-trend positive">

                            <FaArrowUp />

                            Qualité

                        </span>

                    </div>


                    <span className="stat-label">
                        Score moyen
                    </span>

                    <strong className="stat-value">

                        {
                            Number(
                                statistiques.score_moyen || 0
                            ).toFixed(0)
                        }%

                    </strong>

                    <div className="mini-progress">

                        <div
                            style={{
                                width:
                                    `${Math.min(
                                        Number(
                                            statistiques.score_moyen || 0
                                        ),
                                        100
                                    )}%`
                            }}
                        />

                    </div>

                </div>



                {/* MEILLEURE OFFRE */}

                <div className="ia-stat-card best-offer-card">

                    <div className="stat-top">

                        <div className="stat-icon best">

                            <FaTrophy />

                        </div>

                        <span className="stat-trend">

                            <FaStar />

                            Top

                        </span>

                    </div>


                    <span className="stat-label">
                        Offre la plus recommandée
                    </span>


                    <strong className="best-offer-title">

                        {
                            meilleureOffre?.titre ||
                            "Aucune donnée"
                        }

                    </strong>


                    {
                        meilleureOffre &&

                        <span className="stat-description">

                            {
                                meilleureOffre
                                    .nombre_recommandations || 0
                            }

                            {" "}
                            recommandation(s)

                        </span>
                    }

                </div>

            </div>



            {/* =================================================
                CONTENU PRINCIPAL
            ================================================= */}

            <div className="ia-content-grid">


                {/* =================================================
                    TOP OFFRES
                ================================================= */}

                <div className="ia-panel top-offers-panel">

                    <div className="panel-header">

                        <div>

                            <h2>
                                <FaTrophy />
                                Offres les plus recommandées
                            </h2>

                            <p>
                                Les offres qui correspondent
                                le mieux aux utilisateurs
                            </p>

                        </div>

                    </div>


                    {
                        topOffres.length === 0 ? (

                            <div className="empty-panel">

                                <FaRobot />

                                <p>
                                    Aucune donnée disponible.
                                </p>

                            </div>

                        ) : (

                            <div className="top-offers-list">

    {
        topOffres
            .slice(0, 5)
            .map((offre, index) => (

                <div
                    className="top-offer"
                    key={offre.id_offre || index}
                >

                    {/* RANG */}
                    <div className="rank">
                        {index + 1}
                    </div>


                    {/* INFORMATIONS OFFRE */}
                    <div className="offer-main">

                        <strong>
                            {offre.titre || "Offre inconnue"}
                        </strong>

                        <span>

                            <FaMapMarkerAlt />

                            {
                                offre.destination ||
                                "Destination inconnue"
                            }

                        </span>

                    </div>


                    {/* SCORE */}
                    <div className="offer-score">

                        <strong>

                            {
                                Number(
                                    offre.score_moyen || 0
                                ).toFixed(0)
                            }%

                        </strong>

                        <small>

                            {
                                Number(
                                    offre.nombre_recommandations || 0
                                )
                            }

                            {" "}

                            recommandation(s)

                        </small>

                    </div>

                </div>

            ))
    }

</div>
                        )
                    }

                </div>



                {/* =================================================
                    MEILLEURE OFFRE
                ================================================= */}

                <div className="ia-panel featured-panel">

                    <div className="featured-icon">

                        <FaStar />

                    </div>


                    <span className="featured-label">
                        MEILLEURE OFFRE IA
                    </span>


                    <h2>

                        {
                            meilleureOffre?.titre ||
                            "Aucune donnée"
                        }

                    </h2>


                    {
                        meilleureOffre && (

                            <>

                                <p className="featured-destination">

                                    <FaMapMarkerAlt />

                                    {
                                        meilleureOffre.destination ||
                                        "Destination"
                                    }

                                </p>


                                <div className="featured-score">

                                    <span>
                                        Score IA
                                    </span>

                                    <strong>

                                        {
                                            Number(
                                                meilleureOffre.score ||
                                                meilleureOffre.score_moyen ||
                                                0
                                            ).toFixed(0)
                                        }%

                                    </strong>

                                </div>


                                <div className="featured-progress">

                                    <div
                                        style={{
                                            width:
                                                `${Math.min(
                                                    Number(
                                                        meilleureOffre.score ||
                                                        meilleureOffre.score_moyen ||
                                                        0
                                                    ),
                                                    100
                                                )}%`
                                        }}
                                    />

                                </div>


                                <p className="featured-description">

                                    Cette offre obtient les meilleurs
                                    résultats dans le système de
                                    recommandation.

                                </p>

                            </>

                        )
                    }

                </div>

            </div>



            {/* =================================================
                DERNIERES RECOMMANDATIONS
            ================================================= */}

            <div className="ia-panel latest-panel">

                <div className="panel-header">

                    <div>

                        <h2>
                            <FaRobot />
                            Dernières recommandations
                        </h2>

                        <p>
                            Activité récente du moteur
                            de recommandation IA
                        </p>

                    </div>


                    <div className="ia-badge">

                        <span></span>

                        IA ACTIVE

                    </div>

                </div>


                {
                    dernieresRecommandations.length === 0 ? (

                        <div className="empty-panel large">

                            <FaRobot />

                            <h3>
                                Aucune recommandation
                            </h3>

                            <p>
                                Le système n'a pas encore
                                généré de recommandations.
                            </p>

                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table className="ia-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Utilisateur
                                        </th>

                                        <th>
                                            Offre
                                        </th>

                                        <th>
                                            Score IA
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {
                                        dernieresRecommandations
                                            .map((r) => (

                                                <tr
                                                    key={
                                                        r.id_recommandation
                                                    }
                                                >

                                                    {/* UTILISATEUR */}

                                                    <td>

                                                        <div className="user-cell">

                                                            <div className="user-avatar">

                                                                {
                                                                    (
                                                                        r.prenom ||
                                                                        "U"
                                                                    )
                                                                        .charAt(0)
                                                                        .toUpperCase()
                                                                }

                                                            </div>


                                                            <div>

                                                                <strong>

                                                                    {
                                                                        r.prenom
                                                                    }

                                                                    {" "}

                                                                    {
                                                                        r.nom
                                                                    }

                                                                </strong>

                                                                <small>

                                                                    Utilisateur #

                                                                    {
                                                                        r.id_utilisateur
                                                                    }

                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* OFFRE */}

                                                    <td>

                                                        <div className="offer-cell">

                                                            <strong>

                                                                {
                                                                    r.offre ||
                                                                    r.titre ||
                                                                    "Offre"
                                                                }

                                                            </strong>

                                                            <small>

                                                                Offre #

                                                                {
                                                                    r.id_offre
                                                                }

                                                            </small>

                                                        </div>

                                                    </td>


                                                    {/* SCORE */}

                                                    <td>

                                                        <div className="table-score">

                                                            <div className="score-number">

                                                                <span
                                                                    className={
                                                                        getScoreClass(
                                                                            r.score
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        Number(
                                                                            r.score || 0
                                                                        ).toFixed(0)
                                                                    }%

                                                                </span>

                                                            </div>


                                                            <div className="table-progress">

                                                                <div
                                                                    className={
                                                                        getScoreClass(
                                                                            r.score
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            `${Math.min(
                                                                                Number(
                                                                                    r.score || 0
                                                                                ),
                                                                                100
                                                                            )}%`
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* TYPE */}

                                                    <td>

                                                        <span className="type-badge">

                                                            <FaRobot />

                                                            {
                                                                r.type_recommandation ||
                                                                "IA"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* DATE */}

                                                    <td>

                                                        <div className="date-cell">

                                                            <FaCalendarAlt />

                                                            {
                                                                formaterDate(
                                                                    r.date_recommandation
                                                                )
                                                            }

                                                        </div>

                                                    </td>

                                                </tr>

                                            ))
                                    }

                                </tbody>

                            </table>

                        </div>

                    )
                }

            </div>

        </div>

    );

}


export default Recommandations;
