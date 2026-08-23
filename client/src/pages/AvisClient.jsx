import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaStar,
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaComment,
    FaPlus,
    FaSyncAlt,
    FaExclamationCircle,
    FaCalendarAlt,
    FaCheckCircle
} from "react-icons/fa";

import api from "../api/api";

import "./AvisClient.css";


function AvisClient() {

    const navigate = useNavigate();


    // =====================================================
    // ETATS
    // =====================================================

    const [utilisateur, setUtilisateur] = useState(null);

    const [avis, setAvis] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [refreshing, setRefreshing] = useState(false);

    const [deletingId, setDeletingId] = useState(null);


    // =====================================================
    // UTILISATEUR CONNECTÉ
    // =====================================================

    useEffect(() => {

        const data = localStorage.getItem("utilisateur");

        if (!data) {

            navigate("/login-client");

            return;
        }

        try {

            const parsed = JSON.parse(data);

            if (!parsed?.id_utilisateur) {

                localStorage.removeItem("utilisateur");

                navigate("/login-client");

                return;
            }

            setUtilisateur(parsed);

        } catch (err) {

            console.error(
                "Erreur lecture utilisateur :",
                err
            );

            localStorage.removeItem("utilisateur");

            navigate("/login-client");
        }

    }, [navigate]);


    // =====================================================
    // IDENTIFIER L'UTILISATEUR D'UN AVIS
    // =====================================================

    const getAvisUtilisateurId = (item) => {

        return (
            item?.id_utilisateur ??
            item?.utilisateur_id ??
            item?.user_id ??
            item?.id_client ??
            item?.client_id ??
            item?.utilisateur?.id_utilisateur ??
            item?.utilisateur?.id ??
            null
        );
    };


    // =====================================================
    // IDENTIFIER L'ID DE L'AVIS
    // =====================================================

    const getAvisId = (item) => {

        return (
            item?.id_avis ??
            item?.id ??
            item?.avis_id ??
            null
        );
    };


    // =====================================================
    // RÉCUPÉRATION DES AVIS DU CLIENT
    // =====================================================

    const chargerAvis = async (
        afficherChargement = true
    ) => {

        if (!utilisateur?.id_utilisateur) {

            return;
        }


        if (afficherChargement) {

            setLoading(true);

        } else {

            setRefreshing(true);
        }


        setError("");


        try {

            /*
             * IMPORTANT :
             *
             * Ton backend possède actuellement :
             *
             * GET /avis
             *
             * mais PAS :
             *
             * GET /avis/utilisateur/:id
             *
             * Nous récupérons donc tous les avis,
             * puis nous conservons uniquement ceux
             * appartenant au client connecté.
             */

            const response = await api.get("/avis");


            const data =
                response.data?.avis ||
                response.data?.data ||
                response.data?.resultats ||
                response.data ||
                [];


            const listeAvis = Array.isArray(data)
                ? data
                : [];


            /*
             * Filtrer uniquement les avis
             * du client connecté.
             */

            const avisClient = listeAvis.filter(
                (item) => {

                    const idUtilisateur =
                        getAvisUtilisateurId(item);


                    /*
                     * Comparaison numérique pour éviter
                     * les problèmes "1" !== 1.
                     */

                    return (
                        idUtilisateur !== null &&
                        Number(idUtilisateur) ===
                        Number(
                            utilisateur.id_utilisateur
                        )
                    );

                }
            );


            /*
             * Trier les avis du plus récent
             * au plus ancien.
             */

            avisClient.sort(
                (a, b) => {

                    const dateA = new Date(
                        a.date_avis ||
                        a.date_creation ||
                        a.created_at ||
                        a.date ||
                        0
                    ).getTime();


                    const dateB = new Date(
                        b.date_avis ||
                        b.date_creation ||
                        b.created_at ||
                        b.date ||
                        0
                    ).getTime();


                    return dateB - dateA;
                }
            );


            setAvis(avisClient);


            /*
             * Sauvegarde locale facultative.
             */

            try {

                localStorage.setItem(
                    "mesAvis",
                    JSON.stringify(avisClient)
                );

            } catch {

                // Rien à faire.
            }


        } catch (err) {

            console.error(
                "Erreur récupération avis :",
                err.response?.data ||
                err
            );


            /*
             * FALLBACK LOCAL
             *
             * Utilisé uniquement si le serveur
             * n'est pas disponible.
             */

            try {

                const localData =
                    localStorage.getItem(
                        "mesAvis"
                    );


                if (localData) {

                    const parsed =
                        JSON.parse(localData);


                    if (Array.isArray(parsed)) {

                        const avisClient =
                            parsed.filter(
                                (item) => {

                                    const idUtilisateur =
                                        getAvisUtilisateurId(
                                            item
                                        );


                                    /*
                                     * Si les anciennes données
                                     * locales ne possèdent pas
                                     * id_utilisateur, on ne les
                                     * affiche pas comme appartenant
                                     * automatiquement au client.
                                     */

                                    if (
                                        idUtilisateur === null
                                    ) {

                                        return false;
                                    }


                                    return (
                                        Number(
                                            idUtilisateur
                                        ) ===
                                        Number(
                                            utilisateur.id_utilisateur
                                        )
                                    );
                                }
                            );


                        setAvis(avisClient);

                    } else {

                        setAvis([]);
                    }

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

            setRefreshing(false);
        }

    };


    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    useEffect(() => {

        if (!utilisateur) {

            return;
        }


        chargerAvis(true);

    }, [utilisateur]);


    // =====================================================
    // NOTE
    // =====================================================

    const getNote = (item) => {

        const note =
            item?.note ??
            item?.rating ??
            item?.evaluation ??
            0;


        const value = Number(note);


        if (Number.isNaN(value)) {

            return 0;
        }


        return Math.max(
            0,
            Math.min(
                5,
                value
            )
        );

    };


    // =====================================================
    // AFFICHAGE DES ÉTOILES
    // =====================================================

    const renderStars = (note) => {

        const value = getNote({
            note
        });


        return (

            <div
                className="avis-client-stars"
                aria-label={`${value} sur 5`}
            >

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

        if (!date) {

            return "Date non disponible";
        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return String(date);
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
    // DATE COURTE
    // =====================================================

    const formatDateCourte = (date) => {

        if (!date) {

            return "-";
        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "-";
        }


        return parsed.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    };


    // =====================================================
    // TITRE DE L'AVIS
    // =====================================================

    const getTitreAvis = (item) => {

        return (
            item?.titre ||
            item?.offre_titre ||
            item?.nom_offre ||
            item?.titre_offre ||
            "Mon avis"
        );

    };


    // =====================================================
    // COMMENTAIRE
    // =====================================================

    const getCommentaire = (item) => {

        return (
            item?.commentaire ||
            item?.message ||
            item?.contenu ||
            ""
        );

    };


    // =====================================================
    // RÉPONSE
    // =====================================================

    const getReponse = (item) => {

        return (
            item?.reponse ||
            item?.reponse_avis ||
            item?.commentaire_reponse ||
            ""
        );

    };


    // =====================================================
    // SUPPRESSION
    // =====================================================

    const supprimerAvis = async (id) => {

        if (!id) {

            setError(
                "Impossible d'identifier cet avis."
            );

            return;
        }


        const confirmation =
            window.confirm(
                "Voulez-vous vraiment supprimer cet avis ?\n\nCette action est irréversible."
            );


        if (!confirmation) {

            return;
        }


        setDeletingId(id);

        setError("");


        try {

            /*
             * Ton backend possède :
             *
             * DELETE /avis/:id
             */

            await api.delete(
                `/avis/${id}`
            );


            /*
             * Suppression immédiate
             * dans l'interface.
             */

            setAvis(
                (previous) =>
                    previous.filter(
                        (item) =>
                            Number(
                                getAvisId(item)
                            ) !==
                            Number(id)
                    )
            );


            /*
             * Mise à jour du cache local.
             */

            try {

                const remaining =
                    avis.filter(
                        (item) =>
                            Number(
                                getAvisId(item)
                            ) !==
                            Number(id)
                    );


                localStorage.setItem(
                    "mesAvis",
                    JSON.stringify(
                        remaining
                    )
                );

            } catch {

                // Rien à faire.
            }


        } catch (err) {

            console.error(
                "Erreur suppression avis :",
                err.response?.data ||
                err
            );


            setError(
                err.response?.data?.message ||
                "Impossible de supprimer cet avis."
            );

        } finally {

            setDeletingId(null);
        }

    };


    // =====================================================
    // MODIFIER
    // =====================================================

    const modifierAvis = (id) => {

        if (!id) {

            return;
        }


        /*
         * Ton formulaire public peut récupérer
         * l'identifiant depuis l'URL.
         */

        navigate(
            `/avis-public?modifier=${id}`
        );

    };


    // =====================================================
    // NOUVEL AVIS
    // =====================================================

    const nouvelAvis = () => {

        navigate(
            "/avis-public"
        );

    };


    // =====================================================
    // RETOUR
    // =====================================================

    const retour = () => {

        navigate(
            "/espace-client"
        );

    };


    // =====================================================
    // STATISTIQUES
    // =====================================================

    const statistiques = useMemo(() => {

        const nombreAvis =
            avis.length;


        const totalNotes =
            avis.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total +
                        getNote(item)
                    );

                },
                0
            );


        const moyenne =
            nombreAvis > 0
                ? totalNotes / nombreAvis
                : 0;


        const notesCinq =
            avis.filter(
                (item) =>
                    getNote(item) === 5
            ).length;


        return {

            nombreAvis,

            moyenne,

            notesCinq

        };

    }, [avis]);


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="avis-client-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="avis-client-header">


                <button
                    type="button"
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
                        Retrouvez et gérez toutes vos publications.
                    </p>

                </div>


                <button
                    type="button"
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
                CONTENU PRINCIPAL
            ================================================= */}

            <main className="avis-client-main">


                {/* =================================================
                    ERREUR
                ================================================= */}

                {error && (

                    <div className="avis-client-error">

                        <FaExclamationCircle />

                        <div>

                            <strong>
                                Attention
                            </strong>

                            <p>
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    STATISTIQUES
                ================================================= */}

                {!loading && avis.length > 0 && (

                    <div className="avis-client-summary">


                        <div className="avis-client-summary-card">

                            <div className="summary-icon">

                                <FaComment />

                            </div>

                            <div>

                                <span>
                                    AVIS PUBLIÉS
                                </span>

                                <strong>
                                    {statistiques.nombreAvis}
                                </strong>

                                <small>
                                    Publication
                                    {statistiques.nombreAvis > 1 ? "s" : ""}
                                </small>

                            </div>

                        </div>


                        <div className="avis-client-summary-card">

                            <div className="summary-icon">

                                <FaStar />

                            </div>

                            <div>

                                <span>
                                    NOTE MOYENNE
                                </span>

                                <strong>
                                    {statistiques.moyenne.toFixed(1)}
                                    <small className="summary-five">
                                        / 5
                                    </small>
                                </strong>

                                <small>
                                    Évaluation moyenne
                                </small>

                            </div>

                        </div>


                        <div className="avis-client-summary-card">

                            <div className="summary-icon">

                                <FaCheckCircle />

                            </div>

                            <div>

                                <span>
                                    5 ÉTOILES
                                </span>

                                <strong>
                                    {statistiques.notesCinq}
                                </strong>

                                <small>
                                    Avis très satisfaisants
                                </small>

                            </div>

                        </div>


                    </div>

                )}


                {/* =================================================
                    CARTE PRINCIPALE
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

                            <p>
                                Consultez vos évaluations et gérez vos publications.
                            </p>

                        </div>


                        <div className="avis-client-title-actions">

                            <button
                                type="button"
                                className="avis-client-refresh"
                                onClick={() =>
                                    chargerAvis(false)
                                }
                                disabled={
                                    refreshing ||
                                    loading
                                }
                                title="Actualiser"
                            >

                                <FaSyncAlt
                                    className={
                                        refreshing
                                            ? "avis-refresh-spinning"
                                            : ""
                                    }
                                />

                            </button>


                            <FaStar />

                        </div>

                    </div>


                    {/* =================================================
                        CHARGEMENT
                    ================================================= */}

                    {loading ? (

                        <div className="avis-client-empty">

                            <div className="avis-client-loading-spinner"></div>

                            <h3>
                                Chargement de vos avis
                            </h3>

                            <p>
                                Nous récupérons vos publications...
                            </p>

                        </div>

                    ) : avis.length === 0 ? (

                        /* =================================================
                            AUCUN AVIS
                        ================================================= */

                        <div className="avis-client-empty">

                            <div className="avis-empty-icon">

                                <FaStar />

                            </div>

                            <h3>
                                Aucun avis publié
                            </h3>

                            <p>
                                Vous n'avez encore publié aucun avis sur la plateforme.
                            </p>

                            <button
                                type="button"
                                onClick={nouvelAvis}
                            >

                                <FaPlus />

                                Publier mon premier avis

                            </button>

                        </div>

                    ) : (

                        /* =================================================
                            LISTE DES AVIS
                        ================================================= */

                        <div className="avis-client-list">

                            {avis.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const id =
                                        getAvisId(
                                            item
                                        );


                                    const note =
                                        getNote(
                                            item
                                        );


                                    const commentaire =
                                        getCommentaire(
                                            item
                                        );


                                    const reponse =
                                        getReponse(
                                            item
                                        );


                                    const date =
                                        item?.date_avis ||
                                        item?.date_creation ||
                                        item?.created_at ||
                                        item?.date;


                                    const titre =
                                        getTitreAvis(
                                            item
                                        );


                                    return (

                                        <article
                                            className="avis-client-item"
                                            key={
                                                id ||
                                                index
                                            }
                                        >


                                            {/* =================================================
                                                EN-TÊTE AVIS
                                            ================================================= */}

                                            <div className="avis-client-item-header">


                                                <div className="avis-client-item-heading">

                                                    <strong>
                                                        {titre}
                                                    </strong>

                                                    <span>

                                                        <FaCalendarAlt />

                                                        {formatDate(
                                                            date
                                                        )}

                                                    </span>

                                                </div>


                                                <div className="avis-client-rating">

                                                    {renderStars(
                                                        note
                                                    )}

                                                    <span>
                                                        {note.toFixed(1)} / 5
                                                    </span>

                                                </div>


                                            </div>


                                            {/* =================================================
                                                COMMENTAIRE
                                            ================================================= */}

                                            {commentaire && (

                                                <p className="avis-client-commentaire">

                                                    {commentaire}

                                                </p>

                                            )}


                                            {!commentaire && (

                                                <p className="avis-client-commentaire avis-no-comment">

                                                    Aucun commentaire ajouté.

                                                </p>

                                            )}


                                            {/* =================================================
                                                RÉPONSE
                                            ================================================= */}

                                            {reponse && (

                                                <div className="avis-client-response">

                                                    <FaComment />

                                                    <div>

                                                        <strong>
                                                            Réponse
                                                        </strong>

                                                        <p>
                                                            {reponse}
                                                        </p>

                                                    </div>

                                                </div>

                                            )}


                                            {/* =================================================
                                                INFORMATIONS
                                            ================================================= */}

                                            <div className="avis-client-item-footer">


                                                <div className="avis-client-publication-info">

                                                    <FaCheckCircle />

                                                    <span>
                                                        Avis publié
                                                    </span>

                                                    {date && (

                                                        <small>
                                                            {formatDateCourte(
                                                                date
                                                            )}
                                                        </small>

                                                    )}

                                                </div>


                                                {/* =================================================
                                                    ACTIONS
                                                ================================================= */}

                                                <div className="avis-client-actions">


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            modifierAvis(
                                                                id
                                                            )
                                                        }
                                                        disabled={
                                                            !id
                                                        }
                                                    >

                                                        <FaEdit />

                                                        Modifier

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="delete"
                                                        onClick={() =>
                                                            supprimerAvis(
                                                                id
                                                            )
                                                        }
                                                        disabled={
                                                            !id ||
                                                            deletingId === id
                                                        }
                                                    >

                                                        <FaTrash />

                                                        {deletingId === id
                                                            ? "Suppression..."
                                                            : "Supprimer"}

                                                    </button>


                                                </div>


                                            </div>


                                        </article>

                                    );

                                }
                            )}

                        </div>

                    )}


                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                {!loading && avis.length > 0 && (

                    <div className="avis-client-bottom-info">

                        <FaStar />

                        <span>
                            Merci de partager votre expérience avec les autres voyageurs.
                        </span>

                    </div>

                )}


            </main>


        </div>

    );

}


export default AvisClient;