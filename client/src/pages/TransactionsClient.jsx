import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaCreditCard,
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaMoneyBillWave
} from "react-icons/fa";

import api from "../api/api";

import "./TransactionsClient.css";


function TransactionsClient() {

    const navigate = useNavigate();

    const [utilisateur, setUtilisateur] = useState(null);

    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =====================================================
    // UTILISATEUR
    // =====================================================

    useEffect(() => {

        const data = localStorage.getItem("utilisateur");

        if (!data) {

            navigate("/login-client");

            return;

        }

        try {

            setUtilisateur(JSON.parse(data));

        } catch {

            localStorage.removeItem("utilisateur");

            navigate("/login-client");

        }

    }, [navigate]);


    // =====================================================
    // RÉCUPÉRER LES TRANSACTIONS
    // =====================================================

    useEffect(() => {

        if (!utilisateur) return;

        const chargerTransactions = async () => {

            setLoading(true);
            setError("");

            try {

                /*
                 * Route prévue :
                 * GET /paiements/utilisateur/:id
                 */

                const response = await api.get(
                    `/paiements/utilisateur/${utilisateur.id_utilisateur}`
                );

                const data =
                    response.data?.paiements ||
                    response.data?.transactions ||
                    response.data ||
                    [];

                setTransactions(
                    Array.isArray(data)
                        ? data
                        : []
                );


            } catch (err) {

                console.error(
                    "Erreur récupération transactions :",
                    err
                );

                /*
                 * On essaye également les données
                 * éventuellement enregistrées localement.
                 */

                try {

                    const localData =
                        localStorage.getItem(
                            "mesTransactions"
                        );

                    if (localData) {

                        const parsed =
                            JSON.parse(localData);

                        setTransactions(
                            Array.isArray(parsed)
                                ? parsed
                                : []
                        );

                    } else {

                        setTransactions([]);

                    }

                } catch {

                    setTransactions([]);

                }

                setError(
                    "Impossible de récupérer les transactions depuis le serveur."
                );

            } finally {

                setLoading(false);

            }

        };


        chargerTransactions();

    }, [utilisateur]);


    // =====================================================
    // STATUT
    // =====================================================

    const getStatusIcon = (statut) => {

        const value =
            String(statut || "")
                .toLowerCase();

        if (
            value.includes("success") ||
            value.includes("réussi") ||
            value.includes("reussi") ||
            value.includes("payé") ||
            value.includes("paye") ||
            value.includes("confirm")
        ) {

            return <FaCheckCircle />;

        }

        if (
            value.includes("attente") ||
            value.includes("pending")
        ) {

            return <FaClock />;

        }

        if (
            value.includes("annul") ||
            value.includes("refus") ||
            value.includes("failed") ||
            value.includes("échec") ||
            value.includes("echec")
        ) {

            return <FaTimesCircle />;

        }

        return <FaCreditCard />;

    };


    const getStatusClass = (statut) => {

        const value =
            String(statut || "")
                .toLowerCase();

        if (
            value.includes("success") ||
            value.includes("réussi") ||
            value.includes("reussi") ||
            value.includes("payé") ||
            value.includes("paye") ||
            value.includes("confirm")
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
            value.includes("annul") ||
            value.includes("refus") ||
            value.includes("failed") ||
            value.includes("échec") ||
            value.includes("echec")
        ) {

            return "failed";

        }

        return "default";

    };


    // =====================================================
    // FORMAT PRIX
    // =====================================================

    const formatPrix = (prix) => {

        if (
            prix === null ||
            prix === undefined ||
            prix === ""
        ) {

            return "-";

        }

        const number =
            Number(prix);

        if (Number.isNaN(number)) {

            return prix;

        }

        return number.toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) + " €";

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) return "-";

        const parsed =
            new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
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
    // RETOUR
    // =====================================================

    const retour = () => {

        navigate("/espace-client");

    };


    return (

        <div className="transactions-client-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="transactions-client-header">

                <button
                    className="transactions-client-back"
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
                        Mes transactions
                    </h1>

                    <p>
                        Consultez l'historique de vos paiements.
                    </p>

                </div>

            </header>


            {/* =================================================
                ERREUR
            ================================================= */}

            {error && (

                <div className="transactions-client-error">
                    {error}
                </div>

            )}


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="transactions-client-summary">

                <div>

                    <div className="summary-icon">
                        <FaCreditCard />
                    </div>

                    <div>

                        <span>
                            TRANSACTIONS
                        </span>

                        <strong>
                            {transactions.length}
                        </strong>

                    </div>

                </div>


                <div>

                    <div className="summary-icon">
                        <FaMoneyBillWave />
                    </div>

                    <div>

                        <span>
                            TOTAL
                        </span>

                        <strong>

                            {formatPrix(
                                transactions.reduce(
                                    (total, transaction) =>
                                        total +
                                        Number(
                                            transaction.montant ||
                                            transaction.prix ||
                                            0
                                        ),
                                    0
                                )
                            )}

                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                TRANSACTIONS
            ================================================= */}

            <section className="transactions-client-card">


                <div className="transactions-client-title">

                    <div>

                        <span>
                            HISTORIQUE
                        </span>

                        <h2>
                            Mes paiements
                        </h2>

                    </div>

                    <FaCreditCard />

                </div>


                {loading ? (

                    <div className="transactions-client-empty">
                        Chargement des transactions...
                    </div>

                ) : transactions.length === 0 ? (

                    <div className="transactions-client-empty">

                        <FaCreditCard />

                        <h3>
                            Aucune transaction
                        </h3>

                        <p>
                            Vous n'avez encore effectué aucun paiement.
                        </p>

                    </div>

                ) : (

                    <div className="transactions-client-list">

                        {transactions.map(
                            (transaction, index) => {

                                const statut =
                                    transaction.statut ||
                                    transaction.status ||
                                    transaction.etat ||
                                    "Non renseigné";

                                return (

                                    <div
                                        className="transaction-client-item"
                                        key={
                                            transaction.id_paiement ||
                                            transaction.id_transaction ||
                                            transaction.id ||
                                            index
                                        }
                                    >


                                        <div className="transaction-client-icon">

                                            {getStatusIcon(statut)}

                                        </div>


                                        <div className="transaction-client-info">

                                            <strong>

                                                {transaction.reference ||
                                                transaction.reference_paiement ||
                                                `Transaction #${index + 1}`}

                                            </strong>

                                            <span>

                                                {transaction.mode_paiement ||
                                                transaction.methode_paiement ||
                                                transaction.moyen_paiement ||
                                                "Paiement"}

                                            </span>

                                            <small>

                                                {formatDate(
                                                    transaction.date_paiement ||
                                                    transaction.date_transaction ||
                                                    transaction.created_at ||
                                                    transaction.date
                                                )}

                                            </small>

                                        </div>


                                        <div className="transaction-client-amount">

                                            <strong>
                                                {formatPrix(
                                                    transaction.montant ||
                                                    transaction.prix ||
                                                    0
                                                )}
                                            </strong>


                                            <span
                                                className={`transaction-status ${getStatusClass(statut)}`}
                                            >

                                                {getStatusIcon(statut)}

                                                {statut}

                                            </span>

                                        </div>


                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


        </div>

    );

}


export default TransactionsClient;