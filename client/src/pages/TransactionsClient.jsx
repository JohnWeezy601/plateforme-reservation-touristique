import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaCreditCard,
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaMoneyBillWave,
    FaReceipt,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaHotel,
    FaChevronRight,
    FaSyncAlt
} from "react-icons/fa";

import api from "../api/api";

import "./TransactionsClient.css";


function TransactionsClient() {

    const navigate = useNavigate();


    // =====================================================
    // ETATS
    // =====================================================

    const [utilisateur, setUtilisateur] =
        useState(null);

    const [transactions, setTransactions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [actualisation, setActualisation] =
        useState(false);


    // =====================================================
    // UTILISATEUR CONNECTÉ
    // =====================================================

    useEffect(() => {

        const data =
            localStorage.getItem("utilisateur");


        if (!data) {

            navigate("/login-client");

            return;

        }


        try {

            const utilisateurConnecte =
                JSON.parse(data);

            setUtilisateur(
                utilisateurConnecte
            );

        }

        catch (error) {

            console.error(
                "Utilisateur invalide :",
                error
            );

            localStorage.removeItem(
                "utilisateur"
            );

            navigate("/login-client");

        }

    }, [navigate]);


    // =====================================================
    // NORMALISER STATUT
    // =====================================================

    const normaliserStatut = (statut) => {

        return String(statut || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    };


    // =====================================================
    // RECUPERER MES TRANSACTIONS
    // =====================================================

    const chargerTransactions = async (
        afficherChargement = true
    ) => {

        if (!utilisateur) {

            return;

        }


        if (afficherChargement) {

            setLoading(true);

        }
        else {

            setActualisation(true);

        }


        setError("");


        try {

            // =================================================
            // IMPORTANT
            // =================================================
            //
            // La route /paiements/utilisateur/:id
            // N'EXISTE PAS dans ton backend.
            //
            // Ton backend possède :
            //
            // GET /paiements
            //
            // Cette route retourne déjà id_utilisateur.
            //
            // On récupère donc tous les paiements puis
            // on filtre ceux du client connecté.
            // =================================================

            const response =
                await api.get(
                    "/paiements"
                );


            const data =
                Array.isArray(
                    response.data
                )
                    ? response.data
                    : (
                        response.data?.paiements ||
                        response.data?.transactions ||
                        response.data?.data ||
                        []
                    );


            // =================================================
            // FILTRER LES PAIEMENTS DU CLIENT
            // =================================================

            const mesTransactions =
                Array.isArray(data)
                    ? data.filter(
                        (paiement) =>
                            Number(
                                paiement.id_utilisateur
                            ) ===
                            Number(
                                utilisateur.id_utilisateur
                            )
                    )
                    : [];


            // =================================================
            // TRI DU PLUS RÉCENT AU PLUS ANCIEN
            // =================================================

            mesTransactions.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.date_paiement ||
                            a.date_transaction ||
                            a.created_at ||
                            0
                        ).getTime();


                    const dateB =
                        new Date(
                            b.date_paiement ||
                            b.date_transaction ||
                            b.created_at ||
                            0
                        ).getTime();


                    return dateB - dateA;

                }
            );


            setTransactions(
                mesTransactions
            );


        }

        catch (err) {

            console.error(
                "Erreur récupération transactions :",
                err.response?.data ||
                err.message ||
                err
            );


            setTransactions([]);


            setError(
                "Impossible de récupérer vos transactions depuis le serveur."
            );

        }

        finally {

            setLoading(false);

            setActualisation(false);

        }

    };


    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    useEffect(() => {

        if (!utilisateur) {

            return;

        }


        chargerTransactions(
            true
        );

    }, [utilisateur]);


    // =====================================================
    // STATUT
    // =====================================================

    const getStatusClass = (
        statut
    ) => {

        const value =
            normaliserStatut(
                statut
            );


        if (
            value.includes("paye") ||
            value.includes("valide") ||
            value.includes("confirme") ||
            value.includes("success") ||
            value.includes("reussi")
        ) {

            return "success";

        }


        if (
            value.includes("attente") ||
            value.includes("pending")
        ) {

            return "pending";

        }


        if (
            value.includes("annule") ||
            value.includes("refus") ||
            value.includes("echec") ||
            value.includes("echoue") ||
            value.includes("failed")
        ) {

            return "failed";

        }


        return "default";

    };


    // =====================================================
    // ICONE STATUT
    // =====================================================

    const getStatusIcon = (
        statut
    ) => {

        const status =
            getStatusClass(
                statut
            );


        if (
            status === "success"
        ) {

            return (
                <FaCheckCircle />
            );

        }


        if (
            status === "pending"
        ) {

            return (
                <FaClock />
            );

        }


        if (
            status === "failed"
        ) {

            return (
                <FaTimesCircle />
            );

        }


        return (
            <FaCreditCard />
        );

    };


    // =====================================================
    // FORMAT MONTANT EURO
    // =====================================================

    const formatPrix = (
        montant
    ) => {

        if (
            montant === null ||
            montant === undefined ||
            montant === ""
        ) {

            return "0 €";

        }


        const number =
            Number(montant);


        if (
            Number.isNaN(number)
        ) {

            return `${montant} €`;

        }


        return (
            `${number.toLocaleString(
                "fr-FR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )} €`
        );

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        date
    ) => {

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
                month: "long",
                year: "numeric"
            }
        );

    };


    // =====================================================
    // FORMAT DATE COURTE
    // =====================================================

    const formatDateCourte = (
        date
    ) => {

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
    // CALCUL TOTAL
    // =====================================================

    const totalTransactions =
        transactions.reduce(
            (
                total,
                transaction
            ) => {

                return (
                    total +
                    Number(
                        transaction.montant ||
                        transaction.montant_total ||
                        transaction.prix ||
                        0
                    )
                );

            },
            0
        );


    // =====================================================
    // NOMBRE DE PAIEMENTS VALIDÉS
    // =====================================================

    const nombrePaiementsValides =
        transactions.filter(
            (transaction) => {

                const statut =
                    normaliserStatut(
                        transaction.statut
                    );


                return (
                    statut === "paye" ||
                    statut === "valide" ||
                    statut === "confirme" ||
                    statut === "confirmee"
                );

            }
        ).length;


    // =====================================================
    // NOMBRE EN ATTENTE
    // =====================================================

    const nombrePaiementsAttente =
        transactions.filter(
            (transaction) => {

                const statut =
                    normaliserStatut(
                        transaction.statut
                    );


                return (
                    statut === "en attente" ||
                    statut === "attente"
                );

            }
        ).length;


    // =====================================================
    // RETOUR
    // =====================================================

    const retour = () => {

        navigate(
            "/espace-client"
        );

    };


    // =====================================================
    // VOIR RÉSERVATION
    // =====================================================

    const voirReservation = (
        transaction
    ) => {

        if (
            transaction.id_reservation
        ) {

            navigate(
                "/mes-reservations"
            );

        }

    };


    // =====================================================
    // CHARGEMENT
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="transactions-client-page">

                <div className="transactions-loading">

                    <div className="transactions-loading-spinner">
                    </div>

                    <FaCreditCard />

                    <h2>
                        Chargement de vos transactions
                    </h2>

                    <p>
                        Nous récupérons votre historique de paiements...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="transactions-client-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="transactions-client-header">

                <div className="transactions-header-top">

                    <button
                        type="button"
                        className="transactions-client-back"
                        onClick={retour}
                    >

                        <FaArrowLeft />

                        <span>
                            Retour à mon espace
                        </span>

                    </button>


                    <button
                        type="button"
                        className="transactions-refresh-button"
                        onClick={() =>
                            chargerTransactions(false)
                        }
                        disabled={actualisation}
                    >

                        <FaSyncAlt
                            className={
                                actualisation
                                    ? "refresh-spin"
                                    : ""
                            }
                        />

                        <span>
                            Actualiser
                        </span>

                    </button>

                </div>


                <div className="transactions-header-content">

                    <div className="transactions-header-icon">

                        <FaCreditCard />

                    </div>


                    <div>

                        <span className="transactions-eyebrow">
                            ESPACE CLIENT
                        </span>

                        <h1>
                            Mes transactions
                        </h1>

                        <p>
                            Consultez et suivez l'ensemble de vos
                            paiements et transactions.
                        </p>

                    </div>

                </div>

            </header>


            {/* =================================================
                CONTENEUR
            ================================================= */}

            <main className="transactions-client-container">


                {/* =================================================
                    ERREUR
                ================================================= */}

                {error && (

                    <div className="transactions-client-error">

                        <FaTimesCircle />

                        <div>

                            <strong>
                                Impossible de charger les transactions
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

                <section className="transactions-summary">


                    <div className="summary-card">

                        <div className="summary-card-icon blue">

                            <FaCreditCard />

                        </div>

                        <div>

                            <span>
                                TRANSACTIONS
                            </span>

                            <strong>
                                {transactions.length}
                            </strong>

                            <small>
                                Paiements enregistrés
                            </small>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-card-icon green">

                            <FaCheckCircle />

                        </div>

                        <div>

                            <span>
                                VALIDÉS
                            </span>

                            <strong>
                                {nombrePaiementsValides}
                            </strong>

                            <small>
                                Paiements confirmés
                            </small>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-card-icon orange">

                            <FaClock />

                        </div>

                        <div>

                            <span>
                                EN ATTENTE
                            </span>

                            <strong>
                                {nombrePaiementsAttente}
                            </strong>

                            <small>
                                Paiements à vérifier
                            </small>

                        </div>

                    </div>


                    <div className="summary-card">

                        <div className="summary-card-icon purple">

                            <FaMoneyBillWave />

                        </div>

                        <div>

                            <span>
                                TOTAL
                            </span>

                            <strong>
                                {formatPrix(
                                    totalTransactions
                                )}
                            </strong>

                            <small>
                                Montant total
                            </small>

                        </div>

                    </div>


                </section>


                {/* =================================================
                    HISTORIQUE
                ================================================= */}

                <section className="transactions-client-card">


                    <div className="transactions-client-title">

                        <div>

                            <span>
                                HISTORIQUE DES PAIEMENTS
                            </span>

                            <h2>
                                Mes transactions
                            </h2>

                            <p>
                                Retrouvez ici toutes vos opérations
                                de paiement liées à vos réservations.
                            </p>

                        </div>


                        <div className="transactions-title-icon">

                            <FaReceipt />

                        </div>

                    </div>


                    {/* =================================================
                        AUCUNE TRANSACTION
                    ================================================= */}

                    {transactions.length === 0 ? (

                        <div className="transactions-client-empty">

                            <div className="empty-transaction-icon">

                                <FaReceipt />

                            </div>

                            <h3>
                                Aucune transaction
                            </h3>

                            <p>
                                Vous n'avez encore effectué aucun
                                paiement sur votre compte.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                Découvrir les offres
                                <FaChevronRight />
                            </button>

                        </div>

                    ) : (

                        <div className="transactions-client-list">


                            {/* =================================================
                                EN-TÊTE TABLEAU
                            ================================================= */}

                            <div className="transactions-list-header">

                                <span>
                                    TRANSACTION
                                </span>

                                <span>
                                    RÉSERVATION
                                </span>

                                <span>
                                    DATE
                                </span>

                                <span>
                                    MONTANT
                                </span>

                                <span>
                                    STATUT
                                </span>

                            </div>


                            {/* =================================================
                                TRANSACTIONS
                            ================================================= */}

                            {transactions.map(
                                (
                                    transaction,
                                    index
                                ) => {

                                    const statut =
                                        transaction.statut ||
                                        transaction.status ||
                                        transaction.etat ||
                                        "Non renseigné";


                                    const montant =
                                        transaction.montant ||
                                        transaction.montant_total ||
                                        transaction.prix ||
                                        0;


                                    const modePaiement =
                                        transaction.mode_paiement ||
                                        transaction.methode_paiement ||
                                        transaction.moyen_paiement ||
                                        "Paiement";


                                    return (

                                        <article
                                            className="transaction-client-item"
                                            key={
                                                transaction.id_paiement ||
                                                transaction.id_transaction ||
                                                transaction.id ||
                                                index
                                            }
                                        >


                                            {/* =================================================
                                                TRANSACTION
                                            ================================================= */}

                                            <div className="transaction-main">

                                                <div
                                                    className={
                                                        `transaction-client-icon ${getStatusClass(
                                                            statut
                                                        )}`
                                                    }
                                                >

                                                    {getStatusIcon(
                                                        statut
                                                    )}

                                                </div>


                                                <div className="transaction-client-info">

                                                    <strong>

                                                        {transaction.reference ||
                                                        transaction.reference_paiement ||
                                                        `Paiement #${transaction.id_paiement || index + 1}`}

                                                    </strong>

                                                    <span>
                                                        {modePaiement}
                                                    </span>

                                                    <small>
                                                        Paiement #{transaction.id_paiement || "-"}
                                                    </small>

                                                </div>

                                            </div>


                                            {/* =================================================
                                                RÉSERVATION
                                            ================================================= */}

                                            <div className="transaction-reservation">

                                                {transaction.id_reservation ? (

                                                    <>

                                                        <div className="reservation-mini-icon">

                                                            <FaHotel />

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                Réservation #
                                                                {transaction.id_reservation}
                                                            </strong>

                                                            {transaction.titre && (

                                                                <span>
                                                                    {transaction.titre}
                                                                </span>

                                                            )}

                                                        </div>

                                                    </>

                                                ) : (

                                                    <span>
                                                        -
                                                    </span>

                                                )}

                                            </div>


                                            {/* =================================================
                                                DATE
                                            ================================================= */}

                                            <div className="transaction-date">

                                                <FaCalendarAlt />

                                                <div>

                                                    <strong>
                                                        {formatDateCourte(
                                                            transaction.date_paiement ||
                                                            transaction.date_transaction ||
                                                            transaction.created_at ||
                                                            transaction.date
                                                        )}
                                                    </strong>

                                                    {transaction.date_reservation && (

                                                        <small>
                                                            Réservation :
                                                            {" "}
                                                            {formatDateCourte(
                                                                transaction.date_reservation
                                                            )}
                                                        </small>

                                                    )}

                                                </div>

                                            </div>


                                            {/* =================================================
                                                MONTANT
                                            ================================================= */}

                                            <div className="transaction-client-amount">

                                                <strong>
                                                    {formatPrix(
                                                        montant
                                                    )}
                                                </strong>

                                                <small>
                                                    EUR
                                                </small>

                                            </div>


                                            {/* =================================================
                                                STATUT
                                            ================================================= */}

                                            <div className="transaction-status-container">

                                                <span
                                                    className={
                                                        `transaction-status ${getStatusClass(
                                                            statut
                                                        )}`
                                                    }
                                                >

                                                    {getStatusIcon(
                                                        statut
                                                    )}

                                                    {statut}

                                                </span>


                                                {transaction.id_reservation && (

                                                    <button
                                                        type="button"
                                                        className="transaction-view-button"
                                                        onClick={() =>
                                                            voirReservation(
                                                                transaction
                                                            )
                                                        }
                                                    >

                                                        Voir

                                                        <FaChevronRight />

                                                    </button>

                                                )}

                                            </div>


                                        </article>

                                    );

                                }
                            )}

                        </div>

                    )}


                </section>


                {/* =================================================
                    INFORMATIONS
                ================================================= */}

                <section className="transactions-information">

                    <div className="information-icon">

                        <FaReceipt />

                    </div>


                    <div>

                        <h3>
                            Informations sur vos paiements
                        </h3>

                        <p>
                            Les paiements en attente sont soumis à
                            vérification par notre équipe. Une fois
                            votre paiement validé, son statut sera
                            automatiquement mis à jour dans votre
                            espace client.
                        </p>

                    </div>

                </section>


            </main>

        </div>

    );

}


export default TransactionsClient;