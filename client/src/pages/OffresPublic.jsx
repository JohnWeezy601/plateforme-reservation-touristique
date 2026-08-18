import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import {
    Autoplay,
    Navigation,
    Pagination
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./OffresPublic.css";


function OffresPublic() {

    const [offres, setOffres] = useState([]);

    const navigate = useNavigate();


    // =====================================================
    // AFFICHAGE DU PRIX DIRECTEMENT EN EURO
    // =====================================================

    const formatPrixEuro = (prix) => {

        if (
            prix === null ||
            prix === undefined ||
            prix === ""
        ) {
            return "Prix sur demande";
        }

        return Number(prix).toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    };


    // =====================================================
    // LIMITER DESCRIPTION
    // =====================================================

    const limiterDescription = (
        texte,
        longueur = 60
    ) => {

        if (!texte) {
            return "";
        }

        if (texte.length <= longueur) {
            return texte;
        }

        return texte.substring(0, longueur) + "...";
    };


    // =====================================================
    // CHARGER LES OFFRES
    // =====================================================

    useEffect(() => {

        const chargerOffres = async () => {

            try {

                const res = await api.get("/offres");

                console.log(
                    "Offres récupérées :",
                    res.data
                );

                let data = res.data;

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

            }

            catch (error) {

                console.error(
                    "Erreur chargement offres :",
                    error
                );

                setOffres([]);

            }

        };


        chargerOffres();

    }, []);


    // =====================================================
    // RESERVATION
    // =====================================================

    const reserver = (id) => {

        const utilisateur =
            localStorage.getItem("utilisateur");


        if (utilisateur) {

            navigate(
                `/reservation-public/${id}`
            );

        }

        else {

            navigate(
                `/login-client?redirect=/reservation-public/${id}`
            );

        }

    };


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="offres-public">


            <h1>
                Nos offres touristiques
            </h1>


            <p className="intro">
                Découvrez nos meilleurs séjours et destinations.
            </p>


            {offres.length > 0 ? (

                <Swiper

                    modules={[
                        Autoplay,
                        Navigation,
                        Pagination
                    ]}

                    spaceBetween={25}

                    slidesPerView={3}

                    navigation

                    pagination={{
                        clickable: true
                    }}

                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false
                    }}

                    speed={800}

                    loop={true}

                    className="offres-slider"

                    breakpoints={{

                        0: {
                            slidesPerView: 1
                        },

                        768: {
                            slidesPerView: 2
                        },

                        1200: {
                            slidesPerView: 3
                        }

                    }}

                >

                    {offres.map((offre) => (

                        <SwiperSlide
                            key={offre.id_offre}
                        >

                            <div className="offre-card">


                                {/* =================================================
                                    IMAGE
                                ================================================= */}

                                <img

                                    src={
                                        offre.image
                                            ? `http://localhost:8081/uploads/${offre.image}`
                                            : "/image-default.jpg"
                                    }

                                    alt={
                                        offre.titre ||
                                        "Offre touristique"
                                    }

                                    onError={(event) => {

                                        event.currentTarget.src =
                                            "/image-default.jpg";

                                    }}

                                />


                                {/* =================================================
                                    CONTENU
                                ================================================= */}

                                <div className="offre-content">


                                    <h2>
                                        {offre.titre}
                                    </h2>


                                    <p>
                                        📍{" "}
                                        {offre.destination ||
                                            "Madagascar"}
                                    </p>


                                    {/* DESCRIPTION */}

                                    <p className="description">

                                        {limiterDescription(
                                            offre.description
                                        )}

                                        {offre.description &&
                                            offre.description.length > 60 && (

                                                <span
                                                    className="voir-plus"
                                                    onClick={() =>
                                                        navigate(
                                                            `/detail-offre/${offre.id_offre}`
                                                        )
                                                    }
                                                >
                                                    Voir plus
                                                </span>

                                            )}

                                    </p>


                                    {/* =================================================
                                        PRIX
                                    ================================================= */}

                                    <h3>

                                        💰{" "}

                                        {formatPrixEuro(
                                            offre.prix
                                        )}

                                        {" "}€

                                    </h3>


                                    {/* =================================================
                                        RESERVATION
                                    ================================================= */}

                                    <button
                                        onClick={() =>
                                            reserver(
                                                offre.id_offre
                                            )
                                        }
                                    >
                                        Réserver
                                    </button>


                                </div>

                            </div>

                        </SwiperSlide>

                    ))}

                </Swiper>

            ) : (

                <div className="offres-empty">

                    <p>
                        Aucune offre disponible pour le moment.
                    </p>

                </div>

            )}

        </div>

    );

}


export default OffresPublic;