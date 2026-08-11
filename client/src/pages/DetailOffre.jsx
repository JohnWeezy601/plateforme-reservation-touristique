
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaMapMarkerAlt,
    FaTag,
    FaMoneyBillWave,
    FaUsers,
    FaCalendarAlt,
    FaArrowLeft,
    FaCheckCircle
} from "react-icons/fa";

import api from "../api/api";
import "./DetailOffre.css";

function DetailOffre() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [offre, setOffre] = useState(null);
    const [loading, setLoading] = useState(true);

    // ==========================
    // Charger une offre
    // ==========================

    useEffect(() => {

        const chargerOffre = async () => {

            try {

                const res = await api.get(`/offres/${id}`);

                setOffre(res.data);

            }
            catch (error) {

                console.log(
                    "Erreur chargement offre",
                    error
                );

            }
            finally {

                setLoading(false);

            }

        };

        chargerOffre();

    }, [id]);


    // ==========================
    // Chargement
    // ==========================

    if (loading) {

        return (
            <div className="detail-offre-loading">

                <div className="loading-spinner"></div>

                <p>
                    Chargement de l'offre...
                </p>

            </div>
        );

    }


    // ==========================
    // Offre introuvable
    // ==========================

    if (!offre) {

        return (
            <div className="detail-offre-error">

                <h2>
                    Offre introuvable
                </h2>

                <button
                    onClick={() => navigate(-1)}
                >
                    Retour
                </button>

            </div>
        );

    }


    // ==========================
    // Affichage
    // ==========================

    return (

        <div className="detail-offre-page">

            <div className="detail-offre-card">

                {/* ==========================
                    IMAGE
                ========================== */}

                <div className="detail-offre-image-container">

                    <img
                        className="detail-offre-image"
                        src={
                            offre.image
                                ? `http://localhost:8081/uploads/${offre.image}`
                                : "/image-default.jpg"
                        }
                        alt={offre.titre}
                    />

                    <button
                        className="btn-retour"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                        Retour
                    </button>

                </div>


                {/* ==========================
                    CONTENU
                ========================== */}

                <div className="detail-offre-content">

                    <div className="offre-heading">

                        <div>

                            <span className="offre-badge">
                                <FaCheckCircle />
                                Offre disponible
                            </span>

                            <h1>
                                {offre.titre}
                            </h1>

                        </div>

                    </div>


                    {/* ==========================
                        DESCRIPTION
                    ========================== */}

                    <div className="description-section">

                        <h2>
                            À propos de cette offre
                        </h2>

                        <p>
                            {offre.description ||
                                "Découvrez cette offre touristique et profitez d'une expérience unique."}
                        </p>

                    </div>


                    {/* ==========================
                        INFORMATIONS
                    ========================== */}

                    <div className="detail-offre-info">

                        {/* DESTINATION */}

                        <div className="info-box">

                            <div className="info-icon destination-icon">
                                <FaMapMarkerAlt />
                            </div>

                            <div>

                                <strong>
                                    Destination
                                </strong>

                                <span>
                                    {offre.destination ||
                                        "Destination inconnue"}
                                </span>

                            </div>

                        </div>


                        {/* CATEGORIE */}

                        <div className="info-box">

                            <div className="info-icon category-icon">
                                <FaTag />
                            </div>

                            <div>

                                <strong>
                                    Catégorie
                                </strong>

                                <span>
                                    {offre.categorie ||
                                        "Non précisée"}
                                </span>

                            </div>

                        </div>


                        {/* PRIX */}

                        <div className="info-box price-box">

                            <div className="info-icon price-icon">
                                <FaMoneyBillWave />
                            </div>

                            <div>

                                <strong>
                                    Prix
                                </strong>

                                <span className="prix-offre">

                                    {Number(offre.prix || 0)
                                        .toLocaleString("fr-FR")}

                                    {" "}Ar

                                </span>

                            </div>

                        </div>


                        {/* CAPACITE */}

                        <div className="info-box">

                            <div className="info-icon capacity-icon">
                                <FaUsers />
                            </div>

                            <div>

                                <strong>
                                    Capacité
                                </strong>

                                <span>
                                    {offre.capacite || 0} personnes
                                </span>

                            </div>

                        </div>


                        {/* DATE DEBUT */}

                        <div className="info-box">

                            <div className="info-icon date-icon">
                                <FaCalendarAlt />
                            </div>

                            <div>

                                <strong>
                                    Début
                                </strong>

                                <span>
                                    {offre.date_debut
                                        ? new Date(
                                            offre.date_debut
                                        ).toLocaleDateString("fr-FR")
                                        : "-"}
                                </span>

                            </div>

                        </div>


                        {/* DATE FIN */}

                        <div className="info-box">

                            <div className="info-icon date-icon">
                                <FaCalendarAlt />
                            </div>

                            <div>

                                <strong>
                                    Fin
                                </strong>

                                <span>
                                    {offre.date_fin
                                        ? new Date(
                                            offre.date_fin
                                        ).toLocaleDateString("fr-FR")
                                        : "-"}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* ==========================
                        ACTION
                    ========================== */}

                    <div className="reservation-section">

                        <div className="reservation-text">

                            <strong>
                                Prêt pour votre prochaine aventure ?
                            </strong>

                            <span>
                                Réservez cette offre dès maintenant.
                            </span>

                        </div>

                        <button
                            className="btn-reserver"
                            onClick={() =>
                                navigate(
                                    `/reservation-public/${offre.id_offre}`
                                )
                            }
                        >
                            Réserver maintenant
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default DetailOffre;

