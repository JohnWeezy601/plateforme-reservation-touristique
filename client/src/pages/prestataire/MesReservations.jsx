import { useEffect, useState } from "react";
import api from "../../api/api";
import "./MesReservations.css";

function MesReservations() {
    // =====================================================
    // ÉTATS
    // =====================================================

    const [reservations, setReservations] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    useEffect(() => {
        chargerReservations();
    }, []);

    // =====================================================
    // RÉCUPÉRER LES RÉSERVATIONS
    // =====================================================

    const chargerReservations = async () => {
        try {
            setChargement(true);
            setErreur("");

            // =================================================
            // RÉCUPÉRER UTILISATEUR CONNECTÉ
            // =================================================

            const utilisateurConnecte =
                localStorage.getItem("utilisateur");

            if (!utilisateurConnecte) {
                setErreur(
                    "Utilisateur non connecté."
                );
                return;
            }

            let utilisateur;

            try {
                utilisateur =
                    JSON.parse(utilisateurConnecte);
            } catch (error) {
                console.error(
                    "Erreur lecture utilisateur :",
                    error
                );

                setErreur(
                    "Les informations de l'utilisateur sont invalides."
                );

                return;
            }

            console.log(
                "UTILISATEUR CONNECTÉ :",
                utilisateur
            );

            // =================================================
            // RÉCUPÉRER ID UTILISATEUR
            // =================================================

            const idUtilisateur =
                utilisateur.id_utilisateur ||
                utilisateur.id;

            console.log(
                "ID UTILISATEUR PRESTATAIRE :",
                idUtilisateur
            );

            if (!idUtilisateur) {
                setErreur(
                    "Identifiant utilisateur introuvable."
                );
                return;
            }

            // =================================================
            // VÉRIFIER LE RÔLE
            // =================================================

            if (
                utilisateur.role !==
                "Prestataire"
            ) {
                setErreur(
                    "Cet espace est réservé aux prestataires."
                );
                return;
            }

            // =================================================
            // RÉCUPÉRER LES RÉSERVATIONS
            // =================================================

            const url =
                `/prestataires/utilisateur/${idUtilisateur}/reservations`;

            console.log(
                "URL RÉSERVATIONS :",
                url
            );

            const response =
                await api.get(url);

            console.log(
                "RÉSERVATIONS RÉCUPÉRÉES :",
                response.data
            );

            // =================================================
            // GÉRER LA RÉPONSE
            // =================================================

            if (Array.isArray(response.data)) {
                setReservations(response.data);
            } else if (
                Array.isArray(
                    response.data?.reservations
                )
            ) {
                setReservations(
                    response.data.reservations
                );
            } else {
                setReservations([]);
            }

        } catch (error) {
            console.error(
                "Erreur récupération réservations :",
                error
            );

            if (error.response) {
                console.error(
                    "STATUT :",
                    error.response.status
                );

                console.error(
                    "RÉPONSE SERVEUR :",
                    error.response.data
                );
            }

            setErreur(
                error.response?.data?.message ||
                "Impossible de récupérer les réservations."
            );

        } finally {
            setChargement(false);
        }
    };

    // =====================================================
    // AFFICHER STATUT
    // =====================================================

    const afficherStatut = (statut) => {
        if (!statut) {
            return "Non défini";
        }

        return statut;
    };

    // =====================================================
    // FORMATTER DATE
    // =====================================================

    const formaterDate = (date) => {
        if (!date) {
            return "-";
        }

        try {
            return new Date(date).toLocaleDateString(
                "fr-FR"
            );
        } catch (error) {
            return date;
        }
    };

    // =====================================================
    // FORMATTER MONTANT
    // =====================================================

    const formaterMontant = (montant) => {
        if (
            montant === null ||
            montant === undefined ||
            montant === ""
        ) {
            return "0 Ar";
        }

        const nombre =
            Number(montant);

        if (Number.isNaN(nombre)) {
            return `${montant} Ar`;
        }

        return `${nombre.toLocaleString(
            "fr-FR"
        )} Ar`;
    };

    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (
        <div className="mes-reservations">

            {/* =================================================
                EN-TÊTE
            ================================================= */}

            <div className="reservations-header">

                <div>

                    <h1>
                        Mes réservations
                    </h1>

                    <p>
                        Consultez et suivez les réservations
                        effectuées sur vos offres touristiques.
                    </p>

                </div>

                <div className="reservations-count">

                    <strong>
                        {reservations.length}
                    </strong>

                    <span>
                        réservation(s)
                    </span>

                </div>

            </div>


            {/* =================================================
                CHARGEMENT
            ================================================= */}

            {chargement && (

                <div className="reservations-message">

                    <div className="reservations-spinner"></div>

                    <p>
                        Chargement des réservations...
                    </p>

                </div>

            )}


            {/* =================================================
                ERREUR
            ================================================= */}

            {!chargement && erreur && (

                <div className="reservations-error">

                    <div>

                        <strong>
                            Une erreur est survenue
                        </strong>

                        <p>
                            {erreur}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={
                            chargerReservations
                        }
                    >
                        Réessayer
                    </button>

                </div>

            )}


            {/* =================================================
                AUCUNE RÉSERVATION
            ================================================= */}

            {!chargement &&
                !erreur &&
                reservations.length === 0 && (

                    <div className="reservations-empty">

                        <div className="empty-icon">
                            📅
                        </div>

                        <h2>
                            Aucune réservation
                        </h2>

                        <p>
                            Vous n'avez pas encore reçu
                            de réservation pour vos offres.
                        </p>

                    </div>

                )}


            {/* =================================================
                LISTE DES RÉSERVATIONS
            ================================================= */}

            {!chargement &&
                !erreur &&
                reservations.length > 0 && (

                    <div className="reservations-table-container">

                        <table className="reservations-table">

                            <thead>

                                <tr>

                                    <th>
                                        N°
                                    </th>

                                    <th>
                                        Client
                                    </th>

                                    <th>
                                        Offre
                                    </th>

                                    <th>
                                        Date réservation
                                    </th>

                                    <th>
                                        Séjour
                                    </th>

                                    <th>
                                        Personnes
                                    </th>

                                    <th>
                                        Montant
                                    </th>

                                    <th>
                                        Statut
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {reservations.map(
                                    (reservation, index) => (

                                        <tr
                                            key={
                                                reservation.id_reservation ||
                                                index
                                            }
                                        >

                                            {/* N° */}

                                            <td>

                                                <strong>
                                                    {
                                                        reservation.id_reservation ||
                                                        "-"
                                                    }
                                                </strong>

                                            </td>


                                            {/* CLIENT */}

                                            <td>

                                                <div className="client-info">

                                                    <strong>

                                                        {
                                                            reservation.prenom ||
                                                            ""
                                                        }{" "}

                                                        {
                                                            reservation.nom ||
                                                            ""
                                                        }

                                                    </strong>

                                                    <span>

                                                        {
                                                            reservation.email ||
                                                            "Email non disponible"
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* OFFRE */}

                                            <td>

                                                <div className="offre-info">

                                                    <strong>

                                                        {
                                                            reservation.titre_offre ||
                                                            reservation.titre ||
                                                            "Offre inconnue"
                                                        }

                                                    </strong>

                                                    {reservation.nom_destination && (

                                                        <span>

                                                            📍{" "}

                                                            {
                                                                reservation.nom_destination
                                                            }

                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* DATE RÉSERVATION */}

                                            <td>

                                                {formaterDate(
                                                    reservation.date_reservation
                                                )}

                                            </td>


                                            {/* SÉJOUR */}

                                            <td>

                                                <div className="sejour-info">

                                                    <span>

                                                        {
                                                            formaterDate(
                                                                reservation.date_debut_sejour
                                                            )
                                                        }

                                                    </span>

                                                    <span className="sejour-arrow">
                                                        →
                                                    </span>

                                                    <span>

                                                        {
                                                            formaterDate(
                                                                reservation.date_fin_sejour
                                                            )
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* PERSONNES */}

                                            <td>

                                                <span className="personnes-badge">

                                                    👥{" "}

                                                    {
                                                        reservation.nombre_personnes ||
                                                        0
                                                    }

                                                </span>

                                            </td>


                                            {/* MONTANT */}

                                            <td>

                                                <strong className="reservation-montant">

                                                    {
                                                        formaterMontant(
                                                            reservation.montant_total
                                                        )
                                                    }

                                                </strong>

                                            </td>


                                            {/* STATUT */}

                                            <td>

                                                <span
                                                    className={
                                                        `reservation-status status-${String(
                                                            reservation.statut ||
                                                            ""
                                                        )
                                                            .toLowerCase()
                                                            .normalize("NFD")
                                                            .replace(
                                                                /[\u0300-\u036f]/g,
                                                                ""
                                                            )
                                                            .replace(
                                                                /\s+/g,
                                                                "-"
                                                            )}`
                                                    }
                                                >

                                                    {afficherStatut(
                                                        reservation.statut
                                                    )}

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

        </div>
    );
}

export default MesReservations;