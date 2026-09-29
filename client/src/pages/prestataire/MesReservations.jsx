import { useEffect, useState } from "react";
import api from "../../api/api";
import "./MesReservations.css";


function MesReservations() {

    const [reservations, setReservations] = useState([]);

    const [chargement, setChargement] = useState(true);

    const [erreur, setErreur] = useState("");


    useEffect(() => {

        chargerReservations();

    }, []);


    const chargerReservations = async () => {

        try {

            setChargement(true);

            setErreur("");


            const utilisateurConnecte =
                localStorage.getItem("utilisateur");


            if (!utilisateurConnecte) {

                setErreur(
                    "Utilisateur non connecté."
                );

                return;

            }


            const utilisateur =
                JSON.parse(utilisateurConnecte);


            const idUtilisateur =
                utilisateur.id;


            const response = await api.get(

                `/prestataires/utilisateur/${idUtilisateur}/reservations`

            );


            setReservations(

                response.data || []

            );

        }

        catch (error) {

            console.error(
                "Erreur récupération réservations :",
                error
            );


            setErreur(
                error.response?.data?.message ||
                "Impossible de récupérer les réservations."
            );

        }

        finally {

            setChargement(false);

        }

    };


    const afficherStatut = (statut) => {

        if (!statut) {

            return "Non défini";

        }


        return statut;

    };


    return (

        <div className="mes-reservations">


            {/* =====================================================
                EN-TÊTE
            ===================================================== */}

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


            {/* =====================================================
                CHARGEMENT
            ===================================================== */}

            {chargement && (

                <div className="reservations-message">

                    <p>
                        Chargement des réservations...
                    </p>

                </div>

            )}


            {/* =====================================================
                ERREUR
            ===================================================== */}

            {!chargement && erreur && (

                <div className="reservations-error">

                    <p>
                        {erreur}
                    </p>

                    <button
                        type="button"
                        onClick={chargerReservations}
                    >
                        Réessayer
                    </button>

                </div>

            )}


            {/* =====================================================
                AUCUNE RÉSERVATION
            ===================================================== */}

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


            {/* =====================================================
                LISTE DES RÉSERVATIONS
            ===================================================== */}

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

                                    <td>

                                        {reservation.id_reservation}

                                    </td>


                                    <td>

                                        <div className="client-info">

                                            <strong>

                                                {reservation.prenom ||
                                                ""}{" "}

                                                {reservation.nom ||
                                                ""}

                                            </strong>

                                            <span>

                                                {reservation.email ||
                                                "Email non disponible"}

                                            </span>

                                        </div>

                                    </td>


                                    <td>

                                        {reservation.titre_offre ||
                                        reservation.titre ||
                                        "Offre inconnue"}

                                    </td>


                                    <td>

                                        {reservation.date_reservation
                                            ? new Date(
                                                reservation.date_reservation
                                              ).toLocaleDateString(
                                                "fr-FR"
                                              )
                                            : "-"
                                        }

                                    </td>


                                    <td>

                                        <div className="sejour-info">

                                            <span>

                                                {reservation.date_debut_sejour ||
                                                "-"}

                                            </span>

                                            <span>
                                                →
                                            </span>

                                            <span>

                                                {reservation.date_fin_sejour ||
                                                "-"}

                                            </span>

                                        </div>

                                    </td>


                                    <td>

                                        {reservation.nombre_personnes ||
                                        0}

                                    </td>


                                    <td>

                                        <strong>

                                            {reservation.montant_total
                                                ? `${reservation.montant_total} Ar`
                                                : "0 Ar"
                                            }

                                        </strong>

                                    </td>


                                    <td>

                                        <span
                                            className={
                                                `reservation-status status-${String(
                                                    reservation.statut ||
                                                    ""
                                                )
                                                .toLowerCase()
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

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}


export default MesReservations;