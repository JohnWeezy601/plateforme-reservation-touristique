import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaStar,
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaComment,
    FaPlus
} from "react-icons/fa";

import api from "../api/api";

import "./AvisClient.css";


function AvisClient() {

    const navigate = useNavigate();

    const [utilisateur, setUtilisateur] = useState(null);

    const [avis, setAvis] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =====================================================
    // UTILISATEUR
    // =====================================================

    useEffect(() => {

        const data =
            localStorage.getItem("utilisateur");

        if (!data) {

            navigate("/login-client");

            return;

        }

        try {

            setUtilisateur(
                JSON.parse(data)
            );

        } catch {

            localStorage.removeItem(
                "utilisateur"
            );

            navigate("/login-client");

        }

    }, [navigate]);


    // =====================================================
    // RÉCUPÉRATION DES AVIS
    // =====================================================

    useEffect(() => {

        if (!utilisateur) return;

        const chargerAvis = async () => {

            setLoading(true);
            setError("");

            try {

                /*
                 * Route client :
                 *
                 * GET /api/avis/utilisateur/:id
                 *
                 * Si ton backend utilise une autre route,
                 * nous l'adapterons à ton controller.
                 */

                const response = await api.get(
                    `/api/avis/utilisateur/${utilisateur.id_utilisateur}`
                );

                const data =
                    response.data?.avis ||
                    response.data ||
                    [];

                setAvis(
                    Array.isArray(data)
                        ? data
                        : []
                );


            } catch (err) {

                console.error(
                    "Erreur récupération avis :",
                    err
                );


                /*
                 * Fallback localStorage
                 */

                try {

                    const localData =
                        localStorage.getItem(
                            "mesAvis"
                        );

                    if (localData) {

                        const parsed =
                            JSON.parse(localData);

                        setAvis(
                            Array.isArray(parsed)
                                ? parsed
                                : []
                        );

                    } else {

                        setAvis([]);

                    }

                } catch {

                    setAvis([]);

                }

                setError(
                    "Impossible de récupérer vos avis depuis le serveur."
                );

            } finally {

                setLoading(false);

            }

        };


        chargerAvis();

    }, [utilisateur]);


    // =====================================================
    // NOTE
    // =====================================================

    const renderStars = (note) => {

        const value =
            Number(note) || 0;

        return (

            <div className="avis-client-stars">

                {[1, 2, 3, 4, 5].map(
                    (star) => (

                        <FaStar
                            key={star}
                            className={
                                star <= value
                                    ? "active"
                                    : ""
                            }
                        />

                    )
                )}

            </div>

        );

    };


    // =====================================================
    // DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) return "";

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return date;

        }

        return parsed.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    };


    // =====================================================
    // SUPPRESSION
    // =====================================================

    const supprimerAvis = async (id) => {

        const confirmation =
            window.confirm(
                "Voulez-vous vraiment supprimer cet avis ?"
            );

        if (!confirmation) return;


        try {

            await api.delete(
                `/api/avis/${id}`
            );

            setAvis(
                (previous) =>
                    previous.filter(
                        (item) =>
                            (
                                item.id_avis ||
                                item.id
                            ) !== id
                    )
            );


        } catch (err) {

            console.error(
                "Erreur suppression avis :",
                err
            );

            setError(
                "Impossible de supprimer cet avis."
            );

        }

    };


    // =====================================================
    // MODIFIER
    // =====================================================

    const modifierAvis = (id) => {

        /*
         * Cette route pourra être reliée
         * à ton formulaire de modification.
         */

        navigate(
            `/avis-public?modifier=${id}`
        );

    };


    // =====================================================
    // NOUVEL AVIS
    // =====================================================

    const nouvelAvis = () => {

        navigate("/avis-public");

    };


    // =====================================================
    // RETOUR
    // =====================================================

    const retour = () => {

        navigate("/espace-client");

    };


    return (

        <div className="avis-client-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="avis-client-header">


                <button
                    className="avis-client-back"
                    onClick={retour}
                >

                    <FaArrowLeft />

                    <span>
                        Retour à mon espace
                    </span>

                </button>


                <div>

                    <span>
                        ESPACE CLIENT
                    </span>

                    <h1>
                        Mes avis
                    </h1>

                    <p>
                        Retrouvez toutes vos publications et avis.
                    </p>

                </div>


                <button
                    className="avis-client-new"
                    onClick={nouvelAvis}
                >

                    <FaPlus />

                    <span>
                        Publier un avis
                    </span>

                </button>


            </header>


            {/* =================================================
                ERREUR
            ================================================= */}

            {error && (

                <div className="avis-client-error">
                    {error}
                </div>

            )}


            {/* =================================================
                CONTENU
            ================================================= */}

            <section className="avis-client-card">


                <div className="avis-client-title">

                    <div>

                        <span>
                            PUBLICATIONS
                        </span>

                        <h2>
                            Mes avis publiés
                        </h2>

                    </div>

                    <FaStar />

                </div>


                {/* CHARGEMENT */}

                {loading ? (

                    <div className="avis-client-empty">

                        Chargement de vos avis...

                    </div>

                ) : avis.length === 0 ? (

                    <div className="avis-client-empty">

                        <FaStar />

                        <h3>
                            Aucun avis publié
                        </h3>

                        <p>
                            Vous n'avez encore publié aucun avis.
                        </p>

                        <button
                            onClick={nouvelAvis}
                        >

                            <FaPlus />

                            Publier mon premier avis

                        </button>

                    </div>

                ) : (

                    <div className="avis-client-list">

                        {avis.map(
                            (item, index) => {

                                const id =
                                    item.id_avis ||
                                    item.id;


                                const note =
                                    item.note ||
                                    item.rating ||
                                    0;


                                return (

                                    <article
                                        className="avis-client-item"
                                        key={
                                            id ||
                                            index
                                        }
                                    >


                                        <div className="avis-client-item-header">


                                            <div>

                                                <strong>

                                                    {item.titre ||
                                                    item.offre_titre ||
                                                    item.nom_offre ||
                                                    "Mon avis"}

                                                </strong>


                                                <span>

                                                    {formatDate(
                                                        item.date_avis ||
                                                        item.date_creation ||
                                                        item.created_at ||
                                                        item.date
                                                    )}

                                                </span>

                                            </div>


                                            {renderStars(note)}


                                        </div>


                                        {item.commentaire && (

                                            <p className="avis-client-commentaire">

                                                {item.commentaire}

                                            </p>

                                        )}


                                        {item.message && !item.commentaire && (

                                            <p className="avis-client-commentaire">

                                                {item.message}

                                            </p>

                                        )}


                                        {item.reponse && (

                                            <div className="avis-client-response">

                                                <FaComment />

                                                <div>

                                                    <strong>
                                                        Réponse
                                                    </strong>

                                                    <p>
                                                        {item.reponse}
                                                    </p>

                                                </div>

                                            </div>

                                        )}


                                        <div className="avis-client-actions">


                                            <button
                                                onClick={() =>
                                                    modifierAvis(id)
                                                }
                                            >

                                                <FaEdit />

                                                Modifier

                                            </button>


                                            <button
                                                className="delete"
                                                onClick={() =>
                                                    supprimerAvis(id)
                                                }
                                            >

                                                <FaTrash />

                                                Supprimer

                                            </button>


                                        </div>


                                    </article>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


        </div>

    );

}


export default AvisClient;