import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaCreditCard,
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaMoneyBillWave,
    FaCalendarAlt,
    FaReceipt,
    FaShieldAlt,
    FaChevronRight,
    FaWallet,
    FaExclamationCircle,
    FaSyncAlt
} from "react-icons/fa";

import api from "../api/api";

import "./TransactionsClient.css";


function TransactionsClient() {

    const navigate = useNavigate();


    // =====================================================
    // ETATS
    // =====================================================

    const [utilisateur, setUtilisateur] = useState(null);

    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [refreshing, setRefreshing] = useState(false);


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

            const parsed =
                JSON.parse(data);

            setUtilisateur(parsed);

        }

        catch (error) {

            console.error(
                "Erreur lecture utilisateur :",
                error
            );

            localStorage.removeItem(
                "utilisateur"
            );

            navigate("/login-client");

        }

    }, [navigate]);


    // =====================================================
    // FORMAT MONTANT EURO
    // =====================================================

    const formatPrix = (montant) => {

        if (
            montant === null ||
            montant === undefined ||
            montant === ""
        ) {

            return "0,00 €";

        }


        const number =
            Number(montant);


        if (Number.isNaN(number)) {

            return "0,00 €";

        }


        return (
            number.toLocaleString(
                "fr-FR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ) + " €"
        );

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

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
    // FORMAT DATE COURTE
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
    // STATUT RÉUSSI
    // =====================================================

    const estReussi = (statut) => {

        const value =
            normaliserStatut(statut);


        return (
            value.includes("success") ||
            value.includes("reussi") ||
            value.includes("paye") ||
            value.includes("valide") ||
            value.includes("confirme") ||
            value.includes("confirmee") ||
            value.includes("complete")
        );

    };


    // =====================================================
    // STATUT EN ATTENTE
    // =====================================================

    const estEnAttente = (statut) => {

        const value =
            normaliserStatut(statut);


        return (
            value.includes("attente") ||
            value.includes("pending")
        );

    };


    // =====================================================
    // STATUT ÉCHOUÉ
    // =====================================================

    const estEchoue = (statut) => {

        const value =
            normaliserStatut(statut);


        return (
            value.includes("echec") ||
            value.includes("echoue") ||
            value.includes("failed") ||
            value.includes("refus") ||
            value.includes("annul")
        );

    };


    // =====================================================
    // ICÔNE STATUT
    // =====================================================

    const getStatusIcon = (statut) => {

        if (estReussi(statut)) {

            return <FaCheckCircle />;

        }


        if (estEnAttente(statut)) {

            return <FaClock />;

        }


        if (estEchoue(statut)) {

            return <FaTimesCircle />;

        }


        return <FaCreditCard />;

    };


    // =====================================================
    // CLASSE STATUT
    // =====================================================

    const getStatusClass = (statut) => {

        if (estReussi(statut)) {

            return "success";

        }


        if (estEnAttente(statut)) {

            return "pending";

        }


        if (estEchoue(statut)) {

            return "failed";

        }


        return "default";

    };


    // =====================================================
    // LIBELLÉ STATUT
    // =====================================================

    const getStatusLabel = (statut) => {

        if (!statut) {

            return "Non renseigné";

        }


        return statut;

    };


    // =====================================================
    // RÉCUPÉRER LES TRANSACTIONS
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

            setRefreshing(true);

        }


        setError("");


        try {

            // =================================================
            // RÉCUPÉRER TOUS LES PAIEMENTS
            // =================================================

            /*
             * IMPORTANT :
             *
             * Le backend possède actuellement :
             *
             * GET /api/paiements
             *
             * Il n'existe pas de route :
             *
             * /api/paiements/utilisateur/:id
             *
             * On récupère donc les paiements existants
             * puis on filtre ceux du client connecté.
             */

            const response =
                await api.get(
                    "/paiements"
                );


            // =================================================
            // NORMALISER LA RÉPONSE
            // =================================================

            const data =
                response.data?.paiements ||
                response.data?.transactions ||
                response.data?.data ||
                response.data ||
                [];


            const liste =
                Array.isArray(data)
                    ? data
                    : [];


            console.log(
                "Tous les paiements récupérés :",
                liste
            );


            // =================================================
            // FILTRER PAR UTILISATEUR
            // =================================================

            const transactionsClient =
                liste.filter(
                    (transaction) => {

                        return (
                            Number(
                                transaction.id_utilisateur
                            ) ===
                            Number(
                                utilisateur.id_utilisateur
                            )
                        );

                    }
                );


            console.log(
                "Transactions du client connecté :",
                transactionsClient
            );


            // =================================================
            // TRI DU PLUS RÉCENT AU PLUS ANCIEN
            // =================================================

            transactionsClient.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.date_paiement ||
                            a.date_transaction ||
                            a.created_at ||
                            a.date ||
                            0
                        ).getTime();


                    const dateB =
                        new Date(
                            b.date_paiement ||
                            b.date_transaction ||
                            b.created_at ||
                            b.date ||
                            0
                        ).getTime();


                    return dateB - dateA;

                }
            );


            // =================================================
            // ENREGISTRER LES TRANSACTIONS
            // =================================================

            setTransactions(
                transactionsClient
            );


            // =================================================
            // SAUVEGARDE LOCALE
            // =================================================

            try {

                localStorage.setItem(
                    "mesTransactions",
                    JSON.stringify(
                        transactionsClient
                    )
                );

            }

            catch {

                // Rien à faire.

            }


        }

        catch (err) {

            console.error(
                "Erreur récupération transactions :",
                err.response?.data ||
                err
            );


            // =================================================
            // FALLBACK LOCAL
            // =================================================

            try {

                const localData =
                    localStorage.getItem(
                        "mesTransactions"
                    );


                if (localData) {

                    const parsed =
                        JSON.parse(
                            localData
                        );


                    if (
                        Array.isArray(parsed)
                    ) {

                        const transactionsClient =
                            parsed.filter(
                                (transaction) => {

                                    return (
                                        Number(
                                            transaction.id_utilisateur
                                        ) ===
                                        Number(
                                            utilisateur.id_utilisateur
                                        )
                                    );

                                }
                            );


                        setTransactions(
                            transactionsClient
                        );

                    }

                    else {

                        setTransactions([]);

                    }

                }

                else {

                    setTransactions([]);

                }

            }

            catch {

                setTransactions([]);

            }


            setError(
                "Impossible de récupérer vos transactions depuis le serveur."
            );

        }

        finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    // =====================================================
    // CHARGEMENT
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
    // STATISTIQUES
    // =====================================================

    const statistiques =
        useMemo(() => {

            const total =
                transactions.reduce(
                    (
                        somme,
                        transaction
                    ) => {

                        return (
                            somme +
                            Number(
                                transaction.montant ??
                                transaction.montant_total ??
                                transaction.prix ??
                                0
                            )
                        );

                    },
                    0
                );


            const reussies =
                transactions.filter(
                    (transaction) =>
                        estReussi(
                            transaction.statut ||
                            transaction.status ||
                            transaction.etat
                        )
                ).length;


            const attente =
                transactions.filter(
                    (transaction) =>
                        estEnAttente(
                            transaction.statut ||
                            transaction.status ||
                            transaction.etat
                        )
                ).length;


            const echouees =
                transactions.filter(
                    (transaction) =>
                        estEchoue(
                            transaction.statut ||
                            transaction.status ||
                            transaction.etat
                        )
                ).length;


            return {

                total,

                reussies,

                attente,

                echouees

            };

        }, [transactions]);


    // =====================================================
    // RETOUR
    // =====================================================

    const retour = () => {

        navigate(
            "/espace-client"
        );

    };


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <div className="transactions-client-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="transactions-client-header">


                <div className="transactions-client-header-inner">


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


                    <div className="transactions-client-heading">

                        <span className="transactions-eyebrow">
                            ESPACE CLIENT
                        </span>

                        <h1>
                            Mes transactions
                        </h1>

                        <p>
                            Consultez et suivez
                            l'ensemble de vos paiements.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="transactions-refresh-button"
                        onClick={() =>
                            chargerTransactions(false)
                        }
                        disabled={refreshing}
                    >

                        <FaSyncAlt
                            className={
                                refreshing
                                    ? "refresh-spinning"
                                    : ""
                            }
                        />

                        <span>
                            Actualiser
                        </span>

                    </button>


                </div>

            </header>


            {/* =================================================
                CONTENU PRINCIPAL
            ================================================= */}

            <main className="transactions-client-main">


                {/* =================================================
                    ERREUR
                ================================================= */}

                {error && (

                    <div className="transactions-client-error">

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

                {!loading && (

                    <section className="transactions-summary-grid">


                        {/* TOTAL TRANSACTIONS */}

                        <div className="transaction-summary-card">

                            <div className="summary-card-icon blue">

                                <FaReceipt />

                            </div>

                            <div className="summary-card-content">

                                <span>
                                    TRANSACTIONS
                                </span>

                                <strong>
                                    {transactions.length}
                                </strong>

                                <small>
                                    Paiement
                                    {transactions.length > 1 ? "s" : ""}
                                    {" "}
                                    enregistré
                                    {transactions.length > 1 ? "s" : ""}
                                </small>

                            </div>

                        </div>


                        {/* TOTAL */}

                        <div className="transaction-summary-card">

                            <div className="summary-card-icon green">

                                <FaMoneyBillWave />

                            </div>

                            <div className="summary-card-content">

                                <span>
                                    TOTAL
                                </span>

                                <strong>
                                    {formatPrix(
                                        statistiques.total
                                    )}
                                </strong>

                                <small>
                                    Montant cumulé
                                </small>

                            </div>

                        </div>


                        {/* RÉUSSIES */}

                        <div className="transaction-summary-card">

                            <div className="summary-card-icon success">

                                <FaCheckCircle />

                            </div>

                            <div className="summary-card-content">

                                <span>
                                    RÉUSSIES
                                </span>

                                <strong>
                                    {statistiques.reussies}
                                </strong>

                                <small>
                                    Paiement
                                    {statistiques.reussies > 1 ? "s" : ""}
                                    {" "}
                                    confirmé
                                    {statistiques.reussies > 1 ? "s" : ""}
                                </small>

                            </div>

                        </div>


                        {/* EN ATTENTE */}

                        <div className="transaction-summary-card">

                            <div className="summary-card-icon orange">

                                <FaClock />

                            </div>

                            <div className="summary-card-content">

                                <span>
                                    EN ATTENTE
                                </span>

                                <strong>
                                    {statistiques.attente}
                                </strong>

                                <small>
                                    À traiter
                                </small>

                            </div>

                        </div>


                    </section>

                )}


                {/* =================================================
                    SECTION HISTORIQUE
                ================================================= */}

                <section className="transactions-client-card">


                    {/* HEADER */}

                    <div className="transactions-client-title">

                        <div>

                            <span>
                                HISTORIQUE DES PAIEMENTS
                            </span>

                            <h2>
                                Toutes mes transactions
                            </h2>

                            <p>
                                Retrouvez ici l'historique
                                de vos paiements effectués
                                sur la plateforme.
                            </p>

                        </div>


                        <div className="transactions-title-icon">

                            <FaWallet />

                        </div>

                    </div>


                    {/* =================================================
                        CHARGEMENT
                    ================================================= */}

                    {loading ? (

                        <div className="transactions-loading">

                            <div className="transaction-spinner"></div>

                            <h3>
                                Chargement de vos transactions
                            </h3>

                            <p>
                                Nous récupérons vos paiements...
                            </p>

                        </div>

                    ) : transactions.length === 0 ? (

                        /* =================================================
                            VIDE
                        ================================================= */

                        <div className="transactions-client-empty">

                            <div className="empty-transaction-icon">

                                <FaCreditCard />

                            </div>

                            <h3>
                                Aucune transaction
                            </h3>

                            <p>
                                Vous n'avez encore effectué
                                aucun paiement sur la plateforme.
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

                        /* =================================================
                            LISTE
                        ================================================= */

                        <div className="transactions-client-list">


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
                                        transaction.montant ??
                                        transaction.montant_total ??
                                        transaction.prix ??
                                        0;


                                    const reference =
                                        transaction.reference ||
                                        transaction.reference_paiement ||
                                        transaction.numero_transaction ||
                                        `Transaction #${transaction.id_paiement || index + 1}`;


                                    const date =
                                        transaction.date_paiement ||
                                        transaction.date_transaction ||
                                        transaction.created_at ||
                                        transaction.date;


                                    const mode =
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


                                            {/* ICÔNE */}

                                            <div
                                                className={`transaction-client-icon ${getStatusClass(statut)}`}
                                            >

                                                {getStatusIcon(
                                                    statut
                                                )}

                                            </div>


                                            {/* INFORMATIONS */}

                                            <div className="transaction-client-info">


                                                <div className="transaction-reference">

                                                    <strong>
                                                        {reference}
                                                    </strong>

                                                    {transaction.id_reservation && (

                                                        <span>
                                                            Réservation #
                                                            {transaction.id_reservation}
                                                        </span>

                                                    )}

                                                </div>


                                                <div className="transaction-meta">


                                                    <span>

                                                        <FaCreditCard />

                                                        {mode}

                                                    </span>


                                                    <span>

                                                        <FaCalendarAlt />

                                                        {formatDateCourte(
                                                            date
                                                        )}

                                                    </span>


                                                    {transaction.date_paiement && (

                                                        <span className="transaction-date-full">

                                                            {formatDate(
                                                                transaction.date_paiement
                                                            )}

                                                        </span>

                                                    )}


                                                </div>

                                            </div>


                                            {/* MONTANT */}

                                            <div className="transaction-client-amount">


                                                <strong>
                                                    {formatPrix(
                                                        montant
                                                    )}
                                                </strong>


                                                <span
                                                    className={`transaction-status ${getStatusClass(statut)}`}
                                                >

                                                    {getStatusIcon(
                                                        statut
                                                    )}

                                                    {getStatusLabel(
                                                        statut
                                                    )}

                                                </span>


                                            </div>


                                            <div className="transaction-arrow">

                                                <FaChevronRight />

                                            </div>


                                        </article>

                                    );

                                }
                            )}


                        </div>

                    )}


                    {/* =================================================
                        SÉCURITÉ
                    ================================================= */}

                    {!loading &&
                        transactions.length > 0 && (

                            <div className="transactions-security">

                                <div className="security-icon">

                                    <FaShieldAlt />

                                </div>

                                <div>

                                    <strong>
                                        Paiements sécurisés
                                    </strong>

                                    <p>
                                        Vos transactions sont
                                        traitées de manière
                                        sécurisée et vos données
                                        de paiement sont protégées.
                                    </p>

                                </div>

                            </div>

                        )}


                </section>


                {/* =================================================
                    FOOTER INFO
                ================================================= */}

                <div className="transactions-bottom-info">

                    <FaShieldAlt />

                    <span>
                        Vos informations de paiement
                        restent confidentielles et sécurisées.
                    </span>

                </div>


            </main>


        </div>

    );

}


export default TransactionsClient;